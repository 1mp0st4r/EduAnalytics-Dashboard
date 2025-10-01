// Comprehensive logging system for the application
import fs from 'fs'
import path from 'path'

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

class Logger {
  private logDir: string
  private maxFileSize: number
  private maxFiles: number

  constructor() {
    this.logDir = path.join(process.cwd(), 'logs')
    this.maxFileSize = 10 * 1024 * 1024 // 10MB
    this.maxFiles = 5
    
    // Ensure log directory exists
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true })
    }
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

  private writeToFile(level: LogLevel, message: string, context?: string, metadata?: Record<string, any>, error?: Error, userId?: string, requestId?: string) {
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

    const logLine = this.formatLogEntry(logEntry)
    const fileName = `${level.toLowerCase()}.log`
    const filePath = path.join(this.logDir, fileName)

    // Write to file
    fs.appendFileSync(filePath, logLine + '\n')

    // Rotate log file if it's too large
    this.rotateLogFile(filePath)

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      const consoleMessage = `[${timestamp}] ${level}: ${message}`
      if (context) console.log(`${consoleMessage} (${context})`)
      else console.log(consoleMessage)
      
      if (error) console.error(error)
      if (metadata) console.log('Metadata:', metadata)
    }
  }

  private rotateLogFile(filePath: string) {
    try {
      const stats = fs.statSync(filePath)
      if (stats.size > this.maxFileSize) {
        // Move current file to .1, .2, etc.
        for (let i = this.maxFiles - 1; i > 0; i--) {
          const oldFile = `${filePath}.${i}`
          const newFile = `${filePath}.${i + 1}`
          if (fs.existsSync(oldFile)) {
            fs.renameSync(oldFile, newFile)
          }
        }
        
        // Move current file to .1
        fs.renameSync(filePath, `${filePath}.1`)
      }
    } catch (error) {
      // Ignore rotation errors
    }
  }

  error(message: string, error?: Error, context?: string, metadata?: Record<string, any>, userId?: string, requestId?: string) {
    this.writeToFile(LogLevel.ERROR, message, context, metadata, error, userId, requestId)
  }

  warn(message: string, context?: string, metadata?: Record<string, any>, userId?: string, requestId?: string) {
    this.writeToFile(LogLevel.WARN, message, context, metadata, undefined, userId, requestId)
  }

  info(message: string, context?: string, metadata?: Record<string, any>, userId?: string, requestId?: string) {
    this.writeToFile(LogLevel.INFO, message, context, metadata, undefined, userId, requestId)
  }

  debug(message: string, context?: string, metadata?: Record<string, any>, userId?: string, requestId?: string) {
    this.writeToFile(LogLevel.DEBUG, message, context, metadata, undefined, userId, requestId)
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

  // Database-specific logging methods
  dbQuery(query: string, params?: any[], duration?: number, userId?: string, requestId?: string) {
    this.debug(`DB Query: ${query}`, 'DATABASE', { query, params, duration }, userId, requestId)
  }

  dbError(query: string, error: Error, params?: any[], userId?: string, requestId?: string) {
    this.error(`DB Error: ${query}`, error, 'DATABASE', { query, params }, userId, requestId)
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
export const logger = new Logger()

// Utility function to generate request ID
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Utility function to extract user ID from request
export function extractUserIdFromRequest(request: any): string | undefined {
  // This would be implemented based on your authentication middleware
  return request.user?.id || request.userId
}
