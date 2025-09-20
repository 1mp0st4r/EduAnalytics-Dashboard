import { type NextRequest, NextResponse } from "next/server"
import { emailService } from "@/lib/email-service"
import { dbService } from "@/lib/database-service"

export async function POST(request: NextRequest) {
  try {
    console.log("[API] Starting monthly reports sending process")

    // Get all active students
    const students = await dbService.getStudents()

    if (students.length === 0) {
      return NextResponse.json({ message: "No students found", sent: 0, failed: 0 })
    }

    // Send bulk monthly reports
    const result = await emailService.sendBulkMonthlyReports(students)

    // Log the results
    console.log(`[API] Monthly reports completed: ${result.sent} sent, ${result.failed} failed`)

    return NextResponse.json({
      message: "Monthly reports sending completed",
      totalStudents: students.length,
      sent: result.sent,
      failed: result.failed,
      successRate: Math.round((result.sent / students.length) * 100),
    })
  } catch (error) {
    console.error("[API] Error sending monthly reports:", error)
    return NextResponse.json({ error: "Failed to send monthly reports" }, { status: 500 })
  }
}
