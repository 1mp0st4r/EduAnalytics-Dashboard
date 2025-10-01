import { NextRequest, NextResponse } from "next/server"
import { neonService } from "../../../lib/neon-service"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// Get all schools
export async function GET(request: NextRequest) {
  try {
    const schools = await neonService.getSchools()

    return NextResponse.json({
      success: true,
      data: schools,
      count: schools.length
    })
  } catch (error) {
    console.error("[API] Error fetching schools:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch schools" },
      { status: 500 }
    )
  }
}

// Add new school
export async function POST(request: NextRequest) {
  try {
    const schoolData = await request.json()
    
    // Validate required fields
    if (!schoolData.name) {
      return NextResponse.json(
        { success: false, error: "School name is required" },
        { status: 400 }
      )
    }

    // Create school in database
    const newSchool = await neonService.createSchool({
      name: schoolData.name,
      address: schoolData.address,
      district: schoolData.district,
      state: schoolData.state,
      contactPhone: schoolData.contactPhone,
      contactEmail: schoolData.contactEmail
    })

    if (!newSchool) {
      throw new Error('Failed to create school in database')
    }

    return NextResponse.json({
      success: true,
      data: newSchool,
      message: "School added successfully"
    })
  } catch (error) {
    console.error("[API] Error adding school:", error)
    return NextResponse.json(
      { success: false, error: "Failed to add school" },
      { status: 500 }
    )
  }
}
