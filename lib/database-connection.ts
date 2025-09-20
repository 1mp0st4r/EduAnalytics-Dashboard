import mysql from "mysql2/promise"
import type { StudentAnalytics } from "./types" // Declare the StudentAnalytics type

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "StudentAnalyticsDB",
  port: Number.parseInt(process.env.DB_PORT || "3306"),
}

export async function getDbConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig)
    return connection
  } catch (error) {
    console.error("Database connection failed:", error)
    throw error
  }
}

export async function executeQuery(query: string, params: any[] = []) {
  const connection = await getDbConnection()
  try {
    const [results] = await connection.execute(query, params)
    return results
  } finally {
    await connection.end()
  }
}

export async function calculateStudentAnalytics(studentId: string): Promise<StudentAnalytics | null> {
  const connection = await getDbConnection()

  try {
    // Get basic student data
    const [studentRows] = await connection.execute("SELECT * FROM Students WHERE StudentID = ?", [studentId])

    if (!Array.isArray(studentRows) || studentRows.length === 0) {
      return null
    }

    const student = studentRows[0] as any

    // Calculate age from DateOfBirth
    const age = Math.floor((Date.now() - new Date(student.DateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))

    // Get educational history for past performance
    const [historyRows] = await connection.execute(
      "SELECT AVG(MarksPercentage) as AvgPastPerformance FROM Educational_History WHERE StudentID = ?",
      [studentId],
    )
    const avgPastPerformance = (historyRows as any)[0]?.AvgPastPerformance || 0

    // Get latest term academic records
    const [latestTermQuery] = await connection.execute(
      "SELECT MAX(Term) as LatestTerm FROM Academic_Records WHERE StudentID = ?",
      [studentId],
    )
    const latestTerm = (latestTermQuery as any)[0]?.LatestTerm || 1

    // Calculate latest term average marks
    const [marksRows] = await connection.execute(
      "SELECT AVG((MarksObtained/MaxMarks)*100) as AvgMarks FROM Academic_Records WHERE StudentID = ? AND Term = ?",
      [studentId, latestTerm],
    )
    const avgMarksLatestTerm = (marksRows as any)[0]?.AvgMarks || 0

    // Calculate failure rate for latest term
    const [failureRows] = await connection.execute(
      "SELECT COUNT(*) as TotalSubjects, SUM(CASE WHEN (MarksObtained/MaxMarks)*100 < 40 THEN 1 ELSE 0 END) as FailedSubjects FROM Academic_Records WHERE StudentID = ? AND Term = ?",
      [studentId, latestTerm],
    )
    const failureData = (failureRows as any)[0]
    const failureRate = failureData.TotalSubjects > 0 ? failureData.FailedSubjects / failureData.TotalSubjects : 0

    // Calculate average attendance for latest term
    const [attendanceRows] = await connection.execute(
      "SELECT AVG(AttendancePercentage) as AvgAttendance FROM Attendance WHERE StudentID = ? AND Term = ?",
      [studentId, latestTerm],
    )
    const avgAttendanceLatestTerm = (attendanceRows as any)[0]?.AvgAttendance || 0

    // Get dropout status
    const [statusRows] = await connection.execute(
      "SELECT IsDropout FROM Student_Status_Records WHERE StudentID = ? ORDER BY StatusDate DESC LIMIT 1",
      [studentId],
    )
    const isDropout = (statusRows as any)[0]?.IsDropout || false

    // Calculate risk score based on multiple factors
    const riskScore = calculateRiskScore({
      avgPastPerformance,
      avgMarksLatestTerm,
      failureRate,
      avgAttendanceLatestTerm,
      familyIncome: student.FamilyAnnualIncome,
      isFirstGeneration: student.IsFirstGenerationLearner,
      worksPartTime: student.WorksPartTime,
      hasReliableInternet: student.HasReliableInternet,
    })

    const analytics: StudentAnalytics = {
      StudentID: studentId,
      Age: age,
      Gender: student.Gender,
      AccommodationType: student.AccommodationType,
      IsRural: student.IsRural,
      CommuteTimeMinutes: student.CommuteTimeMinutes,
      CasteCategory: student.CasteCategory,
      AdmissionQuota: student.AdmissionQuota,
      FamilyAnnualIncome: student.FamilyAnnualIncome,
      NumberOfSiblings: student.NumberOfSiblings,
      FatherEducation: student.FatherEducation,
      IsFatherLiterate: student.IsFatherLiterate,
      MotherEducation: student.MotherEducation,
      IsMotherLiterate: student.IsMotherLiterate,
      IsFirstGenerationLearner: student.IsFirstGenerationLearner,
      AvgPastPerformance: avgPastPerformance,
      MediumChanged: false, // Would need additional logic to determine
      AvgMarks_LatestTerm: avgMarksLatestTerm,
      MarksTrend: 0, // Would need previous term data to calculate
      FailureRate_LatestTerm: failureRate,
      AvgAttendance_LatestTerm: avgAttendanceLatestTerm,
      WorksPartTime: student.WorksPartTime,
      IsPreparingCompetitiveExam: student.IsPreparingCompetitiveExam,
      HasOwnLaptop: student.HasOwnLaptop,
      HasReliableInternet: student.HasReliableInternet,
      IsDropout: isDropout,
      RiskScore: riskScore,
      RiskLevel: getRiskLevel(riskScore),
    }

    return analytics
  } finally {
    await connection.end()
  }
}

function calculateRiskScore(factors: any): number {
  let score = 0

  // Academic factors (40% weight)
  if (factors.avgPastPerformance < 50) score += 15
  else if (factors.avgPastPerformance < 70) score += 8

  if (factors.avgMarksLatestTerm < 50) score += 20
  else if (factors.avgMarksLatestTerm < 70) score += 10

  if (factors.failureRate > 0.3) score += 15
  else if (factors.failureRate > 0.1) score += 8

  // Behavioral factors (30% weight)
  if (factors.avgAttendanceLatestTerm < 75) score += 15
  else if (factors.avgAttendanceLatestTerm < 85) score += 8

  if (factors.worksPartTime) score += 10

  // Socio-economic factors (30% weight)
  if (factors.familyIncome < 200000) score += 10
  else if (factors.familyIncome < 500000) score += 5

  if (factors.isFirstGeneration) score += 8
  if (!factors.hasReliableInternet) score += 7

  return Math.min(score, 100)
}

function getRiskLevel(score: number): "Low" | "Medium" | "High" | "Critical" {
  if (score >= 75) return "Critical"
  if (score >= 50) return "High"
  if (score >= 25) return "Medium"
  return "Low"
}
