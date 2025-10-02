import { type NextRequest, NextResponse } from "next/server"
import { emailService } from "../../../../lib/email-service"
import { neonService } from "../../../../lib/neon-service"

export async function POST(request: NextRequest) {
  try {
    const { studentId, issueData } = await request.json()

    if (!studentId || !issueData) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 })
    }

    console.log(`[API] Sending issue report for student ${studentId}`)

    // Get student details
    const student = await neonService.getStudentById(studentId)

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Send issue report email
    const success = await emailService.sendIssueReport(student, issueData)

    if (success) {
      return NextResponse.json({
        message: "Issue report sent successfully",
        studentId,
        issueType: issueData.issue_type,
      })
    } else {
      return NextResponse.json({ error: "Failed to send issue report" }, { status: 500 })
    }
  } catch (error) {
    console.error("[API] Error sending issue report:", error)
    return NextResponse.json({ error: "Failed to send issue report" }, { status: 500 })
  }
}
