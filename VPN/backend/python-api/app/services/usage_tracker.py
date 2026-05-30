from sqlalchemy.orm import Session
from app.models.usage import UsageRecord
from app.models.user import User
from datetime import datetime, timezone


def record_usage(
    db: Session,
    user_id: int,
    server_id: int,
    bytes_sent: int,
    bytes_received: int,
    protocol: str,
    duration: int,
):
    record = UsageRecord(
        user_id=user_id,
        server_id=server_id,
        bytes_sent=bytes_sent,
        bytes_received=bytes_received,
        protocol=protocol,
        session_duration=duration,
    )
    db.add(record)
    db.commit()


def check_quota(db: Session, user_id: int) -> bool:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return False

    from sqlalchemy import func
    total = db.query(
        func.sum(UsageRecord.bytes_sent + UsageRecord.bytes_received)
    ).filter(UsageRecord.user_id == user_id).scalar() or 0

    return total < user.quota_bytes


def get_user_bandwidth_used(db: Session, user_id: int) -> int:
    from sqlalchemy import func
    total = db.query(
        func.sum(UsageRecord.bytes_sent + UsageRecord.bytes_received)
    ).filter(UsageRecord.user_id == user_id).scalar() or 0
    return total
