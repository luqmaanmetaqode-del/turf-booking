@echo off
echo ========================================
echo   TurfX - Share with Boss
echo ========================================
echo.
echo STEP 1: Download ngrok
echo Go to: https://ngrok.com/download
echo.
echo STEP 2: Extract ngrok.exe to this folder
echo.
echo STEP 3: Run this command:
echo    ngrok http 3000
echo.
echo STEP 4: Copy the https URL and send to your boss!
echo.
echo ========================================
echo.
echo Checking if ngrok is available...
echo.

where ngrok >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ ngrok found! Starting...
    echo.
    ngrok http 3000
) else (
    echo ❌ ngrok not found!
    echo.
    echo Please download from: https://ngrok.com/download
    echo Extract ngrok.exe to: %CD%
    echo Then run this script again.
    echo.
    start https://ngrok.com/download
    pause
)
