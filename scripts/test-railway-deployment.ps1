# Test Railway Deployment Locally
# Run this before deploying to ensure everything works

Write-Host "🧪 Testing Railway Deployment Configuration..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if backend starts with production settings
Write-Host "📋 Test 1: Checking production configuration..." -ForegroundColor Yellow
$env:NODE_ENV = "production"
$env:PORT = "3000"

# Check if required files exist
$requiredFiles = @(
    "civic-backend\index.js",
    "civic-backend\package.json",
    "railway.json",
    "civic-backend\.env.example"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file exists" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file missing" -ForegroundColor Red
        $allFilesExist = $false
    }
}

Write-Host ""

# Test 2: Check environment variables
Write-Host "📋 Test 2: Checking environment variables..." -ForegroundColor Yellow

if ($env:GEMINI_API_KEY) {
    Write-Host "  ✓ GEMINI_API_KEY is set" -ForegroundColor Green
} else {
    Write-Host "  ✗ GEMINI_API_KEY not set (Required for Railway)" -ForegroundColor Red
}

if ($env:TWILIO_ACCOUNT_SID -and $env:TWILIO_AUTH_TOKEN) {
    Write-Host "  ✓ Twilio credentials set (SMS enabled)" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Twilio not configured (SMS will be logged to console)" -ForegroundColor Yellow
}

Write-Host ""

# Test 3: Start backend temporarily
Write-Host "📋 Test 3: Starting backend in production mode..." -ForegroundColor Yellow
Write-Host "  Press Ctrl+C to stop when you see 'Civic backend running'" -ForegroundColor Gray
Write-Host ""

cd civic-backend
npm start

# Cleanup
$env:NODE_ENV = ""
$env:PORT = ""
cd ..

Write-Host ""
Write-Host "✅ Local test completed!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Push to GitHub: git push origin main"
Write-Host "  2. Go to railway.app and deploy"
Write-Host "  3. Set environment variables in Railway dashboard"
Write-Host "  4. Check DEPLOYMENT_CHECKLIST.md for details"
