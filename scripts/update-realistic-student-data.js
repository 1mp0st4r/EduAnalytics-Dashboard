const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

// Realistic Indian dropout rates by class level (approximate percentages)
const DROPOUT_RATES_BY_CLASS = {
  1: 2.5,   // Very low dropout in early primary
  2: 3.2,   // Low dropout
  3: 4.1,   // Low dropout
  4: 5.8,   // Moderate dropout
  5: 7.2,   // Moderate dropout
  6: 12.5,  // Higher dropout (transition to middle school)
  7: 15.8,  // High dropout
  8: 18.2,  // High dropout
  9: 22.1,  // Very high dropout (transition to high school)
  10: 25.8, // Very high dropout
  11: 28.5, // Very high dropout
  12: 15.2  // Lower dropout (final year)
}

// Class distribution (realistic enrollment numbers)
const CLASS_DISTRIBUTION = {
  1: 850,   // High enrollment in early classes
  2: 920,   // High enrollment
  3: 980,   // High enrollment
  4: 1050,  // Peak enrollment
  5: 1100,  // Peak enrollment
  6: 950,   // Drop after primary
  7: 800,   // Significant drop
  8: 700,   // Significant drop
  9: 600,   // Major drop (high school transition)
  10: 500,  // Major drop
  11: 400,  // Major drop
  12: 350   // Final year
}

// Risk level distribution by class (higher classes = higher risk)
const RISK_DISTRIBUTION_BY_CLASS = {
  1: { Low: 85, Medium: 12, High: 2.5, Critical: 0.5 },
  2: { Low: 82, Medium: 15, High: 2.5, Critical: 0.5 },
  3: { Low: 80, Medium: 16, High: 3, Critical: 1 },
  4: { Low: 75, Medium: 20, High: 4, Critical: 1 },
  5: { Low: 70, Medium: 22, High: 6, Critical: 2 },
  6: { Low: 60, Medium: 25, High: 12, Critical: 3 },
  7: { Low: 50, Medium: 30, High: 15, Critical: 5 },
  8: { Low: 45, Medium: 30, High: 18, Critical: 7 },
  9: { Low: 35, Medium: 35, High: 22, Critical: 8 },
  10: { Low: 30, Medium: 35, High: 25, Critical: 10 },
  11: { Low: 25, Medium: 35, High: 28, Critical: 12 },
  12: { Low: 20, Medium: 40, High: 30, Critical: 10 }
}

// Indian names for more realistic data
const INDIAN_NAMES = {
  male: [
    'Arjun', 'Rahul', 'Vikram', 'Amit', 'Rajesh', 'Suresh', 'Pradeep', 'Kiran', 'Ajay', 'Ravi',
    'Deepak', 'Manoj', 'Suresh', 'Rohit', 'Amit', 'Vikram', 'Raj', 'Kumar', 'Suresh', 'Pradeep',
    'Rahul', 'Arjun', 'Vikram', 'Amit', 'Rajesh', 'Suresh', 'Pradeep', 'Kiran', 'Ajay', 'Ravi',
    'Deepak', 'Manoj', 'Suresh', 'Rohit', 'Amit', 'Vikram', 'Raj', 'Kumar', 'Suresh', 'Pradeep',
    'Rahul', 'Arjun', 'Vikram', 'Amit', 'Rajesh', 'Suresh', 'Pradeep', 'Kiran', 'Ajay', 'Ravi'
  ],
  female: [
    'Priya', 'Sunita', 'Neha', 'Kavya', 'Anjali', 'Rashmi', 'Sita', 'Meera', 'Pooja', 'Kavita',
    'Deepika', 'Shilpa', 'Rekha', 'Sneha', 'Anita', 'Ritu', 'Suman', 'Lata', 'Geeta', 'Usha',
    'Priya', 'Sunita', 'Neha', 'Kavya', 'Anjali', 'Rashmi', 'Sita', 'Meera', 'Pooja', 'Kavita',
    'Deepika', 'Shilpa', 'Rekha', 'Sneha', 'Anita', 'Ritu', 'Suman', 'Lata', 'Geeta', 'Usha',
    'Priya', 'Sunita', 'Neha', 'Kavya', 'Anjali', 'Rashmi', 'Sita', 'Meera', 'Pooja', 'Kavita'
  ]
}

// Indian surnames
const INDIAN_SURNAMES = [
  'Sharma', 'Verma', 'Gupta', 'Kumar', 'Singh', 'Patel', 'Reddy', 'Agarwal', 'Joshi', 'Mishra',
  'Choudhary', 'Rao', 'Mehta', 'Jain', 'Agarwal', 'Sharma', 'Verma', 'Gupta', 'Kumar', 'Singh',
  'Patel', 'Reddy', 'Agarwal', 'Joshi', 'Mishra', 'Choudhary', 'Rao', 'Mehta', 'Jain', 'Agarwal'
]

// Generate realistic Indian email addresses
function generateIndianEmail(firstName, lastName, classLevel) {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'rediffmail.com']
  const domain = domains[Math.floor(Math.random() * domains.length)]
  
  // For classes 6-12, use student email
  if (classLevel >= 6) {
    const variations = [
      `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
      `${firstName.toLowerCase()}${lastName.toLowerCase()}@${domain}`,
      `${firstName.toLowerCase()}.${lastName.toLowerCase()}${classLevel}@${domain}`,
      `${firstName.toLowerCase()}${classLevel}@${domain}`
    ]
    return variations[Math.floor(Math.random() * variations.length)]
  }
  
  // For classes 1-5, return null (will use mentor email)
  return null
}

// Generate realistic Indian phone numbers
function generateIndianPhoneNumber() {
  const prefixes = ['+91-', '91-', '']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  
  // Generate 10-digit Indian mobile number
  const mobile = Math.floor(Math.random() * 9000000000) + 1000000000
  return `${prefix}${mobile}`
}

// Generate student name
function generateStudentName(gender) {
  const genderKey = gender.toLowerCase()
  const firstNames = INDIAN_NAMES[genderKey]
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = INDIAN_SURNAMES[Math.floor(Math.random() * INDIAN_SURNAMES.length)]
  return `${firstName} ${lastName}`
}

// Calculate risk level based on class and random factors
function calculateRiskLevel(classLevel) {
  const distribution = RISK_DISTRIBUTION_BY_CLASS[classLevel]
  const random = Math.random() * 100
  
  let cumulative = 0
  for (const [level, percentage] of Object.entries(distribution)) {
    cumulative += percentage
    if (random <= cumulative) {
      return level
    }
  }
  return 'Low'
}

// Calculate dropout probability based on class and risk level
function calculateDropoutProbability(classLevel, riskLevel) {
  const baseRate = DROPOUT_RATES_BY_CLASS[classLevel]
  const riskMultiplier = {
    'Low': 0.3,
    'Medium': 0.7,
    'High': 1.5,
    'Critical': 2.5
  }
  
  return Math.min(95, Math.max(5, baseRate * riskMultiplier[riskLevel] + (Math.random() * 10 - 5)))
}

// Calculate risk score based on class and risk level
function calculateRiskScore(classLevel, riskLevel) {
  const baseScore = classLevel * 5 // Higher classes have higher base scores
  const riskMultiplier = {
    'Low': 0.2,
    'Medium': 0.5,
    'High': 0.8,
    'Critical': 1.0
  }
  
  return Math.min(100, Math.max(10, baseScore + (riskLevel === 'Critical' ? 40 : riskLevel === 'High' ? 25 : riskLevel === 'Medium' ? 10 : 0) + Math.random() * 10))
}

// Calculate attendance based on class and risk level
function calculateAttendance(classLevel, riskLevel) {
  const baseAttendance = 95 - (classLevel * 2) // Higher classes have lower attendance
  const riskPenalty = {
    'Low': 0,
    'Medium': -5,
    'High': -15,
    'Critical': -25
  }
  
  return Math.max(30, Math.min(100, baseAttendance + riskPenalty[riskLevel] + (Math.random() * 10 - 5)))
}

// Calculate performance based on class and risk level
function calculatePerformance(classLevel, riskLevel) {
  const basePerformance = 85 - (classLevel * 1.5) // Higher classes are more challenging
  const riskPenalty = {
    'Low': 0,
    'Medium': -8,
    'High': -20,
    'Critical': -35
  }
  
  return Math.max(20, Math.min(100, basePerformance + riskPenalty[riskLevel] + (Math.random() * 15 - 7.5)))
}

async function updateStudentData() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  })

  try {
    console.log('🔄 Starting realistic student data update...')
    
    // Get all students
    const studentsResult = await pool.query('SELECT * FROM students WHERE is_active = true')
    const students = studentsResult.rows
    console.log(`📊 Found ${students.length} students to update`)

    // Get mentors for email/phone assignment
    const mentorsResult = await pool.query(`
      SELECT m.id, u.email, u.phone 
      FROM mentors m 
      JOIN users u ON m.user_id = u.id
    `)
    const mentors = mentorsResult.rows
    console.log(`👥 Found ${mentors.length} mentors`)

    // Create class distribution
    const classDistribution = []
    for (const [classLevel, count] of Object.entries(CLASS_DISTRIBUTION)) {
      for (let i = 0; i < count; i++) {
        classDistribution.push(parseInt(classLevel))
      }
    }

    // Shuffle the distribution
    for (let i = classDistribution.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [classDistribution[i], classDistribution[j]] = [classDistribution[j], classDistribution[i]]
    }

    console.log('📚 Class distribution created:', CLASS_DISTRIBUTION)

    let updatedCount = 0
    const batchSize = 100

    for (let i = 0; i < students.length; i++) {
      const student = students[i]
      const classLevel = classDistribution[i % classDistribution.length]
      const gender = Math.random() < 0.52 ? 'Male' : 'Female' // Slight male bias in Indian education
      
      // Generate new data
      const studentName = generateStudentName(gender)
      const riskLevel = calculateRiskLevel(classLevel)
      const dropoutProbability = calculateDropoutProbability(classLevel, riskLevel)
      const riskScore = Math.round(calculateRiskScore(classLevel, riskLevel))
      const attendance = calculateAttendance(classLevel, riskLevel)
      const performance = calculatePerformance(classLevel, riskLevel)
      
      // Determine if student is dropout based on probability
      const isDropout = Math.random() * 100 < dropoutProbability
      
      // Assign contact information
      let email = generateIndianEmail(studentName.split(' ')[0], studentName.split(' ')[1], classLevel)
      let phone = null
      
      if (classLevel < 6) {
        // For classes 1-5, use mentor's contact info
        const mentor = mentors[Math.floor(Math.random() * mentors.length)]
        email = mentor.email
        phone = mentor.phone
      } else {
        // For classes 6-12, generate student contact info
        phone = generateIndianPhoneNumber()
      }

      // Update student record
      await pool.query(`
        UPDATE students SET
          full_name = $1,
          class_level = $2,
          gender = $3,
          current_attendance = $4,
          current_performance = $5,
          risk_level = $6,
          dropout_probability = $7,
          risk_score = $8::integer,
          is_dropout = $9,
          email = $10,
          phone = $11,
          updated_at = NOW()
        WHERE id = $12
      `, [
        studentName,
        classLevel,
        gender,
        attendance.toFixed(2),
        performance.toFixed(2),
        riskLevel,
        dropoutProbability.toFixed(2),
        riskScore,
        isDropout,
        email,
        phone,
        student.id
      ])

      updatedCount++
      
      if (updatedCount % batchSize === 0) {
        console.log(`✅ Updated ${updatedCount}/${students.length} students...`)
      }
    }

    console.log(`🎉 Successfully updated ${updatedCount} students!`)

    // Generate summary statistics
    const summaryResult = await pool.query(`
      SELECT 
        class_level,
        COUNT(*) as total_students,
        COUNT(CASE WHEN is_dropout = true THEN 1 END) as dropouts,
        ROUND(AVG(dropout_probability), 2) as avg_dropout_probability,
        ROUND(AVG(risk_score), 2) as avg_risk_score,
        ROUND(AVG(current_attendance), 2) as avg_attendance,
        ROUND(AVG(current_performance), 2) as avg_performance
      FROM students 
      WHERE is_active = true 
      GROUP BY class_level 
      ORDER BY class_level
    `)

    console.log('\n📊 Updated Dataset Summary:')
    console.log('Class | Students | Dropouts | Dropout% | Risk Score | Attendance | Performance')
    console.log('------|----------|----------|----------|------------|------------|------------')
    
    summaryResult.rows.forEach(row => {
      const dropoutRate = ((row.dropouts / row.total_students) * 100).toFixed(1)
      console.log(
        `${row.class_level.toString().padStart(5)} | ${row.total_students.toString().padStart(8)} | ${row.dropouts.toString().padStart(8)} | ${dropoutRate.padStart(8)}% | ${row.avg_dropout_probability.toString().padStart(10)} | ${row.avg_attendance.toString().padStart(10)} | ${row.avg_performance.toString().padStart(11)}`
      )
    })

    // Risk level distribution
    const riskResult = await pool.query(`
      SELECT 
        risk_level,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM students WHERE is_active = true), 2) as percentage
      FROM students 
      WHERE is_active = true 
      GROUP BY risk_level 
      ORDER BY 
        CASE risk_level 
          WHEN 'Critical' THEN 4
          WHEN 'High' THEN 3
          WHEN 'Medium' THEN 2
          WHEN 'Low' THEN 1
        END
    `)

    console.log('\n🎯 Risk Level Distribution:')
    riskResult.rows.forEach(row => {
      console.log(`${row.risk_level}: ${row.count} students (${row.percentage}%)`)
    })

  } catch (error) {
    console.error('❌ Error updating student data:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// Run the update
updateStudentData()
  .then(() => {
    console.log('✅ Student data update completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Student data update failed:', error)
    process.exit(1)
  })
