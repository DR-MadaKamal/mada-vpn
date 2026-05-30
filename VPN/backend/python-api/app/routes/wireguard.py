from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.core.config import settings
import json

router = APIRouter()


class WireGuardConfig(BaseModel):
    private_key: str
    address: str
    dns: str = "1.1.1.1,8.8.8.8"
    public_key: str
    endpoint: str
    allowed_ips: str = "0.0.0.0/0, ::/0"
    persistent_keepalive: int = 25


@router.post("/generate-config")
async def generate_wireguard_config(
    server_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.models.server import Server
    server = db.query(Server).filter(Server.id == server_id).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")

    config = f"""[Interface]
PrivateKey = <CLIENT_PRIVATE_KEY>
Address = 10.0.0.{current_user.id + 2}/24
DNS = 1.1.1.1, 8.8.8.8

[Peer]
PublicKey = {server.public_key or "<SERVER_PUBLIC_KEY>"}
Endpoint = {server.host}:51820
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25
"""
    return {"config": config, "server": server.name, "protocol": "wireguard"}


@router.get("/status")
async def get_wireguard_status(current_user: User = Depends(get_current_user)):
    return {
        "interface": "wg0",
        "status": "disconnected",
        "bytes_sent": 0,
        "bytes_received": 0,
    }


@router.get("/peers")
async def list_peers(current_user: User = Depends(get_current_user)):
    return {"peers": []}
