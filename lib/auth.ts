import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
const BCRYPT_ROUNDS = 12

// User types
export type UserType = 'student' | 'admin' | 'mentor' | 'parent'

// JWT Payload interface
export interface JWTPayload {
  userId: string
  email: string
  userType: UserType
  iat?: number
  exp?: number
}

// User interface
export interface User {
  id: string
  email: string
  userType: UserType
  fullName: string
  phone?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Authentication utilities
export class AuthService {
  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS)
  }

  /**
   * Compare a password with its hash
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  /**
   * Generate a JWT token
   */
  static generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'eduanalytics',
      audience: 'eduanalytics-users'
    })
  }

  /**
   * Verify a JWT token
   */
  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET, {
        issuer: 'eduanalytics',
        audience: 'eduanalytics-users'
      }) as JWTPayload
    } catch (error) {
      throw new Error('Invalid or expired token')
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }
    return authHeader.substring(7)
  }

  /**
   * Generate a secure random password
   */
  static generateSecurePassword(length: number = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    return password
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number')
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: '30d',
      issuer: 'eduanalytics',
      audience: 'eduanalytics-refresh'
    })
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET, {
        issuer: 'eduanalytics',
        audience: 'eduanalytics-refresh'
      }) as JWTPayload
    } catch (error) {
      throw new Error('Invalid or expired refresh token')
    }
  }
}

// Middleware for protecting routes
export function requireAuth(userTypes?: UserType[]) {
  return (req: any, res: any, next: any) => {
    try {
      const authHeader = req.headers.authorization
      const token = AuthService.extractTokenFromHeader(authHeader)
      
      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Access token required'
        })
      }

      const payload = AuthService.verifyToken(token)
      
      // Check if user type is allowed
      if (userTypes && !userTypes.includes(payload.userType)) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        })
      }

      // Add user info to request
      req.user = payload
      next()
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      })
    }
  }
}

// Middleware for optional authentication
export function optionalAuth(req: any, res: any, next: any) {
  try {
    const authHeader = req.headers.authorization
    const token = AuthService.extractTokenFromHeader(authHeader)
    
    if (token) {
      const payload = AuthService.verifyToken(token)
      req.user = payload
    }
    
    next()
  } catch (error) {
    // Continue without authentication
    next()
  }
}

export default AuthService
