import { NextRequest, NextResponse } from "next/server"
import { AuthService, UserType } from "@/lib/auth"
import { neonService } from "@/lib/neon-service"
import { emailService } from "@/lib/email-service"
import crypto from "crypto"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

interface RegisterRequest {
  email: string
  password: string
  fullName: string
  userType: UserType
  phone?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json()
    
    // Validate required fields
    if (!body.email || !body.password || !body.fullName || !body.userType) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Email, password, full name, and user type are required" 
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

    // Validate password strength
    const passwordValidation = AuthService.validatePasswordStrength(body.password)
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

    // Validate user type
    const validUserTypes: UserType[] = ['student', 'admin', 'mentor', 'parent']
    if (!validUserTypes.includes(body.userType)) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid user type. Must be one of: student, admin, mentor, parent" 
        },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await neonService.getUserByEmail(body.email)
    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: "User with this email already exists" 
        },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await AuthService.hashPassword(body.password)

    // Create user data
    const userData = {
      email: body.email.toLowerCase().trim(),
      passwordHash: hashedPassword,
      userType: body.userType,
      fullName: body.fullName.trim(),
      phone: body.phone?.trim() || null,
      isActive: true,
      emailVerified: false
    }

    // Create user in database
    const newUser = await neonService.createUser(userData)
    
    if (!newUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Failed to create user" 
        },
        { status: 500 }
      )
    }

    // Generate JWT token
    const token = AuthService.generateToken({
      userId: newUser.id,
      email: newUser.email,
      userType: newUser.userType
    })

    // Generate refresh token
    const refreshToken = AuthService.generateRefreshToken({
      userId: newUser.id,
      email: newUser.email,
      userType: newUser.userType
    })

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    
    // Store verification token in database
    await neonService.storeEmailVerificationToken(newUser.id, verificationToken)

    // Send verification email
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}&userId=${newUser.id}&email=${newUser.email}`
    try {
      await emailService.sendEmailVerificationEmail(newUser.email, verificationLink, newUser.fullName)
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
      // Continue with registration even if email fails
    }

    // Return success response (exclude password hash and normalize field names)
    const { passwordHash, ...userWithoutPassword } = newUser
    
    // Normalize field names for frontend compatibility
    const normalizedUser = {
      ...userWithoutPassword,
      userType: newUser.user_type, // Convert snake_case to camelCase
      fullName: newUser.full_name,
      isActive: newUser.is_active,
      emailVerified: newUser.email_verified,
      createdAt: newUser.created_at,
      updatedAt: newUser.updated_at
    }

    return NextResponse.json({
      success: true,
      message: "User registered successfully. Please check your email to verify your account.",
      data: {
        user: normalizedUser,
        token,
        refreshToken
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error("[API] Error in user registration:", error)
    
    // Handle specific database errors
    if (error.code === '23505') { // Unique constraint violation
      return NextResponse.json(
        { 
          success: false, 
          error: "User with this email already exists" 
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error during registration" 
      },
      { status: 500 }
    )
  }
}
