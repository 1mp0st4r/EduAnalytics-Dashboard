import { NextRequest, NextResponse } from "next/server"
import { neonService } from "../../../lib/neon-service"
import { AuthService } from "../../../lib/auth"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// Get all student-mentor assignments
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

    // Check if user is admin
    if (decoded.userType !== 'admin') {
      return NextResponse.json(
        { success: false, error: "Access denied. Admin role required." },
        { status: 403 }
      )
    }

    // Get all assignments
    const assignments = await neonService.getAllAssignments()

    return NextResponse.json({
      success: true,
      data: assignments,
      count: assignments.length
    })

  } catch (error) {
    console.error("[API] Error fetching assignments:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch assignments" },
      { status: 500 }
    )
  }
}

// Create new assignment
export async function POST(request: NextRequest) {
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

    // Check if user is admin
    if (decoded.userType !== 'admin') {
      return NextResponse.json(
        { success: false, error: "Access denied. Admin role required." },
        { status: 403 }
      )
    }

    const assignmentData = await request.json()
    
    // Validate required fields
    if (!assignmentData.studentId || !assignmentData.mentorId) {
      return NextResponse.json(
        { success: false, error: "Student ID and Mentor ID are required" },
        { status: 400 }
      )
    }

    // Verify the student exists
    const student = await neonService.getStudentById(assignmentData.studentId)
    if (!student) {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 }
      )
    }

    // Verify the mentor exists
    const mentor = await neonService.getMentorById(assignmentData.mentorId)
    if (!mentor) {
      return NextResponse.json(
        { success: false, error: "Mentor not found" },
        { status: 404 }
      )
    }

    // Check if mentor has capacity
    const mentorStats = await neonService.getMentorStatistics(assignmentData.mentorId)
    if (mentorStats.totalStudents >= mentor.max_students) {
      return NextResponse.json(
        { success: false, error: "Mentor has reached maximum student capacity" },
        { status: 400 }
      )
    }

    // Create assignment
    const newAssignment = await neonService.createAssignment({
      studentId: assignmentData.studentId,
      mentorId: assignmentData.mentorId,
      assignedBy: decoded.userId,
      notes: assignmentData.notes || ''
    })

    if (!newAssignment) {
      throw new Error('Failed to create assignment')
    }

    return NextResponse.json({
      success: true,
      data: newAssignment,
      message: "Student assigned to mentor successfully"
    })

  } catch (error) {
    console.error("[API] Error creating assignment:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create assignment" },
      { status: 500 }
    )
  }
}
