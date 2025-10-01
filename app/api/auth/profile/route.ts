import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { neonService } from "@/lib/neon-service"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// GET - Get user profile
export async function GET(request: NextRequest) {
  return requireAuth()(request, null, async () => {
    try {
      const userId = (request as any).user.userId
      
      // Get user from database
      const user = await neonService.getUserById(userId)
      
      if (!user) {
        return NextResponse.json(
          { 
            success: false, 
            error: "User not found" 
          },
          { status: 404 }
        )
      }

      // Return user data without password hash and normalize field names
      const { passwordHash, ...userWithoutPassword } = user
      
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
        data: normalizedUser
      })

    } catch (error: any) {
      console.error("[API] Error getting user profile:", error)
      
      return NextResponse.json(
        { 
          success: false, 
          error: "Internal server error" 
        },
        { status: 500 }
      )
    }
  })
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  return requireAuth()(request, null, async () => {
    try {
      const userId = (request as any).user.userId
      const body = await request.json()
      
      // Validate allowed fields
      const allowedFields = ['fullName', 'phone']
      const updateData: any = {}
      
      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          updateData[field] = body[field]
        }
      }

      // Validate full name if provided
      if (updateData.fullName && typeof updateData.fullName !== 'string') {
        return NextResponse.json(
          { 
            success: false, 
            error: "Full name must be a string" 
          },
          { status: 400 }
        )
      }

      // Validate phone if provided
      if (updateData.phone && typeof updateData.phone !== 'string') {
        return NextResponse.json(
          { 
            success: false, 
            error: "Phone must be a string" 
          },
          { status: 400 }
        )
      }

      // Update user in database
      const updatedUser = await neonService.updateUser(userId, updateData)
      
      if (!updatedUser) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Failed to update user profile" 
          },
          { status: 500 }
        )
      }

      // Return updated user data without password hash
      const { passwordHash, ...userWithoutPassword } = updatedUser

      return NextResponse.json({
        success: true,
        message: "Profile updated successfully",
        data: userWithoutPassword
      })

    } catch (error: any) {
      console.error("[API] Error updating user profile:", error)
      
      return NextResponse.json(
        { 
          success: false, 
          error: "Internal server error" 
        },
        { status: 500 }
      )
    }
  })
}
