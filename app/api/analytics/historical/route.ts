import { NextRequest, NextResponse } from 'next/server'
import { analyticsService } from '../../../../lib/analytics-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const classLevel = searchParams.get('class')
    const days = parseInt(searchParams.get('days') || '30')

    if (!studentId && !classLevel) {
      return NextResponse.json(
        { error: 'Student ID or class level required' },
        { status: 400 }
      )
    }

    if (studentId) {
      // Get individual student analytics
      const analytics = await analyticsService.getStudentAnalytics(studentId)
      const historicalData = await analyticsService.getHistoricalData(studentId, days)

      return NextResponse.json({
        success: true,
        data: {
          analytics,
          historicalData
        }
      })
    }

    if (classLevel) {
      // Get class-level analytics
      const classAnalytics = await analyticsService.getClassAnalytics(classLevel)

      return NextResponse.json({
        success: true,
        data: classAnalytics
      })
    }

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, date, attendance, performance, riskScore, riskLevel } = body

    if (!studentId || !date) {
      return NextResponse.json(
        { error: 'Student ID and date are required' },
        { status: 400 }
      )
    }

    // Add new data point
    await analyticsService.addDataPoint({
      studentId,
      date,
      attendance: attendance || 0,
      performance: performance || 0,
      riskScore: riskScore || 0,
      riskLevel: riskLevel || 'Unknown'
    })

    return NextResponse.json({
      success: true,
      message: 'Data point added successfully'
    })

  } catch (error) {
    console.error('Analytics POST error:', error)
    return NextResponse.json(
      { error: 'Failed to add data point' },
      { status: 500 }
    )
  }
}
