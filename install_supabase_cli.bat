@echo off
echo ============================================================
echo Installing Supabase CLI for Windows
echo ============================================================
echo.

REM Create directory for Supabase
set INSTALL_DIR=%USERPROFILE%\supabase-cli
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

echo Downloading Supabase CLI...
echo.

REM Download using PowerShell
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri 'https://github.com/supabase/cli/releases/latest/download/supabase_windows_amd64.zip' -OutFile '%INSTALL_DIR%\supabase.zip'}"

if %errorlevel% neq 0 (
    echo.
    echo ❌ Download failed!
    echo.
    echo Please download manually from:
    echo https://github.com/supabase/cli/releases/latest
    echo.
    pause
    exit /b 1
)

echo ✅ Downloaded successfully
echo.

echo Extracting...
powershell -Command "& {Expand-Archive -Path '%INSTALL_DIR%\supabase.zip' -DestinationPath '%INSTALL_DIR%' -Force}"

if %errorlevel% neq 0 (
    echo ❌ Extraction failed!
    pause
    exit /b 1
)

echo ✅ Extracted successfully
echo.

REM Clean up zip file
del "%INSTALL_DIR%\supabase.zip"

echo Adding to PATH...
echo.

REM Add to user PATH
powershell -Command "& {$path = [Environment]::GetEnvironmentVariable('Path', 'User'); if ($path -notlike '*%INSTALL_DIR%*') { [Environment]::SetEnvironmentVariable('Path', $path + ';%INSTALL_DIR%', 'User'); Write-Host 'Added to PATH' } else { Write-Host 'Already in PATH' }}"

echo.
echo ============================================================
echo ✅ Installation Complete!
echo ============================================================
echo.
echo Supabase CLI installed to: %INSTALL_DIR%
echo.
echo ⚠️  IMPORTANT: Close and reopen your terminal for PATH changes to take effect
echo.
echo Then verify installation with:
echo   supabase --version
echo.
pause
