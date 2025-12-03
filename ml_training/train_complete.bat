@echo off
echo ============================================================
echo Complete ML Model Training Pipeline
echo ============================================================
echo.
echo This will:
echo 1. Setup Python environment
echo 2. Generate sample training data
echo 3. Train the model
echo 4. Save model to public/models/
echo.
echo Estimated time: 10-15 minutes
echo.
pause

echo.
echo ============================================================
echo Step 1: Setting up Python environment
echo ============================================================
echo.

REM Deactivate any active environment
call deactivate 2>nul

REM Remove old venv if exists
if exist venv (
    echo Removing old virtual environment...
    rmdir /s /q venv
)

REM Create fresh venv
echo Creating virtual environment...
python -m venv venv
if %errorlevel% neq 0 (
    echo ❌ Error: Failed to create virtual environment
    echo Make sure Python 3.11.8 is installed
    pause
    exit /b 1
)

REM Activate venv
call venv\Scripts\activate.bat

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip --quiet

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Error: Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Environment setup complete
echo.

echo ============================================================
echo Step 2: Generating sample training data
echo ============================================================
echo.

python generate_sample_data.py
if %errorlevel% neq 0 (
    echo ❌ Error: Failed to generate sample data
    pause
    exit /b 1
)

echo ✅ Sample data generated
echo.

echo ============================================================
echo Step 3: Training the model
echo ============================================================
echo.
echo This may take 10-15 minutes...
echo.

python train_model.py
if %errorlevel% neq 0 (
    echo ❌ Error: Training failed
    pause
    exit /b 1
)

echo.
echo ============================================================
echo ✅ TRAINING COMPLETE!
echo ============================================================
echo.
echo Model saved to: ..\public\models\certificate-detector\
echo.
echo Files created:
echo - model.json (model architecture)
echo - group1-shard1of1.bin (model weights)
echo - metadata.json (training info)
echo - training_history.png (training graphs)
echo - confusion_matrix.png (performance)
echo.
echo Next steps:
echo 1. Go back to main project: cd ..
echo 2. Install TensorFlow.js: npm install
echo 3. Run your app: npm run dev
echo 4. Test the ML model with certificate images!
echo.
pause
