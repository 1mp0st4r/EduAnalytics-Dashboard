import { NextRequest } from 'next/server'
import { AuthService } from './auth'

// Rate limiting storage (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Security headers
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' ws: wss:;"
}

// Rate limiting configuration
const RATE_LIMITS = {
  auth: { requests: 5, window: 60 * 1000 }, // 5 requests per minute
  general: { requests: 100, window: 60 * 1000 }, // 100 requests per minute
  chat: { requests: 20, window: 60 * 1000 }, // 20 requests per minute
  cron: { requests: 1, window: 60 * 1000 } // 1 request per minute
}

// Input validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  studentId: /^[A-Z]{3}\d{3,6}$/,
  mentorId: /^MEN_[A-Z0-9_]+$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
}

// Sanitize input to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

// Validate email format
export function isValidEmail(email: string): boolean {
  return VALIDATION_PATTERNS.email.test(email)
}

// Validate password strength
export function isValidPassword(password: string): boolean {
  return VALIDATION_PATTERNS.password.test(password)
}

// Validate phone number
export function isValidPhone(phone: string): boolean {
  return VALIDATION_PATTERNS.phone.test(phone)
}

// Rate limiting middleware
export function checkRateLimit(
  request: NextRequest,
  type: keyof typeof RATE_LIMITS = 'general'
): { allowed: boolean; remaining: number; resetTime: number } {
  const ip = getClientIP(request)
  const key = `${ip}:${type}`
  const now = Date.now()
  const limit = RATE_LIMITS[type]

  const current = rateLimitStore.get(key)
  
  if (!current || now > current.resetTime) {
    // Reset or initialize
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + limit.window
    })
    return {
      allowed: true,
      remaining: limit.requests - 1,
      resetTime: now + limit.window
    }
  }

  if (current.count >= limit.requests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime
    }
  }

  // Increment counter
  current.count++
  rateLimitStore.set(key, current)

  return {
    allowed: true,
    remaining: limit.requests - current.count,
    resetTime: current.resetTime
  }
}

// Get client IP address
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return request.ip || 'unknown'
}

// Validate JWT token and check permissions
export async function validateTokenAndPermissions(
  request: NextRequest,
  requiredRoles: string[] = []
): Promise<{ valid: boolean; user?: any; error?: string }> {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { valid: false, error: 'Missing or invalid authorization header' }
    }

    const token = authHeader.substring(7)
    const decoded = AuthService.verifyToken(token)
    
    if (!decoded) {
      return { valid: false, error: 'Invalid or expired token' }
    }

    // Check if user is active
    if (!decoded.isActive) {
      return { valid: false, error: 'Account is deactivated' }
    }

    // Check role permissions
    if (requiredRoles.length > 0 && !requiredRoles.includes(decoded.userType)) {
      return { valid: false, error: 'Insufficient permissions' }
    }

    return { valid: true, user: decoded }
  } catch (error) {
    console.error('Token validation error:', error)
    return { valid: false, error: 'Token validation failed' }
  }
}

// SQL injection prevention
export function sanitizeSQLInput(input: string): string {
  return input
    .replace(/['"\\]/g, '') // Remove quotes and backslashes
    .replace(/;.*$/g, '') // Remove semicolons and everything after
    .replace(/--.*$/g, '') // Remove SQL comments
    .replace(/\/\*.*?\*\//g, '') // Remove block comments
    .trim()
}

// CSRF protection
export function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
}

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken
}

// Input validation for common fields
export function validateStudentData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.studentId || !VALIDATION_PATTERNS.studentId.test(data.studentId)) {
    errors.push('Invalid student ID format')
  }

  if (!data.fullName || data.fullName.length < 2) {
    errors.push('Full name must be at least 2 characters')
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.push('Invalid email format')
  }

  if (data.phone && !isValidPhone(data.phone)) {
    errors.push('Invalid phone number format')
  }

  if (data.classLevel && (data.classLevel < 1 || data.classLevel > 12)) {
    errors.push('Class level must be between 1 and 12')
  }

  if (data.attendance && (data.attendance < 0 || data.attendance > 100)) {
    errors.push('Attendance must be between 0 and 100')
  }

  if (data.performance && (data.performance < 0 || data.performance > 100)) {
    errors.push('Performance must be between 0 and 100')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// Log security events
export function logSecurityEvent(
  event: string,
  details: any,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details,
    severity
  }

  console.log(`[SECURITY-${severity.toUpperCase()}]`, logEntry)
  
  // In production, send to security monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Send to security monitoring service (e.g., Sentry, DataDog)
    // This would be implemented based on your monitoring setup
  }
}

// Clean up rate limit store periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000) // Clean up every 5 minutes
