FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy ML model files
COPY ml_model.py .
COPY ml_api.py .
COPY final_synthetic_dropout_data_rajasthan.csv .

# Train model if not exists
RUN python ml_model.py

# Expose port
EXPOSE 8001

# Start ML API service
CMD ["python", "ml_api.py"]
