// Database connection and query utilities
// This file provides database connection and common query functions

interface DatabaseConfig {
  host: string
  port: number
  database: string
  user: string
  password: string
}

// Mock database connection - in real app, this would use actual database client
class DatabaseConnection {
  private config: DatabaseConfig

  constructor() {
    this.config = {
      host: process.env.DB_HOST || "localhost",
      port: Number.parseInt(process.env.DB_PORT || "5432"),
      database: process.env.DB_NAME || "edusupport_db",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "password",
    }
  }

  // Mock query function - in real app, this would execute actual SQL
  async query(sql: string, params: any[] = []): Promise<any[]> {
    console.log(`[Database Query] ${sql}`, params)

    // Mock data responses based on query patterns
    if (sql.includes("SELECT * FROM students")) {
      return this.getMockStudents()
    }

    if (sql.includes("SELECT * FROM student_issues")) {
      return this.getMockIssues()
    }

    if (sql.includes("SELECT * FROM mentors")) {
      return this.getMockMentors()
    }

    if (sql.includes("INSERT INTO")) {
      return [{ id: Math.floor(Math.random() * 1000), affected_rows: 1 }]
    }

    if (sql.includes("UPDATE")) {
      return [{ affected_rows: 1 }]
    }

    return []
  }

  private getMockStudents() {
    return [
      {
        id: 1,
        student_id: "STU001",
        full_name: "राहुल शर्मा / Rahul Sharma",
        class_level: 10,
        current_attendance: 78.5,
        current_performance: 72.3,
        risk_level: "medium",
        dropout_probability: 45.2,
        mentor_name: "प्रिया सिंह / Priya Singh",
        parent_phone: "+91-9876543220",
        parent_email: "shyam.sharma@gmail.com",
        school_name: "सरकारी उच्च माध्यमिक विद्यालय, रामपुर",
        created_at: new Date("2023-04-01"),
      },
      {
        id: 2,
        student_id: "STU002",
        full_name: "सुनीता कुमारी / Sunita Kumari",
        class_level: 9,
        current_attendance: 45.2,
        current_performance: 38.7,
        risk_level: "high",
        dropout_probability: 78.9,
        mentor_name: "अमित गुप्ता / Amit Gupta",
        parent_phone: "+91-9876543221",
        parent_email: "ram.kumar@gmail.com",
        school_name: "राजकीय माध्यमिक विद्यालय, सुंदरनगर",
        created_at: new Date("2023-04-01"),
      },
    ]
  }

  private getMockIssues() {
    return [
      {
        id: 1,
        student_name: "राहुल शर्मा / Rahul Sharma",
        issue_type: "पारिवारिक दबाव / Family Pressure",
        description: "परिवार चाहता है कि वह खेती में मदद करे और पढ़ाई छोड़ दे",
        severity: "high",
        status: "pending",
        mentor_name: "प्रिया सिंह / Priya Singh",
        created_at: new Date(),
      },
      {
        id: 2,
        student_name: "सुनीता कुमारी / Sunita Kumari",
        issue_type: "आर्थिक समस्या / Financial Issue",
        description: "घर की आर्थिक स्थिति खराब होने से स्कूल आने में कठिनाई",
        severity: "critical",
        status: "in_progress",
        mentor_name: "अमित गुप्ता / Amit Gupta",
        created_at: new Date(),
      },
    ]
  }

  private getMockMentors() {
    return [
      {
        id: 1,
        full_name: "प्रिया सिंह / Priya Singh",
        employee_id: "MEN001",
        specialization: "शैक्षणिक परामर्श",
        experience_years: 5,
        max_students: 50,
        current_students: 35,
        email: "priya.singh@edusupport.gov.in",
        phone: "+91-9876543201",
      },
      {
        id: 2,
        full_name: "अमित गुप्ता / Amit Gupta",
        employee_id: "MEN002",
        specialization: "मनोवैज्ञानिक सहायता",
        experience_years: 8,
        max_students: 40,
        current_students: 28,
        email: "amit.gupta@edusupport.gov.in",
        phone: "+91-9876543202",
      },
    ]
  }

  async close() {
    console.log("[Database] Connection closed")
  }
}

// Database service functions
export class DatabaseService {
  private db: DatabaseConnection

  constructor() {
    this.db = new DatabaseConnection()
  }

  // Student-related queries
  async getStudents(filters: any = {}) {
    let sql = `
      SELECT s.*, u.full_name, u.email, u.phone,
             m.full_name as mentor_name,
             sc.name as school_name
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN mentors men ON s.mentor_id = men.id
      LEFT JOIN users m ON men.user_id = m.id
      LEFT JOIN schools sc ON s.school_id = sc.id
      WHERE s.is_active = true
    `

    const params: any[] = []

    if (filters.riskLevel && filters.riskLevel !== "all") {
      sql += ` AND s.risk_level = $${params.length + 1}`
      params.push(filters.riskLevel)
    }

    if (filters.classLevel && filters.classLevel !== "all") {
      sql += ` AND s.class_level = $${params.length + 1}`
      params.push(Number.parseInt(filters.classLevel))
    }

    sql += ` ORDER BY s.dropout_probability DESC`

    return await this.db.query(sql, params)
  }

  async getStudentById(id: number) {
    const sql = `
      SELECT s.*, u.full_name, u.email, u.phone,
             m.full_name as mentor_name, m.email as mentor_email, m.phone as mentor_phone,
             sc.name as school_name
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN mentors men ON s.mentor_id = men.id
      LEFT JOIN users m ON men.user_id = m.id
      LEFT JOIN schools sc ON s.school_id = sc.id
      WHERE s.id = $1
    `

    const result = await this.db.query(sql, [id])
    return result[0] || null
  }

  async updateStudentRisk(studentId: number, riskLevel: string, dropoutProbability: number) {
    const sql = `
      UPDATE students 
      SET risk_level = $1, dropout_probability = $2, last_risk_assessment = CURRENT_TIMESTAMP
      WHERE id = $3
    `

    return await this.db.query(sql, [riskLevel, dropoutProbability, studentId])
  }

  // Issue-related queries
  async getStudentIssues(filters: any = {}) {
    let sql = `
      SELECT si.*, s.student_id, u.full_name as student_name,
             m.full_name as mentor_name
      FROM student_issues si
      JOIN students s ON si.student_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN mentors men ON si.assigned_to = men.id
      LEFT JOIN users m ON men.user_id = m.id
      WHERE 1=1
    `

    const params: any[] = []

    if (filters.status && filters.status !== "all") {
      sql += ` AND si.status = $${params.length + 1}`
      params.push(filters.status)
    }

    sql += ` ORDER BY si.created_at DESC`

    return await this.db.query(sql, params)
  }

  async createStudentIssue(issueData: any) {
    const sql = `
      INSERT INTO student_issues (student_id, issue_type, description, severity, reported_by, assigned_to)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `

    return await this.db.query(sql, [
      issueData.studentId,
      issueData.issueType,
      issueData.description,
      issueData.severity,
      issueData.reportedBy,
      issueData.assignedTo,
    ])
  }

  async updateIssueStatus(issueId: number, status: string, resolutionNotes?: string) {
    const sql = `
      UPDATE student_issues 
      SET status = $1, resolution_notes = $2, resolved_at = CASE WHEN $1 = 'resolved' THEN CURRENT_TIMESTAMP ELSE resolved_at END
      WHERE id = $3
    `

    return await this.db.query(sql, [status, resolutionNotes, issueId])
  }

  // Email notification queries
  async createEmailNotification(notificationData: any) {
    const sql = `
      INSERT INTO email_notifications (recipient_email, recipient_type, subject, message, notification_type, student_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `

    return await this.db.query(sql, [
      notificationData.recipientEmail,
      notificationData.recipientType,
      notificationData.subject,
      notificationData.message,
      notificationData.notificationType,
      notificationData.studentId,
    ])
  }

  async updateEmailStatus(notificationId: number, status: string, errorMessage?: string) {
    const sql = `
      UPDATE email_notifications 
      SET status = $1, sent_at = CASE WHEN $1 = 'sent' THEN CURRENT_TIMESTAMP ELSE sent_at END, error_message = $2
      WHERE id = $3
    `

    return await this.db.query(sql, [status, errorMessage, notificationId])
  }

  async getPendingEmailNotifications() {
    const sql = `
      SELECT * FROM email_notifications 
      WHERE status = 'pending'
      ORDER BY created_at ASC
      LIMIT 100
    `

    return await this.db.query(sql)
  }

  // Analytics and reporting
  async getStudentStatistics() {
    const sql = `
      SELECT 
        COUNT(*) as total_students,
        COUNT(CASE WHEN risk_level = 'high' THEN 1 END) as high_risk,
        COUNT(CASE WHEN risk_level = 'medium' THEN 1 END) as medium_risk,
        COUNT(CASE WHEN risk_level = 'low' THEN 1 END) as low_risk,
        AVG(current_attendance) as avg_attendance,
        AVG(current_performance) as avg_performance
      FROM students 
      WHERE is_active = true
    `

    const result = await this.db.query(sql)
    return result[0] || {}
  }

  async close() {
    await this.db.close()
  }
}

// Export singleton instance
export const dbService = new DatabaseService()
