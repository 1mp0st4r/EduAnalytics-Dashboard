import { NextRequest, NextResponse } from 'next/server'
import { neonService } from '../../../lib/neon-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'all'
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    // Fetch real student data for reports
    const students = await neonService.getStudents({ limit: 10000 })
    
    if (type === 'performance') {
      const performanceReport = generatePerformanceReport(students)
      return NextResponse.json({ success: true, data: performanceReport })
    }
    
    if (type === 'risk-analysis') {
      const riskReport = generateRiskAnalysisReport(students)
      return NextResponse.json({ success: true, data: riskReport })
    }
    
    if (type === 'attendance') {
      const attendanceReport = generateAttendanceReport(students)
      return NextResponse.json({ success: true, data: attendanceReport })
    }

    if (type === 'mentor-effectiveness') {
      const mentorReport = generateMentorEffectivenessReport(students)
      return NextResponse.json({ success: true, data: mentorReport })
    }

    // Return all available report types
    return NextResponse.json({ 
      success: true, 
      data: {
        availableReports: [
          'performance',
          'risk-analysis', 
          'attendance',
          'mentor-effectiveness'
        ],
        totalStudents: students.length
      }
    })

  } catch (error) {
    console.error('Error generating reports:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate reports' 
    }, { status: 500 })
  }
}

function generatePerformanceReport(students: any[]) {
  const performanceData = students.map(student => ({
    studentId: student.StudentID,
    name: student.StudentName,
    class: student.StudentClass,
    attendance: student.AvgAttendance_LatestTerm,
    performance: student.AvgMarks_LatestTerm,
    riskLevel: student.RiskLevel,
    mentor: student.MentorName,
    lastUpdated: new Date('2025-01-09').toISOString()
  }))

  // Calculate statistics
  const avgAttendance = performanceData.reduce((sum, s) => sum + (parseFloat(s.attendance) || 0), 0) / performanceData.length
  const avgPerformance = performanceData.reduce((sum, s) => sum + (parseFloat(s.performance) || 0), 0) / performanceData.length
  
  const classDistribution = performanceData.reduce((acc, s) => {
    acc[s.class] = (acc[s.class] || 0) + 1
    return acc
  }, {})

  const riskDistribution = performanceData.reduce((acc, s) => {
    acc[s.riskLevel] = (acc[s.riskLevel] || 0) + 1
    return acc
  }, {})

  return {
    type: 'performance',
    generatedAt: new Date('2025-01-09').toISOString(),
    summary: {
      totalStudents: performanceData.length,
      avgAttendance: Math.round(avgAttendance * 100) / 100,
      avgPerformance: Math.round(avgPerformance * 100) / 100,
      classDistribution,
      riskDistribution
    },
    data: performanceData,
    charts: {
      performanceDistribution: generatePerformanceChart(performanceData),
      attendanceTrends: generateAttendanceChart(performanceData),
      riskLevels: generateRiskChart(riskDistribution)
    }
  }
}

function generateRiskAnalysisReport(students: any[]) {
  const riskData = students.map(student => ({
    studentId: student.StudentID,
    name: student.StudentName,
    class: student.StudentClass,
    riskLevel: student.RiskLevel,
    riskScore: student.RiskScore,
    attendance: student.AvgAttendance_LatestTerm,
    performance: student.AvgMarks_LatestTerm,
    mentor: student.MentorName,
    interventionNeeded: getInterventionLevel(student.RiskLevel),
    lastAssessment: new Date('2025-01-09').toISOString()
  }))

  const riskStats = riskData.reduce((acc, student) => {
    const level = student.riskLevel
    if (!acc[level]) {
      acc[level] = { count: 0, avgScore: 0, totalScore: 0 }
    }
    acc[level].count++
    acc[level].totalScore += student.riskScore || 0
    acc[level].avgScore = acc[level].totalScore / acc[level].count
    return acc
  }, {})

  return {
    type: 'risk-analysis',
    generatedAt: new Date('2025-01-09').toISOString(),
    summary: {
      totalAtRisk: riskData.filter(s => s.riskLevel !== 'Low').length,
      criticalRisk: riskStats['Critical']?.count || 0,
      highRisk: riskStats['High']?.count || 0,
      mediumRisk: riskStats['Medium']?.count || 0,
      lowRisk: riskStats['Low']?.count || 0,
      riskStats
    },
    data: riskData,
    charts: {
      riskDistribution: generateRiskDistributionChart(riskStats),
      interventionPriority: generateInterventionChart(riskData),
      riskTrends: generateRiskTrendChart(riskData)
    }
  }
}

function generateAttendanceReport(students: any[]) {
  const attendanceData = students.map(student => ({
    studentId: student.StudentID,
    name: student.StudentName,
    class: student.StudentClass,
    attendance: student.AvgAttendance_LatestTerm,
    status: getAttendanceStatus(student.AvgAttendance_LatestTerm),
    mentor: student.MentorName,
    lastUpdated: new Date('2025-01-09').toISOString()
  }))

  const classAttendance = attendanceData.reduce((acc, student) => {
    const className = student.class
    if (!acc[className]) {
      acc[className] = { total: 0, present: 0, students: [] }
    }
    acc[className].total++
    acc[className].students.push(student)
    if (student.attendance >= 75) acc[className].present++
    return acc
  }, {})

  const attendanceStats = Object.keys(classAttendance).map(className => ({
    class: className,
    totalStudents: classAttendance[className].total,
    presentStudents: classAttendance[className].present,
    attendanceRate: Math.round((classAttendance[className].present / classAttendance[className].total) * 100)
  }))

  return {
    type: 'attendance',
    generatedAt: new Date('2025-01-09').toISOString(),
    summary: {
      totalStudents: attendanceData.length,
      avgAttendance: Math.round(attendanceData.reduce((sum, s) => sum + (parseFloat(s.attendance) || 0), 0) / attendanceData.length * 100) / 100,
      classAttendance: attendanceStats,
      poorAttendance: attendanceData.filter(s => s.attendance < 75).length
    },
    data: attendanceData,
    charts: {
      attendanceByClass: generateAttendanceByClassChart(attendanceStats),
      attendanceDistribution: generateAttendanceDistributionChart(attendanceData),
      attendanceTrends: generateAttendanceTrendChart(attendanceData)
    }
  }
}

function generateMentorEffectivenessReport(students: any[]) {
  const mentorData = students.reduce((acc, student) => {
    const mentorName = student.MentorName || 'Unassigned'
    if (!acc[mentorName]) {
      acc[mentorName] = {
        mentorName,
        totalStudents: 0,
        highRiskStudents: 0,
        avgAttendance: 0,
        avgPerformance: 0,
        totalAttendance: 0,
        totalPerformance: 0,
        students: []
      }
    }
    
    acc[mentorName].totalStudents++
    acc[mentorName].totalAttendance += student.AvgAttendance_LatestTerm || 0
    acc[mentorName].totalPerformance += student.AvgMarks_LatestTerm || 0
    acc[mentorName].students.push(student)
    
    if (student.RiskLevel === 'High' || student.RiskLevel === 'Critical') {
      acc[mentorName].highRiskStudents++
    }
    
    return acc
  }, {})

  // Calculate averages
  Object.keys(mentorData).forEach(mentor => {
    const data = mentorData[mentor]
    data.avgAttendance = Math.round((data.totalAttendance / data.totalStudents) * 100) / 100
    data.avgPerformance = Math.round((data.totalPerformance / data.totalStudents) * 100) / 100
    data.effectivenessScore = calculateEffectivenessScore(data)
  })

  const mentorStats = Object.values(mentorData).map(mentor => ({
    ...mentor,
    effectivenessRating: getEffectivenessRating(mentor.effectivenessScore)
  }))

  return {
    type: 'mentor-effectiveness',
    generatedAt: new Date('2025-01-09').toISOString(),
    summary: {
      totalMentors: mentorStats.length,
      avgStudentsPerMentor: Math.round(mentorStats.reduce((sum, m) => sum + m.totalStudents, 0) / mentorStats.length),
      topPerformer: mentorStats.reduce((prev, current) => 
        (prev.effectivenessScore > current.effectivenessScore) ? prev : current
      ),
      totalHighRiskStudents: mentorStats.reduce((sum, m) => sum + m.highRiskStudents, 0)
    },
    data: mentorStats,
    charts: {
      mentorPerformance: generateMentorPerformanceChart(mentorStats),
      studentDistribution: generateStudentDistributionChart(mentorStats),
      effectivenessTrends: generateEffectivenessChart(mentorStats)
    }
  }
}

// Helper functions
function getInterventionLevel(riskLevel: string): string {
  switch (riskLevel) {
    case 'Critical': return 'Immediate (24 hours)'
    case 'High': return 'Within 48 hours'
    case 'Medium': return 'Within 1 week'
    case 'Low': return 'Monthly monitoring'
    default: return 'No intervention needed'
  }
}

function getAttendanceStatus(attendance: number): string {
  if (attendance >= 90) return 'Excellent'
  if (attendance >= 75) return 'Good'
  if (attendance >= 60) return 'Fair'
  return 'Poor'
}

function calculateEffectivenessScore(mentor: any): number {
  const attendanceWeight = 0.3
  const performanceWeight = 0.4
  const riskWeight = 0.3
  
  const attendanceScore = Math.min(mentor.avgAttendance, 100)
  const performanceScore = Math.min(mentor.avgPerformance, 100)
  const riskScore = Math.max(0, 100 - (mentor.highRiskStudents / mentor.totalStudents * 100))
  
  return Math.round(
    (attendanceScore * attendanceWeight) + 
    (performanceScore * performanceWeight) + 
    (riskScore * riskWeight)
  )
}

function getEffectivenessRating(score: number): string {
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Good'
  if (score >= 55) return 'Fair'
  return 'Needs Improvement'
}

// Chart data generators
function generatePerformanceChart(data: any[]) {
  const ranges = [
    { range: '90-100%', count: data.filter(s => s.performance >= 90).length },
    { range: '80-89%', count: data.filter(s => s.performance >= 80 && s.performance < 90).length },
    { range: '70-79%', count: data.filter(s => s.performance >= 70 && s.performance < 80).length },
    { range: '60-69%', count: data.filter(s => s.performance >= 60 && s.performance < 70).length },
    { range: 'Below 60%', count: data.filter(s => s.performance < 60).length }
  ]
  return ranges
}

function generateAttendanceChart(data: any[]) {
  const ranges = [
    { range: '90-100%', count: data.filter(s => s.attendance >= 90).length },
    { range: '75-89%', count: data.filter(s => s.attendance >= 75 && s.attendance < 90).length },
    { range: '60-74%', count: data.filter(s => s.attendance >= 60 && s.attendance < 75).length },
    { range: 'Below 60%', count: data.filter(s => s.attendance < 60).length }
  ]
  return ranges
}

function generateRiskChart(riskDistribution: any) {
  return Object.keys(riskDistribution).map(level => ({
    level,
    count: riskDistribution[level]
  }))
}

function generateRiskDistributionChart(riskStats: any) {
  return Object.keys(riskStats).map(level => ({
    level,
    count: riskStats[level].count,
    avgScore: Math.round(riskStats[level].avgScore * 100) / 100
  }))
}

function generateInterventionChart(data: any[]) {
  const interventions = data.reduce((acc, student) => {
    const intervention = student.interventionNeeded
    acc[intervention] = (acc[intervention] || 0) + 1
    return acc
  }, {})
  
  return Object.keys(interventions).map(intervention => ({
    intervention,
    count: interventions[intervention]
  }))
}

function generateRiskTrendChart(data: any[]) {
  // Simulate trend data over last 30 days
  const days = 30
  const trend = []
  for (let i = days; i >= 0; i--) {
    const date = new Date('2025-01-09')
    date.setDate(date.getDate() - i)
    trend.push({
      date: date.toISOString().split('T')[0],
      critical: Math.floor(Math.random() * 10) + 5,
      high: Math.floor(Math.random() * 15) + 10,
      medium: Math.floor(Math.random() * 20) + 15,
      low: Math.floor(Math.random() * 25) + 20
    })
  }
  return trend
}

function generateAttendanceByClassChart(attendanceStats: any[]) {
  return attendanceStats.map(stat => ({
    class: stat.class,
    attendanceRate: stat.attendanceRate,
    totalStudents: stat.totalStudents
  }))
}

function generateAttendanceDistributionChart(data: any[]) {
  const statusCounts = data.reduce((acc, student) => {
    acc[student.status] = (acc[student.status] || 0) + 1
    return acc
  }, {})
  
  return Object.keys(statusCounts).map(status => ({
    status,
    count: statusCounts[status]
  }))
}

function generateAttendanceTrendChart(data: any[]) {
  // Simulate 30-day trend
  const days = 30
  const trend = []
  for (let i = days; i >= 0; i--) {
    const date = new Date('2025-01-09')
    date.setDate(date.getDate() - i)
    trend.push({
      date: date.toISOString().split('T')[0],
      avgAttendance: Math.floor(Math.random() * 20) + 75,
      presentStudents: Math.floor(Math.random() * 100) + 800,
      absentStudents: Math.floor(Math.random() * 50) + 20
    })
  }
  return trend
}

function generateMentorPerformanceChart(data: any[]) {
  return data.map(mentor => ({
    mentorName: mentor.mentorName,
    effectivenessScore: mentor.effectivenessScore,
    totalStudents: mentor.totalStudents,
    highRiskStudents: mentor.highRiskStudents
  }))
}

function generateStudentDistributionChart(data: any[]) {
  return data.map(mentor => ({
    mentorName: mentor.mentorName,
    totalStudents: mentor.totalStudents,
    highRiskStudents: mentor.highRiskStudents,
    normalRiskStudents: mentor.totalStudents - mentor.highRiskStudents
  }))
}

function generateEffectivenessChart(data: any[]) {
  const ratings = data.reduce((acc, mentor) => {
    acc[mentor.effectivenessRating] = (acc[mentor.effectivenessRating] || 0) + 1
    return acc
  }, {})
  
  return Object.keys(ratings).map(rating => ({
    rating,
    count: ratings[rating]
  }))
}
