import { NextRequest, NextResponse } from "next/server"
import { neonService } from "../../../lib/neon-service"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log("[API] Testing database connection...")
    
    // Test connection
    const isConnected = await neonService.testConnection()
    
    if (!isConnected) {
      return NextResponse.json(
        { success: false, error: "Database connection failed" },
        { status: 500 }
      )
    }

    // Get basic statistics
    const stats = await neonService.getStudentStatistics()
    
    // Get sample students
    const sampleStudents = await neonService.getStudents({ limit: 5 })

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      data: {
        connection: "Neon PostgreSQL",
        statistics: stats,
        sampleStudents: sampleStudents.length,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error("[API] Error testing database:", error)
    return NextResponse.json(
      { success: false, error: "Database test failed" },
      { status: 500 }
    )
  }
}