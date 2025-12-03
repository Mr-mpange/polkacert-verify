@echo off
echo ============================================================
echo PolkaCert Verify - Production Deployment
echo ============================================================
echo.

echo Choose deployment platform:
echo 1. Vercel (Recommended)
echo 2. Netlify
echo 3. Docker
echo 4. Build only
echo.

set /p choice="Enter choice (1-4): "

if "%choice%"=="1" goto vercel
if "%choice%"=="2" goto netlify
if "%choice%"=="3" goto docker
if "%choice%"=="4" goto build
goto invalid

:vercel
echo.
echo ============================================================
echo Deploying to Vercel
echo ============================================================
echo.
echo Make sure you have:
echo - Vercel CLI installed: npm install -g vercel
echo - Logged in: vercel login
echo - Environment variables configured
echo.
pause

echo Building production bundle...
call npm run build:prod
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo.
echo Deploying to Vercel...
call vercel --prod

echo.
echo ✅ Deployment complete!
echo Check your Vercel dashboard for the URL
pause
exit /b 0

:netlify
echo.
echo ============================================================
echo Deploying to Netlify
echo ============================================================
echo.
echo Make sure you have:
echo - Netlify CLI installed: npm install -g netlify-cli
echo - Logged in: netlify login
echo - Environment variables configured
echo.
pause

echo Building production bundle...
call npm run build:prod
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo.
echo Deploying to Netlify...
call netlify deploy --prod

echo.
echo ✅ Deployment complete!
echo Check your Netlify dashboard for the URL
pause
exit /b 0

:docker
echo.
echo ============================================================
echo Building and Running Docker Container
echo ============================================================
echo.
echo Make sure you have:
echo - Docker installed and running
echo - .env file configured
echo.
pause

echo Building Docker image...
call docker build -t polkacert-verify .
if %errorlevel% neq 0 (
    echo ❌ Docker build failed!
    pause
    exit /b 1
)

echo.
echo Starting Docker container...
call docker-compose up -d
if %errorlevel% neq 0 (
    echo ❌ Docker start failed!
    pause
    exit /b 1
)

echo.
echo ✅ Docker container running!
echo Access at: http://localhost:80
echo.
echo To stop: docker-compose down
pause
exit /b 0

:build
echo.
echo ============================================================
echo Building Production Bundle
echo ============================================================
echo.

echo Building...
call npm run build:prod
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo.
echo ✅ Build complete!
echo Output: dist/ folder
echo.
echo Next steps:
echo 1. Upload dist/ folder to your server
echo 2. Configure web server (nginx/apache)
echo 3. Point domain to server
pause
exit /b 0

:invalid
echo.
echo ❌ Invalid choice!
pause
exit /b 1
