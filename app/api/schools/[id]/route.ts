import { NextRequest, NextResponse } from "next/server"
import { neonService } from "../../../../lib/neon-service"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// Get school by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const schoolId = params.id

    if (!schoolId) {
      return NextResponse.json(
        { success: false, error: "School ID is required" },
        { status: 400 }
      )
    }

    const school = await neonService.getSchoolById(schoolId)

    if (!school) {
      return NextResponse.json(
        { success: false, error: "School not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: school
    })

  } catch (error) {
    console.error("[API] Error fetching school:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch school" },
      { status: 500 }
    )
  }
}

// Update school
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const schoolId = params.id
    const updateData = await request.json()

    if (!schoolId) {
      return NextResponse.json(
        { success: false, error: "School ID is required" },
        { status: 400 }
      )
    }

    // Check if school exists
    const existingSchool = await neonService.getSchoolById(schoolId)
    if (!existingSchool) {
      return NextResponse.json(
        { success: false, error: "School not found" },
        { status: 404 }
      )
    }

    // Update school in database
    const updatedSchool = await neonService.updateSchool(schoolId, updateData)

    if (!updatedSchool) {
      throw new Error('Failed to update school in database')
    }

    return NextResponse.json({
      success: true,
      data: updatedSchool,
      message: "School updated successfully"
    })

  } catch (error) {
    console.error("[API] Error updating school:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update school" },
      { status: 500 }
    )
  }
}

// Delete school
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const schoolId = params.id

    if (!schoolId) {
      return NextResponse.json(
        { success: false, error: "School ID is required" },
        { status: 400 }
      )
    }

    // Check if school exists
    const existingSchool = await neonService.getSchoolById(schoolId)
    if (!existingSchool) {
      return NextResponse.json(
        { success: false, error: "School not found" },
        { status: 404 }
      )
    }

    // Delete school from database
    const deleted = await neonService.deleteSchool(schoolId)

    if (!deleted) {
      throw new Error('Failed to delete school from database')
    }

    return NextResponse.json({
      success: true,
      message: "School deleted successfully"
    })

  } catch (error) {
    console.error("[API] Error deleting school:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete school" },
      { status: 500 }
    )
  }
}
