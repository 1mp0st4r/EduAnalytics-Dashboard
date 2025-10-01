import { NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { neonService } from "@/lib/neon-service"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

interface ResetPasswordRequest {
  token: string
  newPassword: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ResetPasswordRequest = await request.json()
    
    // Validate required fields
    if (!body.token || !body.newPassword) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Token and new password are required" 
        },
        { status: 400 }
      )
    }

    // Validate password strength
    const passwordValidation = AuthService.validatePasswordStrength(body.newPassword)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Password does not meet requirements",
          details: passwordValidation.errors
        },
        { status: 400 }
      )
    }

    // Verify reset token
    let payload
    try {
      payload = AuthService.verifyToken(body.token)
    } catch (error) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid or expired reset token" 
        },
        { status: 401 }
      )
    }

    // Verify token exists in database and is valid
    const isValidToken = await neonService.verifyPasswordResetToken(payload.userId, body.token)
    if (!isValidToken) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid or expired reset token" 
        },
        { status: 401 }
      )
    }

    // Get user to ensure they exist and are active
    const user = await neonService.getUserById(payload.userId)
    if (!user || !user.isActive) {
      return NextResponse.json(
        { 
          success: false, 
          error: "User not found or account is deactivated" 
        },
        { status: 404 }
      )
    }

    // Hash new password
    const hashedPassword = await AuthService.hashPassword(body.newPassword)

    // Update password in database
    const success = await neonService.updateUserPassword(user.id, hashedPassword)
    
    if (!success) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Failed to update password" 
        },
        { status: 500 }
      )
    }

    // Invalidate the reset token
    await neonService.invalidatePasswordResetToken(user.id, body.token)

    // Generate new JWT token
    const token = AuthService.generateToken({
      userId: user.id,
      email: user.email,
      userType: user.userType
    })

    // Generate refresh token
    const refreshToken = AuthService.generateRefreshToken({
      userId: user.id,
      email: user.email,
      userType: user.userType
    })

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
      data: {
        token,
        refreshToken
      }
    })

  } catch (error: any) {
    console.error("[API] Error in password reset:", error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error during password reset" 
      },
      { status: 500 }
    )
  }
}
