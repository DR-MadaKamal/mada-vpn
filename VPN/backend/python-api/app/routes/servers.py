from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.server import Server
from app.core.config import settings
import httpx

router = APIRouter()


@router.get("/")
async def list_servers(db: Session = Depends(get_db)):
    servers = db.query(Server).filter(Server.is_active == True).all()
    return [
        {
            "id": s.id,
            "name": s.name,
            "host": s.host,
            "country": s.country,
            "city": s.city,
            "latitude": s.latitude,
            "longitude": s.longitude,
            "load_percent": s.load_percent,
            "connected_clients": s.connected_clients,
            "max_clients": s.max_clients,
            "protocols": s.protocols.split(",") if s.protocols else [],
            "p2p_allowed": s.p2p_allowed,
            "features": s.features.split(",") if s.features else [],
            "tier_required": s.tier_required,
        }
        for s in servers
    ]


@router.get("/{server_id}")
async def get_server(server_id: int, db: Session = Depends(get_db)):
    server = db.query(Server).filter(Server.id == server_id).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    return {
        "id": server.id,
        "name": server.name,
        "host": server.host,
        "country": server.country,
        "city": server.city,
        "latitude": server.latitude,
        "longitude": server.longitude,
        "load_percent": server.load_percent,
        "connected_clients": server.connected_clients,
        "max_clients": server.max_clients,
        "protocols": server.protocols.split(",") if server.protocols else [],
        "public_key": server.public_key,
    }


@router.get("/{server_id}/health")
async def check_server_health(server_id: int, db: Session = Depends(get_db)):
    server = db.query(Server).filter(Server.id == server_id).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"http://{server.host}:8080/health", timeout=5)
            return {"server_id": server_id, "status": "online", "details": resp.json()}
    except Exception:
        return {"server_id": server_id, "status": "offline"}
