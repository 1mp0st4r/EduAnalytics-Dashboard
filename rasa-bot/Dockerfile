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

# Copy Rasa bot files
COPY . .

# Train Rasa model
RUN rasa train

# Expose port
EXPOSE 5005

# Start Rasa server
CMD ["rasa", "run", "--port", "5005", "--enable-api", "--cors", "*"]
