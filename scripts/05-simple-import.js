// Load environment variables
require('dotenv').config({ path: '.env.local' });

const mysql = require('mysql2/promise');
const fs = require('fs');
const csv = require('csv-parser');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'StudentAnalyticsDB',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
};

// Helper function to safely get values
function safeValue(value, defaultValue = null) {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  return value;
}

// Helper function to safely parse numbers
function safeNumber(value, defaultValue = 0) {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

// Helper function to safely parse integers
function safeInt(value, defaultValue = 0) {
  const parsed = parseInt(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

// Helper function to safely parse booleans
function safeBoolean(value, defaultValue = false) {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  return value === 'TRUE' || value === 'true' || value === '1';
}

async function importData() {
  console.log('🚀 Starting Simple CSV Import...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    await connection.beginTransaction();
    
    // First, let's import just a few students to test
    const students = [];
    const contactInfo = new Map();
    
    // Read contact info first
    console.log('📖 Reading contact information...');
    await new Promise((resolve, reject) => {
      fs.createReadStream('student_contact_and_mentor_list.csv')
        .pipe(csv())
        .on('data', (row) => {
          contactInfo.set(row['Student ID'], row);
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    console.log(`📊 Loaded ${contactInfo.size} contact records`);
    
    // Read student data
    console.log('📖 Reading student data...');
    await new Promise((resolve, reject) => {
      let count = 0;
      fs.createReadStream('final_synthetic_dropout_data_rajasthan.csv')
        .pipe(csv())
        .on('data', (row) => {
          if (count < 100) { // Import only first 100 students for testing
            students.push(row);
          }
          count++;
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    console.log(`📊 Loaded ${students.length} student records`);
    
    // Create a simple school
    console.log('🏫 Creating school...');
    const [schoolResult] = await connection.execute(
      'INSERT INTO Schools (name, district, state) VALUES (?, ?, ?)',
      ['Rajasthan Government School', 'Jaipur', 'Rajasthan']
    );
    const schoolId = schoolResult.insertId;
    
    // Create a simple mentor
    console.log('👨‍🏫 Creating mentor...');
    const [mentorResult] = await connection.execute(
      'INSERT INTO Mentors (full_name, email, phone, specialization) VALUES (?, ?, ?, ?)',
      ['Default Mentor', 'mentor@school.edu', '1234567890', 'General']
    );
    const mentorId = mentorResult.insertId;
    
    let successCount = 0;
    let errorCount = 0;
    
    // Import students
    console.log('👥 Importing students...');
    for (const student of students) {
      try {
        const contact = contactInfo.get(student.StudentID) || {};
        
        // Create user account
        const [userResult] = await connection.execute(
          'INSERT INTO Users (email, password_hash, user_type, full_name, phone) VALUES (?, ?, ?, ?, ?)',
          [
            `student_${student.StudentID}@school.edu`,
            '$2b$10$dummyhash', // Dummy password hash
            'student',
            safeValue(contact['Student Name'], `Student ${student.StudentID}`),
            safeValue(contact['Contact Phone Number'], '1234567890')
          ]
        );
        const userId = userResult.insertId;
        
        // Insert student record with all safe values
        await connection.execute(`
          INSERT INTO Students (
            user_id, StudentID, school_id, mentor_id, StudentName, Gender, Age, StudentClass,
            MotherName, FatherName, ContactPhoneNumber, AdmissionQuota, AccommodationType,
            IsRural, NumberOfSiblings, MotherEducation, FatherEducation, IsFatherLiterate,
            IsMotherLiterate, IsFirstGenerationLearner, CommuteTimeMinutes, FamilyAnnualIncome,
            FamilyEconomicStatus, HasReliableInternet, HasOwnLaptop, IsPreparingCompetitiveExam,
            AvgPastPerformance, MediumChanged, AvgMarks_LatestTerm, AvgMarks_PreviousTerm,
            MarksTrend, FailureRate_LatestTerm, AvgAttendance_LatestTerm, WorksPartTime,
            IsDropout, RiskScore, RiskLevel, DropoutProbability
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          userId,
          safeValue(student.StudentID),
          schoolId,
          mentorId,
          safeValue(contact['Student Name'], `Student ${student.StudentID}`),
          safeValue(student.Gender, 'Other'),
          safeInt(student.AdmissionQuota, 18),
          safeInt(student.AdmissionQuota, 10),
          safeValue(contact['Mother Name']),
          safeValue(contact['Father Name']),
          safeValue(contact['Contact Phone Number'], '1234567890'),
          safeValue(student.AdmissionQuota, 'General'),
          safeValue(student.AccommodationType, 'DayScholar'),
          safeBoolean(student.IsRural),
          safeInt(student.NumberOfSiblings),
          safeValue(student.MotherEducation, 'No Formal Education'),
          safeValue(student.FatherEducation, 'No Formal Education'),
          safeBoolean(student.IsFatherLiterate),
          safeBoolean(student.IsMotherLiterate),
          safeBoolean(student.IsFirstGenerationLearner),
          safeNumber(student.CommuteTimeMinutes),
          safeNumber(student.FamilyAnnualIncome),
          safeValue(student.FamilyEconomicStatus, 'General_Tier'),
          safeBoolean(student.HasReliableInternet),
          safeBoolean(student.HasOwnLaptop),
          safeBoolean(student.IsPreparingCompetitiveExam),
          safeNumber(student.AvgPastPerformance),
          safeBoolean(student.MediumChanged),
          safeNumber(student.AvgMarks_LatestTerm),
          safeNumber(student.AvgMarks_PreviousTerm),
          safeNumber(student.MarksTrend),
          safeNumber(student.FailureRate_LatestTerm),
          safeNumber(student.AvgAttendance_LatestTerm),
          safeBoolean(student.WorksPartTime),
          safeBoolean(student.IsDropout),
          0, // RiskScore
          'Low', // RiskLevel
          0 // DropoutProbability
        ]);
        
        successCount++;
        
        if (successCount % 10 === 0) {
          console.log(`✅ Imported ${successCount} students...`);
        }
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Error importing student ${student.StudentID}:`, error.message);
      }
    }
    
    await connection.commit();
    
    console.log('\n🎉 Import completed!');
    console.log(`✅ Successfully imported: ${successCount} students`);
    console.log(`❌ Errors: ${errorCount} students`);
    
  } catch (error) {
    await connection.rollback();
    console.error('❌ Import failed:', error);
  } finally {
    await connection.end();
  }
}

// Run the import
if (require.main === module) {
  importData()
    .then(() => {
      console.log('\n🎯 Next steps:');
      console.log('1. Run: npm run dev');
      console.log('2. Visit: http://localhost:3000');
      console.log('3. Test database: http://localhost:3000/api/test-db');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Import failed:', error);
      process.exit(1);
    });
}

module.exports = { importData };
