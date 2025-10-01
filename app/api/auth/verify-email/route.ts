import { NextRequest, NextResponse } from "next/server"
import { neonService } from "@/lib/neon-service"
import { emailService } from "@/lib/email-service"
import crypto from "crypto"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

interface VerifyEmailRequest {
  userId: string
  token: string
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyEmailRequest = await request.json()
    
    // Validate required fields
    if (!body.userId || !body.token) {
      return NextResponse.json(
        { 
          success: false, 
          error: "User ID and token are required" 
        },
        { status: 400 }
      )
    }

    // Verify the email verification token
    const isValidToken = await neonService.verifyEmailVerificationToken(body.userId, body.token)
    
    if (!isValidToken) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid or expired verification token" 
        },
        { status: 400 }
      )
    }

    // Update user's email verification status
    const user = await neonService.getUserById(body.userId)
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: "User not found" 
        },
        { status: 404 }
      )
    }

    // Mark email as verified
    await neonService.updateUser(body.userId, { emailVerified: true })

    // Invalidate the verification token
    await neonService.invalidateEmailVerificationToken(body.userId, body.token)

    return NextResponse.json({
      success: true,
      message: "Email verified successfully"
    })

  } catch (error: any) {
    console.error("[API] Error in email verification:", error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error during email verification" 
      },
      { status: 500 }
    )
  }
}

// Resend verification email
export async function PUT(request: NextRequest) {
  try {
    const body: { email: string } = await request.json()
    
    if (!body.email) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Email is required" 
        },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await neonService.getUserByEmail(body.email.toLowerCase().trim())
    
    if (!user) {
      // Always return success to prevent email enumeration attacks
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, a verification email has been sent"
      })
    }

    if (user.email_verified) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Email is already verified" 
        },
        { status: 400 }
      )
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    
    // Store verification token in database
    await neonService.storeEmailVerificationToken(user.id, verificationToken)

    // Send verification email
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}&userId=${user.id}`
    await emailService.sendEmailVerificationEmail(user.email, verificationLink, user.full_name)

    return NextResponse.json({
      success: true,
      message: "Verification email sent successfully"
    })

  } catch (error: any) {
    console.error("[API] Error in resend verification email:", error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error during email verification" 
      },
      { status: 500 }
    )
  }
}
