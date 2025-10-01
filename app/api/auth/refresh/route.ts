import { NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { neonService } from "@/lib/neon-service"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

interface RefreshRequest {
  refreshToken: string
}

export async function POST(request: NextRequest) {
  try {
    const body: RefreshRequest = await request.json()
    
    // Validate required fields
    if (!body.refreshToken) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Refresh token is required" 
        },
        { status: 400 }
      )
    }

    // Verify refresh token
    let payload
    try {
      payload = AuthService.verifyRefreshToken(body.refreshToken)
    } catch (error) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid or expired refresh token" 
        },
        { status: 401 }
      )
    }

    // Get user from database to ensure they still exist and are active
    const user = await neonService.getUserById(payload.userId)
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: "User not found" 
        },
        { status: 404 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Account is deactivated" 
        },
        { status: 403 }
      )
    }

    // Generate new access token
    const newToken = AuthService.generateToken({
      userId: user.id,
      email: user.email,
      userType: user.userType
    })

    // Generate new refresh token
    const newRefreshToken = AuthService.generateRefreshToken({
      userId: user.id,
      email: user.email,
      userType: user.userType
    })

    return NextResponse.json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    })

  } catch (error: any) {
    console.error("[API] Error in token refresh:", error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error during token refresh" 
      },
      { status: 500 }
    )
  }
}
