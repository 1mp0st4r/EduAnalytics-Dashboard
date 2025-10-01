import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import { neonService } from '../../lib/neon-service'
import { AuthService } from '../../lib/auth'

// Mock the neon service
jest.mock('../../lib/neon-service', () => ({
  neonService: {
    getUserByEmail: jest.fn(),
    createUser: jest.fn(),
    updateUserLastLogin: jest.fn(),
    storeEmailVerificationToken: jest.fn(),
    verifyEmailToken: jest.fn(),
    updateUserEmailVerified: jest.fn()
  }
}))

describe('Authentication API', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    full_name: 'Test User',
    user_type: 'student',
    is_active: true,
    email_verified: true,
    password_hash: '$2b$10$hashedpassword',
    created_at: new Date(),
    updated_at: new Date()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      // Mock successful user lookup
      ;(neonService.getUserByEmail as jest.Mock).mockResolvedValue(mockUser)
      ;(neonService.updateUserLastLogin as jest.Mock).mockResolvedValue(true)

      // Mock password verification
      jest.spyOn(AuthService, 'comparePassword').mockResolvedValue(true)
      jest.spyOn(AuthService, 'generateToken').mockReturnValue('mock-jwt-token')
      jest.spyOn(AuthService, 'generateRefreshToken').mockReturnValue('mock-refresh-token')

      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      })

      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.user.email).toBe('test@example.com')
      expect(data.data.token).toBe('mock-jwt-token')
    })

    it('should return 401 for invalid credentials', async () => {
      ;(neonService.getUserByEmail as jest.Mock).mockResolvedValue(mockUser)
      jest.spyOn(AuthService, 'comparePassword').mockResolvedValue(false)

      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
      })

      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid email or password')
    })

    it('should return 403 for deactivated account', async () => {
      const deactivatedUser = { ...mockUser, is_active: false }
      ;(neonService.getUserByEmail as jest.Mock).mockResolvedValue(deactivatedUser)

      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      })

      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Account is deactivated. Please contact support.')
    })
  })

  describe('POST /api/auth/register', () => {
    it('should register successfully with valid data', async () => {
      ;(neonService.getUserByEmail as jest.Mock).mockResolvedValue(null) // User doesn't exist
      ;(neonService.createUser as jest.Mock).mockResolvedValue(mockUser)
      ;(neonService.storeEmailVerificationToken as jest.Mock).mockResolvedValue(true)

      jest.spyOn(AuthService, 'hashPassword').mockResolvedValue('$2b$10$hashedpassword')
      jest.spyOn(AuthService, 'generateToken').mockReturnValue('mock-jwt-token')
      jest.spyOn(AuthService, 'generateRefreshToken').mockReturnValue('mock-refresh-token')

      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'newuser@example.com',
          password: 'Password123!',
          fullName: 'New User',
          userType: 'student'
        })
      })

      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.user.email).toBe('newuser@example.com')
    })

    it('should return 400 for existing email', async () => {
      ;(neonService.getUserByEmail as jest.Mock).mockResolvedValue(mockUser)

      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'Password123!',
          fullName: 'Test User',
          userType: 'student'
        })
      })

      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('User with this email already exists')
    })

    it('should return 400 for weak password', async () => {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: '123',
          fullName: 'Test User',
          userType: 'student'
        })
      })

      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Password')
    })
  })

  describe('POST /api/auth/refresh', () => {
    it('should refresh token successfully', async () => {
      jest.spyOn(AuthService, 'verifyRefreshToken').mockReturnValue({
        userId: 'user-123',
        email: 'test@example.com',
        userType: 'student'
      })
      jest.spyOn(AuthService, 'generateToken').mockReturnValue('new-jwt-token')

      const response = await fetch('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refreshToken: 'valid-refresh-token'
        })
      })

      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.token).toBe('new-jwt-token')
    })

    it('should return 401 for invalid refresh token', async () => {
      jest.spyOn(AuthService, 'verifyRefreshToken').mockReturnValue(null)

      const response = await fetch('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refreshToken: 'invalid-refresh-token'
        })
      })

      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid or expired refresh token')
    })
  })
})
