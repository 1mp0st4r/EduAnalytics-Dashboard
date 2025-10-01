import { NextRequest, NextResponse } from "next/server"
import { neonService } from "../../../../lib/neon-service"
import { validateStudentData, sanitizeObject, ValidationError, validateIntegerId } from "../../../../lib/validation"

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
    const rawUpdateData = await request.json()

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: "Student ID is required" },
        { status: 400 }
      )
    }

    // Sanitize input data
    const updateData = sanitizeObject(rawUpdateData)
    
    // Validate update data (only validate provided fields)
    const validation = validateStudentData(updateData)
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: validation.errors },
        { status: 400 }
      )
    }

    // Check if student exists
    const existingStudent = await neonService.getStudentById(studentId)
    if (!existingStudent) {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 }
      )
    }

    // Update student in database
    const updatedStudent = await neonService.updateStudent(studentId, updateData)

    if (!updatedStudent) {
      throw new Error('Failed to update student in database')
    }

    return NextResponse.json({
      success: true,
      data: updatedStudent,
      message: "Student updated successfully"
    })

  } catch (error) {
    console.error("[API] Error updating student:", error)
    
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    
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
    const { searchParams } = new URL(request.url)
    const hardDelete = searchParams.get('hard') === 'true'

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: "Student ID is required" },
        { status: 400 }
      )
    }

    // Check if student exists
    const existingStudent = await neonService.getStudentById(studentId)
    if (!existingStudent) {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 }
      )
    }

    // Delete student from database
    const deleted = hardDelete 
      ? await neonService.hardDeleteStudent(studentId)
      : await neonService.deleteStudent(studentId)

    if (!deleted) {
      throw new Error('Failed to delete student from database')
    }

    return NextResponse.json({
      success: true,
      message: hardDelete ? "Student permanently deleted" : "Student deleted successfully"
    })

  } catch (error) {
    console.error("[API] Error deleting student:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete student" },
      { status: 500 }
    )
  }
}