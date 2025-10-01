import { NextRequest, NextResponse } from "next/server"
import { neonService } from "../../../../lib/neon-service"
import { AuthService } from "../../../../lib/auth"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// Get intervention by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const interventionId = params.id

    if (!interventionId) {
      return NextResponse.json(
        { success: false, error: "Intervention ID is required" },
        { status: 400 }
      )
    }

    const intervention = await neonService.getInterventionById(interventionId)

    if (!intervention) {
      return NextResponse.json(
        { success: false, error: "Intervention not found" },
        { status: 404 }
      )
    }

    // Check if user has access to this intervention
    if (decoded.userType === 'mentor') {
      const mentor = await neonService.getMentorByUserId(decoded.userId)
      if (!mentor || intervention.mentor_id !== mentor.id) {
        return NextResponse.json(
          { success: false, error: "Access denied" },
          { status: 403 }
        )
      }
    }

    // Normalize field names for frontend compatibility
    const normalizedIntervention = {
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
    }

    return NextResponse.json({
      success: true,
      data: normalizedIntervention
    })

  } catch (error) {
    console.error("[API] Error fetching intervention:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch intervention" },
      { status: 500 }
    )
  }
}

// Update intervention
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const interventionId = params.id
    const updateData = await request.json()

    if (!interventionId) {
      return NextResponse.json(
        { success: false, error: "Intervention ID is required" },
        { status: 400 }
      )
    }

    // Check if intervention exists
    const existingIntervention = await neonService.getInterventionById(interventionId)
    if (!existingIntervention) {
      return NextResponse.json(
        { success: false, error: "Intervention not found" },
        { status: 404 }
      )
    }

    // Check if user has access to this intervention
    if (decoded.userType === 'mentor') {
      const mentor = await neonService.getMentorByUserId(decoded.userId)
      if (!mentor || existingIntervention.mentor_id !== mentor.id) {
        return NextResponse.json(
          { success: false, error: "Access denied" },
          { status: 403 }
        )
      }
    }

    // Update intervention
    const updatedIntervention = await neonService.updateIntervention(interventionId, updateData)

    if (!updatedIntervention) {
      throw new Error('Failed to update intervention')
    }

    return NextResponse.json({
      success: true,
      data: updatedIntervention,
      message: "Intervention updated successfully"
    })

  } catch (error) {
    console.error("[API] Error updating intervention:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update intervention" },
      { status: 500 }
    )
  }
}

// Delete intervention
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Only admins can delete interventions
    if (decoded.userType !== 'admin') {
      return NextResponse.json(
        { success: false, error: "Access denied. Admin role required." },
        { status: 403 }
      )
    }

    const interventionId = params.id

    if (!interventionId) {
      return NextResponse.json(
        { success: false, error: "Intervention ID is required" },
        { status: 400 }
      )
    }

    // Check if intervention exists
    const existingIntervention = await neonService.getInterventionById(interventionId)
    if (!existingIntervention) {
      return NextResponse.json(
        { success: false, error: "Intervention not found" },
        { status: 404 }
      )
    }

    // Delete intervention
    const deleted = await neonService.deleteIntervention(interventionId)

    if (!deleted) {
      throw new Error('Failed to delete intervention')
    }

    return NextResponse.json({
      success: true,
      message: "Intervention deleted successfully"
    })

  } catch (error) {
    console.error("[API] Error deleting intervention:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete intervention" },
      { status: 500 }
    )
  }
}
