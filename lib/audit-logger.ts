/**
 * Audit Logging System
 * Tracks all user actions and system events for compliance and security
 */

export interface AuditEvent {
  id: string
  timestamp: string
  userId: string
  userEmail: string
  userRole: string
  action: string
  resource: string
  resourceId?: string
  details: {
    method?: string
    endpoint?: string
    ipAddress?: string
    userAgent?: string
    requestBody?: any
    responseStatus?: number
    errorMessage?: string
    changes?: any
    metadata?: any
  }
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'authentication' | 'authorization' | 'data_access' | 'data_modification' | 'system' | 'security'
  success: boolean
}

export interface AuditFilter {
  userId?: string
  action?: string
  resource?: string
  category?: string
  severity?: string
  success?: boolean
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

export class AuditLogger {
  private static instance: AuditLogger
  private events: AuditEvent[] = []
  private maxEvents = 10000 // Keep last 10k events in memory

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger()
    }
    return AuditLogger.instance
  }

  /**
   * Log an audit event
   */
  log(event: Omit<AuditEvent, 'id' | 'timestamp'>): void {
    const auditEvent: AuditEvent = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      ...event
    }

    this.events.unshift(auditEvent) // Add to beginning of array

    // Keep only the most recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents)
    }

    // In production, also send to external logging service
    this.sendToExternalLogging(auditEvent)
  }

  /**
   * Log authentication events
   */
  logAuthentication(userId: string, userEmail: string, userRole: string, action: string, success: boolean, details: any = {}): void {
    this.log({
      userId,
      userEmail,
      userRole,
      action,
      resource: 'authentication',
      details,
      severity: success ? 'low' : 'high',
      category: 'authentication',
      success
    })
  }

  /**
   * Log data access events
   */
  logDataAccess(userId: string, userEmail: string, userRole: string, resource: string, resourceId: string, details: any = {}): void {
    this.log({
      userId,
      userEmail,
      userRole,
      action: 'read',
      resource,
      resourceId,
      details,
      severity: 'low',
      category: 'data_access',
      success: true
    })
  }

  /**
   * Log data modification events
   */
  logDataModification(
    userId: string, 
    userEmail: string, 
    userRole: string, 
    action: string, 
    resource: string, 
    resourceId: string, 
    changes: any, 
    details: any = {}
  ): void {
    this.log({
      userId,
      userEmail,
      userRole,
      action,
      resource,
      resourceId,
      details: { ...details, changes },
      severity: action === 'delete' ? 'high' : 'medium',
      category: 'data_modification',
      success: true
    })
  }

  /**
   * Log authorization failures
   */
  logAuthorizationFailure(userId: string, userEmail: string, userRole: string, resource: string, action: string, details: any = {}): void {
    this.log({
      userId,
      userEmail,
      userRole,
      action,
      resource,
      details,
      severity: 'high',
      category: 'authorization',
      success: false
    })
  }

  /**
   * Log security events
   */
  logSecurityEvent(userId: string, userEmail: string, userRole: string, action: string, details: any = {}): void {
    this.log({
      userId,
      userEmail,
      userRole,
      action,
      resource: 'security',
      details,
      severity: 'critical',
      category: 'security',
      success: false
    })
  }

  /**
   * Log system events
   */
  logSystemEvent(action: string, details: any = {}): void {
    this.log({
      userId: 'system',
      userEmail: 'system@eduanalytics.com',
      userRole: 'system',
      action,
      resource: 'system',
      details,
      severity: 'medium',
      category: 'system',
      success: true
    })
  }

  /**
   * Get audit events with filtering
   */
  getEvents(filter: AuditFilter = {}): { events: AuditEvent[], total: number } {
    let filteredEvents = [...this.events]

    // Apply filters
    if (filter.userId) {
      filteredEvents = filteredEvents.filter(event => event.userId === filter.userId)
    }

    if (filter.action) {
      filteredEvents = filteredEvents.filter(event => event.action === filter.action)
    }

    if (filter.resource) {
      filteredEvents = filteredEvents.filter(event => event.resource === filter.resource)
    }

    if (filter.category) {
      filteredEvents = filteredEvents.filter(event => event.category === filter.category)
    }

    if (filter.severity) {
      filteredEvents = filteredEvents.filter(event => event.severity === filter.severity)
    }

    if (filter.success !== undefined) {
      filteredEvents = filteredEvents.filter(event => event.success === filter.success)
    }

    if (filter.startDate) {
      filteredEvents = filteredEvents.filter(event => event.timestamp >= filter.startDate!)
    }

    if (filter.endDate) {
      filteredEvents = filteredEvents.filter(event => event.timestamp <= filter.endDate!)
    }

    const total = filteredEvents.length

    // Apply pagination
    if (filter.offset) {
      filteredEvents = filteredEvents.slice(filter.offset)
    }

    if (filter.limit) {
      filteredEvents = filteredEvents.slice(0, filter.limit)
    }

    return { events: filteredEvents, total }
  }

  /**
   * Get audit statistics
   */
  getStatistics(timeframe: 'day' | 'week' | 'month' = 'day'): any {
    const now = new Date()
    const startTime = new Date(now.getTime() - this.getTimeframeMs(timeframe))
    
    const recentEvents = this.events.filter(event => 
      new Date(event.timestamp) >= startTime
    )

    const stats = {
      total: recentEvents.length,
      byCategory: {} as { [key: string]: number },
      bySeverity: {} as { [key: string]: number },
      bySuccess: { success: 0, failure: 0 },
      byUser: {} as { [key: string]: number },
      topActions: {} as { [key: string]: number },
      hourlyDistribution: new Array(24).fill(0)
    }

    recentEvents.forEach(event => {
      // Category stats
      stats.byCategory[event.category] = (stats.byCategory[event.category] || 0) + 1
      
      // Severity stats
      stats.bySeverity[event.severity] = (stats.bySeverity[event.severity] || 0) + 1
      
      // Success stats
      if (event.success) {
        stats.bySuccess.success++
      } else {
        stats.bySuccess.failure++
      }
      
      // User stats
      stats.byUser[event.userId] = (stats.byUser[event.userId] || 0) + 1
      
      // Action stats
      stats.topActions[event.action] = (stats.topActions[event.action] || 0) + 1
      
      // Hourly distribution
      const hour = new Date(event.timestamp).getHours()
      stats.hourlyDistribution[hour]++
    })

    return stats
  }

  /**
   * Search audit events
   */
  searchEvents(query: string, filter: AuditFilter = {}): AuditEvent[] {
    const { events } = this.getEvents(filter)
    
    const searchTerm = query.toLowerCase()
    return events.filter(event => 
      event.action.toLowerCase().includes(searchTerm) ||
      event.resource.toLowerCase().includes(searchTerm) ||
      event.userEmail.toLowerCase().includes(searchTerm) ||
      event.details.endpoint?.toLowerCase().includes(searchTerm) ||
      JSON.stringify(event.details).toLowerCase().includes(searchTerm)
    )
  }

  /**
   * Get events for a specific user
   */
  getUserEvents(userId: string, limit: number = 100): AuditEvent[] {
    return this.events
      .filter(event => event.userId === userId)
      .slice(0, limit)
  }

  /**
   * Get failed login attempts
   */
  getFailedLogins(timeframe: 'day' | 'week' | 'month' = 'day'): AuditEvent[] {
    const now = new Date()
    const startTime = new Date(now.getTime() - this.getTimeframeMs(timeframe))
    
    return this.events.filter(event => 
      event.category === 'authentication' &&
      event.action === 'login' &&
      !event.success &&
      new Date(event.timestamp) >= startTime
    )
  }

  /**
   * Get suspicious activities
   */
  getSuspiciousActivities(): AuditEvent[] {
    return this.events.filter(event => 
      event.severity === 'critical' ||
      event.category === 'security' ||
      (!event.success && event.category === 'authorization')
    )
  }

  /**
   * Clear old events (for maintenance)
   */
  clearOldEvents(daysToKeep: number = 30): void {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000)
    this.events = this.events.filter(event => new Date(event.timestamp) > cutoffDate)
  }

  /**
   * Export audit logs
   */
  exportLogs(format: 'json' | 'csv' = 'json', filter: AuditFilter = {}): string {
    const { events } = this.getEvents(filter)
    
    if (format === 'csv') {
      const headers = ['timestamp', 'userId', 'userEmail', 'userRole', 'action', 'resource', 'resourceId', 'severity', 'category', 'success']
      const csvRows = events.map(event => [
        event.timestamp,
        event.userId,
        event.userEmail,
        event.userRole,
        event.action,
        event.resource,
        event.resourceId || '',
        event.severity,
        event.category,
        event.success.toString()
      ])
      
      return [headers, ...csvRows].map(row => row.join(',')).join('\n')
    }
    
    return JSON.stringify(events, null, 2)
  }

  /**
   * Generate unique ID for audit events
   */
  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get timeframe in milliseconds
   */
  private getTimeframeMs(timeframe: 'day' | 'week' | 'month'): number {
    switch (timeframe) {
      case 'day': return 24 * 60 * 60 * 1000
      case 'week': return 7 * 24 * 60 * 60 * 1000
      case 'month': return 30 * 24 * 60 * 60 * 1000
      default: return 24 * 60 * 60 * 1000
    }
  }

  /**
   * Send to external logging service (implement based on your needs)
   */
  private sendToExternalLogging(event: AuditEvent): void {
    // In production, implement integration with external logging services like:
    // - AWS CloudWatch
    // - Google Cloud Logging
    // - Splunk
    // - ELK Stack
    // - Datadog
    
    console.log('[AUDIT]', JSON.stringify(event, null, 2))
  }
}

// Export singleton instance
export const auditLogger = AuditLogger.getInstance()

// Middleware helper for API routes
export function auditMiddleware(
  action: string,
  resource: string,
  options: {
    logRequestBody?: boolean
    logResponseBody?: boolean
    severity?: 'low' | 'medium' | 'high' | 'critical'
    category?: 'authentication' | 'authorization' | 'data_access' | 'data_modification' | 'system' | 'security'
  } = {}
) {
  return function(req: any, res: any, next?: any) {
    const startTime = Date.now()
    
    // Store original methods
    const originalSend = res.send
    const originalJson = res.json
    
    let responseBody: any
    
    // Override response methods to capture response body
    res.send = function(body: any) {
      responseBody = body
      return originalSend.call(this, body)
    }
    
    res.json = function(body: any) {
      responseBody = body
      return originalJson.call(this, body)
    }
    
    // Log on response finish
    res.on('finish', () => {
      const duration = Date.now() - startTime
      const userId = req.user?.id || 'anonymous'
      const userEmail = req.user?.email || 'anonymous@example.com'
      const userRole = req.user?.userType || 'anonymous'
      
      const details = {
        method: req.method,
        endpoint: req.url,
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
        responseStatus: res.statusCode,
        duration,
        ...(options.logRequestBody && { requestBody: req.body }),
        ...(options.logResponseBody && { responseBody })
      }
      
      const success = res.statusCode >= 200 && res.statusCode < 400
      
      auditLogger.log({
        userId,
        userEmail,
        userRole,
        action,
        resource,
        details,
        severity: options.severity || (success ? 'low' : 'high'),
        category: options.category || 'data_access',
        success
      })
    })
    
    if (next) next()
  }
}
