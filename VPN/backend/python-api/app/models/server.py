from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class Server(Base):
    __tablename__ = "servers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    host = Column(String, nullable=False)
    ip_address = Column(String, nullable=False)
    country = Column(String, nullable=False)
    city = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    is_active = Column(Boolean, default=True)
    load_percent = Column(Integer, default=0)
    connected_clients = Column(Integer, default=0)
    max_clients = Column(Integer, default=1000)
    protocols = Column(String, default="http,socks5,wireguard")
    public_key = Column(String)
    p2p_allowed = Column(Boolean, default=False)
    features = Column(String, default="")  # comma-separated: p2p,obfuscation,streaming,ddos
    tier_required = Column(String, default="free")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
