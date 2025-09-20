#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration for CockroachDB
const dbConfig = {
    connectionString: process.env.DATABASE_URL || process.env.COCKROACHDB_URL,
    ssl: {
        rejectUnauthorized: false
    }
};

async function setupCockroachDB() {
    console.log('🐓 Starting CockroachDB Setup for EduAnalytics Dashboard...');
    
    let pool;
    try {
        // Step 1: Test connection
        console.log('📡 Testing CockroachDB connection...');
        pool = new Pool(dbConfig);
        
        const client = await pool.connect();
        const result = await client.query('SELECT NOW() as current_time');
        console.log('✅ Connected to CockroachDB successfully!');
        console.log(`🕐 Server time: ${result.rows[0].current_time}`);
        client.release();

        // Step 2: Execute schema script
        console.log('📋 Creating database schema...');
        const schemaPath = path.join(__dirname, '06-create-cockroachdb-schema.sql');
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        
        // Split the SQL into individual statements
        const statements = schemaSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    await pool.query(statement);
                } catch (error) {
                    // Ignore errors for statements that might already exist
                    if (!error.message.includes('already exists') && 
                        !error.message.includes('duplicate key') &&
                        !error.message.includes('ON CONFLICT')) {
                        console.warn(`⚠️  Warning executing statement: ${error.message}`);
                    }
                }
            }
        }
        
        console.log('✅ Database schema created successfully!');

        // Step 3: Verify tables were created
        console.log('🔍 Verifying table creation...');
        const tablesResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        
        console.log('📊 Created tables:');
        tablesResult.rows.forEach(row => {
            console.log(`   - ${row.table_name}`);
        });

        // Step 4: Check sample data
        console.log('👥 Checking sample data...');
        const studentsResult = await pool.query('SELECT COUNT(*) as count FROM students');
        const mentorsResult = await pool.query('SELECT COUNT(*) as count FROM mentors');
        const schoolsResult = await pool.query('SELECT COUNT(*) as count FROM schools');
        
        console.log(`   - Students: ${studentsResult.rows[0].count}`);
        console.log(`   - Mentors: ${mentorsResult.rows[0].count}`);
        console.log(`   - Schools: ${schoolsResult.rows[0].count}`);

        console.log('\n🎉 CockroachDB setup completed successfully!');
        console.log('🚀 Your EduAnalytics Dashboard is ready to use with CockroachDB!');

    } catch (error) {
        console.error('❌ CockroachDB setup failed:', error.message);
        console.error('💡 Make sure your DATABASE_URL or COCKROACHDB_URL is correctly set in .env.local');
        process.exit(1);
    } finally {
        if (pool) {
            await pool.end();
            console.log('🔌 Database connection closed.');
        }
    }
}

// Run the setup
setupCockroachDB();
