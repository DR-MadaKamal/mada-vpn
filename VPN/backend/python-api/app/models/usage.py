from sqlalchemy import Column, Integer, BigInteger, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base


class UsageRecord(Base):
    __tablename__ = "usage_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    server_id = Column(Integer, ForeignKey("servers.id"))
    bytes_sent = Column(BigInteger, default=0)
    bytes_received = Column(BigInteger, default=0)
    protocol = Column(String)
    session_duration = Column(Integer)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
