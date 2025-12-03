@echo off
echo ============================================================
echo Starting PolkaCert Verify - Complete Application
echo ============================================================
echo.
echo This will start:
echo 1. Frontend (React + Vite)
echo 2. Backend (Supabase)
echo 3. ML Model (TensorFlow.js - auto-loaded)
echo.
echo Press Ctrl+C to stop all services
echo.
pause

echo.
echo ============================================================
echo Checking dependencies...
echo ============================================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing npm dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Error: Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed
) else (
    echo ✅ Dependencies already installed
)

echo.
echo ============================================================
echo Starting Development Server
echo ============================================================
echo.
echo Frontend will be available at: http://localhost:5173
echo.
echo Features available:
echo ✅ Certificate verification
echo ✅ Blockchain integration (Polkadot)
echo ✅ Rule-based AI verification
echo ✅ ML model verification (if trained)
echo ✅ QR code scanning
echo ✅ Admin dashboard
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the development server
npm run dev
