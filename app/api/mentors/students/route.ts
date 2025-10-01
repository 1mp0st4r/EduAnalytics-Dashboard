import { NextRequest, NextResponse } from "next/server"
import { neonService } from "../../../../lib/neon-service"
import { AuthService } from "../../../../lib/auth"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// Get students assigned to the authenticated mentor
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

    // Get students assigned to this mentor
    const students = await neonService.getStudentsByMentorId(mentor.id)

    // Normalize field names for frontend compatibility
    const normalizedStudents = (students || []).map(student => ({
      id: student.id,
      studentId: student.student_id,
      fullName: student.full_name,
      email: student.email,
      phone: student.phone,
      gender: student.gender,
      classLevel: student.class_level,
      schoolName: student.SchoolName,
      currentAttendance: student.current_attendance,
      currentPerformance: student.current_performance,
      riskLevel: student.risk_level,
      riskScore: student.risk_score,
      dropoutProbability: student.dropout_probability,
      parentName: student.parent_name,
      parentPhone: student.parent_phone,
      parentEmail: student.parent_email,
      address: student.address,
      district: student.district,
      state: student.state,
      createdAt: student.created_at
    }))

    return NextResponse.json({
      success: true,
      data: normalizedStudents,
      count: normalizedStudents.length
    })

  } catch (error) {
    console.error("[API] Error fetching mentor students:", error)
    console.error("[API] Error details:", error.message)
    return NextResponse.json(
      { success: false, error: "Failed to fetch students", details: error.message },
      { status: 500 }
    )
  }
}
