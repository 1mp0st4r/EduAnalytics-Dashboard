// Email notification service for student dropout prevention system
// Handles automated emails to parents, mentors, and administrators

import nodemailer from "nodemailer"

interface EmailTemplate {
  subject: string
  htmlContent: string
  textContent: string
}

interface EmailRecipient {
  email: string
  name: string
  type: "parent" | "mentor" | "admin"
}

interface EmailNotification {
  to: EmailRecipient[]
  template: EmailTemplate
  studentData?: any
  priority: "low" | "medium" | "high" | "urgent"
}

export class EmailService {
  private transporter: nodemailer.Transporter
  private fromEmail: string
  private fromName: string

  constructor() {
    this.fromEmail = process.env.FROM_EMAIL || "noreply@edusupport.gov.in"
    this.fromName = process.env.FROM_NAME || "शिक्षा सहायक / EduSupport"

    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // Use TLS
      auth: {
        user: this.fromEmail,
        pass: process.env.EMAIL_API_KEY, // Gmail App Password
      },
      tls: {
        rejectUnauthorized: false,
      },
    })
  }

  async sendEmail(notification: EmailNotification): Promise<boolean> {
    try {
      console.log(
        `[Email Service] Sending ${notification.priority} priority email to ${notification.to.length} recipients`,
      )

      // Send email to each recipient
      for (const recipient of notification.to) {
        const mailOptions = {
          from: `${this.fromName} <${this.fromEmail}>`,
          to: `${recipient.name} <${recipient.email}>`,
          subject: notification.template.subject,
          text: notification.template.textContent,
          html: notification.template.htmlContent,
        }

        console.log(`[Email] Sending to: ${recipient.email} (${recipient.name})`)

        const result = await this.transporter.sendMail(mailOptions)
        console.log(`[Email] Sent successfully: ${result.messageId}`)

        // Add delay to avoid rate limiting (Gmail has sending limits)
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      return true
    } catch (error) {
      console.error("[Email Service] Error sending email:", error)
      return false
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify()
      console.log("[Email Service] SMTP connection verified successfully")
      return true
    } catch (error) {
      console.error("[Email Service] SMTP connection failed:", error)
      return false
    }
  }

  // Monthly progress report to parents
  async sendMonthlyReport(studentData: any): Promise<boolean> {
    const template = this.generateMonthlyReportTemplate(studentData)
    const recipients: EmailRecipient[] = []

    if (studentData.parent_email) {
      recipients.push({
        email: studentData.parent_email,
        name: studentData.parent_name || "अभिभावक / Parent",
        type: "parent",
      })
    }

    if (studentData.mentor_email) {
      recipients.push({
        email: studentData.mentor_email,
        name: studentData.mentor_name || "मेंटर / Mentor",
        type: "mentor",
      })
    }

    const notification: EmailNotification = {
      to: recipients,
      template,
      studentData,
      priority: "medium",
    }

    return await this.sendEmail(notification)
  }

  // High-risk student alert to parents and mentors
  async sendHighRiskAlert(studentData: any): Promise<boolean> {
    const template = this.generateHighRiskAlertTemplate(studentData)
    const recipients: EmailRecipient[] = []

    if (studentData.parent_email) {
      recipients.push({
        email: studentData.parent_email,
        name: studentData.parent_name || "अभिभावक / Parent",
        type: "parent",
      })
    }

    if (studentData.mentor_email) {
      recipients.push({
        email: studentData.mentor_email,
        name: studentData.mentor_name || "मेंटर / Mentor",
        type: "mentor",
      })
    }

    const notification: EmailNotification = {
      to: recipients,
      template,
      studentData,
      priority: "urgent",
    }

    return await this.sendEmail(notification)
  }

  // Issue report notification
  async sendIssueReport(studentData: any, issueData: any): Promise<boolean> {
    const template = this.generateIssueReportTemplate(studentData, issueData)
    const recipients: EmailRecipient[] = []

    if (studentData.parent_email) {
      recipients.push({
        email: studentData.parent_email,
        name: studentData.parent_name || "अभिभावक / Parent",
        type: "parent",
      })
    }

    if (studentData.mentor_email) {
      recipients.push({
        email: studentData.mentor_email,
        name: studentData.mentor_name || "मेंटर / Mentor",
        type: "mentor",
      })
    }

    const notification: EmailNotification = {
      to: recipients,
      template,
      studentData,
      priority: issueData.severity === "critical" ? "urgent" : "high",
    }

    return await this.sendEmail(notification)
  }

  // Attendance warning
  async sendAttendanceWarning(studentData: any): Promise<boolean> {
    const template = this.generateAttendanceWarningTemplate(studentData)
    const recipients: EmailRecipient[] = []

    if (studentData.parent_email) {
      recipients.push({
        email: studentData.parent_email,
        name: studentData.parent_name || "अभिभावक / Parent",
        type: "parent",
      })
    }

    const notification: EmailNotification = {
      to: recipients,
      template,
      studentData,
      priority: "high",
    }

    return await this.sendEmail(notification)
  }

  // Performance warning
  async sendPerformanceWarning(studentData: any): Promise<boolean> {
    const template = this.generatePerformanceWarningTemplate(studentData)
    const recipients: EmailRecipient[] = []

    if (studentData.parent_email) {
      recipients.push({
        email: studentData.parent_email,
        name: studentData.parent_name || "अभिभावक / Parent",
        type: "parent",
      })
    }

    const notification: EmailNotification = {
      to: recipients,
      template,
      studentData,
      priority: "high",
    }

    return await this.sendEmail(notification)
  }

  // Password reset email
  async sendPasswordResetEmail(userEmail: string, resetLink: string, userName: string): Promise<boolean> {
    const template = this.generatePasswordResetTemplate(userName, resetLink)
    const recipients: EmailRecipient[] = [
      {
        email: userEmail,
        name: userName,
        type: "admin", // This will be used for styling
      }
    ]

    const notification: EmailNotification = {
      to: recipients,
      template,
      priority: "high",
    }

    return await this.sendEmail(notification)
  }

  // Email verification email
  async sendEmailVerificationEmail(userEmail: string, verificationLink: string, userName: string): Promise<boolean> {
    const template = this.generateEmailVerificationTemplate(userName, verificationLink)
    const recipients: EmailRecipient[] = [
      {
        email: userEmail,
        name: userName,
        type: "admin", // This will be used for styling
      }
    ]

    const notification: EmailNotification = {
      to: recipients,
      template,
      priority: "medium",
    }

    return await this.sendEmail(notification)
  }

  async sendBulkMonthlyReports(studentsData: any[]): Promise<{ sent: number; failed: number }> {
    let sent = 0
    let failed = 0

    console.log(`[Email Service] Sending monthly reports to ${studentsData.length} students`)

    for (const student of studentsData) {
      try {
        const success = await this.sendMonthlyReport(student)
        if (success) {
          sent++
        } else {
          failed++
        }
        // Increased delay for Gmail rate limiting (500 emails/day limit)
        await new Promise((resolve) => setTimeout(resolve, 2000))
      } catch (error) {
        console.error(`[Email Service] Failed to send monthly report for student ${student.student_id}:`, error)
        failed++
      }
    }

    console.log(`[Email Service] Monthly reports completed: ${sent} sent, ${failed} failed`)
    return { sent, failed }
  }

  // Bulk high-risk alerts
  async sendBulkHighRiskAlerts(highRiskStudents: any[]): Promise<{ sent: number; failed: number }> {
    let sent = 0
    let failed = 0

    console.log(`[Email Service] Sending high-risk alerts to ${highRiskStudents.length} students`)

    for (const student of highRiskStudents) {
      try {
        const success = await this.sendHighRiskAlert(student)
        if (success) {
          sent++
        } else {
          failed++
        }
        // Increased delay for Gmail rate limiting
        await new Promise((resolve) => setTimeout(resolve, 3000))
      } catch (error) {
        console.error(`[Email Service] Failed to send high-risk alert for student ${student.student_id}:`, error)
        failed++
      }
    }

    console.log(`[Email Service] High-risk alerts completed: ${sent} sent, ${failed} failed`)
    return { sent, failed }
  }

  // Template generators
  private generateMonthlyReportTemplate(studentData: any): EmailTemplate {
    const subject = `${studentData.full_name} की मासिक प्रगति रिपोर्ट / Monthly Progress Report for ${studentData.full_name}`

    const textContent = `प्रिय ${studentData.parent_name || "अभिभावक"} / Dear ${studentData.parent_name || "Parent"},

आपके बच्चे ${studentData.full_name} की मासिक प्रगति रिपोर्ट:
Monthly progress report for your child ${studentData.full_name}:

📊 शैक्षणिक प्रदर्शन / Academic Performance: ${studentData.current_performance}%
📅 उपस्थिति / Attendance: ${studentData.current_attendance}%
⚠️ जोखिम स्तर / Risk Level: ${this.getRiskLevelText(studentData.risk_level)}
🎯 कक्षा / Class: ${studentData.class_level}
🏫 स्कूल / School: ${studentData.school_name}

${this.getPerformanceMessage(studentData)}

मेंटर संपर्क / Mentor Contact:
👤 नाम / Name: ${studentData.mentor_name}
📞 फोन / Phone: ${studentData.mentor_phone}
📧 ईमेल / Email: ${studentData.mentor_email}

यदि आपके कोई प्रश्न हैं तो कृपया संपर्क करें।
If you have any questions, please feel free to contact us.

धन्यवाद / Thank you,
शिक्षा सहायक टीम / EduSupport Team`

    const htmlContent = this.generateHTMLTemplate(subject, textContent, studentData, "monthly")

    return { subject, textContent, htmlContent }
  }

  private generateHighRiskAlertTemplate(studentData: any): EmailTemplate {
    const subject = `🚨 महत्वपूर्ण: ${studentData.full_name} के लिए तत्काल ध्यान चाहिए / URGENT: Immediate Attention Required for ${studentData.full_name}`

    const textContent = `प्रिय ${studentData.parent_name || "अभिभावक"} / Dear ${studentData.parent_name || "Parent"},

यह एक महत्वपूर्ण सूचना है। आपके बच्चे ${studentData.full_name} को तत्काल सहायता की आवश्यकता है।
This is an important notification. Your child ${studentData.full_name} needs immediate assistance.

🚨 चिंता के कारण / Reasons for Concern:
• उपस्थिति / Attendance: ${studentData.current_attendance}% (बहुत कम / Very Low)
• प्रदर्शन / Performance: ${studentData.current_performance}% (सुधार की आवश्यकता / Needs Improvement)
• ड्रॉपआउट जोखिम / Dropout Risk: ${studentData.dropout_probability}%

🤝 हमारी सहायता / Our Support:
हमारे मेंटर ${studentData.mentor_name} आपके बच्चे की मदद के लिए तैयार हैं।
Our mentor ${studentData.mentor_name} is ready to help your child.

📞 तत्काल संपर्क करें / Contact Immediately:
मेंटर / Mentor: ${studentData.mentor_phone}
ईमेल / Email: ${studentData.mentor_email}

कृपया जल्द से जल्द स्कूल आएं या फोन करें। आपके बच्चे का भविष्य महत्वपूर्ण है।
Please visit the school or call as soon as possible. Your child's future is important.

धन्यवाद / Thank you,
शिक्षा सहायक टीम / EduSupport Team`

    const htmlContent = this.generateHTMLTemplate(subject, textContent, studentData, "alert")

    return { subject, textContent, htmlContent }
  }

  private generateIssueReportTemplate(studentData: any, issueData: any): EmailTemplate {
    const subject = `समस्या रिपोर्ट: ${studentData.full_name} / Issue Report: ${studentData.full_name}`

    const textContent = `प्रिय ${studentData.parent_name || "अभिभावक"} / Dear ${studentData.parent_name || "Parent"},

आपके बच्चे ${studentData.full_name} ने निम्नलिखित समस्या की रिपोर्ट की है:
Your child ${studentData.full_name} has reported the following issue:

📋 समस्या का प्रकार / Issue Type: ${issueData.issue_type}
📝 विवरण / Description: ${issueData.description}
⚠️ गंभीरता / Severity: ${this.getSeverityText(issueData.severity)}
📅 रिपोर्ट की तारीख / Report Date: ${new Date().toLocaleDateString("hi-IN")}

🤝 अगले कदम / Next Steps:
हमारे मेंटर इस समस्या का समाधान करने के लिए काम कर रहे हैं।
Our mentors are working to resolve this issue.

मेंटर संपर्क / Mentor Contact:
👤 ${studentData.mentor_name}
📞 ${studentData.mentor_phone}

कृपया अपने बच्चे से बात करें और आवश्यक सहायता प्रदान करें।
Please talk to your child and provide necessary support.

धन्यवाद / Thank you,
शिक्षा सहायक टीम / EduSupport Team`

    const htmlContent = this.generateHTMLTemplate(subject, textContent, studentData, "issue")

    return { subject, textContent, htmlContent }
  }

  private generateAttendanceWarningTemplate(studentData: any): EmailTemplate {
    const subject = `उपस्थिति चेतावनी: ${studentData.full_name} / Attendance Warning: ${studentData.full_name}`

    const textContent = `प्रिय ${studentData.parent_name || "अभिभावक"} / Dear ${studentData.parent_name || "Parent"},

आपके बच्चे ${studentData.full_name} की उपस्थिति चिंताजनक है।
Your child ${studentData.full_name}'s attendance is concerning.

📊 वर्तमान उपस्थिति / Current Attendance: ${studentData.current_attendance}%
📈 आवश्यक उपस्थिति / Required Attendance: 75%

नियमित उपस्थिति शैक्षणिक सफलता के लिए आवश्यक है।
Regular attendance is essential for academic success.

कृपया अपने बच्चे को नियमित रूप से स्कूल भेजें।
Please ensure your child attends school regularly.

धन्यवाद / Thank you,
शिक्षा सहायक टीम / EduSupport Team`

    const htmlContent = this.generateHTMLTemplate(subject, textContent, studentData, "warning")

    return { subject, textContent, htmlContent }
  }

  private generatePerformanceWarningTemplate(studentData: any): EmailTemplate {
    const subject = `प्रदर्शन चेतावनी: ${studentData.full_name} / Performance Warning: ${studentData.full_name}`

    const textContent = `प्रिय ${studentData.parent_name || "अभिभावक"} / Dear ${studentData.parent_name || "Parent"},

आपके बच्चे ${studentData.full_name} के शैक्षणिक प्रदर्शन में सुधार की आवश्यकता है।
Your child ${studentData.full_name}'s academic performance needs improvement.

📊 वर्तमान प्रदर्शन / Current Performance: ${studentData.current_performance}%
📈 अपेक्षित प्रदर्शन / Expected Performance: 60%

अतिरिक्त अध्ययन और सहायता की आवश्यकता है।
Additional study and support is needed.

मेंटर से संपर्क करें: ${studentData.mentor_phone}
Contact mentor: ${studentData.mentor_phone}

धन्यवाद / Thank you,
शिक्षा सहायक टीम / EduSupport Team`

    const htmlContent = this.generateHTMLTemplate(subject, textContent, studentData, "warning")

    return { subject, textContent, htmlContent }
  }

  private generatePasswordResetTemplate(userName: string, resetLink: string): EmailTemplate {
    const subject = "Password Reset Request / पासवर्ड रीसेट अनुरोध"

    const textContent = `Dear ${userName} / प्रिय ${userName},

You have requested to reset your password for your EduAnalytics account.
आपने अपने EduAnalytics खाते के लिए पासवर्ड रीसेट करने का अनुरोध किया है।

🔐 Password Reset Instructions / पासवर्ड रीसेट निर्देश:

1. Click the link below to reset your password:
   नीचे दिए गए लिंक पर क्लिक करके अपना पासवर्ड रीसेट करें:

   ${resetLink}

2. This link will expire in 1 hour for security reasons.
   सुरक्षा कारणों से यह लिंक 1 घंटे में समाप्त हो जाएगा।

3. If you didn't request this password reset, please ignore this email.
   यदि आपने यह पासवर्ड रीसेट नहीं मांगा है, तो कृपया इस ईमेल को नजरअंदाज करें।

⚠️ Security Note / सुरक्षा नोट:
Never share this link with anyone. Our team will never ask for your password.
इस लिंक को किसी के साथ साझा न करें। हमारी टीम कभी भी आपका पासवर्ड नहीं मांगेगी।

Thank you / धन्यवाद,
EduAnalytics Team / एजुएनालिटिक्स टीम`

    const htmlContent = this.generateHTMLTemplate(subject, textContent, { full_name: userName }, "password-reset")

    return { subject, textContent, htmlContent }
  }

  private generateEmailVerificationTemplate(userName: string, verificationLink: string): EmailTemplate {
    const subject = "Verify Your Email Address / अपना ईमेल पता सत्यापित करें"

    const textContent = `Dear ${userName} / प्रिय ${userName},

Welcome to EduAnalytics! Please verify your email address to complete your account setup.
EduAnalytics में आपका स्वागत है! अपना खाता सेटअप पूरा करने के लिए कृपया अपना ईमेल पता सत्यापित करें।

📧 Email Verification / ईमेल सत्यापन:

1. Click the link below to verify your email address:
   अपना ईमेल पता सत्यापित करने के लिए नीचे दिए गए लिंक पर क्लिक करें:

   ${verificationLink}

2. This link will expire in 24 hours.
   यह लिंक 24 घंटे में समाप्त हो जाएगा।

3. Once verified, you'll have full access to all features.
   सत्यापित होने के बाद, आपको सभी सुविधाओं तक पूरी पहुंच मिल जाएगी।

🎉 What's Next / आगे क्या:
- Access your personalized dashboard
- View student analytics and reports
- Manage your account settings

- अपना व्यक्तिगत डैशबोर्ड एक्सेस करें
- छात्र एनालिटिक्स और रिपोर्ट देखें
- अपनी खाता सेटिंग्स प्रबंधित करें

Thank you for joining us / हमसे जुड़ने के लिए धन्यवाद,
EduAnalytics Team / एजुएनालिटिक्स टीम`

    const htmlContent = this.generateHTMLTemplate(subject, textContent, { full_name: userName }, "verification")

    return { subject, textContent, htmlContent }
  }

  private generateHTMLTemplate(subject: string, textContent: string, studentData: any, type: string): string {
    const colorScheme = {
      monthly: { primary: "#0891b2", secondary: "#f97316" },
      alert: { primary: "#dc2626", secondary: "#f97316" },
      issue: { primary: "#eab308", secondary: "#0891b2" },
      warning: { primary: "#f97316", secondary: "#0891b2" },
      "password-reset": { primary: "#dc2626", secondary: "#f97316" },
      verification: { primary: "#059669", secondary: "#0891b2" },
    }

    const colors = colorScheme[type as keyof typeof colorScheme] || colorScheme.monthly

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: ${colors.primary}; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
        .highlight { background: ${colors.secondary}; color: white; padding: 10px; border-radius: 4px; margin: 10px 0; }
        .stats { display: flex; justify-content: space-around; margin: 20px 0; }
        .stat { text-align: center; padding: 10px; }
        .stat-value { font-size: 24px; font-weight: bold; color: ${colors.primary}; }
        .contact-info { background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0; }
        .button { display: inline-block; background: ${colors.primary}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 15px 0; }
        .button:hover { background: ${colors.secondary}; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>EduAnalytics / एजुएनालिटिक्स</h1>
            <p>${subject}</p>
        </div>
        <div class="content">
            ${textContent.replace(/\n/g, "<br>").replace(/📊|📅|⚠️|🎯|🏫|👤|📞|📧|🚨|🤝|📋|📝|📈|🔐|📧|🎉/g, "")}
        </div>
        <div class="footer">
            <p>यह एक स्वचालित संदेश है। कृपया इसका उत्तर न दें।<br>
            This is an automated message. Please do not reply.</p>
            <p>EduAnalytics - Your partner for educational success<br>
            एजुएनालिटिक्स - शैक्षिक सफलता के लिए आपका साथी</p>
        </div>
    </div>
</body>
</html>`
  }

  private getRiskLevelText(riskLevel: string): string {
    switch (riskLevel) {
      case "high":
        return "उच्च / High"
      case "medium":
        return "मध्यम / Medium"
      case "low":
        return "कम / Low"
      default:
        return "अज्ञात / Unknown"
    }
  }

  private getSeverityText(severity: string): string {
    switch (severity) {
      case "critical":
        return "अत्यधिक गंभीर / Critical"
      case "high":
        return "गंभीर / High"
      case "medium":
        return "मध्यम / Medium"
      case "low":
        return "कम / Low"
      default:
        return "अज्ञात / Unknown"
    }
  }

  private getPerformanceMessage(studentData: any): string {
    if (studentData.risk_level === "high") {
      return `⚠️ चेतावनी: आपके बच्चे को अतिरिक्त सहायता की आवश्यकता है। कृपया तुरंत स्कूल से संपर्क करें।
⚠️ Warning: Your child needs additional support. Please contact the school immediately.`
    } else if (studentData.risk_level === "medium") {
      return `📈 सुधार की गुंजाइश: नियमित अभ्यास और मार्गदर्शन से बेहतर परिणाम मिल सकते हैं।
📈 Room for improvement: Better results can be achieved with regular practice and guidance.`
    } else {
      return `✅ बधाई! आपका बच्चा अच्छा प्रदर्शन कर रहा है। इसी तरह जारी रखें।
✅ Congratulations! Your child is performing well. Keep up the good work.`
    }
  }
}

// Export singleton instance
export const emailService = new EmailService()
