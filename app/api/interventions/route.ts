import { NextRequest, NextResponse } from "next/server"
import { neonService } from "../../../lib/neon-service"
import { AuthService } from "../../../lib/auth"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// Get all interventions (admin only)
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

    // Get all interventions
    const interventions = await neonService.getAllInterventions()

    // Normalize field names for frontend compatibility
    const normalizedInterventions = interventions.map(intervention => ({
      id: intervention.id,
      studentId: intervention.student_id,
      studentName: intervention.student_name,
      mentorId: intervention.mentor_id,
      mentorName: intervention.mentor_name,
      type: intervention.type,
      description: intervention.description,
      priority: intervention.priority,
      status: intervention.status,
      createdAt: intervention.created_at,
      scheduledDate: intervention.scheduled_date,
      completedDate: intervention.completed_date,
      updatedAt: intervention.updated_at
    }))

    return NextResponse.json({
      success: true,
      data: normalizedInterventions,
      count: normalizedInterventions.length
    })

  } catch (error) {
    console.error("[API] Error fetching interventions:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch interventions" },
      { status: 500 }
    )
  }
}

// Create new intervention
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

    // Check if user is admin or mentor
    if (decoded.userType !== 'admin' && decoded.userType !== 'mentor') {
      return NextResponse.json(
        { success: false, error: "Access denied. Admin or mentor role required." },
        { status: 403 }
      )
    }

    const interventionData = await request.json()
    
    // Validate required fields
    if (!interventionData.studentId || !interventionData.type || !interventionData.description) {
      return NextResponse.json(
        { success: false, error: "Student ID, type, and description are required" },
        { status: 400 }
      )
    }

    // Get mentor ID based on user type
    let mentorId = interventionData.mentorId
    if (decoded.userType === 'mentor') {
      const mentor = await neonService.getMentorByUserId(decoded.userId)
      if (!mentor) {
        return NextResponse.json(
          { success: false, error: "Mentor profile not found" },
          { status: 404 }
        )
      }
      mentorId = mentor.id
    }

    // Verify the student exists
    const student = await neonService.getStudentById(interventionData.studentId)
    if (!student) {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 }
      )
    }

    // Create intervention
    const newIntervention = await neonService.createIntervention({
      studentId: interventionData.studentId,
      mentorId: mentorId,
      type: interventionData.type,
      description: interventionData.description,
      priority: interventionData.priority || 'medium',
      scheduledDate: interventionData.scheduledDate || new Date().toISOString().split('T')[0]
    })

    if (!newIntervention) {
      throw new Error('Failed to create intervention')
    }

    return NextResponse.json({
      success: true,
      data: newIntervention,
      message: "Intervention created successfully"
    })

  } catch (error) {
    console.error("[API] Error creating intervention:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create intervention" },
      { status: 500 }
    )
  }
}
