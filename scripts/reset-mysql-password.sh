#!/bin/bash

echo "🔧 MySQL Password Reset Script"
echo "=============================="
echo ""

# Stop MySQL service
echo "1. Stopping MySQL service..."
brew services stop mysql

# Start MySQL in safe mode (skip grant tables)
echo "2. Starting MySQL in safe mode..."
mysqld_safe --skip-grant-tables --skip-networking &

# Wait for MySQL to start
sleep 5

# Connect and reset password
echo "3. Resetting root password..."
mysql -u root << EOF
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword';
FLUSH PRIVILEGES;
EXIT;
EOF

# Stop the safe mode MySQL
echo "4. Stopping safe mode MySQL..."
pkill -f mysqld_safe

# Start MySQL normally
echo "5. Starting MySQL normally..."
brew services start mysql

# Wait for MySQL to start
sleep 3

# Test the new password
echo "6. Testing new password..."
mysql -u root -pnewpassword -e "SELECT 1;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Password reset successful!"
    echo "New root password: newpassword"
    echo ""
    echo "Updating .env.local file..."
    
    # Update .env.local file
    cat > .env.local << 'EOF'
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=newpassword
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
    
    echo "✅ .env.local updated with new password!"
    echo ""
    echo "Next steps:"
    echo "1. Run: npm run db:init"
    echo "2. Run: npm run db:setup"
    echo "3. Run: npm run dev"
else
    echo "❌ Password reset failed. Try manual approach."
fi
