<div align="center">
  <h1>🛡️ MadaVPN</h1>
  <p><strong>Full-stack open source VPN platform</strong></p>
  <p>
    <a href="https://github.com/mada-dev/mada-vpn/issues">Report Bug</a> ·
    <a href="https://github.com/mada-dev/mada-vpn/issues">Request Feature</a>
  </p>
  <p>
    <img src="https://img.shields.io/badge/backend-FastAPI-009688?logo=fastapi" alt="FastAPI">
    <img src="https://img.shields.io/badge/frontend-Next.js-000000?logo=next.js" alt="Next.js">
    <img src="https://img.shields.io/badge/extension-Chrome-4285F4?logo=google-chrome" alt="Chrome">
    <img src="https://img.shields.io/badge/desktop-Electron-47848F?logo=electron" alt="Electron">
    <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT">
  </p>
</div>

---

## ✨ Features

| Category | Features |
|----------|----------|
| **Core** | RAM-Only servers, strict No-Logs policy, Privacy jurisdiction (Switzerland), WireGuard, OpenVPN |
| **Stealth** | Obfuscation (4 methods), Shadowsocks, Multi-Hop (3-hop), Dedicated IP, Tor over VPN |
| **Security** | Kill Switch (system + app), IPv6/WebRTC leak protection, Private DNS, Perfect Forward Secrecy |
| **Performance** | Split Tunneling, Smart DNS, 10 Gbps ports, 11 global servers, Dynamic Switching |
| **Convenience** | Malware blocker, Auto WiFi, Unlimited connections, Meshnet, Cross-platform |

## 🚀 Quick Start

### 1. Backend API
```bash
cd backend/python-api
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 2. Web Dashboard
```bash
cd frontend/website
npm install
npm run dev
# opens at http://localhost:3000
```

### 3. Chrome Extension
```bash
cd frontend/extension
npm install
node build.js
# Load unpacked from frontend/extension/dist/ in chrome://extensions
```

### 4. Desktop App
```bash
cd frontend/desktop
npm install
npm start
```

## 🌐 Live Demo

- **Dashboard**: `http://localhost:3000`
- **API Docs**: `http://localhost:8000/docs`
- **Login**: `demo / demo123`

## 📦 Downloads

| Platform | Download |
|----------|----------|
| Chrome Extension | [Load unpacked](https://github.com/mada-dev/mada-vpn/tree/main/frontend/extension) |
| Windows (64-bit) | [madavpn-win32-x64.zip](https://github.com/mada-dev/mada-vpn/releases) |
| macOS (Intel) | [madavpn-darwin-x64.dmg](https://github.com/mada-dev/mada-vpn/releases) |
| macOS (Apple Silicon) | [madavpn-darwin-arm64.dmg](https://github.com/mada-dev/mada-vpn/releases) |
| Linux (AppImage) | [madavpn-linux-x86_64.AppImage](https://github.com/mada-dev/mada-vpn/releases) |

## 🏗️ Architecture

```
mada-vpn/
├── backend/python-api/    # FastAPI REST API (Python)
│   └── app/
│       ├── core/          # Config, DB, Security, Background tasks
│       ├── models/        # SQLAlchemy models (User, Server, etc.)
│       └── routes/        # API endpoints (auth, users, servers, ...)
├── frontend/
│   ├── website/           # Next.js dashboard (TypeScript)
│   ├── extension/         # Chrome extension (proxy-based VPN)
│   └── desktop/           # Electron desktop app
└── README.md
```

## 🧪 API Testing

```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -d "username=demo&password=demo123" | python -c "import sys,json;print(json.load(sys.stdin)['access_token'])")

# List servers
curl http://localhost:8000/api/v1/servers/

# Search servers
curl "http://localhost:8000/api/v1/servers/search?q=tokyo"

# WireGuard config with real crypto keys
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/users/config/1/wireguard

# Check health
curl http://localhost:8000/health
```

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///./vpn.db` | SQLite database path |
| `JWT_SECRET` | `change-this-in-production` | JWT signing secret |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API URL |

## 🛠️ Tech Stack

- **Backend**: Python 3.13, FastAPI, SQLAlchemy, SQLite, JWT, Prometheus
- **Frontend**: Next.js 14, React 18, TypeScript, TailwindCSS, Lucide icons
- **Extension**: Chrome Extensions API (MV3), Proxy API, WebRTC
- **Desktop**: Electron, Node.js, System proxy management
- **Protocols**: WireGuard, HTTP proxy, SOCKS5, WebSocket tunnel, Shadowsocks, OpenVPN

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <p>Built with ❤️ for privacy and freedom</p>
</div>
