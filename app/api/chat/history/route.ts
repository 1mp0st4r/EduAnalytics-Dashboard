import { NextRequest, NextResponse } from "next/server"
import { neonService } from "../../../../lib/neon-service"
import { AuthService } from "../../../../lib/auth"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// Get chat history for the authenticated user
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

    // Check if user is a student
    if (decoded.userType !== 'student') {
      return NextResponse.json(
        { success: false, error: "Access denied. Student role required." },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    // Get chat history
    const chatHistory = await neonService.getChatHistory(decoded.userId, conversationId || undefined)

    // Normalize field names for frontend compatibility
    const normalizedHistory = chatHistory.map(message => ({
      id: message.id,
      conversationId: message.conversation_id,
      message: message.message,
      response: message.response,
      isUser: message.is_user,
      timestamp: message.created_at
    }))

    return NextResponse.json({
      success: true,
      data: normalizedHistory,
      count: normalizedHistory.length
    })

  } catch (error) {
    console.error("[API] Error fetching chat history:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch chat history" },
      { status: 500 }
    )
  }
}
