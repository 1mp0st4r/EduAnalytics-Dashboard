import { NextRequest, NextResponse } from "next/server"
import { neonService } from "../../../lib/neon-service"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// Get all mentors
export async function GET(request: NextRequest) {
  try {
    const mentors = await neonService.getMentors()

    return NextResponse.json({
      success: true,
      data: mentors,
      count: mentors.length
    })
  } catch (error) {
    console.error("[API] Error fetching mentors:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch mentors" },
      { status: 500 }
    )
  }
}

// Add new mentor
export async function POST(request: NextRequest) {
  try {
    const mentorData = await request.json()
    
    // Validate required fields
    if (!mentorData.userId || !mentorData.employeeId) {
      return NextResponse.json(
        { success: false, error: "User ID and Employee ID are required" },
        { status: 400 }
      )
    }

    // Check if user exists and is of type 'mentor'
    const user = await neonService.getUserById(mentorData.userId)
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    if (user.user_type !== 'mentor') {
      return NextResponse.json(
        { success: false, error: "User must be of type 'mentor'" },
        { status: 400 }
      )
    }

    // Create mentor in database
    const newMentor = await neonService.createMentor({
      userId: mentorData.userId,
      employeeId: mentorData.employeeId,
      specialization: mentorData.specialization,
      experienceYears: mentorData.experienceYears,
      maxStudents: mentorData.maxStudents
    })

    if (!newMentor) {
      throw new Error('Failed to create mentor in database')
    }

    return NextResponse.json({
      success: true,
      data: newMentor,
      message: "Mentor added successfully"
    })
  } catch (error) {
    console.error("[API] Error adding mentor:", error)
    return NextResponse.json(
      { success: false, error: "Failed to add mentor" },
      { status: 500 }
    )
  }
}
