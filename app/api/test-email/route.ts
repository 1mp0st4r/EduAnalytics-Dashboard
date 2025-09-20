import { NextRequest, NextResponse } from "next/server"
const nodemailer = require('nodemailer')

// Test email configuration endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { testEmail } = body

    if (!testEmail) {
      return NextResponse.json(
        { success: false, error: "Test email address is required" },
        { status: 400 }
      )
    }

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@eduanalytics.gov.in',
        pass: process.env.EMAIL_API_KEY || process.env.SMTP_PASS || 'your_smtp_password'
      },
      tls: {
        rejectUnauthorized: false
      }
    })

    // Test email content
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@eduanalytics.gov.in',
      to: testEmail,
      subject: '🧪 EduAnalytics SMTP Test',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>SMTP Test</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 20px; background: #f8f9fa; border-radius: 0 0 8px 8px; }
            .success { background: #d1fae5; border: 1px solid #10b981; padding: 15px; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 SMTP Configuration Successful!</h1>
              <p>EduAnalytics Email System Test</p>
            </div>
            
            <div class="content">
              <div class="success">
                <h3>✅ Email Configuration Working</h3>
                <p>Your SMTP settings are correctly configured and emails are being sent successfully!</p>
              </div>
              
              <h3>Configuration Details:</h3>
              <ul>
                <li><strong>SMTP Host:</strong> ${process.env.SMTP_HOST || 'smtp.gmail.com'}</li>
                <li><strong>SMTP Port:</strong> ${process.env.SMTP_PORT || '587'}</li>
                <li><strong>From Email:</strong> ${process.env.FROM_EMAIL || 'noreply@eduanalytics.gov.in'}</li>
                <li><strong>Secure:</strong> ${process.env.SMTP_SECURE === 'true' ? 'Yes' : 'No'}</li>
              </ul>
              
              <p><strong>Next Steps:</strong></p>
              <ol>
                <li>Your email system is ready for production use</li>
                <li>You can now send risk alerts, attendance notifications, and reports</li>
                <li>Test different notification types from the dashboard</li>
              </ol>
            </div>
          </div>
        </body>
        </html>
      `
    }

    // Send test email
    await transporter.sendMail(mailOptions)

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully!",
      data: {
        testEmail: testEmail,
        smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
        smtpPort: process.env.SMTP_PORT || '587',
        fromEmail: process.env.FROM_EMAIL || 'noreply@eduanalytics.gov.in'
      }
    })

  } catch (error) {
    console.error("[API] SMTP test failed:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "SMTP configuration failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
