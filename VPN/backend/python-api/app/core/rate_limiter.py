import time
from collections import defaultdict
from typing import Dict, Tuple

class InMemoryRateLimiter:
    def __init__(self):
        self._buckets: Dict[str, list] = defaultdict(list)

    def check(self, key: str, max_requests: int = 30, window_seconds: int = 60) -> Tuple[bool, int]:
        now = time.time()
        window_start = now - window_seconds
        self._buckets[key] = [t for t in self._buckets[key] if t > window_start]
        if len(self._buckets[key]) >= max_requests:
            retry_after = int(self._buckets[key][0] + window_seconds - now)
            return False, retry_after
        self._buckets[key].append(now)
        return True, 0

rate_limiter = InMemoryRateLimiter()
