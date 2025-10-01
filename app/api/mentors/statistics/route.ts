import { NextRequest, NextResponse } from "next/server"
import { neonService } from "../../../../lib/neon-service"
import { AuthService } from "../../../../lib/auth"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// Get statistics for the authenticated mentor
export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: "Authorization token required" },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    // Verify the token and get user info
    const decoded = AuthService.verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      )
    }

    // Check if user is a mentor
    if (decoded.userType !== 'mentor') {
      return NextResponse.json(
        { success: false, error: "Access denied. Mentor role required." },
        { status: 403 }
      )
    }

    // Get mentor by user ID
    const mentor = await neonService.getMentorByUserId(decoded.userId)
    if (!mentor) {
      return NextResponse.json(
        { success: false, error: "Mentor profile not found" },
        { status: 404 }
      )
    }

    // Get mentor statistics
    const statistics = await neonService.getMentorStatistics(mentor.id)

    return NextResponse.json({
      success: true,
      data: statistics
    })

  } catch (error) {
    console.error("[API] Error fetching mentor statistics:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch statistics" },
      { status: 500 }
    )
  }
}
