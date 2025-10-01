#!/bin/bash

# Setup script for Rasa AI Chatbot
echo "🚀 Setting up Rasa AI Chatbot for EduAnalytics..."

# Create rasa-bot directory if it doesn't exist
mkdir -p rasa-bot

# Navigate to rasa-bot directory
cd rasa-bot

# Check if Python 3.8+ is installed
python3 --version
if [ $? -ne 0 ]; then
    echo "❌ Python 3.8+ is required. Please install Python first."
    exit 1
fi

# Create virtual environment
echo "📦 Creating Python virtual environment..."
python3 -m venv rasa-env
source rasa-env/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install Rasa and dependencies
echo "📥 Installing Rasa and dependencies..."
pip install -r requirements.txt

# Initialize Rasa project (if not already done)
if [ ! -f "config.yml" ]; then
    echo "🎯 Initializing Rasa project..."
    rasa init --no-prompt
fi

# Train the model
echo "🧠 Training Rasa model..."
rasa train

# Start action server in background
echo "🔧 Starting Rasa action server..."
rasa run actions --port 5055 &
ACTION_PID=$!

# Wait a moment for action server to start
sleep 5

# Start Rasa server
echo "🌐 Starting Rasa server..."
echo "Rasa server will be available at: http://localhost:5005"
echo "Rasa action server running on: http://localhost:5055"
echo ""
echo "To stop the servers, press Ctrl+C"
echo "To test the chatbot, visit: http://localhost:5005"
echo ""

# Save PID for cleanup
echo $ACTION_PID > rasa_action.pid

# Start Rasa server
rasa run --port 5005 --enable-api --cors "*"

# Cleanup function
cleanup() {
    echo "🛑 Stopping Rasa servers..."
    if [ -f rasa_action.pid ]; then
        kill $(cat rasa_action.pid) 2>/dev/null
        rm rasa_action.pid
    fi
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM
