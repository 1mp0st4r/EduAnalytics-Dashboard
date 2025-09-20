import { Pool, PoolClient } from 'pg'

// CockroachDB (PostgreSQL-compatible) database service
export class CockroachDBService {
  private pool: Pool

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || process.env.COCKROACHDB_URL,
      ssl: {
        rejectUnauthorized: false
      },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })
  }

  // Test database connection
  async testConnection(): Promise<boolean> {
    try {
      const client = await this.pool.connect()
      await client.query('SELECT NOW()')
      client.release()
      console.log('✅ CockroachDB connection successful')
      return true
    } catch (error) {
      console.error('❌ CockroachDB connection failed:', error)
      return false
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
        m.full_name as "MentorName",
        m.email as "MentorEmail",
        m.phone as "MentorPhone",
        sc.name as "SchoolName",
        s.created_at
      FROM students s
      LEFT JOIN mentors m ON s.mentor_id = m.id
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

    try {
      const result = await this.pool.query(sql, params)
      return result.rows
    } catch (error) {
      console.error('Error fetching students:', error)
      throw error
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
        m.full_name as "MentorName",
        m.email as "MentorEmail",
        m.phone as "MentorPhone",
        sc.name as "SchoolName",
        s.created_at
      FROM students s
      LEFT JOIN mentors m ON s.mentor_id = m.id
      LEFT JOIN schools sc ON s.school_id = sc.id
      WHERE s.student_id = $1 AND s.is_active = true
    `

    try {
      const result = await this.pool.query(sql, [studentId])
      return result.rows.length > 0 ? result.rows[0] : null
    } catch (error) {
      console.error('Error fetching student by ID:', error)
      throw error
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

    try {
      const result = await this.pool.query(sql, [riskLevel, riskScore, dropoutProbability, studentId])
      return result.rowCount > 0
    } catch (error) {
      console.error('Error updating student risk:', error)
      throw error
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

    try {
      const result = await this.pool.query(sql)
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

    try {
      const result = await this.pool.query(sql, [
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
    }
  }

  // Get AI predictions for a student
  async getAIPredictions(studentId: string): Promise<any[]> {
    const sql = `
      SELECT * FROM ai_predictions 
      WHERE student_id = $1 
      ORDER BY created_at DESC
    `

    try {
      const result = await this.pool.query(sql, [studentId])
      return result.rows
    } catch (error) {
      console.error('Error fetching AI predictions:', error)
      throw error
    }
  }

  // Close database connection
  async close(): Promise<void> {
    await this.pool.end()
  }
}

// Export singleton instance
export const cockroachDBService = new CockroachDBService()
