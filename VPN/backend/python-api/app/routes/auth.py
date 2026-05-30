from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.core.database import get_db
from app.core.security import (
    verify_password, get_password_hash, create_access_token,
    create_refresh_token, get_current_user
)
from app.models.user import User
import jwt
from app.core.config import settings

router = APIRouter()


class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: str = ""


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: str
    tier: str
    is_active: bool

    class Config:
        from_attributes = True


@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return TokenResponse(
        access_token=create_access_token({"sub": str(user.id)}),
        refresh_token=create_refresh_token(user.id),
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account disabled")

    return TokenResponse(
        access_token=create_access_token({"sub": str(user.id), "tier": user.tier}),
        refresh_token=create_refresh_token(user.id),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(refresh_token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=400, detail="Invalid refresh token")
        user_id = payload.get("sub")
        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user or not user.is_active:
            raise HTTPException(status_code=403, detail="Account disabled")
        return TokenResponse(
            access_token=create_access_token({"sub": str(user.id), "tier": user.tier}),
            refresh_token=create_refresh_token(user.id),
        )
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/verify")
async def verify_token(token_data: dict, db: Session = Depends(get_db)):
    token = token_data.get("token")
    if not token:
        raise HTTPException(status_code=401, detail="No token provided")
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get("sub")
        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user or not user.is_active:
            raise HTTPException(status_code=403, detail="User not found or disabled")

        from app.models.usage import UsageRecord
        from sqlalchemy import func
        total_used = db.query(
            func.sum(UsageRecord.bytes_sent + UsageRecord.bytes_received)
        ).filter(UsageRecord.user_id == user.id).scalar() or 0

        return {
            "user_id": str(user.id),
            "username": user.username,
            "tier": user.tier,
            "expires_at": payload.get("exp"),
            "quota_bytes": user.quota_bytes,
            "bytes_used": total_used,
        }
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
