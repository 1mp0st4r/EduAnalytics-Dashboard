import { NextRequest, NextResponse } from "next/server"
import { neonService } from "../../../../lib/neon-service"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// Get mentor by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const mentorId = params.id

    if (!mentorId) {
      return NextResponse.json(
        { success: false, error: "Mentor ID is required" },
        { status: 400 }
      )
    }

    const mentor = await neonService.getMentorById(mentorId)

    if (!mentor) {
      return NextResponse.json(
        { success: false, error: "Mentor not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: mentor
    })

  } catch (error) {
    console.error("[API] Error fetching mentor:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch mentor" },
      { status: 500 }
    )
  }
}

// Update mentor
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const mentorId = params.id
    const updateData = await request.json()

    if (!mentorId) {
      return NextResponse.json(
        { success: false, error: "Mentor ID is required" },
        { status: 400 }
      )
    }

    // Check if mentor exists
    const existingMentor = await neonService.getMentorById(mentorId)
    if (!existingMentor) {
      return NextResponse.json(
        { success: false, error: "Mentor not found" },
        { status: 404 }
      )
    }

    // Update mentor in database
    const updatedMentor = await neonService.updateMentor(mentorId, updateData)

    if (!updatedMentor) {
      throw new Error('Failed to update mentor in database')
    }

    return NextResponse.json({
      success: true,
      data: updatedMentor,
      message: "Mentor updated successfully"
    })

  } catch (error) {
    console.error("[API] Error updating mentor:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update mentor" },
      { status: 500 }
    )
  }
}

// Delete mentor
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const mentorId = params.id

    if (!mentorId) {
      return NextResponse.json(
        { success: false, error: "Mentor ID is required" },
        { status: 400 }
      )
    }

    // Check if mentor exists
    const existingMentor = await neonService.getMentorById(mentorId)
    if (!existingMentor) {
      return NextResponse.json(
        { success: false, error: "Mentor not found" },
        { status: 404 }
      )
    }

    // Delete mentor from database
    const deleted = await neonService.deleteMentor(mentorId)

    if (!deleted) {
      throw new Error('Failed to delete mentor from database')
    }

    return NextResponse.json({
      success: true,
      message: "Mentor deleted successfully"
    })

  } catch (error) {
    console.error("[API] Error deleting mentor:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete mentor" },
      { status: 500 }
    )
  }
}
