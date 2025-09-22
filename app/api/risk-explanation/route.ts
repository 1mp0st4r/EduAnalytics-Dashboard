import { NextRequest, NextResponse } from "next/server"
import { riskExplanationService } from "../../../lib/risk-explanation"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// Get risk explanation for a student
export async function POST(request: NextRequest) {
  try {
    const studentData = await request.json()
    
    // Validate required fields
    if (!studentData.RiskLevel || !studentData.RiskScore) {
      return NextResponse.json(
        { success: false, error: "Student risk data is required" },
        { status: 400 }
      )
    }

    // Generate comprehensive risk explanation
    const explanation = riskExplanationService.generateExplanation(studentData)
    const styling = riskExplanationService.getRiskStyling(studentData.RiskLevel)
    const timeline = riskExplanationService.getInterventionTimeline(studentData.RiskLevel)

    return NextResponse.json({
      success: true,
      data: {
        explanation,
        styling,
        timeline,
        generatedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error("[API] Error generating risk explanation:", error)
    return NextResponse.json(
      { success: false, error: "Failed to generate risk explanation" },
      { status: 500 }
    )
  }
}

// Get risk explanation for multiple students
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const riskLevel = searchParams.get('riskLevel')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10

    // This would typically fetch students from database and generate explanations
    // For now, return a sample response
    return NextResponse.json({
      success: true,
      data: {
        message: "Use POST method to get risk explanation for specific student data",
        riskLevels: ['Critical', 'High', 'Medium', 'Low'],
        availableFields: [
          'RiskLevel',
          'RiskScore', 
          'AvgAttendance_LatestTerm',
          'AvgMarks_LatestTerm',
          'DropoutProbability',
          'Gender',
          'StudentClass'
        ]
      }
    })
  } catch (error) {
    console.error("[API] Error in risk explanation GET:", error)
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    )
  }
}
