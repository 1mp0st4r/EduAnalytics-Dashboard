import { NextRequest, NextResponse } from "next/server"
import { dbService } from "@/lib/database-service"

export async function GET(request: NextRequest) {
  try {
    console.log("[API] Testing database connection...")

    // Test database connection
    const isConnected = await dbService.testConnection()
    
    if (!isConnected) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Database connection failed",
          error: "Unable to connect to MySQL database"
        }, 
        { status: 500 }
      )
    }

    // Get basic statistics
    const stats = await dbService.getStudentStatistics()
    
    // Get a few sample students
    const sampleStudents = await dbService.getStudents({ limit: 5 })

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      data: {
        connection: "Connected to MySQL database",
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

