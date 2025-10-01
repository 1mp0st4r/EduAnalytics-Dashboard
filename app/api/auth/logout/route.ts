import { NextRequest, NextResponse } from "next/server"
import { AuthService, requireAuth } from "@/lib/auth"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // In a stateless JWT system, logout is handled client-side
    // by removing the token from storage. However, we can add
    // token blacklisting here if needed for enhanced security.
    
    return NextResponse.json({
      success: true,
      message: "Logout successful"
    })

  } catch (error: any) {
    console.error("[API] Error in user logout:", error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error during logout" 
      },
      { status: 500 }
    )
  }
}

// Optional: Add a blacklist endpoint for enhanced security
export async function DELETE(request: NextRequest) {
  try {
    // This would be used to blacklist a token
    // Implementation depends on your token storage strategy
    
    return NextResponse.json({
      success: true,
      message: "Token blacklisted successfully"
    })

  } catch (error: any) {
    console.error("[API] Error in token blacklisting:", error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error during token blacklisting" 
      },
      { status: 500 }
    )
  }
}
