#!/bin/bash

# Production Deployment Script for EduAnalytics Dashboard
echo "🚀 Starting EduAnalytics Production Deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check environment variables
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is required"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ JWT_SECRET environment variable is required"
    exit 1
fi

echo "✅ Environment checks passed"

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p ssl
mkdir -p logs

# Build and start services
echo "🏗️ Building and starting services..."
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 30

# Check service health
echo "🔍 Checking service health..."

# Check app health
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Next.js application is healthy"
else
    echo "❌ Next.js application is not responding"
fi

# Check ML service health
if curl -f http://localhost:8001/health > /dev/null 2>&1; then
    echo "✅ ML service is healthy"
else
    echo "❌ ML service is not responding"
fi

# Check database
if docker-compose -f docker-compose.production.yml exec db pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ Database is healthy"
else
    echo "❌ Database is not responding"
fi

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "📊 Service URLs:"
echo "  - Application: http://localhost:3000"
echo "  - ML Service: http://localhost:8001"
echo "  - Database: localhost:5432"
echo ""
echo "📋 Useful commands:"
echo "  - View logs: docker-compose -f docker-compose.production.yml logs -f"
echo "  - Stop services: docker-compose -f docker-compose.production.yml down"
echo "  - Restart services: docker-compose -f docker-compose.production.yml restart"
echo ""
echo "🔧 To scale services:"
echo "  - Scale app: docker-compose -f docker-compose.production.yml up -d --scale app=3"
echo ""
