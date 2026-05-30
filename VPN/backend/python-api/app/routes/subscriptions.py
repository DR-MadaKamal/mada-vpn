from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.subscription import Subscription
from app.models.user import User
from app.models.payment import Payment

router = APIRouter()


class SubscriptionCreate(BaseModel):
    plan: str
    bandwidth_gb: int = 10
    devices_limit: int = 1
    speed_limit_mbps: int = 10


PLANS = {
    "free": {"price": 0, "bandwidth_gb": 5, "devices": 1, "speed": 10},
    "basic": {"price": 4.99, "bandwidth_gb": 50, "devices": 3, "speed": 50},
    "premium": {"price": 9.99, "bandwidth_gb": 200, "devices": 5, "speed": 100},
    "enterprise": {"price": 29.99, "bandwidth_gb": 1000, "devices": 10, "speed": 500},
}


@router.get("/plans")
async def list_plans():
    return PLANS


@router.post("/subscribe")
async def create_subscription(
    sub_data: SubscriptionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if sub_data.plan not in PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan")

    existing = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == "active",
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already have an active subscription")

    plan = PLANS[sub_data.plan]
    subscription = Subscription(
        user_id=current_user.id,
        plan=sub_data.plan,
        bandwidth_gb=sub_data.bandwidth_gb or plan["bandwidth_gb"],
        devices_limit=sub_data.devices_limit or plan["devices"],
        speed_limit_mbps=sub_data.speed_limit_mbps or plan["speed"],
        price_monthly=plan["price"],
        expires_at=datetime.now(timezone.utc) + timedelta(days=30),
    )
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    return {"message": "Subscribed", "subscription_id": subscription.id}


@router.get("/my")
async def get_my_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sub = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == "active",
    ).first()
    if not sub:
        return {"plan": "free", "status": "none", "bandwidth_gb": 5, "devices_limit": 1, "speed_limit_mbps": 10, "expires_at": None, "auto_renew": False}
    return {
        "id": sub.id,
        "plan": sub.plan,
        "status": sub.status,
        "bandwidth_gb": sub.bandwidth_gb,
        "devices_limit": sub.devices_limit,
        "speed_limit_mbps": sub.speed_limit_mbps,
        "expires_at": sub.expires_at,
        "auto_renew": sub.auto_renew,
    }


@router.post("/cancel")
async def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sub = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == "active",
    ).first()
    if not sub:
        raise HTTPException(status_code=404, detail="No active subscription")
    sub.status = "cancelled"
    current_user.tier = "free"
    db.commit()
    return {"message": "Subscription cancelled"}
