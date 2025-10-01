import { NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { neonService } from "@/lib/neon-service"
import { EmailService } from "@/lib/email-service"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

interface ForgotPasswordRequest {
  email: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ForgotPasswordRequest = await request.json()
    
    // Validate required fields
    if (!body.email) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Email is required" 
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
    
    // Always return success to prevent email enumeration attacks
    // But only send email if user exists
    if (user && user.isActive) {
      // Generate password reset token (expires in 1 hour)
      const resetToken = AuthService.generateToken({
        userId: user.id,
        email: user.email,
        userType: user.userType
      })

      // Store reset token in database with expiration
      await neonService.storePasswordResetToken(user.id, resetToken)

      // Send password reset email
      const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&userId=${user.id}`
      const emailService = new EmailService()
      await emailService.sendPasswordResetEmail(user.email, resetLink, user.fullName)
    }

    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, a password reset link has been sent"
    })

  } catch (error: any) {
    console.error("[API] Error in forgot password:", error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error during password reset request" 
      },
      { status: 500 }
    )
  }
}
