from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plan = Column(String, nullable=False)
    status = Column(String, default="active")
    price_monthly = Column(Float)
    bandwidth_gb = Column(Integer, default=10)
    devices_limit = Column(Integer, default=1)
    speed_limit_mbps = Column(Integer, default=10)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True))
    auto_renew = Column(Boolean, default=False)
