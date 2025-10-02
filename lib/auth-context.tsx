"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, UserType } from './auth'

interface AuthContextType {
  user: User | null
  token: string | null
  refreshToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  refreshAuthToken: () => Promise<boolean>
  updateProfile: (data: { fullName?: string; phone?: string }) => Promise<{ success: boolean; error?: string }>
}

interface RegisterData {
  email: string
  password: string
  fullName: string
  userType: UserType
  phone?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user && !!token

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('auth_token')
        const storedRefreshToken = localStorage.getItem('refresh_token')
        const storedUser = localStorage.getItem('user_data')

        if (storedToken && storedUser) {
          setToken(storedToken)
          setRefreshToken(storedRefreshToken)
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error('Error initializing auth state:', error)
        // Clear invalid data
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_data')
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // Auto-refresh token when it's about to expire
  useEffect(() => {
    if (!token || !refreshToken) return

    const refreshInterval = setInterval(async () => {
      const success = await refreshAuthToken()
      if (!success) {
        logout()
      }
    }, 6 * 60 * 60 * 1000) // Refresh every 6 hours

    return () => clearInterval(refreshInterval)
  }, [token, refreshToken])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        const { user: userData, token: newToken, refreshToken: newRefreshToken } = data.data
        
        setUser(userData)
        setToken(newToken)
        setRefreshToken(newRefreshToken)
        
        // Store in localStorage
        localStorage.setItem('auth_token', newToken)
        localStorage.setItem('refresh_token', newRefreshToken)
        localStorage.setItem('user_data', JSON.stringify(userData))
        
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Network error during login' }
    }
  }

  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (data.success) {
        const { user: newUser, token: newToken, refreshToken: newRefreshToken } = data.data
        
        setUser(newUser)
        setToken(newToken)
        setRefreshToken(newRefreshToken)
        
        // Store in localStorage
        localStorage.setItem('auth_token', newToken)
        localStorage.setItem('refresh_token', newRefreshToken)
        localStorage.setItem('user_data', JSON.stringify(newUser))
        
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'Network error during registration' }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setRefreshToken(null)
    
    // Clear localStorage
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_data')
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('userType')
    localStorage.removeItem('userEmail')
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }

  const refreshAuthToken = async (): Promise<boolean> => {
    if (!refreshToken) return false

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      const data = await response.json()

      if (data.success) {
        const { token: newToken, refreshToken: newRefreshToken } = data.data
        
        setToken(newToken)
        setRefreshToken(newRefreshToken)
        
        // Update localStorage
        localStorage.setItem('auth_token', newToken)
        localStorage.setItem('refresh_token', newRefreshToken)
        
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      return false
    }
  }

  const updateProfile = async (data: { fullName?: string; phone?: string }): Promise<{ success: boolean; error?: string }> => {
    if (!token) return { success: false, error: 'Not authenticated' }

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        setUser(result.data)
        localStorage.setItem('user_data', JSON.stringify(result.data))
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Profile update error:', error)
      return { success: false, error: 'Network error during profile update' }
    }
  }

  const value: AuthContextType = {
    user,
    token,
    refreshToken,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshAuthToken,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Higher-order component for protecting routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  allowedUserTypes?: UserType[]
) {
  return function AuthenticatedComponent(props: P) {
    const { user, isLoading, isAuthenticated } = useAuth()

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-600">Loading...</p>
          </div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-slate-900">Authentication Required</h1>
            <p className="text-slate-600">Please log in to access this page.</p>
            <button
              onClick={() => window.location.href = '/login'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      )
    }

    if (allowedUserTypes && user && !allowedUserTypes.includes(user.userType)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-slate-900">Access Denied</h1>
            <p className="text-slate-600">You don't have permission to access this page.</p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Go Back
            </button>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}
