import { NextRequest, NextResponse } from "next/server"
const nodemailer = require('nodemailer')
import { dbService } from "@/lib/database-service"

// Email notification system
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, studentId, recipientEmail, customMessage } = body

    if (!type || !studentId) {
      return NextResponse.json(
        { success: false, error: "Type and studentId are required" },
        { status: 400 }
      )
    }

    // Get student data
    const student = await dbService.getStudentById(studentId)
    if (!student) {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 }
      )
    }

    // Configure email transporter with flexible SMTP settings
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@eduanalytics.gov.in',
        pass: process.env.EMAIL_API_KEY || process.env.SMTP_PASS || 'your_smtp_password'
      },
      tls: {
        rejectUnauthorized: false // Allow self-signed certificates
      }
    })

    let emailContent
    let subject

    switch (type) {
      case 'risk-alert':
        subject = `🚨 High Risk Alert - Student ${student.StudentID}`
        emailContent = generateRiskAlertEmail(student)
        break

      case 'dropout-warning':
        subject = `⚠️ Dropout Risk Warning - Student ${student.StudentID}`
        emailContent = generateDropoutWarningEmail(student)
        break

      case 'attendance-alert':
        subject = `📊 Attendance Alert - Student ${student.StudentID}`
        emailContent = generateAttendanceAlertEmail(student)
        break

      case 'performance-alert':
        subject = `📈 Performance Alert - Student ${student.StudentID}`
        emailContent = generatePerformanceAlertEmail(student)
        break

      case 'monthly-report':
        subject = `📋 Monthly Student Report - ${student.StudentID}`
        emailContent = generateMonthlyReportEmail(student)
        break

      case 'custom':
        subject = `📧 Custom Message - Student ${student.StudentID}`
        emailContent = generateCustomEmail(student, customMessage)
        break

      default:
        return NextResponse.json(
          { success: false, error: "Invalid notification type" },
          { status: 400 }
        )
    }

    // Send email
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@eduanalytics.gov.in',
      to: recipientEmail || student.ContactPhoneNumber || 'mentor@school.edu',
      subject: subject,
      html: emailContent
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json({
      success: true,
      message: `${type} notification sent successfully`,
      data: {
        studentId: student.StudentID,
        recipientEmail: mailOptions.to,
        notificationType: type
      }
    })

  } catch (error) {
    console.error("[API] Error sending notification:", error)
    return NextResponse.json(
      { success: false, error: "Failed to send notification" },
      { status: 500 }
    )
  }
}

// Generate risk alert email
function generateRiskAlertEmail(student: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>High Risk Alert</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8f9fa; }
        .alert { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 15px 0; }
        .student-info { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚨 HIGH RISK ALERT</h1>
          <p>Immediate Attention Required</p>
        </div>
        
        <div class="content">
          <div class="alert">
            <h3>⚠️ Student at High Risk of Dropout</h3>
            <p>Student <strong>${student.StudentID}</strong> has been identified as high risk and requires immediate intervention.</p>
          </div>
          
          <div class="student-info">
            <h3>Student Information</h3>
            <p><strong>Name:</strong> ${student.StudentName || 'N/A'}</p>
            <p><strong>Student ID:</strong> ${student.StudentID}</p>
            <p><strong>Risk Level:</strong> ${student.RiskLevel}</p>
            <p><strong>Risk Score:</strong> ${student.RiskScore}/100</p>
            <p><strong>Dropout Probability:</strong> ${student.DropoutProbability}%</p>
            <p><strong>Attendance:</strong> ${student.AvgAttendance_LatestTerm}%</p>
            <p><strong>Performance:</strong> ${student.AvgMarks_LatestTerm}%</p>
          </div>
          
          <div class="alert">
            <h3>Recommended Actions</h3>
            <ul>
              <li>Schedule immediate counseling session</li>
              <li>Contact parents/guardians</li>
              <li>Assign dedicated mentor</li>
              <li>Implement intervention plan</li>
              <li>Monitor progress weekly</li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p>EduAnalytics Dashboard - Student Success Platform</p>
          <p>This is an automated alert. Please take immediate action.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Generate dropout warning email
function generateDropoutWarningEmail(student: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Dropout Risk Warning</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #fd7e14; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8f9fa; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 15px 0; }
        .student-info { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ DROPOUT RISK WARNING</h1>
          <p>Student Requires Attention</p>
        </div>
        
        <div class="content">
          <div class="warning">
            <h3>⚠️ Student Showing Dropout Risk Indicators</h3>
            <p>Student <strong>${student.StudentID}</strong> is showing concerning patterns that may lead to dropout.</p>
          </div>
          
          <div class="student-info">
            <h3>Student Information</h3>
            <p><strong>Name:</strong> ${student.StudentName || 'N/A'}</p>
            <p><strong>Student ID:</strong> ${student.StudentID}</p>
            <p><strong>Risk Level:</strong> ${student.RiskLevel}</p>
            <p><strong>Dropout Probability:</strong> ${student.DropoutProbability}%</p>
            <p><strong>Attendance:</strong> ${student.AvgAttendance_LatestTerm}%</p>
            <p><strong>Performance:</strong> ${student.AvgMarks_LatestTerm}%</p>
          </div>
          
          <div class="warning">
            <h3>Risk Factors Identified</h3>
            <ul>
              ${student.AvgAttendance_LatestTerm < 70 ? '<li>Low attendance rate</li>' : ''}
              ${student.AvgMarks_LatestTerm < 50 ? '<li>Poor academic performance</li>' : ''}
              ${student.IsRural ? '<li>Rural background</li>' : ''}
              ${student.IsFirstGenerationLearner ? '<li>First generation learner</li>' : ''}
              ${student.WorksPartTime ? '<li>Part-time work commitments</li>' : ''}
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p>EduAnalytics Dashboard - Student Success Platform</p>
          <p>Please review and take appropriate action.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Generate attendance alert email
function generateAttendanceAlertEmail(student: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Attendance Alert</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #17a2b8; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8f9fa; }
        .alert { background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; margin: 15px 0; }
        .student-info { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 ATTENDANCE ALERT</h1>
          <p>Student Attendance Concern</p>
        </div>
        
        <div class="content">
          <div class="alert">
            <h3>📉 Low Attendance Detected</h3>
            <p>Student <strong>${student.StudentID}</strong> has concerning attendance patterns.</p>
          </div>
          
          <div class="student-info">
            <h3>Student Information</h3>
            <p><strong>Name:</strong> ${student.StudentName || 'N/A'}</p>
            <p><strong>Student ID:</strong> ${student.StudentID}</p>
            <p><strong>Current Attendance:</strong> ${student.AvgAttendance_LatestTerm}%</p>
            <p><strong>Target Attendance:</strong> 80%</p>
            <p><strong>Attendance Gap:</strong> ${80 - student.AvgAttendance_LatestTerm}%</p>
          </div>
          
          <div class="alert">
            <h3>Recommended Actions</h3>
            <ul>
              <li>Contact student to understand reasons for absence</li>
              <li>Notify parents/guardians about attendance</li>
              <li>Provide support for any underlying issues</li>
              <li>Implement attendance improvement plan</li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p>EduAnalytics Dashboard - Student Success Platform</p>
          <p>Please address attendance concerns promptly.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Generate performance alert email
function generatePerformanceAlertEmail(student: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Performance Alert</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6f42c1; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8f9fa; }
        .alert { background: #e2e3f0; border: 1px solid #c5c6d0; padding: 15px; margin: 15px 0; }
        .student-info { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📈 PERFORMANCE ALERT</h1>
          <p>Academic Performance Concern</p>
        </div>
        
        <div class="content">
          <div class="alert">
            <h3>📉 Academic Performance Decline</h3>
            <p>Student <strong>${student.StudentID}</strong> is showing declining academic performance.</p>
          </div>
          
          <div class="student-info">
            <h3>Student Information</h3>
            <p><strong>Name:</strong> ${student.StudentName || 'N/A'}</p>
            <p><strong>Student ID:</strong> ${student.StudentID}</p>
            <p><strong>Current Performance:</strong> ${student.AvgMarks_LatestTerm}%</p>
            <p><strong>Previous Performance:</strong> ${student.AvgMarks_PreviousTerm || 'N/A'}%</p>
            <p><strong>Performance Trend:</strong> ${student.MarksTrend > 0 ? 'Improving' : 'Declining'}</p>
          </div>
          
          <div class="alert">
            <h3>Recommended Actions</h3>
            <ul>
              <li>Schedule academic counseling session</li>
              <li>Identify learning difficulties</li>
              <li>Provide additional academic support</li>
              <li>Arrange tutoring or remedial classes</li>
              <li>Monitor progress closely</li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p>EduAnalytics Dashboard - Student Success Platform</p>
          <p>Please provide academic support and monitoring.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Generate monthly report email
function generateMonthlyReportEmail(student: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Monthly Student Report</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #28a745; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8f9fa; }
        .report { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 MONTHLY STUDENT REPORT</h1>
          <p>Student Progress Summary</p>
        </div>
        
        <div class="content">
          <div class="report">
            <h3>Student Information</h3>
            <p><strong>Name:</strong> ${student.StudentName || 'N/A'}</p>
            <p><strong>Student ID:</strong> ${student.StudentID}</p>
            <p><strong>Current Risk Level:</strong> ${student.RiskLevel}</p>
          </div>
          
          <div class="report">
            <h3>Academic Performance</h3>
            <p><strong>Attendance:</strong> ${student.AvgAttendance_LatestTerm}%</p>
            <p><strong>Performance:</strong> ${student.AvgMarks_LatestTerm}%</p>
            <p><strong>Risk Score:</strong> ${student.RiskScore}/100</p>
          </div>
          
          <div class="report">
            <h3>Key Metrics</h3>
            <p><strong>Dropout Probability:</strong> ${student.DropoutProbability}%</p>
            <p><strong>Failure Rate:</strong> ${student.FailureRate_LatestTerm}%</p>
            <p><strong>Performance Trend:</strong> ${student.MarksTrend > 0 ? 'Improving' : 'Declining'}</p>
          </div>
        </div>
        
        <div class="footer">
          <p>EduAnalytics Dashboard - Student Success Platform</p>
          <p>Monthly automated report for student monitoring.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Generate custom email
function generateCustomEmail(student: any, customMessage: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Custom Message</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6c757d; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8f9fa; }
        .message { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📧 CUSTOM MESSAGE</h1>
          <p>Personal Communication</p>
        </div>
        
        <div class="content">
          <div class="message">
            <h3>Message for Student ${student.StudentID}</h3>
            <p><strong>Student Name:</strong> ${student.StudentName || 'N/A'}</p>
            <hr>
            <p>${customMessage || 'No custom message provided.'}</p>
          </div>
        </div>
        
        <div class="footer">
          <p>EduAnalytics Dashboard - Student Success Platform</p>
          <p>Custom message sent via automated system.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
