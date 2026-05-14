# TurfX - Setup ngrok for Boss Demo
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TurfX - Share with Boss Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if ngrok exists
if (-not (Test-Path "ngrok.exe")) {
    Write-Host "❌ ngrok.exe not found!" -ForegroundColor Red
    Write-Host "Please download from: https://ngrok.com/download" -ForegroundColor Yellow
    Start-Process "https://ngrok.com/download"
    exit
}

Write-Host "✅ ngrok.exe found!" -ForegroundColor Green
Write-Host ""

# Check if authenticated
$configPath = "$env:USERPROFILE\.ngrok2\ngrok.yml"
if (-not (Test-Path $configPath)) {
    Write-Host "⚠️  ngrok not authenticated yet!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "STEP 1: Sign up at ngrok (takes 30 seconds)" -ForegroundColor Cyan
    Write-Host "Opening signup page..." -ForegroundColor Gray
    Start-Process "https://dashboard.ngrok.com/signup"
    Write-Host ""
    Write-Host "STEP 2: After signup, copy your authtoken command" -ForegroundColor Cyan
    Write-Host "It looks like: ngrok config add-authtoken 2abc..." -ForegroundColor Gray
    Write-Host ""
    Write-Host "STEP 3: Paste the FULL command here and press Enter:" -ForegroundColor Cyan
    $authCommand = Read-Host "Paste command"
    
    # Execute the auth command
    Invoke-Expression $authCommand
    Write-Host ""
    Write-Host "✅ Authentication complete!" -ForegroundColor Green
    Write-Host ""
}

Write-Host "🚀 Starting ngrok for frontend (port 3000)..." -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANT: Keep this window open!" -ForegroundColor Yellow
Write-Host ""

# Start ngrok
.\ngrok.exe http 3000

Write-Host ""
Write-Host "Copy the https URL and send to your boss!" -ForegroundColor Green
