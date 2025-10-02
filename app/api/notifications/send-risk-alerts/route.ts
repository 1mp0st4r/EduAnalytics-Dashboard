import { type NextRequest, NextResponse } from "next/server"
import { emailService } from "../../../../lib/email-service"
import { neonService } from "../../../../lib/neon-service"

export async function POST(request: NextRequest) {
  try {
    console.log("[API] Starting high-risk alerts sending process")

    // Get high-risk students
    const highRiskStudents = await neonService.getStudents({ riskLevel: "High" })

    if (highRiskStudents.length === 0) {
      return NextResponse.json({ message: "No high-risk students found", sent: 0, failed: 0 })
    }

    // Send bulk high-risk alerts
    const result = await emailService.sendBulkHighRiskAlerts(highRiskStudents)

    // Log the results
    console.log(`[API] High-risk alerts completed: ${result.sent} sent, ${result.failed} failed`)

    return NextResponse.json({
      message: "High-risk alerts sending completed",
      totalHighRiskStudents: highRiskStudents.length,
      sent: result.sent,
      failed: result.failed,
      successRate: Math.round((result.sent / highRiskStudents.length) * 100),
    })
  } catch (error) {
    console.error("[API] Error sending high-risk alerts:", error)
    return NextResponse.json({ error: "Failed to send high-risk alerts" }, { status: 500 })
  }
}
