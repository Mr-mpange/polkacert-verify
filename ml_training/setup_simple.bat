@echo off
echo ============================================================
echo ML Model Training Setup (Simplified - No C++ Required)
echo ============================================================
echo.

echo Step 1: Creating virtual environment...
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

echo Step 4: Installing dependencies (this may take 5-10 minutes)...
echo Installing TensorFlow CPU (no GPU, no compilation needed)...
pip install tensorflow-cpu==2.15.0
if %errorlevel% neq 0 (
    echo Error: Failed to install TensorFlow
    pause
    exit /b 1
)
echo.

echo Installing NumPy...
pip install numpy
echo.

echo Installing Pillow (image processing)...
pip install pillow
echo.

echo Installing scikit-learn...
pip install scikit-learn
echo.

echo Installing matplotlib (plotting)...
pip install matplotlib
echo.

echo Installing TensorFlow.js converter...
pip install tensorflowjs
echo.

echo Installing OpenCV (optional, for advanced image processing)...
pip install opencv-python
echo.

echo ✅ All dependencies installed
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
echo Note: This uses TensorFlow CPU (no GPU acceleration)
echo Training will be slower but works on any computer
echo.
pause
