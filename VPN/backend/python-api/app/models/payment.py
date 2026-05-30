from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    status = Column(String, default="pending")
    payment_method = Column(String)
    transaction_id = Column(String, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
