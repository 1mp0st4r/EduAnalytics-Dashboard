import mysql from "mysql2/promise";
import type { StudentAnalytics } from "./database-types";

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "StudentAnalyticsDB",
  port: parseInt(process.env.DB_PORT || "3306"),
};

// Connection pool for better performance
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
});

export class DatabaseService {
  private pool: mysql.Pool;

  constructor() {
    this.pool = pool;
  }

  // Test database connection
  async testConnection(): Promise<boolean> {
    try {
      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();
      console.log("Database connection successful");
      return true;
    } catch (error) {
      console.error("Database connection failed:", error);
      return false;
    }
  }

  // Get all students with filters
  async getStudents(filters: {
    riskLevel?: string;
    classLevel?: string;
    isDropout?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<StudentAnalytics[]> {
    let sql = `
      SELECT 
        s.StudentID,
        s.Age,
        s.Gender,
        s.AccommodationType,
        s.IsRural,
        s.CommuteTimeMinutes,
        s.AdmissionQuota as CasteCategory,
        s.AdmissionQuota,
        s.FamilyAnnualIncome,
        s.NumberOfSiblings,
        s.FatherEducation,
        s.IsFatherLiterate,
        s.MotherEducation,
        s.IsMotherLiterate,
        s.IsFirstGenerationLearner,
        s.AvgPastPerformance,
        s.MediumChanged,
        s.AvgMarks_LatestTerm,
        s.MarksTrend,
        s.FailureRate_LatestTerm,
        s.AvgAttendance_LatestTerm,
        s.WorksPartTime,
        s.IsPreparingCompetitiveExam,
        s.HasOwnLaptop,
        s.HasReliableInternet,
        s.IsDropout,
        s.RiskScore,
        s.RiskLevel,
        s.StudentName,
        s.ContactPhoneNumber,
        m.full_name as MentorName,
        m.phone as MentorPhone,
        m.email as MentorEmail,
        sc.name as SchoolName
      FROM Students s
      LEFT JOIN Mentors m ON s.mentor_id = m.id
      LEFT JOIN Schools sc ON s.school_id = sc.id
      WHERE s.is_active = TRUE
    `;

    const params: any[] = [];

    if (filters.riskLevel && filters.riskLevel !== "all") {
      sql += ` AND s.RiskLevel = ?`;
      params.push(filters.riskLevel);
    }

    if (filters.classLevel && filters.classLevel !== "all") {
      sql += ` AND s.StudentClass = ?`;
      params.push(parseInt(filters.classLevel));
    }

    if (filters.isDropout !== undefined) {
      sql += ` AND s.IsDropout = ?`;
      params.push(filters.isDropout);
    }

    sql += ` ORDER BY s.RiskScore DESC`;

    if (filters.limit) {
      sql += ` LIMIT ?`;
      params.push(parseInt(filters.limit.toString()));
    }

    if (filters.offset) {
      sql += ` OFFSET ?`;
      params.push(parseInt(filters.offset.toString()));
    }

    try {
      const [rows] = await this.pool.query(sql, params);
      return this.mapToStudentAnalytics(rows as any[]);
    } catch (error) {
      console.error("Error fetching students:", error);
      throw error;
    }
  }

  // Get student by ID
  async getStudentById(studentId: string): Promise<StudentAnalytics | null> {
    const sql = `
      SELECT 
        s.StudentID,
        s.Age,
        s.Gender,
        s.AccommodationType,
        s.IsRural,
        s.CommuteTimeMinutes,
        s.AdmissionQuota as CasteCategory,
        s.AdmissionQuota,
        s.FamilyAnnualIncome,
        s.NumberOfSiblings,
        s.FatherEducation,
        s.IsFatherLiterate,
        s.MotherEducation,
        s.IsMotherLiterate,
        s.IsFirstGenerationLearner,
        s.AvgPastPerformance,
        s.MediumChanged,
        s.AvgMarks_LatestTerm,
        s.MarksTrend,
        s.FailureRate_LatestTerm,
        s.AvgAttendance_LatestTerm,
        s.WorksPartTime,
        s.IsPreparingCompetitiveExam,
        s.HasOwnLaptop,
        s.HasReliableInternet,
        s.IsDropout,
        s.RiskScore,
        s.RiskLevel,
        s.StudentName,
        s.ContactPhoneNumber,
        s.MotherName,
        s.FatherName,
        m.full_name as MentorName,
        m.phone as MentorPhone,
        m.email as MentorEmail,
        sc.name as SchoolName
      FROM Students s
      LEFT JOIN Mentors m ON s.mentor_id = m.id
      LEFT JOIN Schools sc ON s.school_id = sc.id
      WHERE s.StudentID = ? AND s.is_active = TRUE
    `;

    try {
      const [rows] = await this.pool.query(sql, [studentId]);
      const students = this.mapToStudentAnalytics(rows as any[]);
      return students.length > 0 ? students[0] : null;
    } catch (error) {
      console.error("Error fetching student by ID:", error);
      throw error;
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
      UPDATE Students 
      SET RiskLevel = ?, RiskScore = ?, DropoutProbability = ?, LastRiskAssessment = CURRENT_TIMESTAMP
      WHERE StudentID = ?
    `;

    try {
      const [result] = await this.pool.query(sql, [riskLevel, riskScore, dropoutProbability, studentId]);
      return (result as any).affectedRows > 0;
    } catch (error) {
      console.error("Error updating student risk:", error);
      throw error;
    }
  }

  // Get student statistics
  async getStudentStatistics(): Promise<{
    totalStudents: number;
    highRiskStudents: number;
    mediumRiskStudents: number;
    lowRiskStudents: number;
    criticalRiskStudents: number;
    dropoutStudents: number;
    avgAttendance: number;
    avgPerformance: number;
  }> {
    const sql = `
      SELECT 
        COUNT(*) as totalStudents,
        COUNT(CASE WHEN RiskLevel = 'High' THEN 1 END) as highRiskStudents,
        COUNT(CASE WHEN RiskLevel = 'Medium' THEN 1 END) as mediumRiskStudents,
        COUNT(CASE WHEN RiskLevel = 'Low' THEN 1 END) as lowRiskStudents,
        COUNT(CASE WHEN RiskLevel = 'Critical' THEN 1 END) as criticalRiskStudents,
        COUNT(CASE WHEN IsDropout = TRUE THEN 1 END) as dropoutStudents,
        AVG(AvgAttendance_LatestTerm) as avgAttendance,
        AVG(AvgMarks_LatestTerm) as avgPerformance
      FROM Students 
      WHERE is_active = TRUE
    `;

    try {
      const [rows] = await this.pool.query(sql);
      const result = (rows as any)[0];
      return {
        totalStudents: result.totalStudents || 0,
        highRiskStudents: result.highRiskStudents || 0,
        mediumRiskStudents: result.mediumRiskStudents || 0,
        lowRiskStudents: result.lowRiskStudents || 0,
        criticalRiskStudents: result.criticalRiskStudents || 0,
        dropoutStudents: result.dropoutStudents || 0,
        avgAttendance: parseFloat(result.avgAttendance) || 0,
        avgPerformance: parseFloat(result.avgPerformance) || 0,
      };
    } catch (error) {
      console.error("Error fetching student statistics:", error);
      throw error;
    }
  }

  // Get high-risk students
  async getHighRiskStudents(): Promise<StudentAnalytics[]> {
    return this.getStudents({ riskLevel: "High" });
  }

  // Get critical-risk students
  async getCriticalRiskStudents(): Promise<StudentAnalytics[]> {
    return this.getStudents({ riskLevel: "Critical" });
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
      INSERT INTO AI_Predictions (StudentID, prediction_type, prediction_value, confidence_score, model_version, input_features, prediction_date)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_DATE)
    `;

    try {
      const [result] = await this.pool.query(sql, [
        studentId,
        predictionType,
        predictionValue,
        confidenceScore,
        modelVersion,
        JSON.stringify(inputFeatures),
      ]);
      return (result as any).affectedRows > 0;
    } catch (error) {
      console.error("Error creating AI prediction:", error);
      throw error;
    }
  }

  // Get AI predictions for a student
  async getAIPredictions(studentId: string): Promise<any[]> {
    const sql = `
      SELECT * FROM AI_Predictions 
      WHERE StudentID = ? 
      ORDER BY created_at DESC
    `;

    try {
      const [rows] = await this.pool.query(sql, [studentId]);
      return rows as any[];
    } catch (error) {
      console.error("Error fetching AI predictions:", error);
      throw error;
    }
  }

  // Map database rows to StudentAnalytics interface
  private mapToStudentAnalytics(rows: any[]): StudentAnalytics[] {
    return rows.map((row) => ({
      StudentID: row.StudentID,
      Age: row.Age || 0,
      Gender: row.Gender || "Other",
      AccommodationType: row.AccommodationType || "DayScholar",
      IsRural: Boolean(row.IsRural),
      CommuteTimeMinutes: row.CommuteTimeMinutes || 0,
      CasteCategory: row.CasteCategory || "General",
      AdmissionQuota: row.AdmissionQuota || "General",
      FamilyAnnualIncome: row.FamilyAnnualIncome || 0,
      NumberOfSiblings: row.NumberOfSiblings || 0,
      FatherEducation: row.FatherEducation || "No Formal Education",
      IsFatherLiterate: Boolean(row.IsFatherLiterate),
      MotherEducation: row.MotherEducation || "No Formal Education",
      IsMotherLiterate: Boolean(row.IsMotherLiterate),
      IsFirstGenerationLearner: Boolean(row.IsFirstGenerationLearner),
      AvgPastPerformance: row.AvgPastPerformance || 0,
      MediumChanged: Boolean(row.MediumChanged),
      AvgMarks_LatestTerm: row.AvgMarks_LatestTerm || 0,
      MarksTrend: row.MarksTrend || 0,
      FailureRate_LatestTerm: row.FailureRate_LatestTerm || 0,
      AvgAttendance_LatestTerm: row.AvgAttendance_LatestTerm || 0,
      WorksPartTime: Boolean(row.WorksPartTime),
      IsPreparingCompetitiveExam: Boolean(row.IsPreparingCompetitiveExam),
      HasOwnLaptop: Boolean(row.HasOwnLaptop),
      HasReliableInternet: Boolean(row.HasReliableInternet),
      IsDropout: Boolean(row.IsDropout),
      RiskScore: row.RiskScore || 0,
      RiskLevel: (row.RiskLevel as "Low" | "Medium" | "High" | "Critical") || "Low",
    }));
  }

  // Close database connection
  async close(): Promise<void> {
    await this.pool.end();
  }
}

// Export singleton instance
export const dbService = new DatabaseService();

