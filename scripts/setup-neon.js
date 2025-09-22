#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Function to parse SQL statements properly, handling complex statements with subqueries
function parseSQLStatements(sql) {
    const statements = [];
    let currentStatement = '';
    let inString = false;
    let stringChar = '';
    let parenDepth = 0;
    let inComment = false;
    
    for (let i = 0; i < sql.length; i++) {
        const char = sql[i];
        const nextChar = sql[i + 1];
        
        // Handle comments
        if (!inString && !inComment && char === '-' && nextChar === '-') {
            inComment = true;
            // Skip the rest of the line
            while (i < sql.length && sql[i] !== '\n') {
                i++;
            }
            inComment = false;
            continue;
        }
        
        // Handle string literals
        if (!inString && !inComment && (char === "'" || char === '"')) {
            inString = true;
            stringChar = char;
            currentStatement += char;
        } else if (inString && char === stringChar) {
            // Check for escaped quotes
            if (nextChar === stringChar) {
                currentStatement += char + nextChar;
                i++; // Skip next character
            } else {
                inString = false;
                stringChar = '';
                currentStatement += char;
            }
        } else if (!inString && !inComment) {
            // Track parentheses depth
            if (char === '(') {
                parenDepth++;
            } else if (char === ')') {
                parenDepth--;
            }
            
            // Only split on semicolon if we're not inside parentheses or strings
            if (char === ';' && parenDepth === 0) {
                const trimmed = currentStatement.trim();
                if (trimmed && trimmed.length > 0) {
                    statements.push(trimmed);
                }
                currentStatement = '';
            } else {
                currentStatement += char;
            }
        } else if (!inComment) {
            currentStatement += char;
        }
    }
    
    // Add the last statement if it doesn't end with semicolon
    const trimmed = currentStatement.trim();
    if (trimmed && trimmed.length > 0) {
        statements.push(trimmed);
    }
    
    return statements;
}

// Database configuration for Neon
const dbConfig = {
    connectionString: process.env.DATABASE_URL || process.env.NEON_URL,
    ssl: {
        rejectUnauthorized: false
    }
};

async function setupNeon() {
    console.log('🌟 Starting Neon PostgreSQL Setup for EduAnalytics Dashboard...');
    
    let pool;
    try {
        // Step 1: Test connection
        console.log('📡 Testing Neon PostgreSQL connection...');
        pool = new Pool(dbConfig);
        
        const client = await pool.connect();
        const result = await client.query('SELECT NOW() as current_time');
        console.log('✅ Connected to Neon PostgreSQL successfully!');
        console.log(`🕐 Server time: ${result.rows[0].current_time}`);
        client.release();

        // Step 2: Execute schema script
        console.log('📋 Creating database schema...');
        const schemaPath = path.join(__dirname, '06-create-cockroachdb-schema.sql');
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        
        // Better SQL statement parsing - handle complex statements with subqueries
        const statements = parseSQLStatements(schemaSQL);
        console.log(`📝 Parsed ${statements.length} SQL statements`);

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.trim()) {
                try {
                    console.log(`   [${i + 1}/${statements.length}] Executing: ${statement.substring(0, 50)}...`);
                    await pool.query(statement);
                } catch (error) {
                    // Ignore errors for statements that might already exist
                    if (!error.message.includes('already exists') && 
                        !error.message.includes('duplicate key') &&
                        !error.message.includes('ON CONFLICT') &&
                        !error.message.includes('does not exist')) {
                        console.warn(`⚠️  Warning executing statement [${i + 1}]: ${error.message}`);
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

        // Step 4: Check sample data (with error handling)
        console.log('👥 Checking sample data...');
        try {
            const studentsResult = await pool.query('SELECT COUNT(*) as count FROM students');
            console.log(`   - Students: ${studentsResult.rows[0].count}`);
        } catch (error) {
            console.log(`   - Students: Table not found or empty`);
        }
        
        try {
            const mentorsResult = await pool.query('SELECT COUNT(*) as count FROM mentors');
            console.log(`   - Mentors: ${mentorsResult.rows[0].count}`);
        } catch (error) {
            console.log(`   - Mentors: Table not found or empty`);
        }
        
        try {
            const schoolsResult = await pool.query('SELECT COUNT(*) as count FROM schools');
            console.log(`   - Schools: ${schoolsResult.rows[0].count}`);
        } catch (error) {
            console.log(`   - Schools: Table not found or empty`);
        }

        console.log('\n🎉 Neon PostgreSQL setup completed successfully!');
        console.log('🚀 Your EduAnalytics Dashboard is ready to use with Neon!');

    } catch (error) {
        console.error('❌ Neon PostgreSQL setup failed:', error.message);
        console.error('💡 Make sure your DATABASE_URL or NEON_URL is correctly set in .env.local');
        process.exit(1);
    } finally {
        if (pool) {
            await pool.end();
            console.log('🔌 Database connection closed.');
        }
    }
}

// Run the setup
setupNeon();
