#!/usr/bin/env node

const mysql = require('mysql2/promise');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function testMySQLConnection() {
  console.log('🔧 MySQL Connection Troubleshooter');
  console.log('==================================\n');

  // Test different connection configurations
  const configs = [
    { user: 'root', password: '', description: 'Root user with no password' },
    { user: 'root', password: 'root', description: 'Root user with password "root"' },
    { user: 'root', password: 'password', description: 'Root user with password "password"' },
    { user: 'root', password: 'admin', description: 'Root user with password "admin"' },
  ];

  console.log('Testing different MySQL connection configurations...\n');

  for (const config of configs) {
    try {
      console.log(`Testing: ${config.description}`);
      const connection = await mysql.createConnection({
        host: 'localhost',
        user: config.user,
        password: config.password,
        port: 3306
      });
      
      await connection.ping();
      await connection.end();
      
      console.log(`✅ SUCCESS: ${config.description}`);
      console.log(`\n🎉 Found working configuration!`);
      console.log(`Update your .env.local file with:`);
      console.log(`DB_USER=${config.user}`);
      console.log(`DB_PASSWORD=${config.password}`);
      
      // Update .env.local file
      const fs = require('fs');
      const envContent = `# Database Configuration
DB_HOST=localhost
DB_USER=${config.user}
DB_PASSWORD=${config.password}
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
NODE_ENV=development`;

      fs.writeFileSync('.env.local', envContent);
      console.log('\n✅ .env.local file updated successfully!');
      
      rl.close();
      return;
      
    } catch (error) {
      console.log(`❌ FAILED: ${config.description} - ${error.message}`);
    }
  }

  console.log('\n❌ None of the common configurations worked.');
  console.log('\n🔧 Manual Setup Required:');
  console.log('1. Find your MySQL root password');
  console.log('2. Or create a new MySQL user for the application');
  console.log('3. Or reset MySQL root password');
  
  console.log('\n📋 Common solutions:');
  console.log('1. Check if you set a password during MySQL installation');
  console.log('2. Look for password in ~/.mysql_history or installation logs');
  console.log('3. Try: brew services stop mysql && brew services start mysql');
  console.log('4. Reset password: https://dev.mysql.com/doc/refman/8.0/en/resetting-permissions.html');
  
  const manualPassword = await askQuestion('\nEnter your MySQL root password (or press Enter to skip): ');
  
  if (manualPassword.trim()) {
    try {
      const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: manualPassword,
        port: 3306
      });
      
      await connection.ping();
      await connection.end();
      
      console.log('✅ SUCCESS with manual password!');
      
      // Update .env.local file
      const fs = require('fs');
      const envContent = `# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=${manualPassword}
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
NODE_ENV=development`;

      fs.writeFileSync('.env.local', envContent);
      console.log('✅ .env.local file updated successfully!');
      
    } catch (error) {
      console.log(`❌ Manual password also failed: ${error.message}`);
    }
  }
  
  rl.close();
}

// Run the troubleshooter
if (require.main === module) {
  testMySQLConnection()
    .then(() => {
      console.log('\n🎉 Next steps:');
      console.log('1. Run: npm run db:init');
      console.log('2. Run: npm run db:setup');
      console.log('3. Run: npm run dev');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Troubleshooter failed:', error);
      process.exit(1);
    });
}

module.exports = { testMySQLConnection };
