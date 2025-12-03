@echo off
echo ============================================================
echo ML Model Training
echo ============================================================
echo.

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo Starting training...
echo This may take 10 minutes to several hours depending on data size
echo.

python train_model.py

echo.
echo ============================================================
echo Training complete!
echo ============================================================
echo.
echo Check the following files:
echo - public/models/certificate-detector/model.json
echo - public/models/certificate-detector/metadata.json
echo - public/models/certificate-detector/training_history.png
echo.
pause
