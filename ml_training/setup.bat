@echo off
echo ============================================================
echo ML Model Training Setup (Fresh Install)
echo ============================================================
echo.

echo Deactivating any active virtual environment...
call deactivate 2>nul

echo.
echo Removing old virtual environment...
if exist venv (
    rmdir /s /q venv
    echo ✅ Old environment removed
) else (
    echo No old environment found
)

echo.
echo Step 1: Creating fresh virtual environment...
python -m venv venv
if %errorlevel% neq 0 (
    echo Error: Failed to create virtual environment
    echo Make sure Python 3.11.8 is installed
    pause
    exit /b 1
)
echo ✅ Virtual environment created
echo.

echo Step 2: Activating virtual environment...
call venv\Scripts\activate.bat
echo ✅ Virtual environment activated
echo.

echo Step 3: Upgrading pip...
python -m pip install --upgrade pip
echo ✅ Pip upgraded
echo.

echo Step 4: Installing dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed
echo.

echo ============================================================
echo ✅ Setup Complete!
echo ============================================================
echo.
echo Next steps:
echo 1. Generate sample data: python generate_sample_data.py
echo 2. Train model: python train_model.py
echo 3. Or add your own images to training_data/ folders
echo.
pause
