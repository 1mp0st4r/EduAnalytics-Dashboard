#!/bin/bash

echo "🚀 EduAnalytics Dashboard - Quick Start Setup"
echo "=============================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MySQL is running
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL first."
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local file not found. Creating template..."
    cat > .env.local << EOF
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=StudentAnalyticsDB
DB_PORT=3306

# Application Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# Email Configuration (for notifications)
FROM_EMAIL=noreply@eduanalytics.gov.in
FROM_NAME=EduAnalytics Support
EMAIL_API_KEY=your_gmail_app_password

# JWT Secret (for authentication)
JWT_SECRET=your_jwt_secret_key_here

# Application Environment
NODE_ENV=development
EOF
    echo "📝 Please edit .env.local with your database credentials"
    echo ""
fi

# Ask user if they want to proceed with database setup
read -p "Do you want to set up the database now? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗄️  Setting up database..."
    npm run db:init
    
    echo ""
    read -p "Do you want to import CSV data now? (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📊 Importing CSV data..."
        npm run db:setup
    fi
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your database credentials"
echo "2. Run: npm run dev"
echo "3. Visit: http://localhost:3000"
echo "4. Test database: http://localhost:3000/api/test-db"
echo ""
echo "For detailed setup instructions, see SETUP_GUIDE.md"

