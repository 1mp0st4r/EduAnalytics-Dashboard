// Comprehensive error handling system
import { NextRequest, NextResponse } from 'next/server'

// Simple logger for server-side use
const logger = {
  error: (message: string, error?: Error, context?: string, metadata?: Record<string, any>, userId?: string, requestId?: string) => {
    console.error(`[${new Date().toISOString()}] ERROR: ${message}`, { context, userId, requestId, metadata, error })
  },
  warn: (message: string, context?: string, metadata?: Record<string, any>, userId?: string, requestId?: string) => {
    console.warn(`[${new Date().toISOString()}] WARN: ${message}`, { context, userId, requestId, metadata })
  },
  info: (message: string, context?: string, metadata?: Record<string, any>, userId?: string, requestId?: string) => {
    console.log(`[${new Date().toISOString()}] INFO: ${message}`, { context, userId, requestId, metadata })
  },
  debug: (message: string, context?: string, metadata?: Record<string, any>, userId?: string, requestId?: string) => {
    console.log(`[${new Date().toISOString()}] DEBUG: ${message}`, { context, userId, requestId, metadata })
  },
  apiRequest: (method: string, url: string, userId?: string, requestId?: string, metadata?: Record<string, any>) => {
    console.log(`[${new Date().toISOString()}] API Request: ${method} ${url}`, { userId, requestId, metadata })
  },
  apiResponse: (method: string, url: string, statusCode: number, responseTime: number, userId?: string, requestId?: string) => {
    console.log(`[${new Date().toISOString()}] API Response: ${method} ${url} - ${statusCode} (${responseTime}ms)`, { userId, requestId })
  },
  apiError: (method: string, url: string, error: Error, statusCode: number, userId?: string, requestId?: string, metadata?: Record<string, any>) => {
    console.error(`[${new Date().toISOString()}] API Error: ${method} ${url} - ${statusCode}`, { userId, requestId, metadata, error })
  },
  studentAction: (action: string, studentId: string, details: Record<string, any>, userId?: string, requestId?: string) => {
    console.log(`[${new Date().toISOString()}] Student Action: ${action}`, { studentId, userId, requestId, details })
  }
}

// Utility function to generate request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Utility function to extract user ID from request
function extractUserIdFromRequest(request: any): string | undefined {
  // This would be implemented based on your authentication middleware
  return request.user?.id || request.userId
}

export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  MAINTENANCE_ERROR = 'MAINTENANCE_ERROR'
}

export class AppError extends Error {
  public type: ErrorType
  public statusCode: number
  public isOperational: boolean
  public details?: Record<string, any>
  public requestId?: string

  constructor(
    message: string,
    type: ErrorType,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: Record<string, any>,
    requestId?: string
  ) {
    super(message)
    this.name = 'AppError'
    this.type = type
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.details = details
    this.requestId = requestId

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor)
  }
}

// Specific error classes
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>, requestId?: string) {
    super(message, ErrorType.VALIDATION_ERROR, 400, true, details, requestId)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', requestId?: string) {
    super(message, ErrorType.AUTHENTICATION_ERROR, 401, true, undefined, requestId)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions', requestId?: string) {
    super(message, ErrorType.AUTHORIZATION_ERROR, 403, true, undefined, requestId)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, requestId?: string) {
    super(`${resource} not found`, ErrorType.NOT_FOUND_ERROR, 404, true, { resource }, requestId)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, any>, requestId?: string) {
    super(message, ErrorType.CONFLICT_ERROR, 409, true, details, requestId)
    this.name = 'ConflictError'
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, originalError?: Error, requestId?: string) {
    super(message, ErrorType.DATABASE_ERROR, 500, false, { originalError: originalError?.message }, requestId)
    this.name = 'DatabaseError'
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, requestId?: string) {
    super(`External service error: ${service} - ${message}`, ErrorType.EXTERNAL_SERVICE_ERROR, 502, true, { service }, requestId)
    this.name = 'ExternalServiceError'
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', requestId?: string) {
    super(message, ErrorType.RATE_LIMIT_ERROR, 429, true, undefined, requestId)
    this.name = 'RateLimitError'
  }
}

// Error response formatter
export function formatErrorResponse(error: AppError | Error, requestId?: string): NextResponse {
  const requestIdToUse = requestId || (error as AppError).requestId || generateRequestId()

  // Handle known application errors
  if (error instanceof AppError) {
    logger.error(`Application Error: ${error.message}`, error, 'ERROR_HANDLER', {
      type: error.type,
      statusCode: error.statusCode,
      isOperational: error.isOperational,
      details: error.details
    }, undefined, requestIdToUse)

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        type: error.type,
        ...(error.details && { details: error.details }),
        requestId: requestIdToUse
      },
      { status: error.statusCode }
    )
  }

  // Handle unknown errors
  logger.error(`Unknown Error: ${error.message}`, error, 'ERROR_HANDLER', undefined, undefined, requestIdToUse)

  return NextResponse.json(
    {
      success: false,
      error: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : error.message,
      type: ErrorType.INTERNAL_SERVER_ERROR,
      requestId: requestIdToUse
    },
    { status: 500 }
  )
}

// Error handler wrapper for API routes
export function withErrorHandler(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    const requestId = generateRequestId()
    const userId = extractUserIdFromRequest(request)

    try {
      // Log the request
      logger.apiRequest(
        request.method,
        request.url,
        userId,
        requestId,
        {
          userAgent: request.headers.get('user-agent'),
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
          referer: request.headers.get('referer')
        }
      )

      const startTime = Date.now()
      const response = await handler(request, context)
      const responseTime = Date.now() - startTime

      // Log the response
      logger.apiResponse(
        request.method,
        request.url,
        response.status,
        responseTime,
        userId,
        requestId
      )

      return response
    } catch (error) {
      // Log the error
      logger.apiError(
        request.method,
        request.url,
        error as Error,
        500,
        userId,
        requestId
      )

      return formatErrorResponse(error as Error, requestId)
    }
  }
}

// Database error handler
export function handleDatabaseError(error: any, operation: string, requestId?: string): DatabaseError {
  let message = `Database error during ${operation}`
  
  // Handle specific database error codes
  if (error.code) {
    switch (error.code) {
      case '23505': // Unique constraint violation
        message = `Duplicate entry during ${operation}`
        break
      case '23503': // Foreign key constraint violation
        message = `Referenced record not found during ${operation}`
        break
      case '23502': // Not null constraint violation
        message = `Required field missing during ${operation}`
        break
      case '42P01': // Undefined table
        message = `Database table not found during ${operation}`
        break
      case 'ECONNREFUSED': // Connection refused
        message = `Database connection failed during ${operation}`
        break
      default:
        message = `Database error (${error.code}) during ${operation}`
    }
  }

  return new DatabaseError(message, error, requestId)
}

// Validation error handler
export function handleValidationError(errors: string[], requestId?: string): ValidationError {
  return new ValidationError('Validation failed', { errors }, requestId)
}

// Rate limiting error handler
export function handleRateLimitError(limit: number, windowMs: number, requestId?: string): RateLimitError {
  return new RateLimitError(
    `Rate limit exceeded. Maximum ${limit} requests per ${windowMs / 1000} seconds`,
    requestId
  )
}

// Maintenance mode error
export function createMaintenanceError(requestId?: string): AppError {
  return new AppError(
    'Service temporarily unavailable for maintenance',
    ErrorType.MAINTENANCE_ERROR,
    503,
    true,
    { maintenanceMode: true },
    requestId
  )
}

// Health check error
export function createHealthCheckError(service: string, error: Error, requestId?: string): ExternalServiceError {
  return new ExternalServiceError(service, error.message, requestId)
}
