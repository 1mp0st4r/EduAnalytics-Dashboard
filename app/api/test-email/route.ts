import { NextRequest, NextResponse } from "next/server"
import { emailService } from "../../../lib/email-service"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log("[API] Testing email service connection...")
    
    // Test email connection
    const connectionTest = await emailService.testEmailConnection()
    
    if (!connectionTest) {
      return NextResponse.json({
        success: false,
        error: "Email service connection failed",
        details: "Check SMTP configuration and credentials"
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Email service connection successful",
      data: {
        connection: "SMTP",
        status: "Connected",
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error("[API] Error testing email service:", error)
    return NextResponse.json(
      { success: false, error: "Email service test failed" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email address is required" },
        { status: 400 }
      )
    }

    console.log(`[API] Sending test email to ${email}...`)
    
    // Send test email
    const emailSent = await emailService.sendTestEmail(email)
    
    if (!emailSent) {
      return NextResponse.json({
        success: false,
        error: "Failed to send test email",
        details: "Check email configuration and recipient address"
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully to ${email}`,
      data: {
        recipient: email,
        sentAt: new Date().toISOString(),
        status: "Delivered"
      }
    })

  } catch (error) {
    console.error("[API] Error sending test email:", error)
    return NextResponse.json(
      { success: false, error: "Failed to send test email" },
      { status: 500 }
    )
  }
}