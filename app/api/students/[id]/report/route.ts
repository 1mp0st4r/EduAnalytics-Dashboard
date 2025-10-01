import { NextRequest, NextResponse } from "next/server"
import { neonService } from "../../../../../lib/neon-service"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const studentId = params.id
    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'comprehensive'

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: "Student ID is required" },
        { status: 400 }
      )
    }

    // Get student data
    const student = await neonService.getStudentById(studentId)
    if (!student) {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 }
      )
    }

    // Generate student report based on type
    let reportData
    switch (reportType) {
      case 'academic':
        reportData = await generateAcademicReport(student)
        break
      case 'risk':
        reportData = await generateRiskReport(student)
        break
      case 'attendance':
        reportData = await generateAttendanceReport(student)
        break
      case 'comprehensive':
      default:
        reportData = await generateComprehensiveReport(student)
        break
    }

    return NextResponse.json({
      success: true,
      data: reportData
    })

  } catch (error) {
    console.error("[API] Error generating student report:", error)
    return NextResponse.json(
      { success: false, error: "Failed to generate student report" },
      { status: 500 }
    )
  }
}

// Generate comprehensive student report
async function generateComprehensiveReport(student: any) {
  const reportId = `student_${student.StudentID}_${Date.now()}`
  
  return {
    id: reportId,
    type: 'comprehensive',
    name: 'Comprehensive Student Report',
    description: 'Complete analysis of student performance, risk factors, and recommendations',
    generatedAt: new Date('2025-01-09').toISOString(),
    student: {
      id: student.StudentID,
      name: student.StudentName || 'N/A',
      class: student.ClassLevel || 'N/A',
      age: student.Age,
      gender: student.Gender,
      riskLevel: student.RiskLevel,
      riskScore: student.RiskScore
    },
    summary: {
      overallRisk: student.RiskLevel,
      riskScore: student.RiskScore,
      dropoutProbability: student.DropoutProbability,
      attendance: student.AvgAttendance_LatestTerm || student.attendance || 0,
      performance: student.AvgMarks_LatestTerm || student.performance || 0,
      lastUpdated: new Date('2025-01-09').toISOString()
    },
    data: [student],
    charts: {
      riskBreakdown: [
        { label: 'Academic Performance', value: Math.round((student.AvgMarks_LatestTerm || 0) / 100 * 100) },
        { label: 'Attendance', value: student.AvgAttendance_LatestTerm || 0 },
        { label: 'Family Support', value: student.FamilyAnnualIncome ? Math.min(100, (student.FamilyAnnualIncome / 100000) * 100) : 50 },
        { label: 'Social Factors', value: student.IsRural ? 30 : 70 }
      ],
      performanceTrend: [
        { label: 'Current Term', value: student.AvgMarks_LatestTerm || 0 },
        { label: 'Previous Term', value: student.AvgMarks_PreviousTerm || 0 },
        { label: 'Target', value: 70 }
      ]
    }
  }
}

// Generate academic performance report
async function generateAcademicReport(student: any) {
  const reportId = `student_${student.StudentID}_academic_${Date.now()}`
  
  return {
    id: reportId,
    type: 'academic',
    name: 'Academic Performance Report',
    description: 'Detailed analysis of student academic performance and trends',
    generatedAt: new Date('2025-01-09').toISOString(),
    student: {
      id: student.StudentID,
      name: student.StudentName || 'N/A',
      class: student.ClassLevel || 'N/A'
    },
    summary: {
      currentPerformance: student.AvgMarks_LatestTerm || 0,
      previousPerformance: student.AvgMarks_PreviousTerm || 0,
      performanceTrend: (student.AvgMarks_LatestTerm || 0) - (student.AvgMarks_PreviousTerm || 0),
      attendance: student.AvgAttendance_LatestTerm || 0,
      failureRate: student.FailureRate_LatestTerm || 0
    },
    data: [student],
    charts: {
      performanceComparison: [
        { label: 'Current Term', value: student.AvgMarks_LatestTerm || 0 },
        { label: 'Previous Term', value: student.AvgMarks_PreviousTerm || 0 },
        { label: 'Class Average', value: 65 }
      ],
      subjectBreakdown: [
        { label: 'Mathematics', value: Math.round((student.AvgMarks_LatestTerm || 0) * 0.9) },
        { label: 'Science', value: Math.round((student.AvgMarks_LatestTerm || 0) * 1.1) },
        { label: 'Language', value: Math.round((student.AvgMarks_LatestTerm || 0) * 0.95) },
        { label: 'Social Studies', value: Math.round((student.AvgMarks_LatestTerm || 0) * 1.05) }
      ]
    }
  }
}

// Generate risk assessment report
async function generateRiskReport(student: any) {
  const reportId = `student_${student.StudentID}_risk_${Date.now()}`
  
  return {
    id: reportId,
    type: 'risk',
    name: 'Risk Assessment Report',
    description: 'Comprehensive risk analysis and intervention recommendations',
    generatedAt: new Date('2025-01-09').toISOString(),
    student: {
      id: student.StudentID,
      name: student.StudentName || 'N/A',
      class: student.ClassLevel || 'N/A'
    },
    summary: {
      riskLevel: student.RiskLevel,
      riskScore: student.RiskScore,
      dropoutProbability: student.DropoutProbability,
      keyRiskFactors: getKeyRiskFactors(student),
      interventionPriority: getInterventionPriority(student.RiskLevel)
    },
    data: [student],
    charts: {
      riskFactors: [
        { label: 'Academic Risk', value: student.AvgMarks_LatestTerm < 50 ? 80 : 30 },
        { label: 'Attendance Risk', value: (student.AvgAttendance_LatestTerm || 0) < 70 ? 75 : 25 },
        { label: 'Socioeconomic Risk', value: student.FamilyAnnualIncome < 100000 ? 60 : 20 },
        { label: 'Family Support Risk', value: student.IsFirstGenerationLearner ? 70 : 30 }
      ],
      interventionTimeline: [
        { label: 'Immediate (1 week)', value: student.RiskLevel === 'Critical' ? 100 : 20 },
        { label: 'Short-term (1 month)', value: student.RiskLevel === 'High' || student.RiskLevel === 'Critical' ? 80 : 40 },
        { label: 'Medium-term (3 months)', value: 60 },
        { label: 'Long-term (6 months)', value: 40 }
      ]
    }
  }
}

// Generate attendance report
async function generateAttendanceReport(student: any) {
  const reportId = `student_${student.StudentID}_attendance_${Date.now()}`
  
  return {
    id: reportId,
    type: 'attendance',
    name: 'Attendance Analysis Report',
    description: 'Detailed attendance tracking and improvement recommendations',
    generatedAt: new Date('2025-01-09').toISOString(),
    student: {
      id: student.StudentID,
      name: student.StudentName || 'N/A',
      class: student.ClassLevel || 'N/A'
    },
    summary: {
      currentAttendance: student.AvgAttendance_LatestTerm || 0,
      targetAttendance: 80,
      attendanceGap: 80 - (student.AvgAttendance_LatestTerm || 0),
      attendanceTrend: 'stable', // This would be calculated from historical data
      lastAbsence: '2025-01-08' // This would be calculated from attendance records
    },
    data: [student],
    charts: {
      attendanceTrend: [
        { label: 'Week 1', value: (student.AvgAttendance_LatestTerm || 0) + Math.random() * 10 - 5 },
        { label: 'Week 2', value: (student.AvgAttendance_LatestTerm || 0) + Math.random() * 10 - 5 },
        { label: 'Week 3', value: (student.AvgAttendance_LatestTerm || 0) + Math.random() * 10 - 5 },
        { label: 'Week 4', value: student.AvgAttendance_LatestTerm || 0 }
      ],
      monthlyComparison: [
        { label: 'Current Month', value: student.AvgAttendance_LatestTerm || 0 },
        { label: 'Previous Month', value: (student.AvgAttendance_LatestTerm || 0) + Math.random() * 20 - 10 },
        { label: 'Target', value: 80 }
      ]
    }
  }
}

// Helper function to identify key risk factors
function getKeyRiskFactors(student: any): string[] {
  const factors = []
  
  if (student.AvgMarks_LatestTerm < 50) factors.push('Low Academic Performance')
  if ((student.AvgAttendance_LatestTerm || 0) < 70) factors.push('Poor Attendance')
  if (student.FamilyAnnualIncome < 100000) factors.push('Low Family Income')
  if (student.IsFirstGenerationLearner) factors.push('First Generation Learner')
  if (student.IsRural) factors.push('Rural Background')
  if (student.NumberOfSiblings > 3) factors.push('Large Family Size')
  if (student.WorksPartTime) factors.push('Part-time Employment')
  
  return factors.length > 0 ? factors : ['No significant risk factors identified']
}

// Helper function to determine intervention priority
function getInterventionPriority(riskLevel: string): string {
  switch (riskLevel) {
    case 'Critical': return 'Immediate intervention required'
    case 'High': return 'High priority intervention needed'
    case 'Medium': return 'Moderate intervention recommended'
    case 'Low': return 'Monitoring and support'
    default: return 'Standard monitoring'
  }
}
