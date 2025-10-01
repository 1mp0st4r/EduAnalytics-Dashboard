#!/bin/bash

# Start ML Service for EduAnalytics
echo "🧠 Starting EduAnalytics ML Service..."

# Check if Python is installed
python3 --version
if [ $? -ne 0 ]; then
    echo "❌ Python 3.8+ is required. Please install Python first."
    exit 1
fi

# Create virtual environment for ML service
if [ ! -d "ml-env" ]; then
    echo "📦 Creating Python virtual environment for ML service..."
    python3 -m venv ml-env
fi

# Activate virtual environment
source ml-env/bin/activate

# Install dependencies
echo "📥 Installing ML service dependencies..."
echo "Using pip with pre-compiled wheels to avoid compilation issues..."
pip install --only-binary=all --upgrade pip
pip install --only-binary=all -r requirements.txt

# Check if model file exists
if [ ! -f "eduanalytics_model.pkl" ]; then
    echo "🎯 Training ML model..."
    python ml_model.py
fi

# Start ML API service
echo "🚀 Starting ML API service on http://localhost:8001"
echo "API Documentation: http://localhost:8001/docs"
echo ""
echo "To stop the service, press Ctrl+C"
echo ""

python ml_api.py
