import { NextRequest, NextResponse } from "next/server"
import { neonService } from "@/lib/neon-service"

// Get specific student by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const student = await neonService.getStudentById(params.id)
    
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

// Update student risk assessment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { riskLevel, riskScore, dropoutProbability } = body

    if (!riskLevel || riskScore === undefined || dropoutProbability === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: riskLevel, riskScore, dropoutProbability" },
        { status: 400 }
      )
    }

    const updated = await neonService.updateStudentRisk(
      params.id,
      riskLevel,
      riskScore,
      dropoutProbability
    )

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Failed to update student risk" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Student risk assessment updated successfully"
    })
  } catch (error) {
    console.error("[API] Error updating student:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update student" },
      { status: 500 }
    )
  }
}
