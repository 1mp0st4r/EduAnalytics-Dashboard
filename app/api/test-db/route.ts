import { NextRequest, NextResponse } from "next/server"
import { neonService } from "@/lib/neon-service"

export async function GET(request: NextRequest) {
  try {
    console.log("[API] Testing database connection...")

    // Test database connection
    const isConnected = await neonService.testConnection()
    
    if (!isConnected) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Database connection failed",
          error: "Unable to connect to Neon PostgreSQL database"
        }, 
        { status: 500 }
      )
    }

    // Get basic statistics
    const stats = await neonService.getStudentStatistics()
    
    // Get a few sample students
    const sampleStudents = await neonService.getStudents({ limit: 5 })

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      data: {
        connection: "Connected to Neon PostgreSQL database",
        statistics: stats,
        sampleStudents: sampleStudents.map(student => ({
          StudentID: student.StudentID,
          RiskLevel: student.RiskLevel,
          RiskScore: student.RiskScore,
          IsDropout: student.IsDropout
        }))
      }
    })

  } catch (error) {
    console.error("[API] Database test failed:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Database test failed",
        error: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    )
  }
}

