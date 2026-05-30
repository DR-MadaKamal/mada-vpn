# Docker Deployment Guide

## Quick Start
```bash
# Linux/macOS
chmod +x scripts/setup.sh
./scripts/setup.sh

# Windows PowerShell
.\scripts\setup.ps1
```

## Manual Deployment

```bash
# 1. Set environment variables
export JWT_SECRET=$(openssl rand -hex 32)
export WS_SECRET=$(openssl rand -hex 32)

# 2. Start all services
docker-compose up --build -d

# 3. Check status
docker-compose ps

# 4. View logs
docker-compose logs -f
```

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Browser     │────▶│   Nginx      │────▶│  Next.js    │
│  Extension   │     │  (Reverse    │     │  Website    │
│              │     │   Proxy)     │     │  (:3000)    │
└─────────────┘     │              │     └─────────────┘
                    │  :443/:80    │     ┌─────────────┐
┌─────────────┐     │              │────▶│  Python API │
│  Desktop     │────▶│              │     │  (:8000)    │
│  App         │     └──────┬───────┘     └─────────────┘
└─────────────┘            │
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
       ┌──────────┐ ┌──────────┐ ┌──────────┐
       │ Go Proxy │ │ Node.js │ │PostgreSQL│
       │(:8080/   │ │WebSocket│ │(:5432)   │
       │ :1080/   │ │(:3001)  │ └──────────┘
       │ :51820)  │ └──────────┘ ┌──────────┐
       └──────────┘              │  Redis   │
                                 │(:6379)   │
                                 └──────────┘
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| Nginx | 80, 443 | Reverse proxy + SSL |
| Go Proxy | 8080 | HTTP proxy |
| Go Proxy | 1080 | SOCKS5 proxy |
| Go Proxy | 51820 | WireGuard |
| Python API | 8000 | Management API |
| Node Tunnel | 3001 | WebSocket tunnel |
| Website | 3000 | Next.js frontend |
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Cache/sessions |
