#!/bin/bash

# Quick Start Script for ML Training
# This script sets up everything and trains the model

echo "============================================================"
echo "Certificate ML Model - Quick Start"
echo "============================================================"

# Check Python
if ! command -v python &> /dev/null; then
    echo "❌ Python not found. Please install Python 3.8+"
    exit 1
fi

echo "✅ Python found: $(python --version)"

# Create virtual environment
echo ""
echo "📦 Creating virtual environment..."
python -m venv venv

# Activate virtual environment
echo "🔧 Activating virtual environment..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Install dependencies
echo ""
echo "📥 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Generate sample data
echo ""
echo "🎨 Generating sample certificate data..."
python generate_sample_data.py

# Train model
echo ""
echo "🚀 Starting model training..."
python train_certificate_model.py

echo ""
echo "============================================================"
echo "✅ Setup Complete!"
echo "============================================================"
echo ""
echo "📁 Model saved to: ../public/models/certificate-detector/"
echo ""
echo "🚀 Next steps:"
echo "   1. cd .."
echo "   2. npm install"
echo "   3. npm run dev"
echo "   4. Test the ML model in your app!"
