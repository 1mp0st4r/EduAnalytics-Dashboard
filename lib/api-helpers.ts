// API helper functions for database operations
import { dbService } from "./database"

export interface StudentFilters {
  riskLevel?: string
  classLevel?: string
  searchTerm?: string
}

export interface IssueFilters {
  status?: string
  severity?: string
}

// Student API helpers
export async function getStudentsWithFilters(filters: StudentFilters) {
  try {
    const students = await dbService.getStudents(filters)

    // Apply search term filter (done in memory for mock data)
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      return students.filter(
        (student: any) =>
          student.full_name.toLowerCase().includes(searchLower) ||
          student.student_id.toLowerCase().includes(searchLower),
      )
    }

    return students
  } catch (error) {
    console.error("Error fetching students:", error)
    throw new Error("Failed to fetch students")
  }
}

export async function getStudentDetails(studentId: number) {
  try {
    const student = await dbService.getStudentById(studentId)
    if (!student) {
      throw new Error("Student not found")
    }
    return student
  } catch (error) {
    console.error("Error fetching student details:", error)
    throw error
  }
}

export async function updateStudentRiskAssessment(studentId: number, riskData: any) {
  try {
    await dbService.updateStudentRisk(studentId, riskData.riskLevel, riskData.dropoutProbability)

    // Also create AI prediction record
    const predictionData = {
      studentId,
      predictionType: "dropout_risk",
      predictionValue: riskData.dropoutProbability,
      confidenceScore: riskData.confidence || 85,
      modelVersion: "v1.2",
      predictionDate: new Date(),
    }

    // In real app, this would insert into ai_predictions table
    console.log("AI Prediction recorded:", predictionData)

    return { success: true }
  } catch (error) {
    console.error("Error updating student risk:", error)
    throw new Error("Failed to update student risk assessment")
  }
}

// Issue API helpers
export async function getIssuesWithFilters(filters: IssueFilters) {
  try {
    return await dbService.getStudentIssues(filters)
  } catch (error) {
    console.error("Error fetching issues:", error)
    throw new Error("Failed to fetch issues")
  }
}

export async function createNewIssue(issueData: any) {
  try {
    const result = await dbService.createStudentIssue(issueData)

    // Trigger email notification to mentor and parents
    await triggerIssueNotifications(issueData)

    return result[0]
  } catch (error) {
    console.error("Error creating issue:", error)
    throw new Error("Failed to create issue")
  }
}

export async function resolveIssue(issueId: number, resolutionNotes: string) {
  try {
    return await dbService.updateIssueStatus(issueId, "resolved", resolutionNotes)
  } catch (error) {
    console.error("Error resolving issue:", error)
    throw new Error("Failed to resolve issue")
  }
}

// Email notification helpers
export async function triggerIssueNotifications(issueData: any) {
  try {
    // Get student details for parent contact
    const student = await dbService.getStudentById(issueData.studentId)

    if (student && student.parent_email) {
      // Create parent notification
      await dbService.createEmailNotification({
        recipientEmail: student.parent_email,
        recipientType: "parent",
        subject: `आपके बच्चे ${student.full_name} की समस्या रिपोर्ट / Issue Report for ${student.full_name}`,
        message: `प्रिय अभिभावक,\n\nआपके बच्चे ने निम्नलिखित समस्या की रिपोर्ट की है:\n\nसमस्या का प्रकार: ${issueData.issueType}\nविवरण: ${issueData.description}\n\nहमारे मेंटर जल्द ही इस समस्या का समाधान करेंगे।\n\nधन्यवाद,\nशिक्षा सहायक टीम`,
        notificationType: "issue_report",
        studentId: issueData.studentId,
      })
    }

    if (student && student.mentor_email) {
      // Create mentor notification
      await dbService.createEmailNotification({
        recipientEmail: student.mentor_email,
        recipientType: "mentor",
        subject: `नई समस्या रिपोर्ट - ${student.full_name} / New Issue Report - ${student.full_name}`,
        message: `छात्र ${student.full_name} (${student.student_id}) ने निम्नलिखित समस्या रिपोर्ट की है:\n\nसमस्या: ${issueData.issueType}\nविवरण: ${issueData.description}\nगंभीरता: ${issueData.severity}\n\nकृपया जल्द से जल्द इस समस्या का समाधान करें।`,
        notificationType: "issue_report",
        studentId: issueData.studentId,
      })
    }
  } catch (error) {
    console.error("Error triggering issue notifications:", error)
  }
}

export async function sendMonthlyReports() {
  try {
    const students = await dbService.getStudents()

    for (const student of students) {
      if (student.parent_email) {
        const reportContent = generateMonthlyReport(student)

        await dbService.createEmailNotification({
          recipientEmail: student.parent_email,
          recipientType: "parent",
          subject: `${student.full_name} की मासिक रिपोर्ट / Monthly Report for ${student.full_name}`,
          message: reportContent,
          notificationType: "monthly_report",
          studentId: student.id,
        })
      }
    }

    return { success: true, message: "Monthly reports queued for sending" }
  } catch (error) {
    console.error("Error sending monthly reports:", error)
    throw new Error("Failed to send monthly reports")
  }
}

export async function sendHighRiskAlerts() {
  try {
    const highRiskStudents = await dbService.getStudents({ riskLevel: "high" })

    for (const student of highRiskStudents) {
      if (student.parent_email) {
        const alertContent = generateRiskAlert(student)

        await dbService.createEmailNotification({
          recipientEmail: student.parent_email,
          recipientType: "parent",
          subject: `महत्वपूर्ण: ${student.full_name} के लिए तत्काल ध्यान चाहिए / URGENT: Immediate Attention Required for ${student.full_name}`,
          message: alertContent,
          notificationType: "risk_alert",
          studentId: student.id,
        })
      }
    }

    return { success: true, message: "High risk alerts queued for sending" }
  } catch (error) {
    console.error("Error sending high risk alerts:", error)
    throw new Error("Failed to send high risk alerts")
  }
}

// Report generation helpers
function generateMonthlyReport(student: any): string {
  return `प्रिय ${student.parent_name || "अभिभावक"},

आपके बच्चे ${student.full_name} की मासिक प्रगति रिपोर्ट:

📊 शैक्षणिक प्रदर्शन: ${student.current_performance}%
📅 उपस्थिति: ${student.current_attendance}%
⚠️ जोखिम स्तर: ${student.risk_level === "high" ? "उच्च" : student.risk_level === "medium" ? "मध्यम" : "कम"}

${
  student.risk_level === "high"
    ? "⚠️ चेतावनी: आपके बच्चे को अतिरिक्त सहायता की आवश्यकता है। कृपया स्कूल से संपर्क करें।"
    : student.risk_level === "medium"
      ? "📈 सुधार की गुंजाइश: नियमित अभ्यास से बेहतर परिणाम मिल सकते हैं।"
      : "✅ बधाई! आपका बच्चा अच्छा प्रदर्शन कर रहा है।"
}

मेंटर संपर्क: ${student.mentor_name}
फोन: ${student.mentor_phone}

धन्यवाद,
शिक्षा सहायक टीम`
}

function generateRiskAlert(student: any): string {
  return `प्रिय ${student.parent_name || "अभिभावक"},

यह एक महत्वपूर्ण सूचना है। आपके बच्चे ${student.full_name} को तत्काल सहायता की आवश्यकता है।

🚨 चिंता के कारण:
• उपस्थिति: ${student.current_attendance}% (बहुत कम)
• प्रदर्शन: ${student.current_performance}% (सुधार की आवश्यकता)
• ड्रॉपआउट जोखिम: ${student.dropout_probability}%

🤝 हमारी सहायता:
हमारे मेंटर ${student.mentor_name} आपके बच्चे की मदद के लिए तैयार हैं।

📞 तत्काल संपर्क करें:
मेंटर: ${student.mentor_phone}
ईमेल: ${student.mentor_email}

कृपया जल्द से जल्द स्कूल आएं या फोन करें। आपके बच्चे का भविष्य महत्वपूर्ण है।

धन्यवाद,
शिक्षा सहायक टीम`
}

// Statistics and analytics helpers
export async function getDashboardStatistics() {
  try {
    return await dbService.getStudentStatistics()
  } catch (error) {
    console.error("Error fetching dashboard statistics:", error)
    throw new Error("Failed to fetch dashboard statistics")
  }
}
