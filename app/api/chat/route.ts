import { NextRequest, NextResponse } from "next/server"
import { neonService } from "../../../lib/neon-service"
import { AuthService } from "../../../lib/auth"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// AI Chatbot endpoint
export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: "Authorization token required" },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    // Verify the token and get user info
    const decoded = AuthService.verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      )
    }

    // Check if user is a student
    if (decoded.userType !== 'student') {
      return NextResponse.json(
        { success: false, error: "Access denied. Student role required." },
        { status: 403 }
      )
    }

    const { message, conversationId } = await request.json()
    
    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      )
    }

    // Get student data for context
    const student = await neonService.getStudentByUserId(decoded.userId)
    if (!student) {
      return NextResponse.json(
        { success: false, error: "Student profile not found" },
        { status: 404 }
      )
    }

    // Get student's academic data for context
    const studentData = await neonService.getStudentById(student.id)
    if (!studentData) {
      return NextResponse.json(
        { success: false, error: "Student data not found" },
        { status: 404 }
      )
    }

    // Generate AI response with context
    const aiResponse = await generateAIResponse(message, studentData, conversationId)

    // Save conversation to database
    await neonService.saveChatMessage({
      userId: decoded.userId,
      conversationId: conversationId || generateConversationId(),
      message: message,
      response: aiResponse,
      isUser: true
    })

    await neonService.saveChatMessage({
      userId: decoded.userId,
      conversationId: conversationId || generateConversationId(),
      message: aiResponse,
      response: '',
      isUser: false
    })

    return NextResponse.json({
      success: true,
      data: {
        response: aiResponse,
        conversationId: conversationId || generateConversationId()
      }
    })

  } catch (error) {
    console.error("[API] Error processing chat message:", error)
    return NextResponse.json(
      { success: false, error: "Failed to process chat message" },
      { status: 500 }
    )
  }
}

// Generate AI response with intelligent chatbot
async function generateAIResponse(message: string, studentData: any, conversationId?: string): Promise<string> {
  try {
    // Import simplified Rasa service
    const { SimpleRasaService } = await import('../../../lib/rasa-service-simple')
    
    // Create service instance with student context
    const rasaService = new SimpleRasaService(conversationId || `student_${studentData.StudentID}`)
    
    // Send message with student context
    const response = await rasaService.sendMessage(message, {
      studentId: studentData.StudentID,
      studentName: studentData.StudentName,
      classLevel: studentData.StudentClass,
      attendance: studentData.AvgAttendance_LatestTerm,
      performance: studentData.AvgMarks_LatestTerm,
      riskLevel: studentData.RiskLevel,
      mentorName: studentData.MentorName,
      schoolName: studentData.SchoolName
    })
    
    return response
    
  } catch (error) {
    console.error('Chatbot service error:', error)
    // Fallback to rule-based responses
    return generateFallbackResponse(message, studentData)
  }
}

// Fallback response generator (keep the old logic as backup)
function generateFallbackResponse(message: string, studentData: any): string {
  const context = {
    studentName: studentData.StudentName || 'Student',
    classLevel: studentData.StudentClass || 'Unknown',
    attendance: studentData.AvgAttendance_LatestTerm || 0,
    performance: studentData.AvgMarks_LatestTerm || 0,
    riskLevel: studentData.RiskLevel || 'Unknown',
    mentorName: studentData.MentorName || 'Your mentor',
    schoolName: studentData.SchoolName || 'Your school'
  }

  const responses = generateContextualResponses(message, context)
  return responses[Math.floor(Math.random() * responses.length)]
}

// Generate contextual responses based on student data
function generateContextualResponses(message: string, context: any): string[] {
  const lowerMessage = message.toLowerCase()
  
  // Attendance-related responses
  if (lowerMessage.includes('attendance') || lowerMessage.includes('present')) {
    if (context.attendance < 75) {
      return [
        `I notice your attendance is currently ${context.attendance}%. Regular attendance is crucial for academic success. Would you like me to help you create a plan to improve your attendance?`,
        `Your attendance rate of ${context.attendance}% is below the recommended 75%. Let's work together to identify barriers and create strategies to improve your attendance.`,
        `I can see you're concerned about attendance. At ${context.attendance}%, there's definitely room for improvement. What challenges are you facing with regular attendance?`
      ]
    } else {
      return [
        `Great job! Your attendance rate of ${context.attendance}% is excellent. Keep up the good work!`,
        `Your attendance at ${context.attendance}% shows great commitment to your studies. This is a strong foundation for academic success.`
      ]
    }
  }

  // Performance-related responses
  if (lowerMessage.includes('marks') || lowerMessage.includes('grades') || lowerMessage.includes('performance')) {
    if (context.performance < 60) {
      return [
        `I see your current performance is ${context.performance}%. Let's work together to improve your academic results. What subjects are you finding most challenging?`,
        `Your marks of ${context.performance}% indicate there's room for improvement. I'm here to help you develop effective study strategies.`,
        `At ${context.performance}%, I understand you might be feeling concerned about your grades. Let's create a plan to boost your academic performance.`
      ]
    } else if (context.performance < 80) {
      return [
        `Your performance of ${context.performance}% is good! With some focused effort, you can reach even higher levels.`,
        `At ${context.performance}%, you're doing well academically. What areas would you like to focus on to improve further?`
      ]
    } else {
      return [
        `Excellent work! Your performance of ${context.performance}% is outstanding. You're clearly dedicated to your studies.`,
        `Your marks of ${context.performance}% are impressive! Keep up the excellent work.`
      ]
    }
  }

  // Risk level responses
  if (lowerMessage.includes('risk') || lowerMessage.includes('dropout') || lowerMessage.includes('struggling')) {
    if (context.riskLevel === 'Critical' || context.riskLevel === 'High') {
      return [
        `I understand you might be going through a challenging time. Remember, ${context.mentorName} is here to support you, and so am I. What specific challenges are you facing?`,
        `It's okay to struggle sometimes. Your mentor ${context.mentorName} and I are here to help you overcome any obstacles. What's on your mind?`,
        `I can see you might be feeling overwhelmed. Let's work together to address your concerns and get you back on track. What would you like to talk about?`
      ]
    } else {
      return [
        `You're doing well overall! If you're feeling concerned about anything, I'm here to help. What's on your mind?`,
        `Your academic journey seems to be going well. Is there anything specific you'd like to discuss or improve?`
      ]
    }
  }

  // Mentor-related responses
  if (lowerMessage.includes('mentor') || lowerMessage.includes('teacher') || lowerMessage.includes('help')) {
    return [
      `Your mentor ${context.mentorName} is a great resource for academic support. You can reach out to them for personalized guidance.`,
      `I can help you with general questions, but for specific academic support, ${context.mentorName} would be the best person to contact.`,
      `Your mentor ${context.mentorName} is there to support you. Is there something specific you'd like help with that I can assist with?`
    ]
  }

  // General academic support
  if (lowerMessage.includes('study') || lowerMessage.includes('exam') || lowerMessage.includes('test')) {
    return [
      `Effective studying involves regular practice, good time management, and understanding concepts rather than memorizing. What subjects are you working on?`,
      `For better exam performance, try creating a study schedule, practicing past papers, and taking regular breaks. What specific subject are you preparing for?`,
      `Study techniques that work well include active recall, spaced repetition, and teaching others. What study methods have you tried?`
    ]
  }

  // General motivational responses
  if (lowerMessage.includes('motivation') || lowerMessage.includes('tired') || lowerMessage.includes('difficult')) {
    return [
      `I understand that academic life can be challenging. Remember, every small step forward is progress. What's one thing you can do today to move closer to your goals?`,
      `It's normal to feel overwhelmed sometimes. Break your tasks into smaller, manageable steps. What's the most important thing you need to focus on right now?`,
      `You've come this far, which shows your determination. What's one small action you can take today to keep moving forward?`
    ]
  }

  // Default responses
  return [
    `Hello ${context.studentName}! I'm here to help you with your academic journey. How can I assist you today?`,
    `Hi! I'm your AI study companion. I can help you with study tips, academic guidance, or just listen to your concerns. What would you like to talk about?`,
    `Welcome! I'm here to support you in your studies at ${context.schoolName}. What questions or concerns do you have today?`
  ]
}

// Generate conversation ID
function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
