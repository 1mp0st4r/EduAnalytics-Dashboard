#!/bin/bash

# Start Ultra-Simple ML Service for EduAnalytics (Zero Dependencies)
echo "🧠 Starting EduAnalytics ML Service (Ultra-Simple Version)..."

# Check if Python is installed
python3 --version
if [ $? -ne 0 ]; then
    echo "❌ Python 3.8+ is required. Please install Python first."
    exit 1
fi

# No virtual environment needed - uses only Python standard library
echo "📦 Using Python standard library only (zero dependencies)"

# Start ultra-simple ML API service
echo "🚀 Starting Ultra-Simple ML API service on http://localhost:8001"
echo "💡 This version uses ZERO external dependencies"
echo "✅ No compilation issues, no pip installs needed"
echo ""
echo "Available endpoints:"
echo "  - Health: http://localhost:8001/health"
echo "  - Predict: http://localhost:8001/predict"
echo "  - Info: http://localhost:8001/model/info"
echo ""
echo "To stop the service, press Ctrl+C"
echo ""

python3 ml_api_ultra_simple.py
