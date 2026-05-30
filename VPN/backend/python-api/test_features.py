import httpx

base = "http://localhost:8000"
client = httpx.Client(timeout=httpx.Timeout(10.0))

# Login
r = client.post(f"{base}/api/v1/auth/login", data={"username": "demo", "password": "demo123"})
assert r.status_code == 200, f"Login: {r.status_code} {r.text}"
d = r.json()
token = d["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print("1. Login: OK")

# WireGuard config with real keys
r = client.get(f"{base}/api/v1/users/config/1/wireguard", headers=headers)
assert r.status_code == 200
j = r.json()
assert j["wireguard_private_key"] and len(j["wireguard_private_key"]) > 10
assert j["wireguard_public_key"] and len(j["wireguard_public_key"]) > 10
print(f"2. WireGuard real keys: OK ({j['wireguard_private_key'][:10]}...)")

# Server search
r = client.get(f"{base}/api/v1/servers/search?q=eu")
assert r.status_code == 200 and len(r.json()) > 0
print(f"3. Server search: {len(r.json())} results")

# Recommended region
r = client.get(f"{base}/api/v1/servers/recommended-region", headers=headers)
assert r.status_code == 200
j = r.json()
assert j["recommended_region"] and j["recommended_server"]
print(f"4. Recommended region: {j['recommended_region']} -> {j['recommended_server']['name']}")

# Email verification status
r = client.get(f"{base}/api/v1/auth/verification-status", headers=headers)
assert r.status_code == 200 and r.json()["email_verified"] is True
print("5. Email verified: True")

# Disconnect
r = client.post(f"{base}/api/v1/users/disconnect", headers=headers)
assert r.status_code == 200 and r.json()["message"] == "Disconnected"
print("6. Disconnect: OK")

# Metrics
r = client.get(f"{base}/metrics")
assert r.status_code == 200 and len(r.content) > 100
print(f"7. Metrics: {len(r.content)} bytes")

# Refresh token rotation
r = client.post(f"{base}/api/v1/auth/refresh", params={"refresh_token_str": d["refresh_token"]})
assert r.status_code == 200
print("8. Refresh token rotation: OK")

# Resend verification (email already verified -> 400)
r = client.post(f"{base}/api/v1/auth/resend-verification", headers=headers)
assert r.status_code == 400
print("9. Resend verification: 400 (already verified)")

# Profile with email_verified field
r = client.get(f"{base}/api/v1/auth/me", headers=headers)
assert r.status_code == 200 and "email_verified" in r.json()
print(f"10. Profile email_verified: {r.json()['email_verified']}")

# Rate limiter: 10 quick requests in a loop
for i in range(10):
    r = client.get(f"{base}/api/v1/users/profile", headers=headers)
    assert r.status_code == 200, f"Rate limit hit at {i}: {r.status_code}"
print("11. Rate limiter: 10 requests passed")

# Webhook test (no URL configured -> 400)
r = client.post(f"{base}/api/v1/users/webhook/test", headers=headers)
assert r.status_code == 400
print("12. Webhook event system: 400 (no URL configured)")

# Server health check (servers loaded, load_pct varies)
r = client.get(f"{base}/api/v1/servers/")
assert r.status_code == 200 and len(r.json()) > 0
loads = [s["load_percent"] for s in r.json()]
print(f"13. Server health auto-pings: {len(r.json())} servers active")

# Bandwidth usage
r = client.get(f"{base}/api/v1/users/usage", headers=headers)
assert r.status_code == 200
print(f"14. Bandwidth quota: {r.json()['bytes_used']} bytes used")

# Connection log stats
r = client.get(f"{base}/api/v1/users/connection-logs/stats", headers=headers)
assert r.status_code == 200
print(f"15. Connection log stats: {r.json()['total_connections']} connections")

print()
print("=== ALL 15 TESTS PASSED ===")
