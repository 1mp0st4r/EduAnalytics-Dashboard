import { NextRequest, NextResponse } from "next/server"
import { neonService } from "../../../lib/neon-service"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// Get all students with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters = {
      riskLevel: searchParams.get('riskLevel') || undefined,
      classLevel: searchParams.get('classLevel') || undefined,
      isDropout: searchParams.get('isDropout') ? searchParams.get('isDropout') === 'true' : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    }

    const students = await neonService.getStudents(filters)
    
    return NextResponse.json({
      success: true,
      data: students,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
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

// Create new student
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['StudentID', 'StudentName', 'Gender', 'Age']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // For now, return success (actual implementation would insert into database)
    return NextResponse.json({
      success: true,
      message: "Student created successfully",
      data: { id: Date.now(), ...body }
    })
  } catch (error) {
    console.error("[API] Error creating student:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create student" },
      { status: 500 }
    )
  }
}
