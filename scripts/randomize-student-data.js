#!/usr/bin/env node

/**
 * Script to randomize student data in the database
 * - Adds random class levels (9, 10, 11, 12)
 * - Adds gender-appropriate names
 * - Randomizes other attributes for better diversity
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Indian names by gender
const maleNames = [
  'Arjun', 'Vikram', 'Rahul', 'Suresh', 'Rajesh', 'Amit', 'Vishal', 'Deepak', 'Sunil', 'Manoj',
  'Ravi', 'Kiran', 'Naveen', 'Sandeep', 'Pradeep', 'Ashok', 'Vinod', 'Gaurav', 'Rohit', 'Ajay',
  'Sanjay', 'Dinesh', 'Ramesh', 'Mahesh', 'Suresh', 'Harish', 'Naresh', 'Bharat', 'Sachin', 'Vijay'
];

const femaleNames = [
  'Priya', 'Sneha', 'Kavya', 'Anita', 'Sunita', 'Meera', 'Pooja', 'Rekha', 'Suman', 'Neha',
  'Deepa', 'Shilpa', 'Ritu', 'Manju', 'Sarita', 'Kavita', 'Anjali', 'Rashmi', 'Seema', 'Vidya',
  'Geeta', 'Lata', 'Kamala', 'Sushma', 'Indira', 'Usha', 'Mala', 'Rama', 'Sita', 'Radha'
];

const surnames = [
  'Sharma', 'Singh', 'Patel', 'Kumar', 'Gupta', 'Yadav', 'Agarwal', 'Verma', 'Jain', 'Mehta',
  'Shah', 'Pandey', 'Mishra', 'Reddy', 'Choudhary', 'Thakur', 'Joshi', 'Malik', 'Rao', 'Agarwal'
];

const classLevels = [9, 10, 11, 12];

async function randomizeStudentData() {
  try {
    console.log('🎲 Starting student data randomization...');

    // Get all students
    const studentsResult = await pool.query('SELECT id, student_id, gender FROM students ORDER BY id');
    const students = studentsResult.rows;

    if (students.length === 0) {
      console.log('❌ No students found in database');
      return;
    }

    console.log(`📊 Found ${students.length} students to randomize`);

    let updated = 0;
    let errors = 0;

    for (const student of students) {
      try {
        // Generate random name based on gender
        const gender = student.gender?.toLowerCase() || 'male';
        const firstName = gender === 'female' 
          ? femaleNames[Math.floor(Math.random() * femaleNames.length)]
          : maleNames[Math.floor(Math.random() * maleNames.length)];
        
        const lastName = surnames[Math.floor(Math.random() * surnames.length)];
        const fullName = `${firstName} ${lastName}`;

        // Generate random class level
        const classLevel = classLevels[Math.floor(Math.random() * classLevels.length)];

        // Randomize other attributes
        const randomAttendance = Math.floor(Math.random() * 40) + 60; // 60-100%
        const randomMarks = Math.floor(Math.random() * 40) + 40; // 40-80%
        const randomRiskScore = Math.floor(Math.random() * 80) + 10; // 10-90
        
        // Determine risk level based on score
        let riskLevel = 'Low';
        if (randomRiskScore >= 70) riskLevel = 'Critical';
        else if (randomRiskScore >= 60) riskLevel = 'High';
        else if (randomRiskScore >= 40) riskLevel = 'Medium';

        // Update student record (removing subject_stream since it doesn't exist)
        const updateQuery = `
          UPDATE students SET
            full_name = $1,
            class_level = $2,
            current_attendance = $3,
            current_performance = $4,
            risk_score = $5,
            risk_level = $6,
            updated_at = NOW()
          WHERE id = $7
        `;

        await pool.query(updateQuery, [
          fullName,
          classLevel,
          randomAttendance,
          randomMarks,
          randomRiskScore,
          riskLevel,
          student.id
        ]);

        updated++;
        
        if (updated % 100 === 0) {
          console.log(`✅ Updated ${updated} students...`);
        }

      } catch (error) {
        console.error(`❌ Error updating student ${student.student_id}:`, error.message);
        errors++;
      }
    }

    console.log(`\n🎉 Randomization complete!`);
    console.log(`✅ Successfully updated: ${updated} students`);
    console.log(`❌ Errors: ${errors} students`);
    console.log(`📊 Total processed: ${students.length} students`);

    // Show sample of updated data
    console.log('\n📋 Sample of randomized data:');
    const sampleResult = await pool.query(`
      SELECT student_id, full_name, class_level, gender, current_attendance, 
             current_performance, risk_level, risk_score
      FROM students 
      ORDER BY RANDOM() 
      LIMIT 5
    `);
    
    sampleResult.rows.forEach(student => {
      console.log(`  ${student.student_id}: ${student.full_name} (Class ${student.class_level}, ${student.gender}) - ${student.risk_level} Risk`);
    });

  } catch (error) {
    console.error('❌ Error during randomization:', error);
  } finally {
    await pool.end();
  }
}

// Run the script
if (require.main === module) {
  randomizeStudentData()
    .then(() => {
      console.log('\n🚀 Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { randomizeStudentData };
