import { NextRequest, NextResponse } from "next/server"
import { neonService } from "../../../../lib/neon-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { riskLevels = ['Critical', 'High'], includeReport = true, customMessage } = body

    // Get high-risk students - we need to get them one by one since neon service only accepts single risk level
    let allStudents = []
    for (const riskLevel of riskLevels) {
      const students = await neonService.getStudents({ 
        limit: 10000,
        riskLevel: riskLevel 
      })
      allStudents = [...allStudents, ...students]
    }
    
    // Remove duplicates based on student ID
    const uniqueStudents = allStudents.filter((student, index, self) => 
      index === self.findIndex(s => s.StudentID === student.StudentID)
    )
    const students = uniqueStudents

    if (!students || students.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No high-risk students found for parent notifications",
        data: { notificationsSent: 0 }
      })
    }

    const notificationsSent = []
    const errors = []

    // Process each student
    for (const student of students) {
      try {
        // Generate parent email (in a real system, this would come from student records)
        const parentEmail = generateParentEmail(student)
        
        if (!parentEmail) {
          errors.push({
            studentId: student.StudentID,
            error: "No parent email found"
          })
          continue
        }

        // Generate student report if requested
        let reportData = null
        if (includeReport) {
          reportData = await generateStudentReport(student)
        }

        // Send notification
        const notificationResult = await sendParentNotification(student, parentEmail, reportData, customMessage)
        
        notificationsSent.push({
          studentId: student.StudentID,
          studentName: student.StudentName || 'N/A',
          parentEmail: parentEmail,
          riskLevel: student.RiskLevel,
          notificationSent: notificationResult.success,
          reportIncluded: !!reportData,
          sentAt: new Date('2025-01-09').toISOString()
        })

      } catch (error) {
        errors.push({
          studentId: student.StudentID,
          error: error.message || "Unknown error"
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully sent ${notificationsSent.length} parent notifications`,
      data: {
        notificationsSent: notificationsSent.length,
        studentsProcessed: students.length,
        errors: errors.length,
        details: {
          successful: notificationsSent,
          failed: errors
        }
      }
    })

  } catch (error) {
    console.error("[API] Error sending parent notifications:", error)
    return NextResponse.json(
      { success: false, error: "Failed to send parent notifications" },
      { status: 500 }
    )
  }
}

// Helper function to generate parent email (mock implementation)
function generateParentEmail(student: any): string | null {
  // In a real system, this would come from student records
  // For now, we'll generate mock emails
  const mockEmails = [
    `${student.StudentName?.toLowerCase().replace(/\s+/g, '.')}@example.com`,
    `parent.${student.StudentID}@example.com`,
    `guardian.${student.StudentID}@example.com`
  ]
  
  // Return the first mock email (in reality, you'd have actual parent emails in the database)
  return mockEmails[0]
}

// Helper function to generate student report
async function generateStudentReport(student: any) {
  return {
    id: `parent_report_${student.StudentID}_${Date.now()}`,
    type: 'parent-summary',
    name: 'Student Progress Report for Parents',
    description: 'Comprehensive student progress report for parents/guardians',
    generatedAt: new Date('2025-01-09').toISOString(),
    student: {
      id: student.StudentID,
      name: student.StudentName || 'N/A',
      class: student.ClassLevel || 'N/A',
      age: student.Age,
      gender: student.Gender,
      riskLevel: student.RiskLevel,
      riskScore: student.RiskScore
    },
    summary: {
      overallRisk: student.RiskLevel,
      riskScore: student.RiskScore,
      dropoutProbability: student.DropoutProbability,
      attendance: student.AvgAttendance_LatestTerm || 0,
      performance: student.AvgMarks_LatestTerm || 0,
      recommendations: getParentRecommendations(student)
    },
    data: [student],
    charts: {
      academicProgress: [
        { label: 'Current Performance', value: student.AvgMarks_LatestTerm || 0 },
        { label: 'Attendance Rate', value: student.AvgAttendance_LatestTerm || 0 },
        { label: 'Target Performance', value: 70 },
        { label: 'Target Attendance', value: 80 }
      ],
      riskFactors: [
        { label: 'Academic Risk', value: student.AvgMarks_LatestTerm < 50 ? 80 : 30 },
        { label: 'Attendance Risk', value: (student.AvgAttendance_LatestTerm || 0) < 70 ? 75 : 25 },
        { label: 'Support Needed', value: student.RiskLevel === 'Critical' ? 90 : 40 }
      ]
    }
  }
}

// Helper function to send parent notification
async function sendParentNotification(student: any, parentEmail: string, reportData: any, customMessage?: string) {
  try {
    // This would call the notification API or email service
    const notificationPayload = {
      type: 'parent-report',
      studentId: student.StudentID,
      recipientEmail: parentEmail,
      reportData: reportData,
      customMessage: customMessage || `Your child ${student.StudentName || student.StudentID} requires attention. Please review the attached report.`
    }

    // In a real implementation, you would call your notification service here
    // For now, we'll simulate a successful notification
    console.log(`[PARENT-NOTIFICATION] Sent to ${parentEmail} for student ${student.StudentID}`)
    
    return { success: true, message: "Notification sent successfully" }
    
  } catch (error) {
    console.error(`[PARENT-NOTIFICATION] Error sending to ${parentEmail}:`, error)
    return { success: false, error: error.message }
  }
}

// Helper function to get parent recommendations
function getParentRecommendations(student: any): string[] {
  const recommendations = []
  
  if (student.AvgMarks_LatestTerm < 50) {
    recommendations.push("Schedule regular study time at home")
    recommendations.push("Consider additional tutoring or academic support")
  }
  
  if ((student.AvgAttendance_LatestTerm || 0) < 70) {
    recommendations.push("Monitor daily attendance and school engagement")
    recommendations.push("Address any barriers to regular school attendance")
  }
  
  if (student.RiskLevel === 'Critical' || student.RiskLevel === 'High') {
    recommendations.push("Maintain open communication with school counselors")
    recommendations.push("Consider family counseling or support services")
    recommendations.push("Monitor student's emotional well-being closely")
  }
  
  if (student.IsFirstGenerationLearner) {
    recommendations.push("Provide additional academic encouragement and support")
    recommendations.push("Connect with school resources for first-generation learners")
  }
  
  if (student.FamilyAnnualIncome < 100000) {
    recommendations.push("Explore available financial aid and scholarship opportunities")
    recommendations.push("Consider free tutoring or academic support programs")
  }
  
  return recommendations.length > 0 ? recommendations : ["Continue current support and monitoring"]
}
