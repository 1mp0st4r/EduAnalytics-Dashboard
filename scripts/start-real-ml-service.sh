#!/bin/bash

# Start Real ML Service for EduAnalytics Dashboard
# This service uses actual XGBoost models and SHAP analysis

echo "🚀 Starting Real ML Service for EduAnalytics Dashboard"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "ml_service_real.py" ]; then
    echo "❌ Error: ml_service_real.py not found in current directory"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Check if Python virtual environment exists
if [ ! -d "ml-env" ]; then
    echo "⚠️  Warning: ml-env virtual environment not found"
    echo "Creating virtual environment..."
    python3 -m venv ml-env
fi

# Activate virtual environment
echo "📦 Activating Python virtual environment..."
source ml-env/bin/activate

# Install required packages if not already installed
echo "🔧 Installing/updating required packages..."
pip install --upgrade pip
pip install pandas numpy scikit-learn xgboost shap joblib

# Check if ml_model.py exists
if [ ! -f "ml_model.py" ]; then
    echo "⚠️  Warning: ml_model.py not found"
    echo "The service will use fallback algorithms"
fi

# Check if dataset exists for training
if [ ! -f "final_synthetic_dropout_data_rajasthan.csv" ]; then
    echo "⚠️  Warning: Dataset file not found"
    echo "The service will use fallback algorithms"
fi

# Start the real ML service
echo ""
echo "🎯 Starting Real ML Service..."
echo "Features:"
echo "  ✅ Real XGBoost model integration"
echo "  ✅ SHAP analysis for explanations"
echo "  ✅ Feature importance extraction"
echo "  ✅ Detailed risk explanations"
echo "  ✅ Fallback for missing dependencies"
echo ""
echo "📡 Service will be available at:"
echo "  - http://localhost:8001/health"
echo "  - http://localhost:8001/risk-assessment"
echo "  - http://localhost:8001/model-info"
echo ""
echo "Press Ctrl+C to stop the service"
echo "=================================================="

# Start the service
python3 ml_service_real.py
