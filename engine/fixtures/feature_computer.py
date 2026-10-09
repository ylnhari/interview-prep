"""Small exact reference: bounded replay horizon, explicit late-event policy."""
from math import isfinite


class FeatureComputer:
    def __init__(self, window_s=60, dedup_s=120):
        if window_s <= 0 or dedup_s < window_s:
            raise ValueError("dedup horizon must cover a positive window")
        self.window_s, self.dedup_s = window_s, dedup_s
        self.now = float("-inf")
        self.records = {}  # id -> (key, event_ts, value, revision, arrival)

    def advance(self, now):
        if not isfinite(now) or now < self.now:
            raise ValueError("arrival clock must be finite and nondecreasing")
        self.now = now
        # Full scan is deliberate: event times need not be globally ordered.
        self.records = {i: r for i, r in self.records.items()
                        if r[4] > now - self.dedup_s}

    def add(self, event_id, key, event_ts, value, arrival, revision=0):
        if not all(isfinite(x) for x in (event_ts, value, arrival)):
            raise ValueError("finite timestamps and values required")
        if event_ts > arrival or not isinstance(revision, int) or revision < 0:
            raise ValueError("invalid time or revision")
        self.advance(arrival)
        old = self.records.get(event_id)
        if old and revision <= old[3]:
            return "duplicate"
        if old and old[0] != key:
            raise ValueError("revision cannot change entity")
        if event_ts <= arrival - self.window_s:
            return "late"  # archive separately; do not revise past decisions
        self.records[event_id] = (key, event_ts, value, revision, arrival)
        return "revised" if old else "accepted"

    def query(self, key, now):
        self.advance(now)  # expires idle records even without another add
        xs = [r[2] for r in self.records.values()
              if r[0] == key and now - self.window_s < r[1] <= now]
        n, mean, m2 = 0, 0.0, 0.0
        for x in xs:  # Welford over current window, not lifetime statistics
            n += 1
            delta = x - mean
            mean += delta / n
            m2 += delta * (x - mean)
        return {"count": n, "sum": sum(xs), "mean": mean if n else None,
                "variance": m2 / (n - 1) if n > 1 else None}
