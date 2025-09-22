import { NextRequest, NextResponse } from "next/server"
import { neonService } from "../../../lib/neon-service"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log("[API] Testing database connection...")
    console.log("[API] DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not set")
    console.log("[API] NEON_URL:", process.env.NEON_URL ? "Set" : "Not set")
    
    // Test direct connection first
    const { Pool } = require('pg');
    const testPool = new Pool({
      connectionString: process.env.DATABASE_URL || process.env.NEON_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    try {
      const testResult = await testPool.query('SELECT NOW()');
      console.log("[API] Direct connection test successful:", testResult.rows[0]);
      await testPool.end();
  } catch (directError: any) {
    console.error("[API] Direct connection test failed:", directError.message);
    await testPool.end();
    return NextResponse.json(
      { 
        success: false, 
        message: "Direct database connection failed",
        error: directError.message
      }, 
      { status: 500 }
    );
  }

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

