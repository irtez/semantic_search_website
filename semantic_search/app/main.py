import os
import sys
from typing import Annotated, List
import logging
import onnxruntime as ort
from transformers import AutoTokenizer
from qdrant_client import AsyncQdrantClient
from qdrant_client.http import models
import json
import torch

import uvicorn
from fastapi import FastAPI, Query, Body
from fastapi.logger import logger
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

import gc

from config import CONFIG
from exception_handler import validation_exception_handler, python_exception_handler
from schema import ErrorResponse, Document
import utils

# Initialize API Server
app = FastAPI(
    title="Semantic module",
    description="Module responsible for semantic search.",
    version="0.1.0",
    terms_of_service=None,
    contact=None,
    license_info=None
)

# Allow CORS for local debugging
app.add_middleware(CORSMiddleware, allow_origins=["*"])

# Load custom exception handlers
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, python_exception_handler)

semantic_search_model_path = CONFIG['models_folder'] + '/' + CONFIG['semantic_search_model'] + '/'
semantic_search_onnx_path = semantic_search_model_path + CONFIG['onnx_folder'] + '/' + \
    CONFIG['semantic_search_model'] + '.onnx'
semantic_search_tokenizer_path = semantic_search_model_path + CONFIG['tokenizer_folder']

session = ort.InferenceSession(semantic_search_onnx_path)
tokenizer = AutoTokenizer.from_pretrained(semantic_search_tokenizer_path)

qdrant = AsyncQdrantClient(host=CONFIG['qdrant_host'], port=CONFIG['qdrant_port'])

def get_embeddings(texts: str) -> torch.Tensor:
    ort_inputs = utils.ort_tokenize(texts, tokenizer)
    ort_outs = session.run(None, ort_inputs)
    embeddings = utils.average_pool(ort_outs, ort_inputs, normalize=True)
    return embeddings

@app.get(
        '/api/search/titles',
        response_description="Sorted documents IDx with scores.",
        responses={
            422: {"model": ErrorResponse},
            500: {"model": ErrorResponse}
        }
)
async def search_documents(
    query: Annotated[str, Query(description='Search query.')],
    score_threshold: Annotated[float, Query(ge=0.1, le=0.9, description="Similiarity score threshold.")] = 0.8,
    document_limit: Annotated[int, Query(ge=5, le=2000, description="Maximum number of documents returned.")] = 1000
):
    """
    Perform document semantic search
    """
    logger.info(f'Serach API predict called with query: {query}')

    embedding = get_embeddings([query]).squeeze(0)
    # async
    points = await qdrant.search(
        collection_name=CONFIG['titles_collection_name'],
        query_vector=embedding,
        score_threshold=score_threshold,
        limit=document_limit
    )
    scores = [point.score for point in points]
    scores = utils.scale_scores(scores)
    documents = [
        {
            "document_id": str(point.id).replace('0'*8, '').replace('-', ''),
            "similarity_score": score 
        }
        for point, score in zip(points, scores)
    ]
    

    gc.collect()
    return documents

@app.post(
        '/api/document',
        response_description="Status of added documents.",
        responses={
            422: {"model": ErrorResponse},
            500: {"model": ErrorResponse}
        }
)
async def add_documents(
    documents: List[Document] = Body(..., description='Documents.')
):
    logger.info(f'Document add API predict called with {len(documents)} documents.')

    doc_embeddings = get_embeddings([doc.title for doc in documents])

    qdrant.upload_collection(
        collection_name=CONFIG['titles_collection_name'],
        vectors=doc_embeddings,
        ids=utils.get_ids(documents),
        payload=[
            {
                'gost_number': doc.gost_number,
                'title': doc.title
            }
            for doc in documents
        ],
        parallel=CONFIG['qdrant_n_parallel'],
        max_retries=3
    )

    return {'message': 'OK'}

@app.delete(
        '/api/document',
        response_description="Status of deleted documents.",
        responses={
            422: {"model": ErrorResponse},
            500: {"model": ErrorResponse}
        }
)
async def delete_documents(
    documents: List[Document] = Body(..., description='Documents.')
):
    await qdrant.delete(
        collection_name=CONFIG['titles_collection_name'],
        points_selector=models.PointIdsList(
            points=utils.get_ids(documents),
        )
    )
    return {'message': 'OK'}

@app.patch(
        '/api/document',
        response_description="Status of edited documents.",
        responses={
            422: {"model": ErrorResponse},
            500: {"model": ErrorResponse}
        }
)
async def edit_documents(
   documents: List[Document] = Body(..., description='Documents.')
):
    doc_embeddings = get_embeddings([doc.title for doc in documents])
    qdrant.upload_collection(
        collection_name=CONFIG['titles_collection_name'],
        ids=utils.get_ids(documents),
        payload=[
            {
                'gost_number': doc.gost_number,
                'title': doc.title
            }
            for doc in documents
        ],
        vectors=doc_embeddings,
        parallel=CONFIG['qdrant_n_parallel'],
        max_retries=3
    )
    return {'message': 'OK'}
    

@app.get('/about')
def show_about():
    """
    Get deployment information, for debugging
    """

    def bash(command):
        output = os.popen(command).read()
        return output

    return {
        "sys.version": sys.version,
        "semantic_search_model_name": CONFIG['semantic_search_model']
    }

if __name__ == '__main__':
    uvicorn.run(
        "main:app",
        port=5555,
        reload=True,
        log_config="log.ini"
    )
else:
    # Configure logging if main.py executed from Docker
    gunicorn_error_logger = logging.getLogger("gunicorn.error")
    gunicorn_logger = logging.getLogger("gunicorn")
    uvicorn_access_logger = logging.getLogger("uvicorn.access")
    uvicorn_access_logger.handlers = gunicorn_error_logger.handlers
    logger.handlers = gunicorn_error_logger.handlers
    logger.setLevel(gunicorn_logger.level)
