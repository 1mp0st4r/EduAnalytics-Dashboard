#!/bin/bash

# Start Simplified ML Service for EduAnalytics (No compilation issues)
echo "🧠 Starting EduAnalytics ML Service (Simplified Version)..."

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

# Install minimal dependencies (no pandas/scikit-learn compilation)
echo "📥 Installing simplified ML service dependencies..."
pip install --upgrade pip
pip install -r requirements-simple.txt

# Start simplified ML API service
echo "🚀 Starting Simplified ML API service on http://localhost:8001"
echo "API Documentation: http://localhost:8001/docs"
echo "💡 Using simplified risk calculation algorithm (no compilation issues)"
echo ""
echo "To stop the service, press Ctrl+C"
echo ""

python ml_api_simple.py
