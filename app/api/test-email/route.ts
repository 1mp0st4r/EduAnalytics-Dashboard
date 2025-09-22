import { NextRequest, NextResponse } from "next/server"
import { EmailService } from "../../../lib/email-service"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { to, subject, text } = await request.json()

    const emailService = new EmailService()
    
    // Test email configuration
    const isConnected = await emailService.verifyConnection()
    
    if (!isConnected) {
      return NextResponse.json(
        { success: false, error: "Email service not configured properly" },
        { status: 500 }
      )
    }

    // Send test email
    const testNotification = {
      to: [{ email: to, name: "Test User", type: "admin" as const }],
      template: {
        subject: subject || "Test Email from EduAnalytics",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">EduAnalytics Test Email</h2>
            <p>This is a test email to verify the email service configuration.</p>
            <p><strong>Message:</strong> ${text || "No message provided"}</p>
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              This is an automated message from EduAnalytics Dashboard.
            </p>
          </div>
        `,
        textContent: `EduAnalytics Test Email\n\nThis is a test email to verify the email service configuration.\n\nMessage: ${text || "No message provided"}\nTimestamp: ${new Date().toLocaleString()}\n\nThis is an automated message from EduAnalytics Dashboard.`
      },
      priority: "low" as const
    }

    const success = await emailService.sendEmail(testNotification)

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Test email sent successfully",
        data: {
          to,
          subject: testNotification.template.subject,
          timestamp: new Date().toISOString()
        }
      })
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to send test email" },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error("[API] Error testing email:", error)
    return NextResponse.json(
      { success: false, error: "Email test failed" },
      { status: 500 }
    )
  }
}