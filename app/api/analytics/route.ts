import { NextRequest, NextResponse } from "next/server"
import { neonService } from "../../../lib/neon-service"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// Get comprehensive analytics and statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'

    switch (type) {
      case 'overview':
        const stats = await neonService.getStudentStatistics()
        const highRiskStudents = await neonService.getStudents({ riskLevel: 'High' })
        const criticalRiskStudents = await neonService.getStudents({ riskLevel: 'Critical' })
        
        return NextResponse.json({
          success: true,
          data: {
            statistics: stats,
            highRiskStudents: highRiskStudents.slice(0, 10), // Top 10 high-risk
            criticalRiskStudents: criticalRiskStudents.slice(0, 5), // Top 5 critical-risk
            riskDistribution: {
              low: stats.lowRiskStudents,
              medium: stats.mediumRiskStudents,
              high: stats.highRiskStudents,
              critical: stats.criticalRiskStudents
            }
          }
        })

      case 'risk-analysis':
        const allStudents = await neonService.getStudents({ limit: 1000 })
        const statsForRiskAnalysis = await neonService.getStudentStatistics()
        const riskAnalysis = {
          totalStudents: allStudents.length,
          dropoutRate: (statsForRiskAnalysis.dropoutStudents / statsForRiskAnalysis.totalStudents) * 100,
          avgRiskScore: allStudents.reduce((sum: number, s: any) => sum + s.RiskScore, 0) / allStudents.length,
          riskFactors: {
            lowAttendance: allStudents.filter((s: any) => s.AvgAttendance_LatestTerm < 70).length,
            poorPerformance: allStudents.filter((s: any) => s.AvgMarks_LatestTerm < 50).length,
            ruralStudents: allStudents.filter((s: any) => s.IsRural).length,
            firstGeneration: allStudents.filter((s: any) => s.IsFirstGenerationLearner).length
          }
        }
        
        return NextResponse.json({
          success: true,
          data: riskAnalysis
        })

      case 'trends':
        // Mock trend data for now
        const trends = {
          monthlyDropoutRate: [5.2, 4.8, 6.1, 5.5, 4.9, 5.8],
          monthlyAttendance: [75.2, 76.1, 74.8, 75.9, 76.3, 75.7],
          monthlyPerformance: [62.1, 63.4, 61.8, 62.9, 63.7, 62.5],
          riskLevelChanges: {
            lowToMedium: 12,
            mediumToHigh: 8,
            highToCritical: 3,
            improved: 15
          }
        }
        
        return NextResponse.json({
          success: true,
          data: trends
        })

      default:
        return NextResponse.json(
          { success: false, error: "Invalid analytics type" },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("[API] Error fetching analytics:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
