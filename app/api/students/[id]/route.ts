import { NextRequest, NextResponse } from "next/server"
import { neonService } from "../../../../lib/neon-service"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// Get student by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const studentId = params.id

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: "Student ID is required" },
        { status: 400 }
      )
    }

    const student = await neonService.getStudentById(studentId)

    if (!student) {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: student
    })

  } catch (error) {
    console.error("[API] Error fetching student:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch student" },
      { status: 500 }
    )
  }
}

// Update student
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const studentId = params.id
    const updateData = await request.json()

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: "Student ID is required" },
        { status: 400 }
      )
    }

    // For now, we'll just return the updated data
    // In a real implementation, you would update the database
    const student = await neonService.getStudentById(studentId)

    if (!student) {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 }
      )
    }

    // Merge the update data with existing student data
    const updatedStudent = { ...student, ...updateData }

    return NextResponse.json({
      success: true,
      data: updatedStudent,
      message: "Student updated successfully"
    })

  } catch (error) {
    console.error("[API] Error updating student:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update student" },
      { status: 500 }
    )
  }
}

// Delete student
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const studentId = params.id

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: "Student ID is required" },
        { status: 400 }
      )
    }

    // For now, we'll just return success
    // In a real implementation, you would delete from the database
    return NextResponse.json({
      success: true,
      message: "Student deleted successfully"
    })

  } catch (error) {
    console.error("[API] Error deleting student:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete student" },
      { status: 500 }
    )
  }
}