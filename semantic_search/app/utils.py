import numpy as np
import torch.nn.functional as F
import torch
from typing import Any, List
from schema import Document
from uuid import UUID
from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from copy import deepcopy
from langchain_core.documents.base import Document as LCDocument

text_splitter = RecursiveCharacterTextSplitter(
    separators=[
        "\n\n",
        "\n",
        " ",
        ".",
        ",",
        "\u200b",  # Zero-width space
        "\uff0c",  # Fullwidth comma
        "\u3001",  # Ideographic comma
        "\uff0e",  # Fullwidth full stop
        "\u3002",  # Ideographic full stop
        "",
    ],
    chunk_size=2000,
    chunk_overlap=200,
    length_function=len,
    is_separator_regex=False,
)

def ort_tokenize(texts: list, tokenizer: Any) -> dict:
    inputs = tokenizer(texts, return_tensors="np", max_length=512, padding=True, truncation=True)
    ort_inputs = {
        "input_ids": inputs['input_ids'].astype(np.int64),
        "attention_mask": inputs['attention_mask'].astype(np.int64),
    }
    return ort_inputs

def average_pool(ort_outs: np.ndarray, ort_inputs: dict, normalize: bool = True, return_tensors: str = 'np') -> torch.Tensor:
    last_hidden_states = torch.Tensor(ort_outs[0])
    attention_mask = torch.Tensor(ort_inputs['attention_mask'])
    last_hidden = last_hidden_states.masked_fill(~attention_mask[..., None].bool(), 0.0)
    embeddings = last_hidden.sum(dim=1) / attention_mask.sum(dim=1)[..., None]
    if normalize:
        embeddings = F.normalize(embeddings, p=2, dim=1)
    if return_tensors == 'np':
        embeddings = np.array(embeddings)
    return embeddings

def get_id(id: str):
    return str(UUID(str(id) + '0' * 8))

def get_docs_ids(docs: List[Document]):
    ids = [get_id(doc.id) for doc in docs]
    return ids

def get_id_reverse(id: str):
    return str(id).replace('0'*8, '').replace('-', '')

def scale_scores(scores: list, mode: str = 'titles'):
    if not scores:
        return []
    scores = np.array(scores)
    if mode == 'titles':
        min_s = 0.8 if np.min(scores) >= 0.8 else 0.78
        max_s = 0.95 if np.max(scores) >= 0.96 else 0.93
    elif mode == 'chunks':
        min_s = 0.88
        max_s = 0.999
    else:
        raise ValueError(f"Mode is incorrect: {mode} (must be one of 'titles', 'chunks')")
    scores[scores < min_s] = 0
    scores[scores > max_s] = 1
    mask_scaling = (scores >= min_s) & (scores <= max_s)
    scores[mask_scaling] = (scores[mask_scaling] - min_s) / (max_s - min_s)
    return scores

def get_texts(documents: List[Document]):
    texts = []
    for doc in documents:
        text = ''
        if doc.path:
            if doc.path.endswith('.pdf'):
                reader = PdfReader(doc.path)
                for page in reader.pages[1:-1]:
                    page_text = page.extract_text()
                    text += (page_text + '\n')
            elif doc.path.endswith('.txt'):
                with open(doc.path, 'r') as f:
                    text = f.read()
            text = text.replace('\xad\n', '').replace('\n\xad', '')
            text = doc.title + '\n\n' + text
        else:
            text = doc.title
        texts.append(text)
    return texts

def get_chunks(documents: List[Document]) -> List[List[LCDocument]]:
    texts = get_texts(documents)
    splitted_texts = text_splitter.create_documents(
        [f"query: {text}" for text in texts],
        metadatas=[{'doc_id': doc.id} for doc in documents]
    )
    chunks = []
    for doc in documents:
        chunks.append(deepcopy([chunk for chunk in splitted_texts if chunk.metadata['doc_id'] == doc.id]))
    return chunks
