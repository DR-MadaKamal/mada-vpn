from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timedelta, timezone
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.usage import UsageRecord
from app.models.user import User

router = APIRouter()


@router.get("/dashboard")
async def get_dashboard(
    days: int = Query(7, ge=1, le=90),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    since = datetime.now(timezone.utc) - timedelta(days=days)

    usage_data = db.query(
        func.date(UsageRecord.recorded_at).label("date"),
        func.sum(UsageRecord.bytes_sent + UsageRecord.bytes_received).label("bytes"),
        func.count(UsageRecord.id).label("sessions"),
    ).filter(
        UsageRecord.user_id == current_user.id,
        UsageRecord.recorded_at >= since,
    ).group_by(
        func.date(UsageRecord.recorded_at)
    ).all()

    protocol_stats = db.query(
        UsageRecord.protocol,
        func.sum(UsageRecord.bytes_sent + UsageRecord.bytes_received).label("bytes"),
        func.count(UsageRecord.id).label("count"),
    ).filter(
        UsageRecord.user_id == current_user.id,
        UsageRecord.recorded_at >= since,
    ).group_by(UsageRecord.protocol).all()

    total_bytes = sum(r.bytes for r in usage_data) if usage_data else 0

    return {
        "period_days": days,
        "total_bandwidth_gb": round(total_bytes / (1024**3), 4),
        "total_sessions": sum(r.sessions for r in usage_data) if usage_data else 0,
        "daily_usage": [
            {"date": str(r.date), "bytes_gb": round(r.bytes / (1024**3), 4), "sessions": r.sessions}
            for r in usage_data
        ],
        "by_protocol": [
            {"protocol": r.protocol or "unknown", "bytes_gb": round(r.bytes / (1024**3), 4), "sessions": r.count}
            for r in protocol_stats
        ],
    }


@router.get("/realtime")
async def get_realtime_status(current_user: User = Depends(get_current_user)):
    return {
        "active_connections": 0,
        "current_speed_kbps": 0,
        "session_started": None,
    }
