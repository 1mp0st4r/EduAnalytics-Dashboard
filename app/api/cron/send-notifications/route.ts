import { NextRequest, NextResponse } from "next/server"
import { neonService } from "../../../../lib/neon-service"
import { emailService } from "../../../../lib/email-service"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// Cron job endpoint for sending scheduled notifications
export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    console.log('[CRON] Starting scheduled notification job...')

    // Get high-risk students
    const highRiskStudents = await neonService.getHighRiskStudents()
    console.log(`[CRON] Found ${highRiskStudents.length} high-risk students`)

    // Get mentors with assigned students
    const mentors = await neonService.getAllMentors()
    console.log(`[CRON] Found ${mentors.length} mentors`)

    let emailsSent = 0
    let errors = 0

    // Send alerts to mentors about their high-risk students
    for (const mentor of mentors) {
      try {
        const mentorStudents = await neonService.getStudentsByMentorId(mentor.id)
        const highRiskMentorStudents = mentorStudents.filter(
          student => student.risk_level === 'Critical' || student.risk_level === 'High'
        )

        if (highRiskMentorStudents.length > 0) {
          await emailService.sendRiskAlertEmail(
            mentor.email,
            mentor.full_name,
            highRiskMentorStudents
          )
          emailsSent++
          console.log(`[CRON] Sent risk alert to mentor: ${mentor.email}`)
        }
      } catch (error) {
        console.error(`[CRON] Error sending email to mentor ${mentor.email}:`, error)
        errors++
      }
    }

    // Send monthly reports to admins
    try {
      const adminUsers = await neonService.getUsersByType('admin')
      const statistics = await neonService.getOverallStatistics()

      for (const admin of adminUsers) {
        await emailService.sendMonthlyReportEmail(
          admin.email,
          admin.full_name,
          statistics
        )
        emailsSent++
        console.log(`[CRON] Sent monthly report to admin: ${admin.email}`)
      }
    } catch (error) {
      console.error('[CRON] Error sending monthly reports:', error)
      errors++
    }

    // Send intervention reminders
    try {
      const pendingInterventions = await neonService.getPendingInterventions()
      
      for (const intervention of pendingInterventions) {
        const mentor = await neonService.getMentorById(intervention.mentor_id)
        if (mentor) {
          await emailService.sendInterventionReminderEmail(
            mentor.email,
            mentor.full_name,
            intervention
          )
          emailsSent++
          console.log(`[CRON] Sent intervention reminder to mentor: ${mentor.email}`)
        }
      }
    } catch (error) {
      console.error('[CRON] Error sending intervention reminders:', error)
      errors++
    }

    console.log(`[CRON] Job completed. Emails sent: ${emailsSent}, Errors: ${errors}`)

    return NextResponse.json({
      success: true,
      message: "Cron job completed successfully",
      data: {
        emailsSent,
        errors,
        highRiskStudents: highRiskStudents.length,
        mentors: mentors.length
      }
    })

  } catch (error) {
    console.error('[CRON] Error in scheduled notification job:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Cron job failed",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
