import { NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { neonService } from "@/lib/neon-service"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

interface LoginRequest {
  email: string
  password: string
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()
    
    // Validate required fields
    if (!body.email || !body.password) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Email and password are required" 
        },
        { status: 400 }
      )
    }

    // Validate email format
    if (!AuthService.validateEmail(body.email)) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid email format" 
        },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await neonService.getUserByEmail(body.email.toLowerCase().trim())
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid email or password" 
        },
        { status: 401 }
      )
    }

    // Check if user is active
    if (!user.is_active) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Account is deactivated. Please contact support." 
        },
        { status: 403 }
      )
    }

    // Verify password
    const isPasswordValid = await AuthService.comparePassword(body.password, user.password_hash)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid email or password" 
        },
        { status: 401 }
      )
    }

    // Update last login timestamp
    await neonService.updateUserLastLogin(user.id)

    // Generate JWT token
    const token = AuthService.generateToken({
      userId: user.id,
      email: user.email,
      userType: user.user_type
    })

    // Generate refresh token
    const refreshToken = AuthService.generateRefreshToken({
      userId: user.id,
      email: user.email,
      userType: user.user_type
    })

    // Return success response (exclude password hash and normalize field names)
    const { password_hash, ...userWithoutPassword } = user
    
    // Normalize field names for frontend compatibility
    const normalizedUser = {
      ...userWithoutPassword,
      userType: user.user_type, // Convert snake_case to camelCase
      fullName: user.full_name,
      isActive: user.is_active,
      emailVerified: user.email_verified,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      lastLogin: user.last_login
    }

    return NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
        user: normalizedUser,
        token,
        refreshToken
      }
    })

  } catch (error: any) {
    console.error("[API] Error in user login:", error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error during login" 
      },
      { status: 500 }
    )
  }
}
