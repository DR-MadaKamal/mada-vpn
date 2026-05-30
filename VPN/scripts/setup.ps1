Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  SecureVPN - Windows Setup Script" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

function Check-Command {
    param($Command)
    if (!(Get-Command $Command -ErrorAction SilentlyContinue)) {
        Write-Host "ERROR: $Command is required but not installed." -ForegroundColor Red
        exit 1
    }
}

Check-Command "docker"
Check-Command "docker-compose"

if (!(Test-Path ".env")) {
    Write-Host "Creating .env file with secure secrets..." -ForegroundColor Yellow
    $jwtSecret = -join ((97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object { [char]$_ })
    $wsSecret = -join ((97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object { [char]$_ })
    @"
JWT_SECRET=$jwtSecret
WS_SECRET=$wsSecret
"@ | Out-File -FilePath ".env"
    Write-Host ".env file created" -ForegroundColor Green
}

New-Item -ItemType Directory -Path "data\wireguard" -Force | Out-Null
New-Item -ItemType Directory -Path "deploy\ssl" -Force | Out-Null
New-Item -ItemType Directory -Path "data\postgres" -Force | Out-Null

if (!(Test-Path "deploy\ssl\cert.pem")) {
    Write-Host "Generating self-signed SSL certificate..." -ForegroundColor Yellow
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 `
        -keyout deploy/ssl/key.pem `
        -out deploy/ssl/cert.pem `
        -subj "//C=US\ST=State\L=City\O=SecureVPN\CN=securevpn.com"
}

Write-Host "Starting all services with Docker Compose..." -ForegroundColor Yellow
docker-compose up --build -d

Write-Host ""
Write-Host "Services started!" -ForegroundColor Green
Write-Host "  Website:    https://securevpn.com" -ForegroundColor Cyan
Write-Host "  API:        https://api.securevpn.com" -ForegroundColor Cyan
Write-Host "  Docs:       https://api.securevpn.com/docs" -ForegroundColor Cyan
Write-Host "  Proxy:      proxy.securevpn.com:8080" -ForegroundColor Cyan
Write-Host "  SOCKS5:     proxy.securevpn.com:1080" -ForegroundColor Cyan
Write-Host "  WireGuard:  proxy.securevpn.com:51820" -ForegroundColor Cyan
