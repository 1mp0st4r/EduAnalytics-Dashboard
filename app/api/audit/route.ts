import { NextRequest, NextResponse } from "next/server"
import { auditLogger } from "../../../lib/audit-logger"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    switch (action) {
      case 'events':
        return await getAuditEvents(request)
      case 'statistics':
        return await getAuditStatistics(request)
      case 'search':
        return await searchAuditEvents(request)
      case 'export':
        return await exportAuditLogs(request)
      case 'failed-logins':
        return await getFailedLogins(request)
      case 'suspicious':
        return await getSuspiciousActivities(request)
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action parameter' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('[API] Error in audit endpoint:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getAuditEvents(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const filter = {
    userId: searchParams.get('userId') || undefined,
    action: searchParams.get('action') || undefined,
    resource: searchParams.get('resource') || undefined,
    category: searchParams.get('category') || undefined,
    severity: searchParams.get('severity') || undefined,
    success: searchParams.get('success') ? searchParams.get('success') === 'true' : undefined,
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
    offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined
  }

  const { events, total } = auditLogger.getEvents(filter)

  return NextResponse.json({
    success: true,
    data: {
      events,
      total,
      hasMore: filter.limit && filter.offset ? 
        (filter.offset + events.length) < total : false
    }
  })
}

async function getAuditStatistics(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const timeframe = (searchParams.get('timeframe') as 'day' | 'week' | 'month') || 'day'

  const statistics = auditLogger.getStatistics(timeframe)

  return NextResponse.json({
    success: true,
    data: statistics,
    timeframe
  })
}

async function searchAuditEvents(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')
  
  if (!query) {
    return NextResponse.json(
      { success: false, error: 'Query parameter is required' },
      { status: 400 }
    )
  }

  const filter = {
    userId: searchParams.get('userId') || undefined,
    action: searchParams.get('action') || undefined,
    resource: searchParams.get('resource') || undefined,
    category: searchParams.get('category') || undefined,
    severity: searchParams.get('severity') || undefined,
    success: searchParams.get('success') ? searchParams.get('success') === 'true' : undefined,
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
    offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined
  }

  const events = auditLogger.searchEvents(query, filter)

  return NextResponse.json({
    success: true,
    data: {
      events,
      query,
      total: events.length
    }
  })
}

async function exportAuditLogs(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const format = (searchParams.get('format') as 'json' | 'csv') || 'json'
  
  const filter = {
    userId: searchParams.get('userId') || undefined,
    action: searchParams.get('action') || undefined,
    resource: searchParams.get('resource') || undefined,
    category: searchParams.get('category') || undefined,
    severity: searchParams.get('severity') || undefined,
    success: searchParams.get('success') ? searchParams.get('success') === 'true' : undefined,
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined
  }

  const exportedData = auditLogger.exportLogs(format, filter)
  const filename = `audit_logs_${new Date().toISOString().split('T')[0]}.${format}`

  return new NextResponse(exportedData, {
    status: 200,
    headers: {
      'Content-Type': format === 'csv' ? 'text/csv' : 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-cache'
    }
  })
}

async function getFailedLogins(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const timeframe = (searchParams.get('timeframe') as 'day' | 'week' | 'month') || 'day'

  const failedLogins = auditLogger.getFailedLogins(timeframe)

  return NextResponse.json({
    success: true,
    data: failedLogins,
    timeframe,
    count: failedLogins.length
  })
}

async function getSuspiciousActivities(request: NextRequest) {
  const suspiciousActivities = auditLogger.getSuspiciousActivities()

  return NextResponse.json({
    success: true,
    data: suspiciousActivities,
    count: suspiciousActivities.length
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId, userEmail, userRole, resource, resourceId, details } = body

    if (!action || !userId || !userEmail || !userRole || !resource) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Log the audit event
    auditLogger.log({
      userId,
      userEmail,
      userRole,
      action,
      resource,
      resourceId,
      details: details || {},
      severity: 'medium',
      category: 'system',
      success: true
    })

    return NextResponse.json({
      success: true,
      message: 'Audit event logged successfully'
    })

  } catch (error) {
    console.error('[API] Error logging audit event:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to log audit event' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const daysToKeep = searchParams.get('daysToKeep') ? 
      parseInt(searchParams.get('daysToKeep')!) : 30

    // Clear old events
    auditLogger.clearOldEvents(daysToKeep)

    return NextResponse.json({
      success: true,
      message: `Cleared audit events older than ${daysToKeep} days`
    })

  } catch (error) {
    console.error('[API] Error clearing audit events:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to clear audit events' },
      { status: 500 }
    )
  }
}
