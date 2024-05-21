import numpy as np
import torch.nn.functional as F
import torch
from typing import Any, List
from schema import Document
from uuid import UUID

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

def get_ids(docs: List[Document]):
    ids = [str(UUID(str(doc.id) + '0' * 8)) for doc in docs]
    return ids

def scale_scores(scores: list):
    scores = np.array(scores)
    min_s = 0.8 if np.min(scores) >= 0.8 else 0.78
    max_s = 0.95 if np.max(scores) >= 0.96 else 0.93
    scores[scores < min_s] = 0
    scores[scores > max_s] = 1
    mask_scaling = (scores >= min_s) & (scores <= max_s)
    scores[mask_scaling] = (scores[mask_scaling] - min_s) / (max_s - min_s)
    return scores
