import numpy as np
import torch.nn.functional as F
import torch
from typing import Any

def ort_tokenize(text: str, tokenizer: Any) -> dict:
    inputs = tokenizer(text, return_tensors="np", max_length=512, padding=True, truncation=True)
    ort_inputs = {
        "input_ids": inputs['input_ids'].astype(np.int64),
        "attention_mask": inputs['attention_mask'].astype(np.int64),
    }
    return ort_inputs

def average_pool(ort_outs: np.ndarray, ort_inputs: dict, normalize: bool = True):
    last_hidden_states = torch.Tensor(ort_outs[0])
    attention_mask = torch.Tensor(ort_inputs['attention_mask'])
    last_hidden = last_hidden_states.masked_fill(~attention_mask[..., None].bool(), 0.0)
    embedding = last_hidden.sum(dim=1) / attention_mask.sum(dim=1)[..., None]
    if normalize:
        embedding = F.normalize(embedding, p=2, dim=1)
    return embedding.squeeze(0)


