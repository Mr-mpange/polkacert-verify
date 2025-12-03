@echo off
echo ============================================================
echo Westend Testnet - Quick Test Setup
echo ============================================================
echo.

echo This will help you test the blockchain features on Westend testnet
echo.
pause

echo.
echo Step 1: Checking .env file...
if not exist ".env" (
    echo .env file not found!
    echo Creating from .env.example...
    copy .env.example .env
    echo.
    echo ⚠️  IMPORTANT: Edit .env file with your Supabase credentials!
    echo.
    echo Required:
    echo - VITE_SUPABASE_URL
    echo - VITE_SUPABASE_ANON_KEY
    echo.
    echo Westend endpoint is already configured:
    echo - VITE_POLKADOT_ENDPOINT=wss://westend-rpc.polkadot.io
    echo.
    pause
) else (
    echo ✅ .env file found
)

echo.
echo Step 2: Checking Westend configuration...
findstr /C:"westend-rpc.polkadot.io" .env >nul
if %errorlevel% equ 0 (
    echo ✅ Westend endpoint configured
) else (
    echo ⚠️  Westend endpoint not found in .env
    echo Add this line to .env:
    echo VITE_POLKADOT_ENDPOINT=wss://westend-rpc.polkadot.io
    pause
)

echo.
echo Step 3: Installing dependencies...
if not exist "node_modules" (
    echo Installing npm packages...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Installation failed!
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed
) else (
    echo ✅ Dependencies already installed
)

echo.
echo ============================================================
echo Setup Complete! Now follow these steps:
echo ============================================================
echo.
echo 1. Get Test Tokens (WND):
echo    - Install Polkadot.js extension
echo    - Create test account
echo    - Go to: https://faucet.polkadot.io/westend
echo    - Paste your address
echo    - Get free WND tokens
echo.
echo 2. Start Application:
echo    - Run: START_ALL.bat
echo    - Access: http://localhost:5173
echo.
echo 3. Test Features:
echo    - Login/Register
echo    - Connect Polkadot wallet
echo    - Issue test certificate
echo    - Verify certificate
echo    - Check on Subscan: https://westend.subscan.io/
echo.
echo 4. Read Testing Guide:
echo    - Open: TESTING_GUIDE.md
echo    - Follow test scenarios
echo.
echo ============================================================
echo.
echo Ready to start testing?
echo.
set /p start="Start application now? (y/n): "

if /i "%start%"=="y" (
    echo.
    echo Starting application...
    call START_ALL.bat
) else (
    echo.
    echo To start later, run: START_ALL.bat
    echo.
    pause
)
