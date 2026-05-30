$root = Split-Path -Parent $MyInvocation.MyCommand.Definition

Write-Host "=== SecureVPN Development Environment ===" -ForegroundColor Cyan
Write-Host ""

# 1. Start Python API
Write-Host "[1/3] Starting Python API server..." -ForegroundColor Yellow
$apiProcess = Start-Process -NoNewWindow -FilePath "powershell" -ArgumentList "-Command uvicorn app.main:app --reload --host 0.0.0.0 --port 8000" -WorkingDirectory "$root\backend\python-api" -PassThru
Start-Sleep -Seconds 4

# 2. Start WebSocket tunnel (Node.js)
Write-Host "[2/3] Starting Node.js WebSocket tunnel..." -ForegroundColor Yellow
$tunnelProcess = Start-Process -NoNewWindow -FilePath "powershell" -ArgumentList "-Command node src/server.js" -WorkingDirectory "$root\backend\node-tunnel" -PassThru
Start-Sleep -Seconds 2

# 3. Start Next.js website
Write-Host "[3/3] Starting Next.js website..." -ForegroundColor Yellow
$webProcess = Start-Process -NoNewWindow -FilePath "powershell" -ArgumentList "-Command npm run dev" -WorkingDirectory "$root\frontend\website" -PassThru
Start-Sleep -Seconds 8

Write-Host ""
Write-Host "=== All services started ===" -ForegroundColor Green
Write-Host "  Website:   http://localhost:3000" -ForegroundColor Green
Write-Host "  API:       http://localhost:8000" -ForegroundColor Green
Write-Host "  API Docs:  http://localhost:8000/docs" -ForegroundColor Green
Write-Host "  Tunnel:    ws://localhost:3001" -ForegroundColor Green
Write-Host ""
Write-Host "Demo accounts:" -ForegroundColor Cyan
Write-Host "  Admin: admin / admin123 (enterprise tier)" -ForegroundColor Cyan
Write-Host "  Demo:  demo / demo123 (free tier)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Chrome extension:" -ForegroundColor Cyan
Write-Host "  1. Open chrome://extensions" -ForegroundColor Cyan
Write-Host "  2. Enable Developer mode" -ForegroundColor Cyan
Write-Host "  3. Load unpacked -> $root\frontend\extension\dist" -ForegroundColor Cyan
Write-Host ""
Write-Host "Desktop app:" -ForegroundColor Cyan
Write-Host "  cd $root\frontend\desktop && npm start" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Magenta

# Wait for all processes
$apiProcess.Handle | Out-Null
$tunnelProcess.Handle | Out-Null
$webProcess.Handle | Out-Null
$apiProcess.WaitForExit()
$tunnelProcess.WaitForExit()
$webProcess.WaitForExit()
