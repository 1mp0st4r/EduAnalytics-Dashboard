# 🤖 Rasa AI Chatbot Setup Guide

This guide will help you set up the Rasa AI chatbot for EduAnalytics Dashboard.

## 🚀 Quick Start

### Option 1: Using Scripts (Recommended for Development)

1. **Start ML Service:**
```bash
./scripts/start-ml-service.sh
```

2. **Start Rasa Chatbot:**
```bash
./scripts/setup-rasa.sh
```

3. **Start Next.js App:**
```bash
npm run dev
```

### Option 2: Using Docker (Recommended for Production)

```bash
docker-compose up --build
```

## 📋 Manual Setup

### 1. ML Service Setup

```bash
# Create virtual environment
python3 -m venv ml-env
source ml-env/bin/activate

# Install dependencies
pip install -r requirements.txt

# Train model
python ml_model.py

# Start service
python ml_api.py
```

### 2. Rasa Chatbot Setup

```bash
# Navigate to rasa-bot directory
cd rasa-bot

# Create virtual environment
python3 -m venv rasa-env
source rasa-env/bin/activate

# Install dependencies
pip install -r requirements.txt

# Train the model
rasa train

# Start action server (in terminal 1)
rasa run actions --port 5055

# Start Rasa server (in terminal 2)
rasa run --port 5005 --enable-api --cors "*"
```

## 🔧 Configuration

### Environment Variables

Add to your `.env.local`:

```bash
# ML Service
ML_SERVICE_URL=http://localhost:8001

# Rasa Service
RASA_URL=http://localhost:5005
```

### Testing the Integration

1. **Test ML Service:**
   - Visit: http://localhost:8001/docs
   - Try the `/predict` endpoint

2. **Test Rasa Service:**
   - Visit: http://localhost:5005
   - Try sending messages like "hello", "what is my attendance?"

3. **Test Chatbot in App:**
   - Start your Next.js app
   - Login as a student
   - Open the chatbot and try: "नमस्ते, मेरी attendance क्या है?"

## 🎯 Features

### Supported Languages
- ✅ English
- ✅ Hindi (हिंदी)
- ✅ Mixed language conversations

### Capabilities
- ✅ Student attendance information
- ✅ Performance reports
- ✅ Risk level assessment
- ✅ Mentor contact information
- ✅ Study tips and motivation
- ✅ Issue reporting
- ✅ Personalized responses based on student data

### Example Conversations

**English:**
```
User: "Hello, what is my attendance?"
Bot: "Your current attendance is 85%. That's excellent! Keep up the good work!"
```

**Hindi:**
```
User: "नमस्ते, मेरे नंबर कैसे हैं?"
Bot: "आपका वर्तमान प्रदर्शन 78% है। आप अच्छा कर रहे हैं! अपना अध्ययन जारी रखें।"
```

## 🛠️ Customization

### Adding New Intents

1. **Edit `rasa-bot/data/nlu.yml`:**
```yaml
- intent: ask_schedule
  examples: |
    - मेरा schedule क्या है?
    - what is my class schedule?
```

2. **Edit `rasa-bot/domain.yml`:**
```yaml
intents:
  - ask_schedule

responses:
  utter_schedule_info:
  - text: "Your class schedule is..."
```

3. **Edit `rasa-bot/data/stories.yml`:**
```yaml
- story: ask schedule
  steps:
  - intent: ask_schedule
  - action: utter_schedule_info
```

4. **Retrain the model:**
```bash
cd rasa-bot
rasa train
```

### Adding Custom Actions

Edit `rasa-bot/actions.py` to add new custom actions:

```python
class CustomAction(Action):
    def name(self) -> Text:
        return "custom_action"
    
    def run(self, dispatcher, tracker, domain):
        # Your custom logic here
        dispatcher.utter_message("Custom response")
        return []
```

## 🚀 Deployment

### Railway Deployment

1. **Deploy ML Service:**
   - Connect your GitHub repo to Railway
   - Set environment variables
   - Deploy with `railway up`

2. **Deploy Rasa Service:**
   - Create separate Railway service for Rasa
   - Set build command: `pip install -r requirements.txt && rasa train`
   - Set start command: `rasa run --port $PORT --enable-api --cors "*"`

### Environment Variables for Production

```bash
DATABASE_URL=postgresql://...
ML_SERVICE_URL=https://your-ml-service.railway.app
RASA_URL=https://your-rasa-service.railway.app
JWT_SECRET=your-production-secret
```

## 📊 Monitoring

### Health Checks

- **ML Service:** `GET /health`
- **Rasa Service:** `GET /health`

### Logs

```bash
# ML Service logs
docker logs ml-service

# Rasa Service logs
docker logs rasa-service
```

## 🔧 Troubleshooting

### Common Issues

1. **Rasa service not responding:**
   - Check if action server is running on port 5055
   - Verify Rasa service is running on port 5005
   - Check logs for errors

2. **ML service errors:**
   - Ensure model file exists (`eduanalytics_model.pkl`)
   - Check Python dependencies
   - Verify data file exists

3. **Integration issues:**
   - Check environment variables
   - Verify network connectivity between services
   - Check CORS settings

### Debug Mode

```bash
# Rasa with debug
rasa run --port 5005 --enable-api --cors "*" --debug

# ML service with debug
python ml_api.py --debug
```

## 📈 Performance Optimization

### For Production

1. **Use Redis for session storage:**
```yaml
# rasa-bot/endpoints.yml
tracker_store:
  type: Redis
  url: redis://localhost:6379
```

2. **Enable model caching:**
```yaml
# rasa-bot/config.yml
pipeline:
  - name: MemoizationPolicy
  - name: TEDPolicy
    max_history: 5
    epochs: 100
```

3. **Use production-grade server:**
```bash
# Instead of rasa run
rasa run --port 5005 --enable-api --cors "*" --production
```

## 🎉 Success!

Your Rasa AI chatbot is now integrated with EduAnalytics Dashboard! 

The chatbot will:
- ✅ Provide personalized responses based on student data
- ✅ Support both English and Hindi
- ✅ Handle various student queries
- ✅ Fall back gracefully if Rasa is unavailable
- ✅ Integrate seamlessly with your existing chat interface

For questions or issues, check the logs or refer to the [Rasa documentation](https://rasa.com/docs/).
