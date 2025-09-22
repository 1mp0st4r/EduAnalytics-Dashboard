import { Pool, PoolClient } from 'pg'

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
    } catch (error) {
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
      return result.rowCount > 0
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
      return result.rowCount > 0
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

  // Close database connection (no-op for serverless)
  async close(): Promise<void> {
    // No persistent connections to close in serverless mode
  }
}

// Export singleton instance
export const neonService = new NeonService()
