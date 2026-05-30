#!/bin/bash
set -e

echo "============================================"
echo "  SecureVPN - Complete Setup Script"
echo "============================================"

check_command() {
    if ! command -v "$1" &> /dev/null; then
        echo "ERROR: $1 is required but not installed."
        exit 1
    fi
}

check_command docker
check_command docker-compose

setup_env() {
    if [ ! -f .env ]; then
        echo "Creating .env file..."
        cat > .env << EOF
JWT_SECRET=$(openssl rand -hex 32)
WS_SECRET=$(openssl rand -hex 32)
POSTGRES_PASSWORD=$(openssl rand -hex 16)
EOF
        echo ".env file created with secure secrets"
    fi
}

setup_directories() {
    mkdir -p data/wireguard deploy/ssl data/postgres
}

generate_ssl() {
    if [ ! -f deploy/ssl/cert.pem ]; then
        echo "Generating self-signed SSL certificate..."
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout deploy/ssl/key.pem \
            -out deploy/ssl/cert.pem \
            -subj "/C=US/ST=State/L=City/O=SecureVPN/CN=securevpn.com"
    fi
}

install_dependencies() {
    echo "Setting up Go proxy dependencies..."
    cd backend/go-proxy
    go mod tidy 2>/dev/null || true
    cd ../..

    echo "Setting up Python dependencies..."
    cd backend/python-api
    pip install -r requirements.txt 2>/dev/null || true
    cd ../..

    echo "Setting up Node.js tunnel dependencies..."
    cd backend/node-tunnel
    npm install 2>/dev/null || true
    cd ../..

    echo "Setting up website dependencies..."
    cd frontend/website
    npm install 2>/dev/null || true
    cd ../..

    echo "Setting up extension..."
    cd frontend/extension
    npm install 2>/dev/null || true
    cd ../..

    echo "Setting up desktop app..."
    cd frontend/desktop
    npm install 2>/dev/null || true
    cd ../..
}

init_database() {
    echo "Waiting for PostgreSQL..."
    sleep 5
    echo "Database initialization complete (auto-migrate with SQLAlchemy)"
}

start_services() {
    echo "Starting all services with Docker Compose..."
    docker-compose up --build -d
    echo "Services started!"
    echo "  Website:    https://securevpn.com"
    echo "  API:        https://api.securevpn.com"
    echo "  Docs:       https://api.securevpn.com/docs"
    echo "  Proxy:      proxy.securevpn.com:8080"
    echo "  SOCKS5:     proxy.securevpn.com:1080"
    echo "  WireGuard:  proxy.securevpn.com:51820"
}

show_help() {
    echo ""
    echo "Available commands:"
    echo "  ./setup.sh            - Full setup"
    echo "  ./setup.sh start      - Start services"
    echo "  ./setup.sh stop       - Stop services"
    echo "  ./setup.sh restart    - Restart services"
    echo "  ./setup.sh logs       - View logs"
    echo "  ./setup.sh update     - Update all dependencies"
    echo ""
}

case "${1:-}" in
    start)
        docker-compose up -d
        ;;
    stop)
        docker-compose down
        ;;
    restart)
        docker-compose restart
        ;;
    logs)
        docker-compose logs -f
        ;;
    update)
        install_dependencies
        ;;
    *)
        setup_env
        setup_directories
        generate_ssl
        install_dependencies
        start_services
        show_help
        ;;
esac
