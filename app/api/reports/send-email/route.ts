import { NextRequest, NextResponse } from "next/server"
const nodemailer = require('nodemailer')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reportData, recipientEmail, recipientName, customMessage } = body

    if (!reportData || !recipientEmail) {
      return NextResponse.json(
        { success: false, error: "Report data and recipient email are required" },
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

    // Generate email content
    const emailContent = generateReportEmail(reportData, recipientName, customMessage)
    const subject = `📊 ${reportData.name} - Student ${reportData.student?.id || 'Report'}`

    // Send email
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@eduanalytics.gov.in',
      to: recipientEmail,
      subject: subject,
      html: emailContent,
      attachments: [
        {
          filename: `${reportData.name.replace(/[^a-zA-Z0-9]/g, '_')}.html`,
          content: generateReportHTML(reportData),
          contentType: 'text/html'
        }
      ]
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json({
      success: true,
      message: "Report sent successfully via email",
      data: {
        recipientEmail,
        reportId: reportData.id,
        reportType: reportData.type,
        sentAt: new Date('2025-01-09').toISOString()
      }
    })

  } catch (error) {
    console.error("[API] Error sending report via email:", error)
    return NextResponse.json(
      { success: false, error: "Failed to send report via email" },
      { status: 500 }
    )
  }
}

// Generate email content for reports
function generateReportEmail(reportData: any, recipientName?: string, customMessage?: string): string {
  const reportDate = new Date(reportData.generatedAt).toLocaleDateString()
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Student Report</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; background: #f8f9fa; border: 1px solid #e9ecef; }
        .report-summary { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #3b82f6; }
        .student-info { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .metrics { display: flex; justify-content: space-between; margin: 15px 0; }
        .metric { text-align: center; padding: 10px; background: white; border-radius: 5px; flex: 1; margin: 0 5px; }
        .metric-value { font-size: 24px; font-weight: bold; color: #3b82f6; }
        .metric-label { font-size: 12px; color: #666; }
        .footer { text-align: center; padding: 20px; color: #666; border-top: 1px solid #e9ecef; margin-top: 20px; }
        .attachment-notice { background: #e3f2fd; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #2196f3; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Student Report</h1>
          <p>EduAnalytics Dashboard</p>
        </div>
        
        <div class="content">
          ${recipientName ? `<p>Dear ${recipientName},</p>` : ''}
          
          <p>Please find attached the <strong>${reportData.name}</strong> for student <strong>${reportData.student?.name || reportData.student?.id || 'N/A'}</strong>.</p>
          
          ${customMessage ? `
            <div class="attachment-notice">
              <h3>📝 Personal Message</h3>
              <p>${customMessage}</p>
            </div>
          ` : ''}
          
          <div class="report-summary">
            <h3>📋 Report Summary</h3>
            <div class="metrics">
              ${reportData.summary ? Object.entries(reportData.summary).slice(0, 4).map(([key, value]) => `
                <div class="metric">
                  <div class="metric-value">${typeof value === 'object' ? 'N/A' : value}</div>
                  <div class="metric-label">${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</div>
                </div>
              `).join('') : ''}
            </div>
          </div>
          
          ${reportData.student ? `
            <div class="student-info">
              <h3>👤 Student Information</h3>
              <p><strong>Name:</strong> ${reportData.student.name || 'N/A'}</p>
              <p><strong>Student ID:</strong> ${reportData.student.id}</p>
              <p><strong>Class:</strong> ${reportData.student.class || 'N/A'}</p>
              ${reportData.student.riskLevel ? `<p><strong>Risk Level:</strong> ${reportData.student.riskLevel}</p>` : ''}
            </div>
          ` : ''}
          
          <div class="attachment-notice">
            <h3>📎 Attachment</h3>
            <p>A detailed HTML report has been attached to this email for your records and further analysis.</p>
          </div>
          
          <p><strong>Report Generated:</strong> ${reportDate}</p>
          <p><strong>Report Type:</strong> ${reportData.type}</p>
        </div>
        
        <div class="footer">
          <p><strong>EduAnalytics Dashboard - Student Success Platform</strong></p>
          <p>This is an automated report generated by the EduAnalytics system.</p>
          <p>For questions or support, please contact your school administration.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Generate HTML report for attachment
function generateReportHTML(reportData: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${reportData.name}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 30px; text-align: center; margin: -20px -20px 30px -20px; }
        .content { max-width: 800px; margin: 0 auto; }
        .summary { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .metric { display: inline-block; text-align: center; margin: 10px; padding: 15px; background: white; border-radius: 5px; min-width: 120px; }
        .metric-value { font-size: 28px; font-weight: bold; color: #3b82f6; }
        .metric-label { font-size: 12px; color: #666; margin-top: 5px; }
        .chart { margin: 20px 0; padding: 20px; background: white; border-radius: 8px; border: 1px solid #e9ecef; }
        .chart-bar { display: flex; align-items: center; margin: 10px 0; }
        .chart-label { width: 150px; font-size: 14px; }
        .chart-bar-bg { flex: 1; height: 20px; background: #e9ecef; border-radius: 10px; margin: 0 10px; position: relative; }
        .chart-bar-fill { height: 100%; border-radius: 10px; transition: width 0.3s ease; }
        .chart-value { width: 60px; text-align: right; font-weight: bold; }
        .student-info { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #e9ecef; }
        .footer { text-align: center; padding: 30px; color: #666; border-top: 1px solid #e9ecef; margin-top: 40px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${reportData.name}</h1>
        <p>${reportData.description}</p>
        <p>Generated: ${new Date(reportData.generatedAt).toLocaleString()}</p>
      </div>
      
      <div class="content">
        ${reportData.student ? `
          <div class="student-info">
            <h2>👤 Student Information</h2>
            <p><strong>Name:</strong> ${reportData.student.name || 'N/A'}</p>
            <p><strong>Student ID:</strong> ${reportData.student.id}</p>
            <p><strong>Class:</strong> ${reportData.student.class || 'N/A'}</p>
            ${reportData.student.age ? `<p><strong>Age:</strong> ${reportData.student.age}</p>` : ''}
            ${reportData.student.gender ? `<p><strong>Gender:</strong> ${reportData.student.gender}</p>` : ''}
            ${reportData.student.riskLevel ? `<p><strong>Risk Level:</strong> ${reportData.student.riskLevel}</p>` : ''}
            ${reportData.student.riskScore ? `<p><strong>Risk Score:</strong> ${reportData.student.riskScore}/100</p>` : ''}
          </div>
        ` : ''}
        
        <div class="summary">
          <h2>📊 Summary</h2>
          ${reportData.summary ? Object.entries(reportData.summary).map(([key, value]) => `
            <div class="metric">
              <div class="metric-value">${typeof value === 'object' ? 'N/A' : value}</div>
              <div class="metric-label">${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</div>
            </div>
          `).join('') : ''}
        </div>
        
        ${reportData.charts ? Object.entries(reportData.charts).map(([chartName, chartData]) => {
          if (!chartData || !Array.isArray(chartData)) return '';
          
          const maxValue = Math.max(...chartData.map((item: any) => item.value || 0));
          const chartTitle = chartName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          
          return `
            <div class="chart">
              <h3>📈 ${chartTitle}</h3>
              ${chartData.map((item: any, index: number) => {
                const value = item.value || 0;
                const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
                const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
                
                return `
                  <div class="chart-bar">
                    <div class="chart-label">${item.label}</div>
                    <div class="chart-bar-bg">
                      <div class="chart-bar-fill" style="width: ${percentage}%; background: ${colors[index % colors.length]};"></div>
                    </div>
                    <div class="chart-value">${value}</div>
                  </div>
                `;
              }).join('')}
            </div>
          `;
        }).join('') : ''}
      </div>
      
      <div class="footer">
        <p><strong>EduAnalytics Dashboard - Student Success Platform</strong></p>
        <p>This report was generated on ${new Date(reportData.generatedAt).toLocaleString()}</p>
        <p>Report ID: ${reportData.id}</p>
      </div>
    </body>
    </html>
  `
}
