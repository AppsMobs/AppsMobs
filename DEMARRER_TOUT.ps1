# Script PowerShell pour démarrer Frontend et Backend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   DEMARRAGE BOOTYBOT - TOUT EN UN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/2] Demarrage du BACKEND (port 3001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\website\auth-backend'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host "[2/2] Demarrage du FRONTEND (port 5174)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\website'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Les deux serveurs sont en cours de demarrage" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:3001" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5174" -ForegroundColor Cyan
Write-Host ""
Write-Host "Les serveurs tournent dans des fenetres separees." -ForegroundColor Yellow
Write-Host "Vous pouvez fermer cette fenetre." -ForegroundColor Yellow

