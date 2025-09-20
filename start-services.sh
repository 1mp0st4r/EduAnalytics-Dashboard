#!/bin/bash

echo "🚀 Starting EduAnalytics Dashboard - Full Stack"
echo "=============================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Install Python dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "📦 Installing Python dependencies..."
    pip3 install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Python dependencies"
        exit 1
    fi
    echo "✅ Python dependencies installed"
fi

# Install Node.js dependencies if package.json exists
if [ -f "package.json" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Node.js dependencies"
        exit 1
    fi
    echo "✅ Node.js dependencies installed"
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local file not found. Please create it with your database and email configuration."
    echo "   See EMAIL_SETUP.md for email configuration details."
fi

echo ""
echo "🎯 Starting Services..."
echo ""

# Start Python ML API service in background
echo "🐍 Starting Python ML API service on port 8001..."
python3 ml_api.py &
ML_PID=$!

# Wait a moment for ML service to start
sleep 3

# Start Next.js application
echo "⚛️  Starting Next.js application on port 3000..."
npm run dev &
NEXT_PID=$!

echo ""
echo "✅ Services Started Successfully!"
echo "================================="
echo "🌐 Next.js App: http://localhost:3000"
echo "🐍 ML API Docs: http://localhost:8001/docs"
echo "📊 ML API Health: http://localhost:8001/health"
echo ""
echo "📧 To test email configuration:"
echo "   1. Go to http://localhost:3000"
echo "   2. Click 'Test Email Configuration'"
echo "   3. Enter your email address"
echo ""
echo "🤖 To test ML integration:"
echo "   1. Go to http://localhost:3000"
echo "   2. Login as student or admin"
echo "   3. Run risk assessment"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $ML_PID 2>/dev/null
    kill $NEXT_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for processes
wait
