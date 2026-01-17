# Launch Firestore emulator, backend, and frontend in separate PowerShell windows

$backendDir = "C:\Users\aryav\Desktop\civic-frontend\civic-backend"
$frontendDir = "C:\Users\aryav\Desktop\civic-frontend"

Write-Host "Starting services..." -ForegroundColor Cyan

# Basic checks
if (-not (Get-Command java -ErrorAction SilentlyContinue)) {
  Write-Error "Java is not available in this terminal. Please reopen VS Code or check PATH."
  exit 1
}
if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
  Write-Error "npx is not available. Please install Node.js and npm."
  exit 1
}
if (-not (Test-Path $backendDir)) {
  Write-Error "Backend directory not found: $backendDir"
  exit 1
}
if (-not (Test-Path $frontendDir)) {
  Write-Error "Frontend directory not found: $frontendDir"
  exit 1
}

# Start Firestore Emulator
Write-Host "Opening Firestore Emulator window..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -WorkingDirectory $backendDir -ArgumentList "-NoExit -NoLogo -Command npx firebase emulators:start --only firestore --import ./.emulator-data --export-on-exit"

Start-Sleep -Seconds 1

# Start Backend
Write-Host "Opening Backend window..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -WorkingDirectory $backendDir -ArgumentList "-NoExit -NoLogo -Command npm start"

Start-Sleep -Seconds 1

# Start Frontend
Write-Host "Opening Frontend window..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -WorkingDirectory $frontendDir -ArgumentList "-NoExit -NoLogo -Command npm run dev"

# Open helpful UIs
Write-Host "Opening Firestore UI and Frontend in browser..." -ForegroundColor Yellow
Start-Process "http://localhost:4002"
Start-Process "http://localhost:5173"

Write-Host "All services launched. Use Ctrl+C in each window to stop." -ForegroundColor Cyan
