@echo off
REM Quick Start Script for ML Training (Windows)

echo ============================================================
echo Certificate ML Model - Quick Start
echo ============================================================

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found. Please install Python 3.8+
    exit /b 1
)

echo ✅ Python found
python --version

REM Create virtual environment
echo.
echo 📦 Creating virtual environment...
python -m venv venv

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies one by one to avoid conflicts
echo.
echo 📥 Installing dependencies (this may take 5-10 minutes)...
python -m pip install --upgrade pip

echo Installing TensorFlow...
pip install tensorflow==2.15.0

echo Installing NumPy...
pip install "numpy>=1.24.0,<2.0.0"

echo Installing scikit-learn...
pip install scikit-learn>=1.3.0

echo Installing Pillow...
pip install Pillow>=10.0.0

echo Installing matplotlib...
pip install matplotlib>=3.7.0

echo Installing seaborn...
pip install seaborn>=0.12.0

echo Installing TensorFlow.js converter...
pip install tensorflowjs==4.11.0

echo Installing tqdm...
pip install tqdm>=4.66.0

echo.
echo ✅ All dependencies installed!

REM Generate sample data
echo.
echo 🎨 Generating sample certificate data...
python generate_sample_data.py

if errorlevel 1 (
    echo ❌ Failed to generate sample data
    pause
    exit /b 1
)

REM Train model
echo.
echo 🚀 Starting model training...
echo This will take 15-30 minutes...
python train_certificate_model.py

if errorlevel 1 (
    echo ❌ Training failed
    pause
    exit /b 1
)

echo.
echo ============================================================
echo ✅ Setup Complete!
echo ============================================================
echo.
echo 📁 Model saved to: ..\public\models\certificate-detector\
echo.
echo 🚀 Next steps:
echo    1. cd ..
echo    2. npm install
echo    3. npm run dev
echo    4. Test the ML model in your app!

pause
