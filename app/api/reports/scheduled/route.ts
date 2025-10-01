import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Mock scheduled reports data - in a real app, this would be stored in database
let scheduledReports = [
  {
    id: 'sched_001',
    name: 'Weekly Risk Analysis Report',
    type: 'risk-analysis',
    frequency: 'weekly',
    dayOfWeek: 'Monday',
    time: '09:00',
    recipients: ['admin@school.edu', 'principal@school.edu'],
    isActive: true,
    lastRun: '2025-01-22T09:00:00Z',
    nextRun: '2025-01-29T09:00:00Z',
    createdBy: 'admin',
    createdAt: '2025-01-15T10:00:00Z'
  },
  {
    id: 'sched_002',
    name: 'Monthly Performance Summary',
    type: 'performance',
    frequency: 'monthly',
    dayOfMonth: 1,
    time: '08:00',
    recipients: ['admin@school.edu', 'teachers@school.edu'],
    isActive: true,
    lastRun: '2025-01-01T08:00:00Z',
    nextRun: '2025-02-01T08:00:00Z',
    createdBy: 'admin',
    createdAt: '2025-01-01T08:00:00Z'
  },
  {
    id: 'sched_003',
    name: 'Daily Attendance Alert',
    type: 'attendance',
    frequency: 'daily',
    time: '16:00',
    recipients: ['admin@school.edu'],
    isActive: true,
    lastRun: '2025-01-21T16:00:00Z',
    nextRun: '2025-01-22T16:00:00Z',
    createdBy: 'admin',
    createdAt: '2025-01-10T14:00:00Z'
  },
  {
    id: 'sched_004',
    name: 'Quarterly Mentor Review',
    type: 'mentor-effectiveness',
    frequency: 'quarterly',
    dayOfMonth: 1,
    time: '10:00',
    recipients: ['admin@school.edu', 'hr@school.edu'],
    isActive: false,
    lastRun: '2023-10-01T10:00:00Z',
    nextRun: '2025-04-01T10:00:00Z',
    createdBy: 'admin',
    createdAt: '2023-10-01T10:00:00Z'
  },
  {
    id: 'sched_005',
    name: 'Weekly Student Progress',
    type: 'performance',
    frequency: 'weekly',
    dayOfWeek: 'Friday',
    time: '17:00',
    recipients: ['teachers@school.edu'],
    isActive: true,
    lastRun: '2025-01-19T17:00:00Z',
    nextRun: '2025-01-26T17:00:00Z',
    createdBy: 'teacher',
    createdAt: '2025-01-12T15:30:00Z'
  }
]

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') // active, inactive, all
    const frequency = searchParams.get('frequency') // daily, weekly, monthly, quarterly

    let filteredReports = scheduledReports

    if (status === 'active') {
      filteredReports = filteredReports.filter(report => report.isActive)
    } else if (status === 'inactive') {
      filteredReports = filteredReports.filter(report => !report.isActive)
    }

    if (frequency) {
      filteredReports = filteredReports.filter(report => report.frequency === frequency)
    }

    // Sort by next run date
    filteredReports.sort((a, b) => new Date(a.nextRun).getTime() - new Date(b.nextRun).getTime())

    return NextResponse.json({
      success: true,
      data: {
        reports: filteredReports,
        summary: {
          total: scheduledReports.length,
          active: scheduledReports.filter(r => r.isActive).length,
          inactive: scheduledReports.filter(r => !r.isActive).length,
          nextScheduled: scheduledReports
            .filter(r => r.isActive)
            .sort((a, b) => new Date(a.nextRun).getTime() - new Date(b.nextRun).getTime())[0]
        }
      }
    })

  } catch (error) {
    console.error('Error fetching scheduled reports:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch scheduled reports'
    }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, type, frequency, time, recipients, dayOfWeek, dayOfMonth } = body

    // Validate required fields
    if (!name || !type || !frequency || !time || !recipients) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 })
    }

    // Generate next run date based on frequency
    const nextRun = calculateNextRun(frequency, dayOfWeek, dayOfMonth, time)

    const newReport = {
      id: `sched_${Date.now()}`,
      name,
      type,
      frequency,
      time,
      recipients,
      dayOfWeek: frequency === 'weekly' ? dayOfWeek : undefined,
      dayOfMonth: frequency === 'monthly' || frequency === 'quarterly' ? dayOfMonth : undefined,
      isActive: true,
      lastRun: null,
      nextRun: nextRun.toISOString(),
      createdBy: 'admin', // In real app, get from auth
      createdAt: new Date('2025-01-09').toISOString()
    }

    scheduledReports.push(newReport)

    return NextResponse.json({
      success: true,
      data: newReport
    })

  } catch (error) {
    console.error('Error creating scheduled report:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create scheduled report'
    }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...updates } = body

    const reportIndex = scheduledReports.findIndex(report => report.id === id)
    if (reportIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Report not found'
      }, { status: 404 })
    }

    // Update the report
    const updatedReport = {
      ...scheduledReports[reportIndex],
      ...updates,
      updatedAt: new Date('2025-01-09').toISOString()
    }

    // Recalculate next run if frequency or timing changed
    if (updates.frequency || updates.time || updates.dayOfWeek || updates.dayOfMonth) {
      updatedReport.nextRun = calculateNextRun(
        updatedReport.frequency,
        updatedReport.dayOfWeek,
        updatedReport.dayOfMonth,
        updatedReport.time
      ).toISOString()
    }

    scheduledReports[reportIndex] = updatedReport

    return NextResponse.json({
      success: true,
      data: updatedReport
    })

  } catch (error) {
    console.error('Error updating scheduled report:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update scheduled report'
    }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Report ID is required'
      }, { status: 400 })
    }

    const reportIndex = scheduledReports.findIndex(report => report.id === id)
    if (reportIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Report not found'
      }, { status: 404 })
    }

    scheduledReports.splice(reportIndex, 1)

    return NextResponse.json({
      success: true,
      message: 'Scheduled report deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting scheduled report:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete scheduled report'
    }, { status: 500 })
  }
}

function calculateNextRun(frequency: string, dayOfWeek?: string, dayOfMonth?: number, time?: string): Date {
  const now = new Date('2025-01-09') // Set to current date
  const [hours, minutes] = time ? time.split(':').map(Number) : [9, 0]
  
  let nextRun = new Date('2025-01-09') // Set to current date
  nextRun.setHours(hours, minutes, 0, 0)

  switch (frequency) {
    case 'daily':
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1)
      }
      break
      
    case 'weekly':
      const targetDay = getDayNumber(dayOfWeek || 'Monday')
      const currentDay = nextRun.getDay()
      const daysUntilTarget = (targetDay - currentDay + 7) % 7
      
      if (daysUntilTarget === 0 && nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 7)
      } else {
        nextRun.setDate(nextRun.getDate() + daysUntilTarget)
      }
      break
      
    case 'monthly':
      const targetDayOfMonth = dayOfMonth || 1
      nextRun.setDate(targetDayOfMonth)
      
      if (nextRun <= now) {
        nextRun.setMonth(nextRun.getMonth() + 1)
      }
      break
      
    case 'quarterly':
      const quarterDay = dayOfMonth || 1
      nextRun.setDate(quarterDay)
      
      // Find next quarter
      const currentQuarter = Math.floor(nextRun.getMonth() / 3)
      let nextQuarter = currentQuarter + 1
      if (nextQuarter > 3) {
        nextQuarter = 0
        nextRun.setFullYear(nextRun.getFullYear() + 1)
      }
      
      nextRun.setMonth(nextQuarter * 3)
      
      if (nextRun <= now) {
        nextQuarter = nextQuarter + 1
        if (nextQuarter > 3) {
          nextQuarter = 0
          nextRun.setFullYear(nextRun.getFullYear() + 1)
        }
        nextRun.setMonth(nextQuarter * 3)
      }
      break
  }

  return nextRun
}

function getDayNumber(dayName: string): number {
  const days = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6
  }
  return days[dayName] || 1
}
