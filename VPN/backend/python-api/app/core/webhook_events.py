import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import Optional
import httpx

logger = logging.getLogger("uvicorn.webhook_events")

MAX_RETRIES = 3
RETRY_DELAY_SECONDS = 5


async def fire_webhook(url: str, event: str, user_id: int, payload: Optional[dict] = None):
    if not url:
        return
    body = {
        "event": event,
        "user_id": user_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": payload or {},
    }
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.post(url, json=body)
                logger.info(f"[webhook] {event} -> {url} (attempt {attempt}): {resp.status_code}")
                return
        except Exception as e:
            logger.warning(f"[webhook] {event} -> {url} (attempt {attempt}): {e}")
            if attempt < MAX_RETRIES:
                await asyncio.sleep(RETRY_DELAY_SECONDS)
