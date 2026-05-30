from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.routes import auth, users, servers, subscriptions, admin, analytics, wireguard

Base.metadata.create_all(bind=engine)


def seed_database():
    db = SessionLocal()
    try:
        from app.models.server import Server
        from app.models.subscription import Subscription
        from app.models.usage import UsageRecord
        from app.models.user import User
        from datetime import datetime, timedelta, timezone

        if db.query(Server).count() > 0:
            return

        seed_servers = [
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
        print(f"[seed] Added {len(seed_servers)} servers")

        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            from app.core.security import get_password_hash
            admin_user = User(username="admin", email="admin@securevpn.com", hashed_password=get_password_hash("admin123"), full_name="Administrator", is_admin=True, is_active=True, tier="enterprise", quota_bytes=1099511627776)
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            print("[seed] Created admin user (admin/admin123)")

        from app.core.security import get_password_hash
        demo_user = db.query(User).filter(User.username == "demo").first()
        if not demo_user:
            demo_user = User(username="demo", email="demo@securevpn.com", hashed_password=get_password_hash("demo123"), full_name="Demo User", is_admin=False, is_active=True, tier="free", quota_bytes=5368709120)
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
            print("[seed] Created demo user (demo/demo123)")

        if db.query(Subscription).count() == 0:
            from datetime import datetime, timedelta, timezone
            for u in [admin_user]:
                sub = Subscription(user_id=u.id, plan="enterprise", status="active", price_monthly=29.99, bandwidth_gb=1000, devices_limit=10, speed_limit_mbps=500, expires_at=datetime.now(timezone.utc) + timedelta(days=30))
                db.add(sub)
            db.commit()
            print("[seed] Created subscriptions")

        if db.query(UsageRecord).count() == 0:
            import random
            now = datetime.now(timezone.utc)
            for u in [admin_user, demo_user]:
                for day_offset in range(30):
                    day = now - timedelta(days=day_offset)
                    daily_bytes = random.randint(50000000, 500000000)
                    usage = UsageRecord(user_id=u.id, server_id=u.id if u.id < len(seed_servers) else 1, bytes_sent=daily_bytes // 2, bytes_received=daily_bytes // 2, protocol=random.choice(["http", "socks5", "wireguard", "ws"]), session_duration=random.randint(300, 7200), recorded_at=day)
                    db.add(usage)
            db.commit()
            print("[seed] Created sample usage records")

        # Seed knowledge base articles
        from app.models.user import KnowledgeBaseArticle, Achievement, Device
        if db.query(KnowledgeBaseArticle).count() == 0:
            articles = [
                KnowledgeBaseArticle(title="Getting Started with SecureVPN", content="Download the app for your platform, log in with your credentials, and click Connect. Your traffic is now encrypted and secure.", category="Getting Started", order_index=1),
                KnowledgeBaseArticle(title="Choosing the Right Protocol", content="WireGuard offers the best speed and security. HTTP proxy works on all networks. SOCKS5 is ideal for P2P. WebSocket tunnel bypasses strict firewalls.", category="Protocols", order_index=2),
                KnowledgeBaseArticle(title="Understanding the Kill Switch", content="The kill switch monitors your VPN connection and blocks all internet traffic if the connection drops unexpectedly, preventing any data leaks.", category="Security", order_index=3),
                KnowledgeBaseArticle(title="Setting Up Multi-Hop VPN", content="Multi-hop routes your traffic through two servers for extra privacy. Enable it in the Advanced section of the dashboard.", category="Advanced", order_index=4),
                KnowledgeBaseArticle(title="Using Split Tunneling", content="Split tunneling lets you choose which apps or domains use the VPN and which use your regular internet connection.", category="Advanced", order_index=5),
                KnowledgeBaseArticle(title="Two-Factor Authentication", content="Add an extra layer of security by enabling TOTP-based two-factor authentication in your account settings.", category="Security", order_index=6),
                KnowledgeBaseArticle(title="Managing Devices", content="You can view and manage all devices connected to your account from the Devices section in your dashboard.", category="Account", order_index=7),
                KnowledgeBaseArticle(title="Bandwidth Usage and Alerts", content="Monitor your bandwidth usage and set up alerts to get notified when you approach your plan's limit.", category="Account", order_index=8),
            ]
            for a in articles:
                db.add(a)
            db.commit()
            print(f"[seed] Added {len(articles)} knowledge base articles")

        # Seed achievements for demo user
        if db.query(Achievement).filter(Achievement.user_id == demo_user.id).count() == 0:
            achievements = [
                Achievement(user_id=demo_user.id, badge_name="First Connection", badge_icon="🔌", description="Connected to SecureVPN for the first time"),
                Achievement(user_id=demo_user.id, badge_name="Speed Demon", badge_icon="⚡", description="Completed a speed test"),
                Achievement(user_id=demo_user.id, badge_name="Globetrotter", badge_icon="🌍", description="Connected to servers on 3 different continents"),
                Achievement(user_id=demo_user.id, badge_name="Security Conscious", badge_icon="🛡️", description="Enabled 2FA on your account"),
                Achievement(user_id=demo_user.id, badge_name="Early Adopter", badge_icon="🌟", description="Joined SecureVPN during beta"),
            ]
            for a in achievements:
                db.add(a)
            db.commit()
            print(f"[seed] Added {len(achievements)} achievements")

        # Seed a device for demo user
        if db.query(Device).filter(Device.user_id == demo_user.id).count() == 0:
            from datetime import datetime, timezone
            devices = [
                Device(user_id=demo_user.id, name="My Laptop", device_type="Windows", ip_address="192.168.1.42", is_active=True, last_connected_at=datetime.now(timezone.utc)),
                Device(user_id=demo_user.id, name="My Phone", device_type="Android", ip_address="192.168.1.100", is_active=True, last_connected_at=datetime.now(timezone.utc)),
            ]
            for d in devices:
                db.add(d)
            db.commit()
            print(f"[seed] Added devices for demo user")

        # Seed a sample invoice
        from app.models.user import Invoice
        if db.query(Invoice).filter(Invoice.user_id == demo_user.id).count() == 0:
            from datetime import datetime, timezone
            invoice = Invoice(user_id=demo_user.id, amount=9.99, currency="USD", status="paid", description="SecureVPN Pro - Monthly", paid_at=datetime.now(timezone.utc))
            db.add(invoice)
            db.commit()
            print("[seed] Added sample invoice")

        # Seed a promo code
        from app.models.user import PromoCode
        if db.query(PromoCode).count() == 0:
            from datetime import datetime, timedelta, timezone
            promo = PromoCode(code="WELCOME10", discount_pct=10, discount_gb=5, max_uses=1000, expires_at=datetime.now(timezone.utc) + timedelta(days=365))
            db.add(promo)
            db.commit()
            print("[seed] Added WELCOME10 promo code")
    finally:
        db.close()

seed_database()

app = FastAPI(
    title="SecureVPN Management API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(servers.router, prefix="/api/v1/servers", tags=["Servers"])
app.include_router(subscriptions.router, prefix="/api/v1/subscriptions", tags=["Subscriptions"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])
app.include_router(wireguard.router, prefix="/api/v1/wireguard", tags=["WireGuard"])


@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}
