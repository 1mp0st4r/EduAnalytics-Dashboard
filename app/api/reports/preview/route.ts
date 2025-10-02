import { NextRequest, NextResponse } from "next/server"
import { neonService } from "../../../../lib/neon-service"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { template, filters = [] } = body

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template is required' },
        { status: 400 }
      )
    }

    // Fetch student data
    const students = await neonService.getStudents({ limit: 10000 })
    
    // Apply filters
    let filteredStudents = students
    for (const filter of filters) {
      filteredStudents = applyFilter(filteredStudents, filter)
    }

    // Generate report data based on template sections
    const reportData = await generateReportData(template, filteredStudents)

    return NextResponse.json({
      success: true,
      data: {
        template: template,
        generatedAt: new Date('2025-01-09').toISOString(),
        totalRecords: filteredStudents.length,
        reportData: reportData
      }
    })

  } catch (error) {
    console.error('[API] Error generating report preview:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate preview' },
      { status: 500 }
    )
  }
}

function applyFilter(students: any[], filter: any) {
  const { field, operator, value } = filter

  return students.filter(student => {
    const studentValue = getStudentFieldValue(student, field)
    
    switch (operator) {
      case 'equals':
        return studentValue === value
      case 'contains':
        return String(studentValue).toLowerCase().includes(String(value).toLowerCase())
      case 'greater_than':
        return parseFloat(studentValue) > parseFloat(value)
      case 'less_than':
        return parseFloat(studentValue) < parseFloat(value)
      case 'between':
        const [min, max] = String(value).split(',').map(Number)
        const numValue = parseFloat(studentValue)
        return numValue >= min && numValue <= max
      case 'in':
        const values = String(value).split(',').map(v => v.trim())
        return values.includes(String(studentValue))
      default:
        return true
    }
  })
}

function getStudentFieldValue(student: any, field: string) {
  const fieldMap: any = {
    'risk_level': student.RiskLevel,
    'class': student.StudentClass,
    'attendance': student.AvgAttendance_LatestTerm,
    'performance': student.AvgMarks_LatestTerm,
    'gender': student.Gender,
    'name': student.StudentName,
    'email': student.ContactEmail,
    'phone': student.ContactPhoneNumber,
    'school': student.SchoolName,
    'mentor': student.MentorName
  }
  
  return fieldMap[field] || student[field] || ''
}

async function generateReportData(template: any, students: any[]) {
  const reportData: any = {
    metadata: {
      generatedAt: new Date('2025-01-09').toISOString(),
      templateName: template.name,
      totalStudents: students.length,
      filters: template.filters
    },
    sections: []
  }

  // Process each section
  for (const section of template.sections) {
    const sectionData = await generateSectionData(section, students)
    reportData.sections.push({
      id: section.id,
      type: section.type,
      title: section.title,
      config: section.config,
      data: sectionData
    })
  }

  return reportData
}

async function generateSectionData(section: any, students: any[]) {
  switch (section.type) {
    case 'summary':
      return generateSummaryData(section.config, students)
    
    case 'chart':
      return generateChartData(section.config, students)
    
    case 'table':
      return generateTableData(section.config, students)
    
    case 'metrics':
      return generateMetricsData(section.config, students)
    
    case 'text':
      return {
        content: section.config.content || 'No content specified'
      }
    
    default:
      return {}
  }
}

function generateSummaryData(config: any, students: any[]) {
  const totalStudents = students.length
  const atRiskStudents = students.filter(s => 
    s.RiskLevel === 'High' || s.RiskLevel === 'Critical'
  ).length
  
  const avgAttendance = students.reduce((sum, s) => 
    sum + (parseFloat(s.AvgAttendance_LatestTerm) || 0), 0
  ) / totalStudents
  
  const avgPerformance = students.reduce((sum, s) => 
    sum + (parseFloat(s.AvgMarks_LatestTerm) || 0), 0
  ) / totalStudents

  return {
    total_students: totalStudents,
    at_risk_students: atRiskStudents,
    avg_attendance: Math.round(avgAttendance * 100) / 100,
    avg_performance: Math.round(avgPerformance * 100) / 100,
    risk_percentage: totalStudents > 0 ? Math.round((atRiskStudents / totalStudents) * 100) : 0
  }
}

function generateChartData(config: any, students: any[]) {
  const { dataSource, chartType } = config

  switch (dataSource) {
    case 'risk_distribution':
      const riskDistribution = {
        Critical: students.filter(s => s.RiskLevel === 'Critical').length,
        High: students.filter(s => s.RiskLevel === 'High').length,
        Medium: students.filter(s => s.RiskLevel === 'Medium').length,
        Low: students.filter(s => s.RiskLevel === 'Low').length
      }
      return {
        labels: Object.keys(riskDistribution),
        values: Object.values(riskDistribution),
        data: Object.entries(riskDistribution).map(([label, value]) => ({
          label,
          value,
          percentage: students.length > 0 ? Math.round((value as number / students.length) * 100) : 0
        }))
      }

    case 'attendance_trends':
      // Generate mock attendance trends
      const trends = []
      for (let i = 29; i >= 0; i--) {
        const date = new Date('2025-01-09')
        date.setDate(date.getDate() - i)
        trends.push({
          date: date.toISOString().split('T')[0],
          attendance: Math.round((Math.random() * 20 + 75) * 100) / 100
        })
      }
      return {
        labels: trends.map(t => t.date),
        values: trends.map(t => t.attendance),
        data: trends
      }

    case 'class_performance':
      const classPerformance: any = {}
      students.forEach(student => {
        const classLevel = student.StudentClass || 'Unknown'
        if (!classPerformance[classLevel]) {
          classPerformance[classLevel] = { total: 0, sum: 0 }
        }
        classPerformance[classLevel].total++
        classPerformance[classLevel].sum += parseFloat(student.AvgMarks_LatestTerm) || 0
      })
      
      const classData = Object.entries(classPerformance).map(([classLevel, data]: [string, any]) => ({
        label: `Class ${classLevel}`,
        value: Math.round((data.sum / data.total) * 100) / 100
      }))
      
      return {
        labels: classData.map(d => d.label),
        values: classData.map(d => d.value),
        data: classData
      }

    case 'daily_attendance':
      const dailyAttendance = []
      for (let i = 29; i >= 0; i--) {
        const date = new Date('2025-01-09')
        date.setDate(date.getDate() - i)
        dailyAttendance.push({
          date: date.toISOString().split('T')[0],
          attendance: Math.round((Math.random() * 15 + 80) * 100) / 100
        })
      }
      return {
        labels: dailyAttendance.map(d => d.date),
        values: dailyAttendance.map(d => d.attendance),
        data: dailyAttendance
      }

    default:
      return { labels: [], values: [], data: [] }
  }
}

function generateTableData(config: any, students: any[]) {
  const { columns = [], sortBy, sortOrder = 'asc', limit = 100 } = config
  
  // Sort students
  let sortedStudents = [...students]
  if (sortBy) {
    sortedStudents.sort((a, b) => {
      const aValue = getStudentFieldValue(a, sortBy)
      const bValue = getStudentFieldValue(b, sortBy)
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1
      } else {
        return aValue > bValue ? 1 : -1
      }
    })
  }
  
  // Apply limit
  sortedStudents = sortedStudents.slice(0, limit)
  
  // Format data for table
  const tableData = sortedStudents.map(student => {
    const row: any = {}
    columns.forEach((column: string) => {
      row[column] = getStudentFieldValue(student, column)
    })
    return row
  })
  
  return {
    columns: columns.map((col: string) => ({
      key: col,
      label: col.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
    })),
    data: tableData,
    totalRows: students.length,
    displayedRows: tableData.length
  }
}

function generateMetricsData(config: any, students: any[]) {
  const { metrics = [] } = config
  const totalStudents = students.length
  
  const metricsData: any = {}
  
  metrics.forEach((metric: any) => {
    switch (metric.key) {
      case 'total_students':
        metricsData[metric.key] = {
          value: totalStudents,
          label: metric.label,
          format: metric.format
        }
        break
        
      case 'avg_attendance':
        const avgAttendance = students.reduce((sum, s) => 
          sum + (parseFloat(s.AvgAttendance_LatestTerm) || 0), 0
        ) / totalStudents
        metricsData[metric.key] = {
          value: Math.round(avgAttendance * 100) / 100,
          label: metric.label,
          format: metric.format
        }
        break
        
      case 'avg_performance':
        const avgPerformance = students.reduce((sum, s) => 
          sum + (parseFloat(s.AvgMarks_LatestTerm) || 0), 0
        ) / totalStudents
        metricsData[metric.key] = {
          value: Math.round(avgPerformance * 100) / 100,
          label: metric.label,
          format: metric.format
        }
        break
        
      case 'at_risk_count':
        const atRiskCount = students.filter(s => 
          s.RiskLevel === 'High' || s.RiskLevel === 'Critical'
        ).length
        metricsData[metric.key] = {
          value: atRiskCount,
          label: metric.label,
          format: metric.format
        }
        break
        
      default:
        metricsData[metric.key] = {
          value: 0,
          label: metric.label,
          format: metric.format
        }
    }
  })
  
  return metricsData
}
