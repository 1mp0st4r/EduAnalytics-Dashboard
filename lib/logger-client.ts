// Client-side logging system for the application
export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: string
  userId?: string
  requestId?: string
  error?: {
    name: string
    message: string
    stack?: string
  }
  metadata?: Record<string, any>
}

class ClientLogger {
  private isDevelopment: boolean

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
  }

  private formatLogEntry(entry: LogEntry): string {
    const logLine = {
      timestamp: entry.timestamp,
      level: entry.level,
      message: entry.message,
      ...(entry.context && { context: entry.context }),
      ...(entry.userId && { userId: entry.userId }),
      ...(entry.requestId && { requestId: entry.requestId }),
      ...(entry.error && { error: entry.error }),
      ...(entry.metadata && { metadata: entry.metadata })
    }
    
    return JSON.stringify(logLine)
  }

  private logToConsole(level: LogLevel, message: string, context?: string, metadata?: Record<string, any>, error?: Error) {
    const timestamp = new Date().toISOString()
    const consoleMessage = `[${timestamp}] ${level}: ${message}`
    
    if (context) {
      console.log(`${consoleMessage} (${context})`)
    } else {
      console.log(consoleMessage)
    }
    
    if (error) {
      console.error(error)
    }
    
    if (metadata) {
      console.log('Metadata:', metadata)
    }
  }

  private async sendToServer(entry: LogEntry) {
    try {
      // Send logs to server-side logging endpoint
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry)
      })
    } catch (error) {
      // Silently fail for logging errors
      console.warn('Failed to send log to server:', error)
    }
  }

  private async writeLog(level: LogLevel, message: string, context?: string, metadata?: Record<string, any>, error?: Error, userId?: string, requestId?: string) {
    const timestamp = new Date().toISOString()
    const logEntry: LogEntry = {
      timestamp,
      level,
      message,
      ...(context && { context }),
      ...(userId && { userId }),
      ...(requestId && { requestId }),
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      }),
      ...(metadata && { metadata })
    }

    // Always log to console in development
    if (this.isDevelopment) {
      this.logToConsole(level, message, context, metadata, error)
    }

    // Send to server for persistent logging
    await this.sendToServer(logEntry)
  }

  error(message: string, error?: Error, context?: string, metadata?: Record<string, any>, userId?: string, requestId?: string) {
    this.writeLog(LogLevel.ERROR, message, context, metadata, error, userId, requestId)
  }

  warn(message: string, context?: string, metadata?: Record<string, any>, userId?: string, requestId?: string) {
    this.writeLog(LogLevel.WARN, message, context, metadata, undefined, userId, requestId)
  }

  info(message: string, context?: string, metadata?: Record<string, any>, userId?: string, requestId?: string) {
    this.writeLog(LogLevel.INFO, message, context, metadata, undefined, userId, requestId)
  }

  debug(message: string, context?: string, metadata?: Record<string, any>, userId?: string, requestId?: string) {
    this.writeLog(LogLevel.DEBUG, message, context, metadata, undefined, userId, requestId)
  }

  // API-specific logging methods
  apiRequest(method: string, url: string, userId?: string, requestId?: string, metadata?: Record<string, any>) {
    this.info(`API Request: ${method} ${url}`, 'API', { method, url, ...metadata }, userId, requestId)
  }

  apiResponse(method: string, url: string, statusCode: number, responseTime: number, userId?: string, requestId?: string) {
    this.info(`API Response: ${method} ${url} - ${statusCode} (${responseTime}ms)`, 'API', { method, url, statusCode, responseTime }, userId, requestId)
  }

  apiError(method: string, url: string, error: Error, statusCode: number, userId?: string, requestId?: string, metadata?: Record<string, any>) {
    this.error(`API Error: ${method} ${url} - ${statusCode}`, error, 'API', { method, url, statusCode, ...metadata }, userId, requestId)
  }

  // Authentication-specific logging methods
  authSuccess(userId: string, userType: string, method: string, requestId?: string) {
    this.info(`Authentication successful: ${method}`, 'AUTH', { userId, userType, method }, userId, requestId)
  }

  authFailure(email: string, method: string, reason: string, requestId?: string) {
    this.warn(`Authentication failed: ${method}`, 'AUTH', { email, method, reason }, undefined, requestId)
  }

  // Security-specific logging methods
  securityEvent(event: string, details: Record<string, any>, userId?: string, requestId?: string) {
    this.warn(`Security Event: ${event}`, 'SECURITY', details, userId, requestId)
  }

  // Business logic logging methods
  studentAction(action: string, studentId: string, details: Record<string, any>, userId?: string, requestId?: string) {
    this.info(`Student Action: ${action}`, 'STUDENT', { studentId, ...details }, userId, requestId)
  }

  riskAssessment(studentId: string, riskLevel: string, score: number, userId?: string, requestId?: string) {
    this.info(`Risk Assessment: ${studentId} - ${riskLevel} (${score})`, 'RISK', { studentId, riskLevel, score }, userId, requestId)
  }
}

// Create singleton instance
export const logger = new ClientLogger()

// Utility function to generate request ID
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Utility function to extract user ID from localStorage or context
export function extractUserIdFromClient(): string | undefined {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        return user.id
      } catch (error) {
        return undefined
      }
    }
  }
  return undefined
}
