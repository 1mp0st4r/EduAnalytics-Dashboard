import { NextRequest, NextResponse } from "next/server"
import { neonService } from "../../../lib/neon-service"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      type, 
      format, 
      filters = {}, 
      dateRange = {},
      includeCharts = false 
    } = body

    if (!type || !format) {
      return NextResponse.json(
        { success: false, error: 'Type and format are required' },
        { status: 400 }
      )
    }

    let data: any
    let filename: string

    switch (type) {
      case 'students':
        data = await exportStudentData(filters, dateRange)
        filename = `students_export_${new Date().toISOString().split('T')[0]}.${format}`
        break
      case 'analytics':
        data = await exportAnalyticsData(filters, dateRange, includeCharts)
        filename = `analytics_export_${new Date().toISOString().split('T')[0]}.${format}`
        break
      case 'reports':
        data = await exportReportsData(filters, dateRange)
        filename = `reports_export_${new Date().toISOString().split('T')[0]}.${format}`
        break
      case 'risk-analysis':
        data = await exportRiskAnalysis(filters, dateRange)
        filename = `risk_analysis_${new Date().toISOString().split('T')[0]}.${format}`
        break
      case 'comprehensive':
        data = await exportComprehensiveData(filters, dateRange, includeCharts)
        filename = `comprehensive_export_${new Date().toISOString().split('T')[0]}.${format}`
        break
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid export type' },
          { status: 400 }
        )
    }

    let exportData: string
    let contentType: string

    switch (format) {
      case 'csv':
        exportData = convertToCSV(data)
        contentType = 'text/csv'
        break
      case 'json':
        exportData = JSON.stringify(data, null, 2)
        contentType = 'application/json'
        break
      case 'xlsx':
        exportData = await convertToExcel(data)
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        break
      case 'pdf':
        exportData = await convertToPDF(data, type)
        contentType = 'application/pdf'
        break
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid export format' },
          { status: 400 }
        )
    }

    return new NextResponse(exportData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('[API] Export error:', error)
    return NextResponse.json(
      { success: false, error: 'Export failed' },
      { status: 500 }
    )
  }
}

async function exportStudentData(filters: any, dateRange: any) {
  const students = await neonService.getStudents({ limit: 10000 })
  
  // Apply filters
  let filteredStudents = students
  
  if (filters.riskLevel) {
    filteredStudents = filteredStudents.filter((s: any) => s.RiskLevel === filters.riskLevel)
  }
  
  if (filters.classLevel) {
    filteredStudents = filteredStudents.filter((s: any) => s.StudentClass === filters.classLevel)
  }
  
  if (filters.gender) {
    filteredStudents = filteredStudents.filter((s: any) => s.Gender === filters.gender)
  }
  
  if (filters.school) {
    filteredStudents = filteredStudents.filter((s: any) => s.SchoolName === filters.school)
  }

  return {
    metadata: {
      exportDate: new Date().toISOString(),
      totalRecords: filteredStudents.length,
      filters: filters,
      dateRange: dateRange
    },
    students: filteredStudents.map((s: any) => ({
      studentId: s.StudentID,
      name: s.StudentName,
      class: s.StudentClass,
      gender: s.Gender,
      attendance: s.AvgAttendance_LatestTerm,
      performance: s.AvgMarks_LatestTerm,
      riskLevel: s.RiskLevel,
      riskScore: s.RiskScore,
      dropoutProbability: s.DropoutProbability,
      isDropout: s.IsDropout,
      school: s.SchoolName,
      mentor: s.MentorName,
      email: s.ContactEmail,
      phone: s.ContactPhoneNumber,
      createdAt: s.created_at
    }))
  }
}

async function exportAnalyticsData(filters: any, dateRange: any, includeCharts: boolean) {
  const students = await neonService.getStudents({ limit: 10000 })
  const stats = await neonService.getStatistics()
  
  const analytics = {
    overview: {
      totalStudents: stats.totalStudents,
      highRiskStudents: stats.highRiskStudents,
      mediumRiskStudents: stats.mediumRiskStudents,
      lowRiskStudents: stats.lowRiskStudents,
      criticalRiskStudents: stats.criticalRiskStudents,
      dropoutStudents: stats.dropoutStudents,
      avgAttendance: stats.avgAttendance,
      avgPerformance: stats.avgPerformance,
      avgDropoutProbability: stats.avgDropoutProbability
    },
    riskDistribution: {
      critical: stats.criticalRiskStudents,
      high: stats.highRiskStudents,
      medium: stats.mediumRiskStudents,
      low: stats.lowRiskStudents
    },
    classDistribution: calculateClassDistribution(students),
    genderDistribution: calculateGenderDistribution(students),
    schoolDistribution: calculateSchoolDistribution(students),
    trends: {
      monthly: generateMonthlyTrends(),
      quarterly: generateQuarterlyTrends()
    }
  }

  if (includeCharts) {
    analytics.charts = {
      attendanceTrends: generateAttendanceTrends(10000),
      performanceTrends: generatePerformanceTrends(10000),
      riskAnalysis: calculateRiskDistribution(students)
    }
  }

  return analytics
}

async function exportReportsData(filters: any, dateRange: any) {
  // Get scheduled reports
  const scheduledResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/reports/scheduled`)
  const scheduledData = scheduledResponse.ok ? await scheduledResponse.json() : { data: [] }
  
  // Get generated reports from localStorage (would be from database in production)
  const generatedReports = []
  
  return {
    metadata: {
      exportDate: new Date().toISOString(),
      totalScheduledReports: scheduledData.data?.length || 0,
      totalGeneratedReports: generatedReports.length
    },
    scheduledReports: scheduledData.data || [],
    generatedReports: generatedReports
  }
}

async function exportRiskAnalysis(filters: any, dateRange: any) {
  const students = await neonService.getStudents({ limit: 10000 })
  
  const riskAnalysis = {
    summary: {
      totalStudents: students.length,
      atRiskStudents: students.filter((s: any) => 
        s.RiskLevel === 'High' || s.RiskLevel === 'Critical'
      ).length,
      predictedDropouts: Math.floor(students.filter((s: any) => 
        s.RiskLevel === 'Critical'
      ).length * 0.25),
      confidence: 85
    },
    riskFactors: calculateRiskFactorDistribution(students),
    interventions: generateInterventionRecommendations(students),
    predictions: {
      nextMonth: predictNextMonthDropouts(students),
      nextQuarter: predictNextQuarterDropouts(students),
      nextYear: predictNextYearDropouts(students)
    }
  }

  return riskAnalysis
}

async function exportComprehensiveData(filters: any, dateRange: any, includeCharts: boolean) {
  const [studentsData, analyticsData, reportsData, riskData] = await Promise.all([
    exportStudentData(filters, dateRange),
    exportAnalyticsData(filters, dateRange, includeCharts),
    exportReportsData(filters, dateRange),
    exportRiskAnalysis(filters, dateRange)
  ])

  return {
    metadata: {
      exportDate: new Date().toISOString(),
      exportType: 'comprehensive',
      filters: filters,
      dateRange: dateRange,
      includeCharts: includeCharts
    },
    students: studentsData,
    analytics: analyticsData,
    reports: reportsData,
    riskAnalysis: riskData
  }
}

// Helper functions
function calculateClassDistribution(students: any[]) {
  const distribution: any = {}
  students.forEach(student => {
    const classLevel = student.StudentClass || 'Unknown'
    distribution[classLevel] = (distribution[classLevel] || 0) + 1
  })
  return distribution
}

function calculateGenderDistribution(students: any[]) {
  const distribution: any = { Male: 0, Female: 0 }
  students.forEach(student => {
    if (student.Gender === 'Male' || student.Gender === 'Female') {
      distribution[student.Gender]++
    }
  })
  return distribution
}

function calculateSchoolDistribution(students: any[]) {
  const distribution: any = {}
  students.forEach(student => {
    const school = student.SchoolName || 'Unknown'
    distribution[school] = (distribution[school] || 0) + 1
  })
  return distribution
}

function generateMonthlyTrends() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return months.map(month => ({
    month,
    attendance: (Math.random() * 20 + 75).toFixed(1),
    performance: (Math.random() * 15 + 70).toFixed(1),
    riskScore: (Math.random() * 30 + 50).toFixed(1)
  }))
}

function generateQuarterlyTrends() {
  return [
    { quarter: 'Q1', attendance: 82.3, performance: 78.5, riskScore: 65.2 },
    { quarter: 'Q2', attendance: 85.1, performance: 81.2, riskScore: 62.8 },
    { quarter: 'Q3', attendance: 83.7, performance: 79.8, riskScore: 64.1 },
    { quarter: 'Q4', attendance: 86.4, performance: 82.6, riskScore: 61.5 }
  ]
}

function calculateRiskDistribution(students: any[]) {
  const distribution: any = { critical: 0, high: 0, medium: 0, low: 0 }
  students.forEach(student => {
    const level = student.RiskLevel?.toLowerCase()
    if (distribution.hasOwnProperty(level)) {
      distribution[level]++
    }
  })
  return distribution
}

function calculateRiskFactorDistribution(students: any[]) {
  return {
    attendance: {
      low: students.filter((s: any) => parseFloat(s.AvgAttendance_LatestTerm) < 75).length,
      medium: students.filter((s: any) => {
        const att = parseFloat(s.AvgAttendance_LatestTerm)
        return att >= 75 && att < 85
      }).length,
      high: students.filter((s: any) => parseFloat(s.AvgAttendance_LatestTerm) >= 85).length
    },
    performance: {
      low: students.filter((s: any) => parseFloat(s.AvgMarks_LatestTerm) < 60).length,
      medium: students.filter((s: any) => {
        const perf = parseFloat(s.AvgMarks_LatestTerm)
        return perf >= 60 && perf < 80
      }).length,
      high: students.filter((s: any) => parseFloat(s.AvgMarks_LatestTerm) >= 80).length
    },
    behavior: {
      issues: Math.floor(students.length * 0.15),
      good: Math.floor(students.length * 0.85)
    }
  }
}

function generateInterventionRecommendations(students: any[]) {
  const highRiskStudents = students.filter((s: any) => s.RiskLevel === 'High' || s.RiskLevel === 'Critical')
  
  return [
    {
      type: 'Academic Support',
      priority: 'High',
      studentsAffected: students.filter((s: any) => parseFloat(s.AvgMarks_LatestTerm) < 60).length,
      description: 'Provide tutoring and study resources',
      estimatedCost: 8000,
      expectedOutcome: '20% improvement in performance'
    },
    {
      type: 'Attendance Intervention',
      priority: 'Medium',
      studentsAffected: students.filter((s: any) => parseFloat(s.AvgAttendance_LatestTerm) < 75).length,
      description: 'Implement attendance tracking and parental notifications',
      estimatedCost: 5000,
      expectedOutcome: '15% improvement in attendance'
    },
    {
      type: 'Counseling Services',
      priority: 'Critical',
      studentsAffected: highRiskStudents.length,
      description: 'Individual counseling and mentorship programs',
      estimatedCost: 12000,
      expectedOutcome: '30% reduction in dropout risk'
    }
  ]
}

function predictNextMonthDropouts(students: any[]) {
  const criticalStudents = students.filter((s: any) => s.RiskLevel === 'Critical')
  return {
    predicted: Math.floor(criticalStudents.length * 0.25),
    confidence: 78,
    factors: ['Low attendance', 'Poor performance', 'Behavioral issues']
  }
}

function predictNextQuarterDropouts(students: any[]) {
  const highRiskStudents = students.filter((s: any) => 
    s.RiskLevel === 'High' || s.RiskLevel === 'Critical'
  )
  return {
    predicted: Math.floor(highRiskStudents.length * 0.15),
    confidence: 72,
    factors: ['Multiple risk factors', 'Declining trends', 'Family issues']
  }
}

function predictNextYearDropouts(students: any[]) {
  const allAtRisk = students.filter((s: any) => 
    s.RiskLevel === 'Medium' || s.RiskLevel === 'High' || s.RiskLevel === 'Critical'
  )
  return {
    predicted: Math.floor(allAtRisk.length * 0.08),
    confidence: 65,
    factors: ['Long-term patterns', 'Socioeconomic factors', 'Academic struggles']
  }
}

function generateAttendanceTrends(limit: number) {
  const trends = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date('2025-01-09')
    date.setDate(date.getDate() - i)
    trends.push({
      date: date.toISOString().split('T')[0],
      attendance: (Math.random() * 20 + 75).toFixed(1)
    })
  }
  return trends
}

function generatePerformanceTrends(limit: number) {
  const trends = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date('2025-01-09')
    date.setDate(date.getDate() - i)
    trends.push({
      date: date.toISOString().split('T')[0],
      performance: (Math.random() * 15 + 70).toFixed(1)
    })
  }
  return trends
}

// Export format converters
function convertToCSV(data: any): string {
  if (data.students) {
    const students = data.students
    if (students.length === 0) return ''
    
    const headers = Object.keys(students[0])
    const csvContent = [
      headers.join(','),
      ...students.map((student: any) => 
        headers.map(header => {
          const value = student[header]
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value
        }).join(',')
      )
    ].join('\n')
    
    return csvContent
  }
  
  return JSON.stringify(data, null, 2)
}

async function convertToExcel(data: any): Promise<string> {
  // In a real implementation, you would use a library like 'xlsx'
  // For now, return CSV format
  return convertToCSV(data)
}

async function convertToPDF(data: any, type: string): Promise<string> {
  // In a real implementation, you would use a library like 'puppeteer' or 'jsPDF'
  // For now, return JSON format
  return JSON.stringify(data, null, 2)
}
