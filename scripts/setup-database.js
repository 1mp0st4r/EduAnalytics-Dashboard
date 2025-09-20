#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT || '3306'),
};

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🚀 Starting EduAnalytics Database Setup...\n');
    
    // Step 1: Connect to MySQL server (without database)
    console.log('📡 Connecting to MySQL server...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL server successfully!\n');

    // Step 2: Create database
    console.log('🗄️  Creating database...');
    await connection.execute('CREATE DATABASE IF NOT EXISTS StudentAnalyticsDB');
    console.log('✅ Database created successfully!\n');

    // Step 3: Use the database
    await connection.execute('USE StudentAnalyticsDB');
    console.log('✅ Using StudentAnalyticsDB database\n');

    // Step 4: Read and execute schema
    console.log('📋 Creating database schema...');
    const schemaPath = path.join(__dirname, '03-create-mysql-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements and filter out comments
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'))
      .filter(stmt => !stmt.includes('--'));

    for (const statement of statements) {
      if (statement.trim() && statement.length > 10) {
        try {
          // Use query instead of execute for DDL statements
          await connection.query(statement);
        } catch (error) {
          // Ignore "table already exists" errors
          if (!error.message.includes('already exists') && 
              !error.message.includes('Duplicate entry') &&
              !error.message.includes('Table') && 
              !error.message.includes('already exists')) {
            console.warn(`⚠️  Warning: ${error.message}`);
          }
        }
      }
    }
    console.log('✅ Database schema created successfully!\n');

    // Step 5: Check if CSV files exist
    console.log('📁 Checking for CSV data files...');
    const csvFiles = [
      'final_synthetic_dropout_data_rajasthan.csv',
      'student_contact_and_mentor_list.csv'
    ];

    const missingFiles = csvFiles.filter(file => 
      !fs.existsSync(path.join(__dirname, '..', file))
    );

    if (missingFiles.length > 0) {
      console.log('❌ Missing CSV files:');
      missingFiles.forEach(file => console.log(`   - ${file}`));
      console.log('\n📝 Please ensure these files are in the project root directory.');
      console.log('   You can run the data import later with: npm run db:setup\n');
    } else {
      console.log('✅ CSV files found!\n');
      console.log('📊 To import data, run: npm run db:setup\n');
    }

    console.log('🎉 Database setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Create a .env.local file with your database credentials');
    console.log('2. Run: npm run db:setup (to import CSV data)');
    console.log('3. Run: npm run dev (to start the application)');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure MySQL is running');
    console.log('2. Check your database credentials');
    console.log('3. Ensure you have permission to create databases');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed.');
    }
  }
}

// Run setup
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };

