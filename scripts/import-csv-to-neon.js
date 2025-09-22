#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { Pool } = require('pg');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// Database configuration for Neon
const dbConfig = {
  connectionString: process.env.DATABASE_URL || process.env.NEON_URL,
  ssl: {
    rejectUnauthorized: false
  }
};

// Function to read CSV file and return data as array
function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

// Function to get mentor ID by name
async function getMentorId(pool, mentorName) {
  try {
    // First try to get any available mentor
    const result = await pool.query('SELECT id FROM mentors LIMIT 1');
    return result.rows.length > 0 ? result.rows[0].id : null;
  } catch (error) {
    console.error('Error getting mentor ID:', error);
    return null;
  }
}

// Function to get school ID (default to first school)
async function getSchoolId(pool) {
  try {
    const result = await pool.query('SELECT id FROM schools LIMIT 1');
    return result.rows.length > 0 ? result.rows[0].id : null;
  } catch (error) {
    console.error('Error getting school ID:', error);
    return null;
  }
}

// Function to create user for student
async function createStudentUser(pool, studentData) {
  const email = `${studentData.StudentID.toLowerCase()}@student.eduanalytics.gov.in`;
  const passwordHash = '$2b$10$example_hash_student'; // In production, use proper hashing
  
  // Handle missing or invalid data
  const fullName = studentData.StudentName?.trim() || `Student ${studentData.StudentID}`;
  const phone = studentData.ContactPhoneNumber?.trim() || null;
  
  try {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, user_type, full_name, phone, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE SET
       full_name = EXCLUDED.full_name,
       phone = EXCLUDED.phone
       RETURNING id`,
      [
        email,
        passwordHash,
        'student',
        fullName,
        phone,
        true
      ]
    );
    return result.rows[0].id;
  } catch (error) {
    console.error('Error creating student user:', error);
    return null;
  }
}

// Function to calculate risk level based on data
function calculateRiskLevel(studentData) {
  const attendance = parseFloat(studentData.AvgAttendance_LatestTerm) || 0;
  const performance = parseFloat(studentData.AvgMarks_LatestTerm) || 0;
  
  let riskScore = 0;
  
  // Attendance scoring
  if (attendance < 50) riskScore += 40;
  else if (attendance < 70) riskScore += 25;
  else if (attendance < 85) riskScore += 10;
  
  // Performance scoring
  if (performance < 40) riskScore += 40;
  else if (performance < 60) riskScore += 25;
  else if (performance < 75) riskScore += 10;
  
  // Additional factors
  if (studentData.IsRural === 'Yes') riskScore += 5;
  if (studentData.IsFirstGenerationLearner === 'Yes') riskScore += 5;
  if (studentData.Gender === 'Female') riskScore += 2; // Slight bias for female students
  
  // Determine risk level
  if (riskScore >= 80) return { level: 'Critical', score: riskScore };
  if (riskScore >= 60) return { level: 'High', score: riskScore };
  if (riskScore >= 40) return { level: 'Medium', score: riskScore };
  return { level: 'Low', score: riskScore };
}

// Function to calculate dropout probability
function calculateDropoutProbability(studentData, riskScore) {
  const attendance = parseFloat(studentData.AvgAttendance_LatestTerm) || 0;
  const performance = parseFloat(studentData.AvgMarks_LatestTerm) || 0;
  
  // Base probability from risk score
  let probability = Math.min(riskScore * 0.8, 95);
  
  // Adjust based on attendance
  if (attendance < 50) probability += 15;
  else if (attendance < 70) probability += 8;
  
  // Adjust based on performance
  if (performance < 40) probability += 10;
  else if (performance < 60) probability += 5;
  
  return Math.min(probability, 95);
}

async function importCSVData() {
  console.log('🚀 Starting CSV data import to Neon PostgreSQL...');
  
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

    // Step 2: Read CSV files
    console.log('📋 Reading CSV files...');
    const studentsData = await readCSV(path.join(__dirname, '..', 'final_synthetic_dropout_data_rajasthan.csv'));
    const mentorsData = await readCSV(path.join(__dirname, '..', 'student_contact_and_mentor_list.csv'));
    
    console.log(`📊 Found ${studentsData.length} students in CSV`);
    console.log(`👥 Found ${mentorsData.length} mentors in CSV`);

    // Step 3: Get school and mentor IDs
    const schoolId = await getSchoolId(pool);
    if (!schoolId) {
      throw new Error('No school found in database');
    }
    console.log(`🏫 Using school ID: ${schoolId}`);

    // Step 4: Import students
    console.log('👨‍🎓 Importing students...');
    let importedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < studentsData.length; i++) {
      const studentData = studentsData[i];
      
      try {
        // Create user for student
        const userId = await createStudentUser(pool, studentData);
        if (!userId) {
          console.error(`❌ Failed to create user for student ${studentData.StudentID}`);
          errorCount++;
          continue;
        }

        // Use default mentor for now (we'll assign proper mentors later)
        const mentorId = await getMentorId(pool, 'default');
        
        // Calculate risk assessment
        const riskAssessment = calculateRiskLevel(studentData);
        const dropoutProbability = calculateDropoutProbability(studentData, riskAssessment.score);

        // Clean and validate data
        const studentId = studentData.StudentID?.trim() || `STU_${Date.now()}_${i}`;
        const fullName = studentData.StudentName?.trim() || `Student ${studentId}`;
        const gender = studentData.Gender?.trim() || 'Other';
        const classLevel = parseInt(studentData.Class) || 10;
        const attendance = Math.max(0, Math.min(100, parseFloat(studentData.AvgAttendance_LatestTerm) || 0));
        const performance = Math.max(0, Math.min(100, parseFloat(studentData.AvgMarks_LatestTerm) || 0));
        const phone = studentData.ContactPhoneNumber?.trim() || null;
        const email = studentData.ContactEmail?.trim() || null;
        const isDropout = studentData.IsDropout === 'Yes' || studentData.IsDropout === '1' || studentData.IsDropout === 'true';

        // Insert student data
        await pool.query(
          `INSERT INTO students (
            user_id, student_id, school_id, mentor_id, full_name, gender, class_level,
            current_attendance, current_performance, risk_level, risk_score, dropout_probability,
            phone, email, is_dropout, is_active, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
          ON CONFLICT (student_id) DO UPDATE SET
            current_attendance = EXCLUDED.current_attendance,
            current_performance = EXCLUDED.current_performance,
            risk_level = EXCLUDED.risk_level,
            risk_score = EXCLUDED.risk_score,
            dropout_probability = EXCLUDED.dropout_probability,
            updated_at = NOW()`,
          [
            userId,
            studentId,
            schoolId,
            mentorId,
            fullName,
            gender,
            classLevel,
            attendance,
            performance,
            riskAssessment.level,
            riskAssessment.score,
            dropoutProbability,
            phone,
            email,
            isDropout,
            true
          ]
        );

        importedCount++;
        
        if (importedCount % 100 === 0) {
          console.log(`📈 Imported ${importedCount}/${studentsData.length} students...`);
        }
        
      } catch (error) {
        console.error(`❌ Error importing student ${studentData.StudentID}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n✅ Import completed!`);
    console.log(`📊 Successfully imported: ${importedCount} students`);
    console.log(`❌ Errors: ${errorCount} students`);

    // Step 5: Verify import
    console.log('🔍 Verifying import...');
    const statsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_students,
        COUNT(CASE WHEN risk_level = 'High' THEN 1 END) as high_risk,
        COUNT(CASE WHEN risk_level = 'Medium' THEN 1 END) as medium_risk,
        COUNT(CASE WHEN risk_level = 'Low' THEN 1 END) as low_risk,
        COUNT(CASE WHEN risk_level = 'Critical' THEN 1 END) as critical_risk,
        AVG(current_attendance) as avg_attendance,
        AVG(current_performance) as avg_performance
      FROM students 
      WHERE is_active = true
    `);
    
    const stats = statsResult.rows[0];
    console.log('📈 Final Statistics:');
    console.log(`   Total Students: ${stats.total_students}`);
    console.log(`   High Risk: ${stats.high_risk}`);
    console.log(`   Medium Risk: ${stats.medium_risk}`);
    console.log(`   Low Risk: ${stats.low_risk}`);
    console.log(`   Critical Risk: ${stats.critical_risk}`);
    console.log(`   Avg Attendance: ${parseFloat(stats.avg_attendance).toFixed(1)}%`);
    console.log(`   Avg Performance: ${parseFloat(stats.avg_performance).toFixed(1)}%`);

    console.log('\n🎉 CSV data import to Neon PostgreSQL completed successfully!');

  } catch (error) {
    console.error('❌ CSV import failed:', error.message);
    console.error('💡 Make sure your DATABASE_URL is correctly set in .env.local');
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
      console.log('🔌 Database connection closed.');
    }
  }
}

// Run the import
importCSVData();
