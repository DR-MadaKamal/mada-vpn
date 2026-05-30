import asyncio
import logging
import random
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.server import Server
from app.models.user import ConnectionLog, User
from app.models.usage import UsageRecord

logger = logging.getLogger("uvicorn.background")


async def server_health_ping_loop():
    while True:
        await asyncio.sleep(30)
        try:
            db: Session = SessionLocal()
            servers = db.query(Server).filter(Server.is_active == True).all()
            for s in servers:
                delta = random.randint(-5, 5)
                s.load_percent = max(5, min(98, (s.load_percent or 50) + delta))
                s.connected_clients = max(10, (s.connected_clients or 100) + random.randint(-10, 10))
            db.commit()
        except Exception as e:
            logger.error(f"server_health_ping_loop error: {e}")
        finally:
            db.close()


async def connection_log_prune_loop():
    while True:
        await asyncio.sleep(86400)
        try:
            db: Session = SessionLocal()
            from app.core.config import settings
            cutoff = datetime.now(timezone.utc)
            deleted = db.query(ConnectionLog).filter(
                ConnectionLog.created_at < cutoff
            ).delete()
            db.commit()
            if deleted:
                logger.info(f"[prune] Deleted {deleted} old connection logs")
        except Exception as e:
            logger.error(f"connection_log_prune_loop error: {e}")
        finally:
            db.close()


async def bandwidth_quota_reset_loop():
    while True:
        await asyncio.sleep(3600)
        try:
            db: Session = SessionLocal()
            now = datetime.now(timezone.utc)
            current_month = now.strftime("%Y-%m")
            users = db.query(User).all()
            for user in users:
                if user.last_quota_reset_month != current_month:
                    db.query(UsageRecord).filter(
                        UsageRecord.user_id == user.id
                    ).delete()
                    user.last_quota_reset_month = current_month
                    logger.info(f"[quota] Reset usage for user {user.id} for month {current_month}")
            db.commit()
        except Exception as e:
            logger.error(f"bandwidth_quota_reset_loop error: {e}")
        finally:
            db.close()
