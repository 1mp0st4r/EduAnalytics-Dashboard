import { Pool } from 'pg'

// Neon PostgreSQL database service - optimized for serverless
export class NeonService {
  private connectionString: string

  constructor() {
    this.connectionString = process.env.DATABASE_URL || process.env.NEON_URL || ''
  }

  // Create a new connection for each operation (serverless-friendly)
  private async getConnection() {
    return new Pool({
      connectionString: this.connectionString,
      ssl: { rejectUnauthorized: false },
      max: 1, // Single connection for serverless
      idleTimeoutMillis: 0, // Don't keep connections alive
      connectionTimeoutMillis: 10000, // 10 second timeout
    })
  }

  // Test database connection
  async testConnection(): Promise<boolean> {
    const pool = await this.getConnection()
    try {
      console.log('🔍 Testing Neon connection...')
      console.log('🔍 Connection string available:', !!this.connectionString)
      
      const result = await pool.query('SELECT NOW()')
      console.log('🔍 Query result:', result.rows[0])
      
      console.log('✅ Neon PostgreSQL connection successful')
      return true
    } catch (error: any) {
      console.error('❌ Neon PostgreSQL connection failed:', error)
      console.error('❌ Error details:', error.message)
      return false
    } finally {
      await pool.end()
    }
  }

  // Get all students with filters
  async getStudents(filters: {
    riskLevel?: string
    classLevel?: string
    isDropout?: boolean
    limit?: number
    offset?: number
  } = {}): Promise<any[]> {
    let sql = `
      SELECT 
        s.id,
        s.student_id as "StudentID",
        s.full_name as "StudentName",
        s.class_level as "StudentClass",
        s.current_attendance as "AvgAttendance_LatestTerm",
        s.current_performance as "AvgMarks_LatestTerm",
        s.risk_level as "RiskLevel",
        s.dropout_probability as "DropoutProbability",
        s.risk_score as "RiskScore",
        s.is_dropout as "IsDropout",
        s.gender as "Gender",
        s.phone as "ContactPhoneNumber",
        s.email as "ContactEmail",
        u.full_name as "MentorName",
        u.email as "MentorEmail",
        u.phone as "MentorPhone",
        sc.name as "SchoolName",
        s.created_at
      FROM students s
      LEFT JOIN mentors m ON s.mentor_id = m.id
      LEFT JOIN users u ON m.user_id = u.id
      LEFT JOIN schools sc ON s.school_id = sc.id
      WHERE s.is_active = true
    `

    const params: any[] = []
    let paramCount = 1

    if (filters.riskLevel) {
      sql += ` AND s.risk_level = $${paramCount}`
      params.push(filters.riskLevel)
      paramCount++
    }

    if (filters.classLevel) {
      sql += ` AND s.class_level = $${paramCount}`
      params.push(parseInt(filters.classLevel))
      paramCount++
    }

    if (filters.isDropout !== undefined) {
      sql += ` AND s.is_dropout = $${paramCount}`
      params.push(filters.isDropout)
      paramCount++
    }

    sql += ` ORDER BY s.risk_score DESC`

    if (filters.limit) {
      sql += ` LIMIT $${paramCount}`
      params.push(filters.limit)
      paramCount++
    }

    if (filters.offset) {
      sql += ` OFFSET $${paramCount}`
      params.push(filters.offset)
    }

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, params)
      return result.rows
    } catch (error) {
      console.error('Error fetching students:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Get student by ID
  async getStudentById(studentId: string): Promise<any | null> {
    const sql = `
      SELECT 
        s.id,
        s.student_id as "StudentID",
        s.full_name as "StudentName",
        s.class_level as "StudentClass",
        s.current_attendance as "AvgAttendance_LatestTerm",
        s.current_performance as "AvgMarks_LatestTerm",
        s.risk_level as "RiskLevel",
        s.dropout_probability as "DropoutProbability",
        s.risk_score as "RiskScore",
        s.is_dropout as "IsDropout",
        s.gender as "Gender",
        s.phone as "ContactPhoneNumber",
        s.email as "ContactEmail",
        u.full_name as "MentorName",
        u.email as "MentorEmail",
        u.phone as "MentorPhone",
        sc.name as "SchoolName",
        s.created_at
      FROM students s
      LEFT JOIN mentors m ON s.mentor_id = m.id
      LEFT JOIN users u ON m.user_id = u.id
      LEFT JOIN schools sc ON s.school_id = sc.id
      WHERE s.student_id = $1 AND s.is_active = true
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, [studentId])
      return result.rows.length > 0 ? result.rows[0] : null
    } catch (error) {
      console.error('Error fetching student by ID:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Create new student
  async createStudent(studentData: {
    studentId: string
    fullName: string
    email?: string
    phone?: string
    gender?: string
    classLevel: number
    schoolId?: number
    mentorId?: number
    parentName?: string
    parentPhone?: string
    parentEmail?: string
    address?: string
    district?: string
    state?: string
    attendance?: number
    performance?: number
    riskLevel?: string
    riskScore?: number
    dropoutProbability?: number
  }): Promise<any | null> {
    const sql = `
      INSERT INTO students (
        student_id, full_name, email, phone, gender, class_level, 
        school_id, mentor_id, parent_name, parent_phone, parent_email,
        address, district, state, current_attendance, current_performance,
        risk_level, risk_score, dropout_probability, is_active, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW(), NOW())
      RETURNING id, student_id, full_name, email, phone, gender, class_level,
                school_id, mentor_id, parent_name, parent_phone, parent_email,
                address, district, state, current_attendance, current_performance,
                risk_level, risk_score, dropout_probability, is_active, created_at
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, [
        studentData.studentId,
        studentData.fullName,
        studentData.email || null,
        studentData.phone || null,
        studentData.gender || 'Other',
        studentData.classLevel,
        studentData.schoolId || null,
        studentData.mentorId || null,
        studentData.parentName || null,
        studentData.parentPhone || null,
        studentData.parentEmail || null,
        studentData.address || null,
        studentData.district || null,
        studentData.state || null,
        studentData.attendance || 0,
        studentData.performance || 0,
        studentData.riskLevel || 'Low',
        studentData.riskScore || 0,
        studentData.dropoutProbability || 0,
        true
      ])
      return result.rows[0] || null
    } catch (error) {
      console.error('Error creating student:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Update student
  async updateStudent(studentId: string, updateData: {
    fullName?: string
    email?: string
    phone?: string
    gender?: string
    classLevel?: number
    schoolId?: number
    mentorId?: number
    parentName?: string
    parentPhone?: string
    parentEmail?: string
    address?: string
    district?: string
    state?: string
    attendance?: number
    performance?: number
    riskLevel?: string
    riskScore?: number
    dropoutProbability?: number
    isActive?: boolean
  }): Promise<any | null> {
    // Build dynamic SQL for updates
    const updateFields = []
    const values = []
    let paramCount = 1

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbField = key === 'classLevel' ? 'class_level' : 
                       key === 'parentName' ? 'parent_name' :
                       key === 'parentPhone' ? 'parent_phone' :
                       key === 'parentEmail' ? 'parent_email' :
                       key === 'isActive' ? 'is_active' :
                       key === 'attendance' ? 'current_attendance' :
                       key === 'performance' ? 'current_performance' :
                       key === 'riskLevel' ? 'risk_level' :
                       key === 'riskScore' ? 'risk_score' :
                       key === 'dropoutProbability' ? 'dropout_probability' :
                       key
        updateFields.push(`${dbField} = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    })

    if (updateFields.length === 0) {
      throw new Error('No fields to update')
    }

    updateFields.push(`updated_at = NOW()`)
    values.push(studentId)

    const sql = `
      UPDATE students 
      SET ${updateFields.join(', ')}
      WHERE student_id = $${paramCount}
      RETURNING id, student_id, full_name, email, phone, gender, class_level,
                school_id, mentor_id, parent_name, parent_phone, parent_email,
                address, district, state, current_attendance, current_performance,
                risk_level, risk_score, dropout_probability, is_active, created_at, updated_at
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, values)
      return result.rows.length > 0 ? result.rows[0] : null
    } catch (error) {
      console.error('Error updating student:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Delete student (soft delete)
  async deleteStudent(studentId: string): Promise<boolean> {
    const sql = `
      UPDATE students 
      SET is_active = false, updated_at = NOW()
      WHERE student_id = $1
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, [studentId])
      return (result.rowCount || 0) > 0
    } catch (error) {
      console.error('Error deleting student:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Hard delete student (permanent)
  async hardDeleteStudent(studentId: string): Promise<boolean> {
    const sql = `DELETE FROM students WHERE student_id = $1`

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, [studentId])
      return (result.rowCount || 0) > 0
    } catch (error) {
      console.error('Error hard deleting student:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Update student risk assessment
  async updateStudentRisk(
    studentId: string,
    riskLevel: string,
    riskScore: number,
    dropoutProbability: number
  ): Promise<boolean> {
    const sql = `
      UPDATE students 
      SET risk_level = $1, risk_score = $2, dropout_probability = $3, last_risk_assessment = NOW()
      WHERE student_id = $4
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, [riskLevel, riskScore, dropoutProbability, studentId])
      return (result.rowCount || 0) > 0
    } catch (error) {
      console.error('Error updating student risk:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Get student statistics
  async getStudentStatistics(): Promise<{
    totalStudents: number
    highRiskStudents: number
    mediumRiskStudents: number
    lowRiskStudents: number
    criticalRiskStudents: number
    dropoutStudents: number
    avgAttendance: number
    avgPerformance: number
  }> {
    const sql = `
      SELECT 
        COUNT(*) as "totalStudents",
        COUNT(CASE WHEN risk_level = 'High' THEN 1 END) as "highRiskStudents",
        COUNT(CASE WHEN risk_level = 'Medium' THEN 1 END) as "mediumRiskStudents",
        COUNT(CASE WHEN risk_level = 'Low' THEN 1 END) as "lowRiskStudents",
        COUNT(CASE WHEN risk_level = 'Critical' THEN 1 END) as "criticalRiskStudents",
        COUNT(CASE WHEN is_dropout = true THEN 1 END) as "dropoutStudents",
        AVG(current_attendance) as "avgAttendance",
        AVG(current_performance) as "avgPerformance"
      FROM students 
      WHERE is_active = true
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql)
      const row = result.rows[0]
      return {
        totalStudents: parseInt(row.totalStudents) || 0,
        highRiskStudents: parseInt(row.highRiskStudents) || 0,
        mediumRiskStudents: parseInt(row.mediumRiskStudents) || 0,
        lowRiskStudents: parseInt(row.lowRiskStudents) || 0,
        criticalRiskStudents: parseInt(row.criticalRiskStudents) || 0,
        dropoutStudents: parseInt(row.dropoutStudents) || 0,
        avgAttendance: parseFloat(row.avgAttendance) || 0,
        avgPerformance: parseFloat(row.avgPerformance) || 0,
      }
    } catch (error) {
      console.error('Error fetching student statistics:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // ===== SCHOOL MANAGEMENT =====

  // Get all schools
  async getSchools(): Promise<any[]> {
    const sql = `
      SELECT id, name, address, district, state, contact_phone, contact_email, created_at
      FROM schools
      ORDER BY name
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql)
      return result.rows
    } catch (error) {
      console.error('Error fetching schools:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Get school by ID
  async getSchoolById(schoolId: string): Promise<any | null> {
    const sql = `
      SELECT id, name, address, district, state, contact_phone, contact_email, created_at
      FROM schools
      WHERE id = $1
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, [schoolId])
      return result.rows.length > 0 ? result.rows[0] : null
    } catch (error) {
      console.error('Error fetching school by ID:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Create new school
  async createSchool(schoolData: {
    name: string
    address?: string
    district?: string
    state?: string
    contactPhone?: string
    contactEmail?: string
  }): Promise<any | null> {
    const sql = `
      INSERT INTO schools (name, address, district, state, contact_phone, contact_email, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING id, name, address, district, state, contact_phone, contact_email, created_at
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, [
        schoolData.name,
        schoolData.address || null,
        schoolData.district || null,
        schoolData.state || null,
        schoolData.contactPhone || null,
        schoolData.contactEmail || null
      ])
      return result.rows[0] || null
    } catch (error) {
      console.error('Error creating school:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Update school
  async updateSchool(schoolId: string, updateData: {
    name?: string
    address?: string
    district?: string
    state?: string
    contactPhone?: string
    contactEmail?: string
  }): Promise<any | null> {
    const updateFields = []
    const values = []
    let paramCount = 1

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbField = key === 'contactPhone' ? 'contact_phone' :
                       key === 'contactEmail' ? 'contact_email' : key
        updateFields.push(`${dbField} = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    })

    if (updateFields.length === 0) {
      throw new Error('No fields to update')
    }

    values.push(schoolId)

    const sql = `
      UPDATE schools 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, address, district, state, contact_phone, contact_email, created_at
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, values)
      return result.rows.length > 0 ? result.rows[0] : null
    } catch (error) {
      console.error('Error updating school:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Delete school
  async deleteSchool(schoolId: string): Promise<boolean> {
    const sql = `DELETE FROM schools WHERE id = $1`

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, [schoolId])
      return (result.rowCount || 0) > 0
    } catch (error) {
      console.error('Error deleting school:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // ===== MENTOR MANAGEMENT =====

  // Get all mentors
  async getMentors(): Promise<any[]> {
    const sql = `
      SELECT 
        m.id,
        m.employee_id,
        m.specialization,
        m.experience_years,
        m.max_students,
        m.created_at,
        u.full_name,
        u.email,
        u.phone,
        COUNT(s.id) as current_students
      FROM mentors m
      LEFT JOIN users u ON m.user_id = u.id
      LEFT JOIN students s ON m.id = s.mentor_id AND s.is_active = true
      GROUP BY m.id, m.employee_id, m.specialization, m.experience_years, m.max_students, m.created_at, u.full_name, u.email, u.phone
      ORDER BY u.full_name
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql)
      return result.rows
    } catch (error) {
      console.error('Error fetching mentors:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Get mentor by ID
  async getMentorById(mentorId: string): Promise<any | null> {
    const sql = `
      SELECT 
        m.id,
        m.employee_id,
        m.specialization,
        m.experience_years,
        m.max_students,
        m.created_at,
        u.full_name,
        u.email,
        u.phone,
        COUNT(s.id) as current_students
      FROM mentors m
      LEFT JOIN users u ON m.user_id = u.id
      LEFT JOIN students s ON m.id = s.mentor_id AND s.is_active = true
      WHERE m.id = $1
      GROUP BY m.id, m.employee_id, m.specialization, m.experience_years, m.max_students, m.created_at, u.full_name, u.email, u.phone
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, [mentorId])
      return result.rows.length > 0 ? result.rows[0] : null
    } catch (error) {
      console.error('Error fetching mentor by ID:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Create new mentor
  async createMentor(mentorData: {
    userId: string
    employeeId: string
    specialization?: string
    experienceYears?: number
    maxStudents?: number
  }): Promise<any | null> {
    const sql = `
      INSERT INTO mentors (user_id, employee_id, specialization, experience_years, max_students, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id, user_id, employee_id, specialization, experience_years, max_students, created_at
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, [
        mentorData.userId,
        mentorData.employeeId,
        mentorData.specialization || null,
        mentorData.experienceYears || null,
        mentorData.maxStudents || 50
      ])
      return result.rows[0] || null
    } catch (error) {
      console.error('Error creating mentor:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Update mentor
  async updateMentor(mentorId: string, updateData: {
    employeeId?: string
    specialization?: string
    experienceYears?: number
    maxStudents?: number
  }): Promise<any | null> {
    const updateFields = []
    const values = []
    let paramCount = 1

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbField = key === 'employeeId' ? 'employee_id' :
                       key === 'experienceYears' ? 'experience_years' :
                       key === 'maxStudents' ? 'max_students' : key
        updateFields.push(`${dbField} = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    })

    if (updateFields.length === 0) {
      throw new Error('No fields to update')
    }

    values.push(mentorId)

    const sql = `
      UPDATE mentors 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, user_id, employee_id, specialization, experience_years, max_students, created_at
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, values)
      return result.rows.length > 0 ? result.rows[0] : null
    } catch (error) {
      console.error('Error updating mentor:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Delete mentor
  async deleteMentor(mentorId: string): Promise<boolean> {
    const sql = `DELETE FROM mentors WHERE id = $1`

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, [mentorId])
      return (result.rowCount || 0) > 0
    } catch (error) {
      console.error('Error deleting mentor:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Get mentor by user ID
  async getMentorByUserId(userId: string): Promise<any | null> {
    const sql = `
      SELECT 
        m.id,
        m.user_id,
        m.employee_id,
        m.specialization,
        m.experience_years,
        m.max_students,
        m.created_at,
        u.full_name,
        u.email,
        u.phone
      FROM mentors m
      LEFT JOIN users u ON m.user_id = u.id
      WHERE m.user_id = $1
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, [userId])
      return result.rows.length > 0 ? result.rows[0] : null
    } catch (error) {
      console.error('Error fetching mentor by user ID:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Get students assigned to a mentor
  async getStudentsByMentorId(mentorId: string): Promise<any[]> {
    // First get the mentor's email
    const mentor = await this.getMentorById(mentorId)
    if (!mentor) {
      return []
    }

    const sql = `
      SELECT 
        s.id,
        s."StudentID" as student_id,
        s."StudentName" as full_name,
        s."ContactEmail" as email,
        s."ContactPhoneNumber" as phone,
        s."Gender" as gender,
        s."StudentClass" as class_level,
        s."AvgAttendance_LatestTerm" as current_attendance,
        s."AvgMarks_LatestTerm" as current_performance,
        s."RiskLevel" as risk_level,
        s."RiskScore" as risk_score,
        s."DropoutProbability" as dropout_probability,
        NULL as parent_name,
        NULL as parent_phone,
        NULL as parent_email,
        NULL as address,
        NULL as district,
        NULL as state,
        s.created_at,
        s."SchoolName"
      FROM "Students" s
      WHERE s."MentorEmail" = $1
      ORDER BY s."StudentName"
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, [mentor.email])
      return result.rows
    } catch (error) {
      console.error('Error fetching students by mentor ID:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Get mentor statistics
  async getMentorStatistics(mentorId: string): Promise<any> {
    // First get the mentor's email
    const mentor = await this.getMentorById(mentorId)
    if (!mentor) {
      return {
        totalStudents: 0,
        highRiskStudents: 0,
        mediumRiskStudents: 0,
        lowRiskStudents: 0,
        averageAttendance: 0,
        averagePerformance: 0,
        recentInterventions: 0
      }
    }

    const sql = `
      SELECT 
        COUNT(s.id) as total_students,
        COUNT(CASE WHEN s."RiskLevel" = 'Critical' OR s."RiskLevel" = 'High' THEN 1 END) as high_risk_students,
        COUNT(CASE WHEN s."RiskLevel" = 'Medium' THEN 1 END) as medium_risk_students,
        COUNT(CASE WHEN s."RiskLevel" = 'Low' THEN 1 END) as low_risk_students,
        COALESCE(AVG(CAST(s."AvgAttendance_LatestTerm" AS DECIMAL)), 0) as average_attendance,
        COALESCE(AVG(CAST(s."AvgMarks_LatestTerm" AS DECIMAL)), 0) as average_performance,
        COUNT(i.id) as recent_interventions
      FROM "Students" s
      LEFT JOIN interventions i ON s.id = i.student_id 
        AND i.created_at >= NOW() - INTERVAL '30 days'
      WHERE s."MentorEmail" = $1
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, [mentor.email])
      const stats = result.rows[0]
      
      return {
        totalStudents: parseInt(stats.total_students) || 0,
        highRiskStudents: parseInt(stats.high_risk_students) || 0,
        mediumRiskStudents: parseInt(stats.medium_risk_students) || 0,
        lowRiskStudents: parseInt(stats.low_risk_students) || 0,
        averageAttendance: parseFloat(stats.average_attendance) || 0,
        averagePerformance: parseFloat(stats.average_performance) || 0,
        recentInterventions: parseInt(stats.recent_interventions) || 0
      }
    } catch (error) {
      console.error('Error fetching mentor statistics:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Get interventions by mentor ID
  async getInterventionsByMentorId(mentorId: string): Promise<any[]> {
    const sql = `
      SELECT 
        i.id,
        i.student_id,
        s.full_name as student_name,
        i.type,
        i.description,
        i.status,
        i.priority,
        i.created_at,
        i.scheduled_date,
        i.completed_date
      FROM interventions i
      LEFT JOIN students s ON i.student_id = s.id
      WHERE s.mentor_id = $1
      ORDER BY i.created_at DESC
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, [mentorId])
      return result.rows
    } catch (error) {
      console.error('Error fetching interventions by mentor ID:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Create intervention
  async createIntervention(interventionData: {
    studentId: string
    mentorId: string
    type: string
    description: string
    priority: string
    scheduledDate: string
  }): Promise<any | null> {
    const sql = `
      INSERT INTO interventions (
        student_id, mentor_id, type, description, priority, 
        scheduled_date, status, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW())
      RETURNING id, student_id, mentor_id, type, description, 
                priority, scheduled_date, status, created_at
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, [
        interventionData.studentId,
        interventionData.mentorId,
        interventionData.type,
        interventionData.description,
        interventionData.priority,
        interventionData.scheduledDate
      ])
      return result.rows[0] || null
    } catch (error) {
      console.error('Error creating intervention:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Get all interventions (admin only)
  async getAllInterventions(): Promise<any[]> {
    const sql = `
      SELECT 
        i.id,
        i.student_id,
        s."StudentName" as student_name,
        i.mentor_id,
        u.full_name as mentor_name,
        i.type,
        i.description,
        i.priority,
        i.status,
        i.created_at,
        i.scheduled_date,
        i.completed_date,
        i.updated_at
      FROM interventions i
      LEFT JOIN "Students" s ON i.student_id = s.id
      LEFT JOIN mentors m ON i.mentor_id = m.id
      LEFT JOIN users u ON m.user_id = u.id
      ORDER BY i.created_at DESC
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql)
      return result.rows
    } catch (error) {
      console.error('Error fetching all interventions:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Get intervention by ID
  async getInterventionById(interventionId: string): Promise<any | null> {
    const sql = `
      SELECT 
        i.id,
        i.student_id,
        s."StudentName" as student_name,
        i.mentor_id,
        u.full_name as mentor_name,
        i.type,
        i.description,
        i.priority,
        i.status,
        i.created_at,
        i.scheduled_date,
        i.completed_date,
        i.updated_at
      FROM interventions i
      LEFT JOIN "Students" s ON i.student_id = s.id
      LEFT JOIN mentors m ON i.mentor_id = m.id
      LEFT JOIN users u ON m.user_id = u.id
      WHERE i.id = $1
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, [interventionId])
      return result.rows.length > 0 ? result.rows[0] : null
    } catch (error) {
      console.error('Error fetching intervention by ID:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Update intervention
  async updateIntervention(interventionId: string, updateData: {
    type?: string
    description?: string
    priority?: string
    status?: string
    scheduledDate?: string
    completedDate?: string
  }): Promise<any | null> {
    const updateFields = []
    const values = []
    let paramCount = 1

    if (updateData.type !== undefined) {
      updateFields.push(`type = $${paramCount}`)
      values.push(updateData.type)
      paramCount++
    }
    if (updateData.description !== undefined) {
      updateFields.push(`description = $${paramCount}`)
      values.push(updateData.description)
      paramCount++
    }
    if (updateData.priority !== undefined) {
      updateFields.push(`priority = $${paramCount}`)
      values.push(updateData.priority)
      paramCount++
    }
    if (updateData.status !== undefined) {
      updateFields.push(`status = $${paramCount}`)
      values.push(updateData.status)
      paramCount++
    }
    if (updateData.scheduledDate !== undefined) {
      updateFields.push(`scheduled_date = $${paramCount}`)
      values.push(updateData.scheduledDate)
      paramCount++
    }
    if (updateData.completedDate !== undefined) {
      updateFields.push(`completed_date = $${paramCount}`)
      values.push(updateData.completedDate)
      paramCount++
    }

    if (updateFields.length === 0) {
      throw new Error('No fields to update')
    }

    updateFields.push(`updated_at = NOW()`)
    values.push(interventionId)

    const sql = `
      UPDATE interventions 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, student_id, mentor_id, type, description, 
                priority, status, scheduled_date, completed_date, 
                created_at, updated_at
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, values)
      return result.rows.length > 0 ? result.rows[0] : null
    } catch (error) {
      console.error('Error updating intervention:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Delete intervention
  async deleteIntervention(interventionId: string): Promise<boolean> {
    const sql = `DELETE FROM interventions WHERE id = $1`

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, [interventionId])
      return (result.rowCount || 0) > 0
    } catch (error) {
      console.error('Error deleting intervention:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Get student by user ID
  async getStudentByUserId(userId: string): Promise<any | null> {
    const sql = `
      SELECT 
        s.id,
        s."StudentID" as student_id,
        s."StudentName" as student_name,
        s."StudentClass" as class_level,
        s."AvgAttendance_LatestTerm" as attendance,
        s."AvgMarks_LatestTerm" as performance,
        s."RiskLevel" as risk_level,
        s."MentorName" as mentor_name,
        s."SchoolName" as school_name
      FROM "Students" s
      WHERE s.user_id = $1
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, [userId])
      return result.rows.length > 0 ? result.rows[0] : null
    } catch (error) {
      console.error('Error fetching student by user ID:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Get all assignments
  async getAllAssignments(): Promise<any[]> {
    const sql = `
      SELECT 
        a.id,
        a.student_id,
        s."StudentName" as student_name,
        a.mentor_id,
        u.full_name as mentor_name,
        a.assigned_by,
        admin.full_name as assigned_by_name,
        a.notes,
        a.created_at
      FROM assignments a
      LEFT JOIN "Students" s ON a.student_id = s.id
      LEFT JOIN mentors m ON a.mentor_id = m.id
      LEFT JOIN users u ON m.user_id = u.id
      LEFT JOIN users admin ON a.assigned_by = admin.id
      ORDER BY a.created_at DESC
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql)
      return result.rows
    } catch (error) {
      console.error('Error fetching assignments:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Create assignment
  async createAssignment(assignmentData: {
    studentId: string
    mentorId: string
    assignedBy: string
    notes: string
  }): Promise<any | null> {
    const sql = `
      INSERT INTO assignments (
        student_id, mentor_id, assigned_by, notes, created_at
      )
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, student_id, mentor_id, assigned_by, notes, created_at
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, [
        assignmentData.studentId,
        assignmentData.mentorId,
        assignmentData.assignedBy,
        assignmentData.notes
      ])
      return result.rows[0] || null
    } catch (error) {
      console.error('Error creating assignment:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Save chat message
  async saveChatMessage(chatData: {
    userId: string
    conversationId: string
    message: string
    response: string
    isUser: boolean
  }): Promise<any | null> {
    const sql = `
      INSERT INTO chat_messages (
        user_id, conversation_id, message, response, is_user, created_at
      )
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id, user_id, conversation_id, message, response, is_user, created_at
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, [
        chatData.userId,
        chatData.conversationId,
        chatData.message,
        chatData.response,
        chatData.isUser
      ])
      return result.rows[0] || null
    } catch (error) {
      console.error('Error saving chat message:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Get chat history
  async getChatHistory(userId: string, conversationId?: string): Promise<any[]> {
    let sql = `
      SELECT 
        id, conversation_id, message, response, is_user, created_at
      FROM chat_messages
      WHERE user_id = $1
    `
    const params = [userId]

    if (conversationId) {
      sql += ` AND conversation_id = $2`
      params.push(conversationId)
    }

    sql += ` ORDER BY created_at ASC`

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, params)
      return result.rows
    } catch (error) {
      console.error('Error fetching chat history:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Get high-risk students
  async getHighRiskStudents(): Promise<any[]> {
    const sql = `
      SELECT 
        s.id,
        s."StudentID" as student_id,
        s."StudentName" as student_name,
        s."StudentClass" as class_level,
        s."AvgAttendance_LatestTerm" as attendance,
        s."AvgMarks_LatestTerm" as performance,
        s."RiskLevel" as risk_level,
        s."RiskScore" as risk_score,
        s."DropoutProbability" as dropout_probability,
        s."MentorName" as mentor_name,
        s."SchoolName" as school_name
      FROM "Students" s
      WHERE s."RiskLevel" = 'Critical' OR s."RiskLevel" = 'High'
      ORDER BY s."RiskScore" DESC
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql)
      return result.rows
    } catch (error) {
      console.error('Error fetching high-risk students:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Get users by type
  async getUsersByType(userType: string): Promise<any[]> {
    const sql = `
      SELECT id, email, full_name, user_type, is_active
      FROM users
      WHERE user_type = $1 AND is_active = true
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, [userType])
      return result.rows
    } catch (error) {
      console.error('Error fetching users by type:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Get pending interventions
  async getPendingInterventions(): Promise<any[]> {
    const sql = `
      SELECT 
        i.id,
        i.student_id,
        s."StudentName" as student_name,
        i.mentor_id,
        i.type,
        i.description,
        i.priority,
        i.scheduled_date,
        i.created_at
      FROM interventions i
      LEFT JOIN "Students" s ON i.student_id = s.id
      WHERE i.status = 'pending' 
        AND i.scheduled_date <= CURRENT_DATE + INTERVAL '1 day'
      ORDER BY i.priority DESC, i.scheduled_date ASC
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql)
      return result.rows
    } catch (error) {
      console.error('Error fetching pending interventions:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Test database connection
  async testConnection(): Promise<boolean> {
    const pool = await this.getConnection()
    try {
      await pool.query('SELECT 1')
      return true
    } catch (error) {
      console.error('Database connection test failed:', error)
      return false
    } finally {
      await pool.end()
    }
  }

  // Create AI prediction record
  async createAIPrediction(
    studentId: string,
    predictionType: string,
    predictionValue: number,
    confidenceScore: number,
    modelVersion: string,
    inputFeatures: any
  ): Promise<boolean> {
    const sql = `
      INSERT INTO ai_predictions (student_id, prediction_type, prediction_value, confidence_score, model_version, input_features, prediction_date)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE)
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, [
        studentId,
        predictionType,
        predictionValue,
        confidenceScore,
        modelVersion,
        JSON.stringify(inputFeatures),
      ])
      return (result.rowCount || 0) > 0
    } catch (error) {
      console.error('Error creating AI prediction:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Get AI predictions for a student
  async getAIPredictions(studentId: string): Promise<any[]> {
    const sql = `
      SELECT * FROM ai_predictions 
      WHERE student_id = $1 
      ORDER BY created_at DESC
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, [studentId])
      return result.rows
    } catch (error) {
      console.error('Error fetching AI predictions:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Get statistics for dashboard
  async getStatistics(): Promise<any> {
    const pool = await this.getConnection()
    try {
      // Get basic statistics
      const totalStudentsResult = await pool.query('SELECT COUNT(*) as count FROM students WHERE is_active = TRUE')
      const totalStudents = parseInt(totalStudentsResult.rows[0].count)

      const riskDistributionResult = await pool.query(`
        SELECT 
          risk_level,
          COUNT(*) as count
        FROM students 
        WHERE is_active = TRUE 
        GROUP BY risk_level
      `)

      const riskDistribution = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      }

      riskDistributionResult.rows.forEach(row => {
        const level = row.risk_level.toLowerCase()
        if (level in riskDistribution) {
          riskDistribution[level as keyof typeof riskDistribution] = parseInt(row.count)
        }
      })

      const avgStatsResult = await pool.query(`
        SELECT 
          AVG(current_attendance) as avg_attendance,
          AVG(current_performance) as avg_performance,
          AVG(dropout_probability) as avg_dropout_probability
        FROM students 
        WHERE is_active = TRUE
      `)

      const avgStats = avgStatsResult.rows[0]

      return {
        totalStudents,
        highRiskStudents: riskDistribution.critical + riskDistribution.high,
        mediumRiskStudents: riskDistribution.medium,
        lowRiskStudents: riskDistribution.low,
        criticalRiskStudents: riskDistribution.critical,
        dropoutStudents: 0, // We can add this later if needed
        avgAttendance: parseFloat(avgStats.avg_attendance) || 0,
        avgPerformance: parseFloat(avgStats.avg_performance) || 0,
        avgDropoutProbability: parseFloat(avgStats.avg_dropout_probability) || 0,
        riskDistribution
      }
    } catch (error: any) {
      console.error('❌ Error fetching statistics:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // User Management Methods

  // Create a new user
  async createUser(userData: {
    email: string
    passwordHash: string
    userType: string
    fullName: string
    phone?: string
    isActive?: boolean
  }): Promise<any | null> {
    const sql = `
      INSERT INTO users (email, password_hash, user_type, full_name, phone, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, user_type, full_name, phone, is_active, created_at, updated_at
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, [
        userData.email,
        userData.passwordHash,
        userData.userType,
        userData.fullName,
        userData.phone || null,
        userData.isActive !== undefined ? userData.isActive : true
      ])
      return result.rows[0] || null
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<any | null> {
    const sql = `
      SELECT id, email, password_hash, user_type, full_name, phone, is_active, created_at, updated_at, last_login, email_verified
      FROM users 
      WHERE email = $1
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, [email])
      return result.rows[0] || null
    } catch (error) {
      console.error('Error getting user by email:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<any | null> {
    const sql = `
      SELECT id, email, password_hash, user_type, full_name, phone, is_active, created_at, updated_at, last_login, email_verified
      FROM users 
      WHERE id = $1
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, [userId])
      return result.rows[0] || null
    } catch (error) {
      console.error('Error getting user by ID:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Update user
  async updateUser(userId: string, updateData: {
    fullName?: string
    phone?: string
    isActive?: boolean
  }): Promise<any | null> {
    const fields = []
    const values = []
    let paramCount = 1

    if (updateData.fullName !== undefined) {
      fields.push(`full_name = $${paramCount}`)
      values.push(updateData.fullName)
      paramCount++
    }

    if (updateData.phone !== undefined) {
      fields.push(`phone = $${paramCount}`)
      values.push(updateData.phone)
      paramCount++
    }

    if (updateData.isActive !== undefined) {
      fields.push(`is_active = $${paramCount}`)
      values.push(updateData.isActive)
      paramCount++
    }

    if (fields.length === 0) {
      return null
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(userId)

    const sql = `
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, user_type, full_name, phone, is_active, created_at, updated_at
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, values)
      return result.rows[0] || null
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Update user password
  async updateUserPassword(userId: string, passwordHash: string): Promise<boolean> {
    const sql = `
      UPDATE users 
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, [passwordHash, userId])
      return (result.rowCount || 0) > 0
    } catch (error) {
      console.error('Error updating user password:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Update user last login
  async updateUserLastLogin(userId: string): Promise<boolean> {
    const sql = `
      UPDATE users 
      SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, [userId])
      return (result.rowCount || 0) > 0
    } catch (error) {
      console.error('Error updating user last login:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Store password reset token
  async storePasswordResetToken(userId: string, token: string): Promise<boolean> {
    const sql = `
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '1 hour')
      ON CONFLICT (user_id) 
      DO UPDATE SET token = $2, expires_at = CURRENT_TIMESTAMP + INTERVAL '1 hour'
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, [userId, token])
      return (result.rowCount || 0) > 0
    } catch (error) {
      console.error('Error storing password reset token:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Verify password reset token
  async verifyPasswordResetToken(userId: string, token: string): Promise<boolean> {
    const sql = `
      SELECT id FROM password_reset_tokens 
      WHERE user_id = $1 AND token = $2 AND expires_at > CURRENT_TIMESTAMP
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, [userId, token])
      return result.rows.length > 0
    } catch (error) {
      console.error('Error verifying password reset token:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Invalidate password reset token
  async invalidatePasswordResetToken(userId: string, token: string): Promise<boolean> {
    const sql = `
      DELETE FROM password_reset_tokens 
      WHERE user_id = $1 AND token = $2
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, [userId, token])
      return (result.rowCount || 0) > 0
    } catch (error) {
      console.error('Error invalidating password reset token:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // ===== EMAIL VERIFICATION =====

  // Store email verification token
  async storeEmailVerificationToken(userId: string, token: string): Promise<boolean> {
    const sql = `
      INSERT INTO email_verification_tokens (user_id, token, expires_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '24 hours')
      ON CONFLICT (user_id) 
      DO UPDATE SET token = $2, expires_at = CURRENT_TIMESTAMP + INTERVAL '24 hours'
    `

    const pool = await this.getConnection()
    try {
      await pool.query(sql, [userId, token])
      return true
    } catch (error) {
      console.error('Error storing email verification token:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Verify email verification token
  async verifyEmailVerificationToken(userId: string, token: string): Promise<boolean> {
    const sql = `
      SELECT id FROM email_verification_tokens 
      WHERE user_id = $1 AND token = $2 AND expires_at > CURRENT_TIMESTAMP
    `

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, [userId, token])
      return result.rows.length > 0
    } catch (error) {
      console.error('Error verifying email verification token:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Invalidate email verification token
  async invalidateEmailVerificationToken(userId: string, token: string): Promise<boolean> {
    const sql = `DELETE FROM email_verification_tokens WHERE user_id = $1 AND token = $2`

    const pool = await this.getConnection()
    try {
      const result = await pool.query(sql, [userId, token])
      return (result.rowCount || 0) > 0
    } catch (error) {
      console.error('Error invalidating email verification token:', error)
      throw error
    } finally {
      await pool.end()
    }
  }

  // Close database connection (no-op for serverless)
  async close(): Promise<void> {
    // No persistent connections to close in serverless mode
  }
}

// Export singleton instance
export const neonService = new NeonService()
