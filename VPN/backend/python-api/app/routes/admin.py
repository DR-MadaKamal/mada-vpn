from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.models.user import User
from app.models.server import Server
from app.models.usage import UsageRecord

router = APIRouter()


class ServerCreate(BaseModel):
    name: str
    host: str
    ip_address: str
    country: str
    city: str = None
    latitude: float = None
    longitude: float = None
    max_clients: int = 1000
    protocols: str = "http,socks5,wireguard"


@router.get("/users")
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    users = db.query(User).offset(skip).limit(limit).all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "tier": u.tier,
            "is_active": u.is_active,
            "is_admin": u.is_admin,
            "created_at": str(u.created_at),
        }
        for u in users
    ]


@router.post("/servers")
async def create_server(
    server_data: ServerCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    import json
    server = Server(**json.loads(server_data.model_dump_json()))
    db.add(server)
    db.commit()
    db.refresh(server)
    return {"message": "Server created", "server_id": server.id}


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    db.commit()
    return {"message": "User disabled"}


@router.get("/stats")
async def admin_stats(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    total_users = db.query(func.count(User.id)).scalar()
    active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar()
    total_servers = db.query(func.count(Server.id)).scalar()
    total_usage = db.query(
        func.sum(UsageRecord.bytes_sent + UsageRecord.bytes_received)
    ).scalar() or 0

    return {
        "total_users": total_users or 0,
        "active_users": active_users or 0,
        "total_servers": total_servers or 0,
        "total_bandwidth_used_gb": round(total_usage / (1024**3), 2),
    }


@router.post("/seed")
async def seed_database(
    db: Session = Depends(get_db),
):
    from app.models.server import Server
    from app.models.subscription import Subscription
    from app.models.usage import UsageRecord
    from app.models.user import User
    import random
    from datetime import datetime, timedelta, timezone
    from app.core.security import get_password_hash

    if db.query(Server).count() == 0:
        seed_servers = [
            Server(name="Germany-Proxy", host="madavpn-proxy.germanywestcentral.azurecontainer.io", ip_address="20.79.129.27", country="Germany", city="Frankfurt", latitude=50.1109, longitude=8.6821, load_percent=12, connected_clients=0, max_clients=500, protocols="http", is_active=True),
            Server(name="US-East-1", host="us-east.securevpn.com", ip_address="10.0.1.1", country="USA", city="New York", latitude=40.7128, longitude=-74.0060, load_percent=34, connected_clients=156, max_clients=1000, protocols="http,socks5,wireguard"),
            Server(name="US-West-1", host="us-west.securevpn.com", ip_address="10.0.1.2", country="USA", city="Los Angeles", latitude=34.0522, longitude=-118.2437, load_percent=52, connected_clients=234, max_clients=1000, protocols="http,socks5,wireguard,ws"),
            Server(name="EU-West-1", host="eu-west.securevpn.com", ip_address="10.0.2.1", country="UK", city="London", latitude=51.5074, longitude=-0.1278, load_percent=28, connected_clients=89, max_clients=1000, protocols="http,socks5,wireguard"),
            Server(name="EU-Central-1", host="eu-central.securevpn.com", ip_address="10.0.2.2", country="Germany", city="Frankfurt", latitude=50.1109, longitude=8.6821, load_percent=45, connected_clients=178, max_clients=1000, protocols="http,socks5,wireguard,ws"),
            Server(name="EU-Paris", host="eu-fr.securevpn.com", ip_address="10.0.2.3", country="France", city="Paris", latitude=48.8566, longitude=2.3522, load_percent=19, connected_clients=67, max_clients=1000, protocols="http,socks5"),
            Server(name="NL-AMS-1", host="nl-ams.securevpn.com", ip_address="10.0.2.4", country="Netherlands", city="Amsterdam", latitude=52.3676, longitude=4.9041, load_percent=12, connected_clients=43, max_clients=1000, protocols="http,socks5,wireguard,ws"),
            Server(name="SG-1", host="sg.securevpn.com", ip_address="10.0.3.1", country="Singapore", city="Singapore", latitude=1.3521, longitude=103.8198, load_percent=38, connected_clients=112, max_clients=1000, protocols="http,socks5,wireguard"),
            Server(name="JP-Tokyo-1", host="jp.securevpn.com", ip_address="10.0.3.2", country="Japan", city="Tokyo", latitude=35.6762, longitude=139.6503, load_percent=55, connected_clients=201, max_clients=1000, protocols="http,socks5,wireguard,ws"),
            Server(name="AU-Syd-1", host="au.securevpn.com", ip_address="10.0.3.3", country="Australia", city="Sydney", latitude=-33.8688, longitude=151.2093, load_percent=22, connected_clients=78, max_clients=1000, protocols="http,socks5"),
            Server(name="CA-Tor-1", host="ca.securevpn.com", ip_address="10.0.1.3", country="Canada", city="Toronto", latitude=43.6532, longitude=-79.3832, load_percent=31, connected_clients=95, max_clients=1000, protocols="http,socks5,wireguard"),
            Server(name="BR-SP-1", host="br.securevpn.com", ip_address="10.0.4.1", country="Brazil", city="São Paulo", latitude=-23.5505, longitude=-46.6333, load_percent=41, connected_clients=134, max_clients=1000, protocols="http,socks5"),
        ]
        for s in seed_servers:
            db.add(s)
        db.commit()

    if db.query(User).filter(User.username == "admin").count() == 0:
        admin = User(username="admin", email="admin@securevpn.com", hashed_password=get_password_hash("admin123"), full_name="Administrator", is_admin=True, is_active=True, tier="enterprise", quota_bytes=1099511627776)
        db.add(admin)
        db.commit()

    if db.query(User).filter(User.username == "demo").count() == 0:
        demo = User(username="demo", email="demo@securevpn.com", hashed_password=get_password_hash("demo123"), full_name="Demo User", is_admin=False, is_active=True, tier="free", quota_bytes=5368709120)
        db.add(demo)
        db.commit()

    if db.query(UsageRecord).count() == 0:
        users = db.query(User).all()
        servers = db.query(Server).all()
        now = datetime.now(timezone.utc)
        for u in users:
            for day_offset in range(30):
                day = now - timedelta(days=day_offset)
                daily_bytes = random.randint(50000000, 500000000)
                srv = random.choice(servers) if servers else None
                usage = UsageRecord(user_id=u.id, server_id=srv.id if srv else None, bytes_sent=daily_bytes // 2, bytes_received=daily_bytes // 2, protocol=random.choice(["http", "socks5", "wireguard", "ws"]), session_duration=random.randint(300, 7200), recorded_at=day)
                db.add(usage)
        db.commit()

    return {"message": "Database seeded"}


@router.put("/users/{user_id}/tier")
async def update_user_tier(
    user_id: int,
    tier_data: dict,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.tier = tier_data.get("tier", user.tier)
    if "quota_bytes" in tier_data:
        user.quota_bytes = tier_data["quota_bytes"]
    db.commit()
    return {"message": "Tier updated"}
