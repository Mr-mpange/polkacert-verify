@echo off
echo ============================================================
echo Train ML Model - One Command
echo ============================================================
echo.
echo This will train your certificate verification ML model
echo.
echo What it does:
echo 1. Setup Python environment
echo 2. Generate 200 sample certificates
echo 3. Train CNN model (10-15 minutes)
echo 4. Save model to public/models/
echo.
echo Requirements:
echo - Python 3.11.8 installed
echo - 10-15 minutes of time
echo - Internet connection (for pip packages)
echo.
pause

cd ml_training
call train_complete.bat
cd ..

echo.
echo ============================================================
echo All Done! Model is ready to use!
echo ============================================================
echo.
echo To use the model in your app:
echo 1. npm install (if not done)
echo 2. npm run dev
echo 3. Upload certificate images to test!
echo.
pause
