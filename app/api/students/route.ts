import { NextRequest, NextResponse } from "next/server"
import { neonService } from "../../../lib/neon-service"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// Get all students with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0
    const riskLevel = searchParams.get('riskLevel')
    const classLevel = searchParams.get('classLevel')
    const isDropout = searchParams.get('isDropout') === 'true'

    const students = await neonService.getStudents({
      limit,
      offset,
      riskLevel: riskLevel || undefined,
      classLevel: classLevel || undefined,
      isDropout: isDropout || undefined
    })

    return NextResponse.json({
      success: true,
      data: students,
      pagination: {
        limit,
        offset,
        total: students.length
      }
    })
  } catch (error) {
    console.error("[API] Error fetching students:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch students" },
      { status: 500 }
    )
  }
}

// Add new student
export async function POST(request: NextRequest) {
  try {
    const studentData = await request.json()
    
    // Validate required fields
    if (!studentData.fullName || !studentData.studentId) {
      return NextResponse.json(
        { success: false, error: "Full name and student ID are required" },
        { status: 400 }
      )
    }

    // For now, we'll create a simple student record
    // In a real implementation, you'd insert into the database
    const newStudent = {
      id: `student_${Date.now()}`,
      student_id: studentData.studentId,
      full_name: studentData.fullName,
      email: studentData.email || '',
      phone: studentData.phone || '',
      gender: studentData.gender || 'Other',
      class_level: studentData.classLevel || 10,
      current_attendance: studentData.attendance || 0,
      current_performance: studentData.performance || 0,
      risk_level: studentData.riskLevel || 'Low',
      risk_score: studentData.riskScore || 0,
      dropout_probability: studentData.dropoutProbability || 0,
      is_dropout: false,
      is_active: true,
      created_at: new Date().toISOString()
    }

    // In a real implementation, you would:
    // 1. Create a user record
    // 2. Create a student record linked to the user
    // 3. Assign a random mentor
    // 4. Link to a school

    return NextResponse.json({
      success: true,
      data: newStudent,
      message: "Student added successfully"
    })
  } catch (error) {
    console.error("[API] Error adding student:", error)
    return NextResponse.json(
      { success: false, error: "Failed to add student" },
      { status: 500 }
    )
  }
}