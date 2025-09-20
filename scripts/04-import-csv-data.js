// Load environment variables
require('dotenv').config({ path: '.env.local' });

const mysql = require('mysql2/promise');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'StudentAnalyticsDB',
  port: parseInt(process.env.DB_PORT || '3306'),
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

// Function to map mentor name to mentor ID
async function getMentorId(connection, mentorName) {
  const [rows] = await connection.execute(
    'SELECT id FROM Mentors WHERE full_name = ?',
    [mentorName]
  );
  return rows.length > 0 ? rows[0].id : 1; // Default to first mentor if not found
}

// Function to get school ID (default to first school)
async function getSchoolId(connection) {
  const [rows] = await connection.execute('SELECT id FROM Schools LIMIT 1');
  return rows.length > 0 ? rows[0].id : 1;
}

// Function to create user for student
async function createStudentUser(connection, studentData) {
  const email = `${studentData.StudentID.toLowerCase()}@student.eduanalytics.gov.in`;
  const passwordHash = '$2b$10$example_hash_student'; // In production, use proper hashing
  
  try {
    const [result] = await connection.execute(
      'INSERT INTO Users (email, password_hash, user_type, full_name, phone) VALUES (?, ?, ?, ?, ?)',
      [email, passwordHash, 'student', studentData.StudentName, studentData.ContactPhoneNumber]
    );
    return result.insertId;
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      // User already exists, get existing user ID
      const [rows] = await connection.execute(
        'SELECT id FROM Users WHERE email = ?',
        [email]
      );
      return rows[0].id;
    }
    throw error;
  }
}

// Main import function
async function importData() {
  let connection;
  
  try {
    console.log('Connecting to MySQL database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL database successfully!');

    // Read the main student dataset
    console.log('Reading student dataset...');
    const studentData = await readCSV(path.join(__dirname, '../final_synthetic_dropout_data_rajasthan.csv'));
    console.log(`Found ${studentData.length} student records`);

    // Read the contact and mentor dataset
    console.log('Reading contact and mentor dataset...');
    const contactData = await readCSV(path.join(__dirname, '../student_contact_and_mentor_list.csv'));
    console.log(`Found ${contactData.length} contact records`);

    // Create a map of contact data by StudentID for quick lookup
    const contactMap = new Map();
    contactData.forEach(contact => {
      contactMap.set(contact.StudentID, contact);
    });

    // Get school ID (using first school)
    const schoolId = await getSchoolId(connection);
    console.log(`Using school ID: ${schoolId}`);

    // Process students in batches
    const batchSize = 100;
    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;

    console.log('Starting data import...');

    for (let i = 0; i < studentData.length; i += batchSize) {
      const batch = studentData.slice(i, i + batchSize);
      
      for (const student of batch) {
        try {
          // Get contact data for this student
          const contactInfo = contactMap.get(student.StudentID);
          
          if (!contactInfo) {
            console.warn(`No contact info found for student ${student.StudentID}`);
            errorCount++;
            continue;
          }

          // Create user for student
          const userId = await createStudentUser(connection, contactInfo);

          // Get mentor ID
          const mentorId = await getMentorId(connection, contactInfo['Assigned Mentor']);

          // Map CSV columns to database columns with proper null handling
          const studentRecord = {
            user_id: userId,
            StudentID: student.StudentID || null,
            school_id: schoolId,
            mentor_id: mentorId,
            StudentName: contactInfo['Student Name'] || null,
            Gender: student.Gender || 'Other',
            Age: parseInt(student.AdmissionQuota) || 0, // Using AdmissionQuota as age placeholder
            StudentClass: parseInt(student.AdmissionQuota) || 0, // Using AdmissionQuota as class placeholder
            MotherName: contactInfo['Mother Name'] || null,
            FatherName: contactInfo['Father Name'] || null,
            ContactPhoneNumber: contactInfo['Contact Phone Number'] || null,
            AdmissionQuota: student.AdmissionQuota || 'General',
            AccommodationType: student.AccommodationType || 'DayScholar',
            IsRural: student.IsRural === 'TRUE',
            NumberOfSiblings: parseInt(student.NumberOfSiblings) || 0,
            MotherEducation: student.MotherEducation || 'No Formal Education',
            FatherEducation: student.FatherEducation || 'No Formal Education',
            IsFatherLiterate: student.IsFatherLiterate === 'TRUE',
            IsMotherLiterate: student.IsMotherLiterate === 'TRUE',
            IsFirstGenerationLearner: student.IsFirstGenerationLearner === 'TRUE',
            CommuteTimeMinutes: parseFloat(student.CommuteTimeMinutes) || 0,
            FamilyAnnualIncome: parseFloat(student.FamilyAnnualIncome) || 0,
            FamilyEconomicStatus: student.FamilyEconomicStatus || 'General_Tier',
            HasReliableInternet: student.HasReliableInternet === 'TRUE',
            HasOwnLaptop: student.HasOwnLaptop === 'TRUE',
            IsPreparingCompetitiveExam: student.IsPreparingCompetitiveExam === 'TRUE',
            AvgPastPerformance: parseFloat(student.AvgPastPerformance) || 0,
            MediumChanged: student.MediumChanged === 'TRUE',
            AvgMarks_LatestTerm: parseFloat(student.AvgMarks_LatestTerm) || 0,
            AvgMarks_PreviousTerm: parseFloat(student.AvgMarks_PreviousTerm) || 0,
            MarksTrend: parseFloat(student.MarksTrend) || 0,
            FailureRate_LatestTerm: parseFloat(student.FailureRate_LatestTerm) || 0,
            AvgAttendance_LatestTerm: parseFloat(student.AvgAttendance_LatestTerm) || 0,
            WorksPartTime: student.WorksPartTime === 'TRUE',
            IsDropout: student.IsDropout === 'TRUE',
            RiskScore: 0, // Will be calculated later
            RiskLevel: 'Low', // Will be calculated later
            DropoutProbability: 0, // Will be calculated later
          };

          // Insert student record
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
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            studentRecord.user_id, studentRecord.StudentID, studentRecord.school_id, studentRecord.mentor_id,
            studentRecord.StudentName, studentRecord.Gender, studentRecord.Age, studentRecord.StudentClass,
            studentRecord.MotherName, studentRecord.FatherName, studentRecord.ContactPhoneNumber,
            studentRecord.AdmissionQuota, studentRecord.AccommodationType, studentRecord.IsRural,
            studentRecord.NumberOfSiblings, studentRecord.MotherEducation, studentRecord.FatherEducation,
            studentRecord.IsFatherLiterate, studentRecord.IsMotherLiterate, studentRecord.IsFirstGenerationLearner,
            studentRecord.CommuteTimeMinutes, studentRecord.FamilyAnnualIncome, studentRecord.FamilyEconomicStatus,
            studentRecord.HasReliableInternet, studentRecord.HasOwnLaptop, studentRecord.IsPreparingCompetitiveExam,
            studentRecord.AvgPastPerformance, studentRecord.MediumChanged, studentRecord.AvgMarks_LatestTerm,
            studentRecord.AvgMarks_PreviousTerm, studentRecord.MarksTrend, studentRecord.FailureRate_LatestTerm,
            studentRecord.AvgAttendance_LatestTerm, studentRecord.WorksPartTime, studentRecord.IsDropout,
            studentRecord.RiskScore, studentRecord.RiskLevel, studentRecord.DropoutProbability
          ]);

          successCount++;

        } catch (error) {
          console.error(`Error importing student ${student.StudentID}:`, error.message);
          errorCount++;
        }

        processedCount++;
        if (processedCount % 100 === 0) {
          console.log(`Processed ${processedCount}/${studentData.length} students...`);
        }
      }
    }

    console.log('\n=== Import Summary ===');
    console.log(`Total processed: ${processedCount}`);
    console.log(`Successfully imported: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log('Data import completed!');

  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

// Run the import
if (require.main === module) {
  importData()
    .then(() => {
      console.log('Import process completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Import process failed:', error);
      process.exit(1);
    });
}

module.exports = { importData };

