from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.server import Server
from app.models.user import User
from app.core.config import settings
import httpx

router = APIRouter()


def _serialize_server(s):
    return {
        "id": s.id,
        "name": s.name,
        "host": s.host,
        "ip_address": s.ip_address,
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


@router.get("")
async def list_servers(db: Session = Depends(get_db)):
    servers = db.query(Server).filter(Server.is_active == True).all()
    return [_serialize_server(s) for s in servers]


@router.get("/search")
async def search_servers(
    q: str = Query("", min_length=1),
    db: Session = Depends(get_db),
):
    if not q:
        return []
    pattern = f"%{q}%"
    servers = db.query(Server).filter(
        Server.is_active == True,
        or_(
            Server.name.ilike(pattern),
            Server.country.ilike(pattern),
            Server.city.ilike(pattern),
            Server.host.ilike(pattern),
        ),
    ).order_by(Server.load_percent.asc()).limit(20).all()
    return [_serialize_server(s) for s in servers]


@router.get("/recommended-region")
async def recommended_region(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    servers = db.query(Server).filter(Server.is_active == True).all()
    regions = {}
    for s in servers:
        continent = {
            "USA": "North America", "Canada": "North America", "Brazil": "South America",
            "UK": "Europe", "Germany": "Europe", "France": "Europe", "Netherlands": "Europe",
            "Singapore": "Asia", "Japan": "Asia",
            "Australia": "Oceania",
        }.get(s.country, "Other")
        if continent not in regions:
            regions[continent] = {"servers": 0, "avg_load": 0, "servers_list": []}
        regions[continent]["servers"] += 1
        regions[continent]["avg_load"] += s.load_percent
        regions[continent]["servers_list"].append(s)
    for r in regions.values():
        r["avg_load"] = round(r["avg_load"] / r["servers"], 1) if r["servers"] > 0 else 0
    best_region = min(regions.items(), key=lambda x: x[1]["avg_load"])
    best_server = min(best_region[1]["servers_list"], key=lambda s: s.load_percent)
    return {
        "recommended_region": best_region[0],
        "recommended_server": {"id": best_server.id, "name": best_server.name, "country": best_server.country, "city": best_server.city, "load_percent": best_server.load_percent},
        "all_regions": {k: {"servers": v["servers"], "avg_load": v["avg_load"]} for k, v in regions.items()},
        "reason": "lowest_avg_load",
    }


@router.get("/{server_id}")
async def get_server(server_id: int, db: Session = Depends(get_db)):
    server = db.query(Server).filter(Server.id == server_id).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    result = _serialize_server(server)
    result["public_key"] = server.public_key
    return result


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
