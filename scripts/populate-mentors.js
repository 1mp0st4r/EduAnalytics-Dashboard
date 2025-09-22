#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { Pool } = require('pg');

// Database configuration for Neon
const dbConfig = {
  connectionString: process.env.DATABASE_URL || process.env.NEON_URL,
  ssl: {
    rejectUnauthorized: false
  }
};

const mentorData = [
  { name: "Dr. Priya Sharma", email: "priya.sharma@school.edu", phone: "+91-9876543210", specialization: "Academic Counseling", experience: 8 },
  { name: "Prof. Amit Kumar", email: "amit.kumar@school.edu", phone: "+91-9876543211", specialization: "Psychological Support", experience: 12 },
  { name: "Dr. Sunita Patel", email: "sunita.patel@school.edu", phone: "+91-9876543212", specialization: "Career Guidance", experience: 6 },
  { name: "Prof. Rajesh Singh", email: "rajesh.singh@school.edu", phone: "+91-9876543213", specialization: "Academic Support", experience: 10 },
  { name: "Dr. Meera Gupta", email: "meera.gupta@school.edu", phone: "+91-9876543214", specialization: "Behavioral Counseling", experience: 7 },
  { name: "Prof. Vikram Joshi", email: "vikram.joshi@school.edu", phone: "+91-9876543215", specialization: "Study Skills", experience: 9 },
  { name: "Dr. Anjali Reddy", email: "anjali.reddy@school.edu", phone: "+91-9876543216", specialization: "Mental Health", experience: 11 },
  { name: "Prof. Suresh Verma", email: "suresh.verma@school.edu", phone: "+91-9876543217", specialization: "Academic Excellence", experience: 5 },
  { name: "Dr. Kavita Nair", email: "kavita.nair@school.edu", phone: "+91-9876543218", specialization: "Student Development", experience: 8 },
  { name: "Prof. Ravi Tiwari", email: "ravi.tiwari@school.edu", phone: "+91-9876543219", specialization: "Educational Psychology", experience: 13 }
];

async function populateMentors() {
  console.log('🌟 Starting Mentor Database Population...');
  
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

    // Step 2: Clear existing mentors (handle foreign key constraints)
    console.log('🧹 Clearing existing mentors...');
    // First, remove mentor references from students
    await pool.query('UPDATE students SET mentor_id = NULL WHERE mentor_id IS NOT NULL');
    // Then delete mentors
    await pool.query('DELETE FROM mentors');
    await pool.query('DELETE FROM users WHERE user_type = \'mentor\'');

    // Step 3: Insert mentors
    console.log('👥 Inserting mentors...');
    for (let i = 0; i < mentorData.length; i++) {
      const mentor = mentorData[i];
      
      // Insert user record
      const userResult = await pool.query(`
        INSERT INTO users (email, password_hash, user_type, full_name, phone, created_at, updated_at, is_active)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), TRUE)
        RETURNING id
      `, [
        mentor.email,
        '$2a$10$example_hash_' + (i + 1), // Placeholder hash
        'mentor',
        mentor.name,
        mentor.phone
      ]);

      const userId = userResult.rows[0].id;

      // Insert mentor record
      await pool.query(`
        INSERT INTO mentors (user_id, employee_id, specialization, experience_years, max_students, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
      `, [
        userId,
        'MEN' + String(i + 1).padStart(3, '0'),
        mentor.specialization,
        mentor.experience,
        50 // Max students per mentor
      ]);

      console.log(`   ✅ Inserted mentor: ${mentor.name}`);
    }

    // Step 4: Assign random mentors to students
    console.log('🎯 Assigning random mentors to students...');
    const studentsResult = await pool.query('SELECT id FROM students WHERE is_active = TRUE');
    const mentorsResult = await pool.query('SELECT id FROM mentors');
    
    const students = studentsResult.rows;
    const mentors = mentorsResult.rows;
    
    let assignedCount = 0;
    for (const student of students) {
      const randomMentor = mentors[Math.floor(Math.random() * mentors.length)];
      
      await pool.query(`
        UPDATE students 
        SET mentor_id = $1
        WHERE id = $2
      `, [randomMentor.id, student.id]);
      
      assignedCount++;
      if (assignedCount % 100 === 0) {
        console.log(`   📈 Assigned mentors to ${assignedCount}/${students.length} students...`);
      }
    }

    console.log(`✅ Successfully assigned mentors to ${assignedCount} students!`);

    // Step 5: Verify results
    console.log('🔍 Verifying mentor assignment...');
    const statsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_mentors,
        COUNT(DISTINCT s.mentor_id) as mentors_with_students,
        COUNT(s.id) as total_students,
        COUNT(CASE WHEN s.mentor_id IS NOT NULL THEN 1 END) as students_with_mentors
      FROM mentors m
      LEFT JOIN students s ON m.id = s.mentor_id
    `);
    
    const stats = statsResult.rows[0];
    console.log('📊 Mentor Assignment Statistics:');
    console.log(`   - Total Mentors: ${stats.total_mentors}`);
    console.log(`   - Mentors with Students: ${stats.mentors_with_students}`);
    console.log(`   - Total Students: ${stats.total_students}`);
    console.log(`   - Students with Mentors: ${stats.students_with_mentors}`);

    console.log('\n🎉 Mentor database population completed successfully!');
    console.log('🚀 All students now have assigned mentors!');

  } catch (error) {
    console.error('❌ Mentor population failed:', error.message);
    console.error('💡 Make sure your DATABASE_URL is correctly set in .env.local');
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
      console.log('🔌 Database connection closed.');
    }
  }
}

// Run the population
populateMentors();
