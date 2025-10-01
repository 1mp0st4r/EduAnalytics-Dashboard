#!/usr/bin/env node

/**
 * Script to check the database schema for the students table
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkSchema() {
  try {
    console.log('🔍 Checking database schema...');

    // Get table structure
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'students' 
      ORDER BY ordinal_position;
    `);

    console.log('\n📋 Students table columns:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    // Get sample data to see what's currently in the table
    console.log('\n📊 Sample student data:');
    const sampleResult = await pool.query(`
      SELECT student_id, full_name, class_level, gender, current_attendance, current_performance, risk_level
      FROM students 
      LIMIT 3
    `);

    sampleResult.rows.forEach(student => {
      console.log(`  ${student.student_id}: ${student.full_name || 'NULL'} (Class ${student.class_level || 'NULL'}, ${student.gender || 'NULL'}) - ${student.risk_level || 'NULL'} Risk`);
    });

  } catch (error) {
    console.error('❌ Error checking schema:', error);
  } finally {
    await pool.end();
  }
}

// Run the script
if (require.main === module) {
  checkSchema()
    .then(() => {
      console.log('\n✅ Schema check completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Schema check failed:', error);
      process.exit(1);
    });
}

module.exports = { checkSchema };
