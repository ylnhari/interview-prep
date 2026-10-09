"""Exact scored-item top-k, with a common total order on globally unique IDs."""
from collections import defaultdict
from heapq import heappush, heappop
from math import isfinite


def top_k_per_key(stream, k):
    if not isinstance(k, int) or k < 0:
        raise ValueError("k must be a nonnegative integer")
    heaps = defaultdict(list)
    for key, score, event_id, payload in stream:
        if not isfinite(score) or not isinstance(event_id, str):
            raise ValueError("finite score and globally unique string ID required")
        if k == 0:
            continue
        h = heaps[key]
        heappush(h, (score, event_id, payload))
        if len(h) > k:
            heappop(h)
    # Contract: upstream enforces globally unique IDs; larger ID wins score ties.
    return {key: sorted(h, reverse=True) for key, h in heaps.items()}
