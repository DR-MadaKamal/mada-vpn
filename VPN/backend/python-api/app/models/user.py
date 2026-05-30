from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text
from sqlalchemy.sql import func
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    tier = Column(String, default="free")
    quota_bytes = Column(Integer, default=524288000)
    ad_blocking = Column(Boolean, default=True)
    lan_access = Column(Boolean, default=False)
    bandwidth_alert_pct = Column(Integer, default=80)
    favorite_servers = Column(String, default="")
    totp_secret = Column(String, default="")
    totp_enabled = Column(Boolean, default=False)
    dns_servers = Column(String, default="1.1.1.1,8.8.8.8")
    port_forwarding = Column(Boolean, default=False)
    ipv6_leak_protection = Column(Boolean, default=True)
    auto_failover = Column(Boolean, default=True)
    referral_code = Column(String, default="", index=True)
    referral_reward = Column(Integer, default=0)
    webhook_url = Column(String, default="")
    notify_email = Column(Boolean, default=True)
    notify_push = Column(Boolean, default=False)
    schedule_enabled = Column(Boolean, default=False)
    schedule_start = Column(String, default="08:00")
    schedule_end = Column(String, default="23:00")
    schedule_days = Column(String, default="mon,tue,wed,thu,fri,sat,sun")
    stealth_mode = Column(Boolean, default=False)
    obfuscation = Column(String, default="none")
    theme = Column(String, default="dark")
    organization_id = Column(Integer, default=0)
    # --- New fields for features 43-100 ---
    dns_over_https = Column(Boolean, default=False)
    bandwidth_saver = Column(Boolean, default=False)
    auto_disconnect_minutes = Column(Integer, default=0)
    connection_timer_minutes = Column(Integer, default=0)
    language = Column(String, default="en")
    onboarded = Column(Boolean, default=False)
    quick_connect = Column(Boolean, default=True)
    mtu_size = Column(Integer, default=1500)
    custom_port = Column(Integer, default=0)
    prefer_tcp = Column(Boolean, default=True)
    last_connected_server_id = Column(Integer, default=0)
    last_connected_at = Column(DateTime(timezone=True))
    trial_used = Column(Boolean, default=False)
    trial_expires_at = Column(DateTime(timezone=True))
    auto_renew = Column(Boolean, default=True)
    connection_log_enabled = Column(Boolean, default=True)
    split_tunnel_mode = Column(String, default="apps")
    protocol_order = Column(String, default="http,socks5,wireguard,ws,openvpn,ikev2,shadowsocks")
    city_level = Column(Boolean, default=False)
    server_grouping = Column(String, default="country")
    # --- New advanced VPN features ---
    ram_only_mode = Column(Boolean, default=False)
    no_logs_attested = Column(Boolean, default=False)
    auto_wifi_protection = Column(Boolean, default=False)
    malware_blocker = Column(Boolean, default=True)
    tracker_blocker = Column(Boolean, default=True)
    smart_dns = Column(Boolean, default=False)
    smart_dns_servers = Column(String, default="")
    meshnet_enabled = Column(Boolean, default=False)
    dedicated_ip_server_id = Column(Integer, default=0)
    dedicated_ip_address = Column(String, default="")
    unlimited_connections = Column(Boolean, default=False)
    dynamic_switching_enabled = Column(Boolean, default=False)
    pfs_enabled = Column(Boolean, default=True)
    pfs_key_rotation_hours = Column(Integer, default=24)
    shadowsocks_enabled = Column(Boolean, default=False)
    shadowsocks_port = Column(Integer, default=8443)
    shadowsocks_password = Column(String, default="")
    shadowsocks_method = Column(String, default="aes-256-gcm")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class LoginActivity(Base):
    __tablename__ = "login_activity"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    ip_address = Column(String, default="")
    user_agent = Column(String, default="")
    device = Column(String, default="")
    location = Column(String, default="")
    success = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Referral(Base):
    __tablename__ = "referrals"

    id = Column(Integer, primary_key=True, index=True)
    referrer_id = Column(Integer, nullable=False, index=True)
    referred_email = Column(String, nullable=False)
    code = Column(String, nullable=False, index=True)
    status = Column(String, default="pending")
    reward_granted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ApiKey(Base):
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    name = Column(String, nullable=False)
    key_hash = Column(String, nullable=False)
    prefix = Column(String, nullable=False)
    last_used_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ServerLoadSnapshot(Base):
    __tablename__ = "server_load_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    server_id = Column(Integer, nullable=False, index=True)
    load_percent = Column(Integer, default=0)
    connected_clients = Column(Integer, default=0)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    owner_id = Column(Integer, nullable=False)
    tier = Column(String, default="free")
    member_limit = Column(Integer, default=5)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class OrganizationMember(Base):
    __tablename__ = "organization_members"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, nullable=False, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    role = Column(String, default="member")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ActiveSession(Base):
    __tablename__ = "active_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    token_prefix = Column(String, default="")
    ip_address = Column(String, default="")
    device = Column(String, default="")
    expires_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PromoCode(Base):
    __tablename__ = "promo_codes"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, nullable=False)
    discount_pct = Column(Integer, default=0)
    discount_gb = Column(Integer, default=0)
    max_uses = Column(Integer, default=100)
    use_count = Column(Integer, default=0)
    expires_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PromoRedemption(Base):
    __tablename__ = "promo_redemptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    promo_id = Column(Integer, nullable=False)
    code = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# --- New models for features 43-100 ---

class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    name = Column(String, default="")
    device_type = Column(String, default="")
    ip_address = Column(String, default="")
    is_active = Column(Boolean, default=True)
    last_connected_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ConnectionLog(Base):
    __tablename__ = "connection_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    server_id = Column(Integer, default=0)
    server_name = Column(String, default="")
    protocol = Column(String, default="")
    bytes_sent = Column(Integer, default=0)
    bytes_received = Column(Integer, default=0)
    duration_seconds = Column(Integer, default=0)
    quality_score = Column(Integer, default=100)
    ip_address = Column(String, default="")
    country = Column(String, default="")
    started_at = Column(DateTime(timezone=True))
    ended_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    amount = Column(Float, default=0.0)
    currency = Column(String, default="USD")
    status = Column(String, default="pending")
    description = Column(String, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    paid_at = Column(DateTime(timezone=True))


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    subject = Column(String, default="")
    message = Column(Text, default="")
    status = Column(String, default="open")
    priority = Column(String, default="normal")
    category = Column(String, default="general")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True))


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    badge_name = Column(String, nullable=False)
    badge_icon = Column(String, default="")
    description = Column(String, default="")
    earned_at = Column(DateTime(timezone=True), server_default=func.now())


class KnowledgeBaseArticle(Base):
    __tablename__ = "knowledge_base"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, default="")
    category = Column(String, default="")
    order_index = Column(Integer, default=0)
    published = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PaymentMethod(Base):
    __tablename__ = "payment_methods"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    method_type = Column(String, default="card")
    last_four = Column(String, default="")
    expiry_month = Column(Integer, default=0)
    expiry_year = Column(Integer, default=0)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class InAppNotification(Base):
    __tablename__ = "in_app_notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    title = Column(String, default="")
    message = Column(String, default="")
    notification_type = Column(String, default="info")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ConnectionRule(Base):
    __tablename__ = "connection_rules"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    name = Column(String, default="")
    source_type = Column(String, default="domain")
    source_value = Column(String, default="")
    destination_type = Column(String, default="proxy")
    destination_value = Column(String, default="")
    action = Column(String, default="route")
    enabled = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ServerPing(Base):
    __tablename__ = "server_pings"

    id = Column(Integer, primary_key=True, index=True)
    server_id = Column(Integer, nullable=False, index=True)
    ping_ms = Column(Float, default=0.0)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())


class MeshnetDevice(Base):
    __tablename__ = "meshnet_devices"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    peer_id = Column(String, nullable=False, unique=True)
    name = Column(String, default="")
    ip_address = Column(String, default="")
    public_key = Column(String, default="")
    allowed_ips = Column(String, default="")
    is_online = Column(Boolean, default=False)
    last_seen_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class DedicatedIP(Base):
    __tablename__ = "dedicated_ips"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    server_id = Column(Integer, nullable=False)
    ip_address = Column(String, nullable=False)
    is_assigned = Column(Boolean, default=True)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())


class ObfuscationRule(Base):
    __tablename__ = "obfuscation_rules"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    name = Column(String, default="")
    obfuscation_type = Column(String, default="tls")  # tls, noise, shadow, wss
    port = Column(Integer, default=443)
    enabled = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class TunnelHealth(Base):
    __tablename__ = "tunnel_health"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    server_id = Column(Integer, nullable=False)
    protocol = Column(String, default="")
    latency_ms = Column(Float, default=0.0)
    packet_loss_pct = Column(Float, default=0.0)
    jitter_ms = Column(Float, default=0.0)
    is_stable = Column(Boolean, default=True)
    checked_at = Column(DateTime(timezone=True), server_default=func.now())


class SmartDNSRule(Base):
    __tablename__ = "smart_dns_rules"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    domain = Column(String, nullable=False)
    target_server = Column(String, default="")
    enabled = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
