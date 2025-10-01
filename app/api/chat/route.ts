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

    // Get student data for context - use first available student for demo
    const students = await neonService.getStudents({ limit: 1 })
    
    if (!students || students.length === 0) {
      return NextResponse.json(
        { success: false, error: "No student data found" },
        { status: 404 }
      )
    }

    const studentData = students[0]

    // Generate AI response with context
    const aiResponse = await generateAIResponse(message, studentData, conversationId)

    // TODO: Save conversation to database when saveChatMessage method is implemented
    // For now, just return the response

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
    // For now, use fallback response to test basic functionality
    return generateFallbackResponse(message, studentData)
    
    // TODO: Re-enable Rasa service once basic functionality is working
    // const { SimpleRasaService } = await import('../../../lib/rasa-service-simple')
    // const rasaService = new SimpleRasaService(conversationId || `student_${studentData.StudentID}`)
    // const response = await rasaService.sendMessage(message, {
    //   studentId: studentData.StudentID,
    //   studentName: studentData.StudentName,
    //   classLevel: studentData.StudentClass,
    //   attendance: studentData.AvgAttendance_LatestTerm,
    //   performance: studentData.AvgMarks_LatestTerm,
    //   riskLevel: studentData.RiskLevel,
    //   mentorName: studentData.MentorName,
    //   schoolName: studentData.SchoolName
    // })
    // return response
    
  } catch (error) {
    console.error('Chatbot service error:', error)
    return "Sorry, I'm having trouble responding right now. Please try again later."
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
  
  // Greeting and introduction responses
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || lowerMessage.includes('good morning') || lowerMessage.includes('good afternoon') || lowerMessage.includes('good evening')) {
    return [
      `Hello ${context.studentName}! I'm your AI study assistant. How can I help you with your academic journey today?`,
      `Hi there! I'm here to support you in your studies. What would you like to discuss?`,
      `Good to see you, ${context.studentName}! I'm ready to help with any academic questions or concerns you have.`,
      `Welcome back! I'm your study companion. What's on your mind today?`
    ]
  }

  // How are you / How's it going responses
  if (lowerMessage.includes('how are you') || lowerMessage.includes('how\'s it going') || lowerMessage.includes('how do you do')) {
    return [
      `I'm doing well, thank you for asking! I'm here and ready to help you with your studies. How are things going for you academically?`,
      `I'm great! I'm always excited to help students like you succeed. How are you feeling about your studies lately?`,
      `I'm doing fantastic! I love helping students achieve their academic goals. How can I assist you today?`
    ]
  }
  
  // Attendance-related responses
  if (lowerMessage.includes('attendance') || lowerMessage.includes('present') || lowerMessage.includes('absent') || lowerMessage.includes('missing class') || lowerMessage.includes('skip')) {
    if (context.attendance < 75) {
      return [
        `I notice your attendance is currently ${context.attendance}%. Regular attendance is crucial for academic success. Would you like me to help you create a plan to improve your attendance?`,
        `Your attendance rate of ${context.attendance}% is below the recommended 75%. Let's work together to identify barriers and create strategies to improve your attendance.`,
        `I can see you're concerned about attendance. At ${context.attendance}%, there's definitely room for improvement. What challenges are you facing with regular attendance?`,
        `Missing classes can significantly impact your learning. At ${context.attendance}% attendance, let's work on strategies to get you to class more consistently.`
      ]
    } else {
      return [
        `Great job! Your attendance rate of ${context.attendance}% is excellent. Keep up the good work!`,
        `Your attendance at ${context.attendance}% shows great commitment to your studies. This is a strong foundation for academic success.`,
        `Excellent! ${context.attendance}% attendance shows you're serious about your education. This consistency will pay off!`
      ]
    }
  }

  // Performance and grades responses
  if (lowerMessage.includes('marks') || lowerMessage.includes('grades') || lowerMessage.includes('performance') || lowerMessage.includes('score') || lowerMessage.includes('result') || lowerMessage.includes('academic')) {
    if (context.performance < 60) {
      return [
        `I see your current performance is ${context.performance}%. Let's work together to improve your academic results. What subjects are you finding most challenging?`,
        `Your marks of ${context.performance}% indicate there's room for improvement. I'm here to help you develop effective study strategies.`,
        `At ${context.performance}%, I understand you might be feeling concerned about your grades. Let's create a plan to boost your academic performance.`,
        `Your current performance of ${context.performance}% shows we need to focus on improvement strategies. What specific subjects are giving you trouble?`
      ]
    } else if (context.performance < 80) {
      return [
        `Your performance of ${context.performance}% is good! With some focused effort, you can reach even higher levels.`,
        `At ${context.performance}%, you're doing well academically. What areas would you like to focus on to improve further?`,
        `You're performing well at ${context.performance}%! Let's identify areas where you can push yourself to achieve even better results.`
      ]
    } else {
      return [
        `Excellent work! Your performance of ${context.performance}% is outstanding. You're clearly dedicated to your studies.`,
        `Your marks of ${context.performance}% are impressive! Keep up the excellent work.`,
        `Outstanding! ${context.performance}% is an excellent achievement. You should be proud of your academic dedication!`
      ]
    }
  }

  // Subject-specific help
  if (lowerMessage.includes('math') || lowerMessage.includes('mathematics')) {
    return [
      `Mathematics can be challenging, but with regular practice, you'll see improvement. Are you struggling with a specific topic like algebra, geometry, or calculus?`,
      `Math requires consistent practice and understanding of concepts. What specific area of mathematics would you like help with?`,
      `I can help you with math study strategies. Are you having trouble with problem-solving techniques or understanding specific concepts?`
    ]
  }

  if (lowerMessage.includes('science') || lowerMessage.includes('physics') || lowerMessage.includes('chemistry') || lowerMessage.includes('biology')) {
    return [
      `Science subjects are fascinating but can be complex. Which science subject are you working on - Physics, Chemistry, or Biology?`,
      `Science requires both theoretical understanding and practical application. What specific concepts are you finding challenging?`,
      `I love helping with science! Are you struggling with understanding concepts, solving problems, or practical applications?`
    ]
  }

  if (lowerMessage.includes('english') || lowerMessage.includes('literature') || lowerMessage.includes('writing')) {
    return [
      `English and literature skills are essential for all subjects. Are you working on reading comprehension, writing essays, or grammar?`,
      `Writing and reading skills improve with practice. What specific aspect of English would you like to work on?`,
      `English skills are fundamental to academic success. Are you having trouble with creative writing, analysis, or comprehension?`
    ]
  }

  // Study techniques and strategies
  if (lowerMessage.includes('study') || lowerMessage.includes('studying') || lowerMessage.includes('study tips') || lowerMessage.includes('how to study')) {
    return [
      `Effective studying involves regular practice, good time management, and understanding concepts rather than memorizing. What subjects are you working on?`,
      `Great study techniques include active recall, spaced repetition, and teaching others. What study methods have you tried?`,
      `Creating a study schedule, finding a quiet space, and taking regular breaks are key to effective studying. What's your current study routine like?`,
      `The Pomodoro Technique (25 minutes study, 5 minutes break) works well for many students. Have you tried different study methods?`
    ]
  }

  // Exam and test preparation
  if (lowerMessage.includes('exam') || lowerMessage.includes('test') || lowerMessage.includes('quiz') || lowerMessage.includes('preparation') || lowerMessage.includes('preparing')) {
    return [
      `For better exam performance, try creating a study schedule, practicing past papers, and taking regular breaks. What specific subject are you preparing for?`,
      `Exam success comes from understanding concepts, regular practice, and good time management. Are you feeling prepared for your upcoming tests?`,
      `Effective exam preparation includes reviewing notes, practicing problems, and getting adequate rest. What's your current preparation strategy?`,
      `Remember to stay calm during exams and read questions carefully. What type of exam are you preparing for?`
    ]
  }

  // Time management
  if (lowerMessage.includes('time') || lowerMessage.includes('schedule') || lowerMessage.includes('busy') || lowerMessage.includes('overwhelmed') || lowerMessage.includes('too much')) {
    return [
      `Time management is crucial for academic success. Try creating a daily schedule with specific study blocks and break times. What's your biggest time management challenge?`,
      `Feeling overwhelmed is normal. Break your tasks into smaller, manageable steps and prioritize what's most important. What's taking up most of your time?`,
      `Creating a weekly planner can help you balance studies, activities, and rest. What commitments do you have that are competing with your study time?`
    ]
  }

  // Stress and mental health
  if (lowerMessage.includes('stress') || lowerMessage.includes('stressed') || lowerMessage.includes('anxiety') || lowerMessage.includes('pressure') || lowerMessage.includes('worried')) {
    return [
      `It's normal to feel stressed about academics. Remember to take breaks, get enough sleep, and don't hesitate to reach out to ${context.mentorName} for support.`,
      `Academic pressure can be overwhelming. Try deep breathing exercises, regular exercise, and talking to someone you trust. What's causing you the most stress?`,
      `Your mental health is just as important as your academics. Consider speaking with a counselor or trusted adult if stress is affecting your daily life.`
    ]
  }

  // Risk level and dropout concerns
  if (lowerMessage.includes('risk') || lowerMessage.includes('dropout') || lowerMessage.includes('struggling') || lowerMessage.includes('failing') || lowerMessage.includes('behind')) {
    if (context.riskLevel === 'Critical' || context.riskLevel === 'High') {
      return [
        `I understand you might be going through a challenging time. Remember, ${context.mentorName} is here to support you, and so am I. What specific challenges are you facing?`,
        `It's okay to struggle sometimes. Your mentor ${context.mentorName} and I are here to help you overcome any obstacles. What's on your mind?`,
        `I can see you might be feeling overwhelmed. Let's work together to address your concerns and get you back on track. What would you like to talk about?`,
        `Every student faces challenges. You're not alone in this. Let's identify what's causing difficulties and create a plan to move forward.`
      ]
    } else {
      return [
        `You're doing well overall! If you're feeling concerned about anything, I'm here to help. What's on your mind?`,
        `Your academic journey seems to be going well. Is there anything specific you'd like to discuss or improve?`,
        `I'm here to help you maintain your good academic standing. What areas would you like to focus on or improve?`
      ]
    }
  }

  // Future and career planning
  if (lowerMessage.includes('future') || lowerMessage.includes('career') || lowerMessage.includes('college') || lowerMessage.includes('university') || lowerMessage.includes('job') || lowerMessage.includes('what to do')) {
    return [
      `Thinking about your future is exciting! Consider your interests, strengths, and goals. Have you thought about what subjects you enjoy most?`,
      `Career planning starts with understanding your interests and skills. What activities or subjects make you feel most engaged?`,
      `Your current studies are building a foundation for your future. Focus on developing skills in areas that interest you. What careers are you curious about?`
    ]
  }

  // Technology and learning resources
  if (lowerMessage.includes('computer') || lowerMessage.includes('online') || lowerMessage.includes('app') || lowerMessage.includes('technology') || lowerMessage.includes('digital')) {
    return [
      `Technology can be a great learning tool! There are many educational apps and online resources available. What type of learning resources are you looking for?`,
      `Digital tools can enhance your studying. Are you interested in note-taking apps, study planners, or educational videos?`,
      `Using technology wisely can boost your academic performance. What digital tools have you tried for studying?`
    ]
  }

  // Motivation and encouragement
  if (lowerMessage.includes('motivation') || lowerMessage.includes('motivated') || lowerMessage.includes('tired') || lowerMessage.includes('difficult') || lowerMessage.includes('hard') || lowerMessage.includes('give up')) {
    return [
      `I understand that academic life can be challenging. Remember, every small step forward is progress. What's one thing you can do today to move closer to your goals?`,
      `It's normal to feel overwhelmed sometimes. Break your tasks into smaller, manageable steps. What's the most important thing you need to focus on right now?`,
      `You've come this far, which shows your determination. What's one small action you can take today to keep moving forward?`,
      `Every expert was once a beginner. Don't give up - persistence is key to success. What's one thing you're proud of accomplishing recently?`
    ]
  }

  // What can you help with (prioritize this over general help)
  if (lowerMessage.includes('what can you do') || lowerMessage.includes('what can you help') || lowerMessage.includes('capabilities') || lowerMessage.includes('services')) {
    return [
      `I can help you with study strategies, academic guidance, motivation, time management, and general support. I can also answer questions about your performance and attendance.`,
      `I'm here to assist with study tips, exam preparation, goal setting, stress management, and connecting you with resources. What specific area would you like help with?`,
      `I can provide study advice, help you understand your academic data, offer motivation, and guide you toward success. How can I support you today?`
    ]
  }

  // Thank you responses (prioritize over general help)
  if (lowerMessage.includes('thank') || lowerMessage.includes('thanks') || lowerMessage.includes('appreciate')) {
    return [
      `You're very welcome! I'm always here to help you succeed. Don't hesitate to reach out anytime you need support.`,
      `My pleasure! I'm glad I could help. Remember, I'm here whenever you need academic guidance or just want to talk.`,
      `You're welcome! It's my job to support you in your academic journey. What else can I help you with today?`
    ]
  }

  // Mentor and teacher support
  if (lowerMessage.includes('mentor') || lowerMessage.includes('teacher') || lowerMessage.includes('help') || lowerMessage.includes('support')) {
    return [
      `Your mentor ${context.mentorName} is a great resource for academic support. You can reach out to them for personalized guidance.`,
      `I can help you with general questions, but for specific academic support, ${context.mentorName} would be the best person to contact.`,
      `Your mentor ${context.mentorName} is there to support you. Is there something specific you'd like help with that I can assist with?`,
      `Don't hesitate to ask for help from ${context.mentorName} or other teachers. They want to see you succeed!`
    ]
  }

  // School and environment
  if (lowerMessage.includes('school') || lowerMessage.includes('classroom') || lowerMessage.includes('environment') || lowerMessage.includes('campus')) {
    return [
      `Your school environment at ${context.schoolName} plays a big role in your learning. Are you comfortable with your current learning setup?`,
      `A positive school environment can boost your academic performance. How do you feel about your current school experience?`,
      `Your school ${context.schoolName} has resources to support your learning. Are you taking advantage of available study spaces and resources?`
    ]
  }

  // Goal setting and planning
  if (lowerMessage.includes('goal') || lowerMessage.includes('plan') || lowerMessage.includes('target') || lowerMessage.includes('achieve') || lowerMessage.includes('improve')) {
    return [
      `Setting clear, achievable goals is important for academic success. What specific goals would you like to work towards this semester?`,
      `SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound) work well for students. What would you like to accomplish?`,
      `Having clear goals gives you direction and motivation. What areas of your academic life would you like to focus on improving?`
    ]
  }

  // Health and wellness
  if (lowerMessage.includes('health') || lowerMessage.includes('sleep') || lowerMessage.includes('exercise') || lowerMessage.includes('food') || lowerMessage.includes('diet')) {
    return [
      `Your physical health directly impacts your academic performance. Make sure you're getting enough sleep, eating well, and staying active.`,
      `Good health habits support better learning. Are you getting enough rest and maintaining a balanced lifestyle?`,
      `Taking care of your body helps your brain function better. What aspects of your health would you like to improve?`
    ]
  }

  // Social and peer relationships
  if (lowerMessage.includes('friend') || lowerMessage.includes('peer') || lowerMessage.includes('social') || lowerMessage.includes('lonely') || lowerMessage.includes('group')) {
    return [
      `Building positive relationships with peers can enhance your learning experience. Are you finding good study partners or friends in your class?`,
      `Study groups can be very effective for learning. Have you considered forming or joining a study group with classmates?`,
      `Social connections are important for your overall well-being. How are your relationships with classmates and friends?`
    ]
  }

  // Homework and assignments
  if (lowerMessage.includes('homework') || lowerMessage.includes('assignment') || lowerMessage.includes('project') || lowerMessage.includes('due') || lowerMessage.includes('deadline')) {
    return [
      `Managing homework and assignments requires good organization. Are you using a planner or calendar to track due dates?`,
      `Breaking large assignments into smaller tasks can make them more manageable. What type of assignment are you working on?`,
      `Prioritizing assignments by due date and importance helps avoid last-minute stress. How do you currently organize your work?`
    ]
  }

  // Learning styles and preferences
  if (lowerMessage.includes('learn') || lowerMessage.includes('learning') || lowerMessage.includes('style') || lowerMessage.includes('preference') || lowerMessage.includes('visual') || lowerMessage.includes('audio')) {
    return [
      `Understanding your learning style can help you study more effectively. Do you learn better through visual, auditory, or hands-on methods?`,
      `Everyone learns differently. Have you discovered what methods work best for you - reading, listening, watching videos, or practicing?`,
      `Experimenting with different learning approaches can help you find what works best. What learning methods have you tried?`
    ]
  }

  // Questions about the AI assistant itself
  if (lowerMessage.includes('who are you') || lowerMessage.includes('what are you') || lowerMessage.includes('ai') || lowerMessage.includes('robot') || lowerMessage.includes('assistant')) {
    return [
      `I'm your AI study assistant, designed to help you succeed academically. I can provide study tips, answer questions, and offer guidance on your learning journey.`,
      `I'm an AI companion created to support students like you. I'm here to help with academic questions, study strategies, and general guidance.`,
      `I'm your digital study buddy! I'm here 24/7 to help you with your academic goals and provide support whenever you need it.`
    ]
  }

  // Goodbye responses
  if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye') || lowerMessage.includes('see you') || lowerMessage.includes('later')) {
    return [
      `Goodbye, ${context.studentName}! Remember, I'm always here when you need help with your studies. Take care!`,
      `See you later! Don't forget that I'm available 24/7 for any academic questions or support you might need.`,
      `Take care! I'll be here whenever you need study help or just want to chat about your academic journey.`
    ]
  }

  // Default responses for unrecognized queries
  return [
    `Hello ${context.studentName}! I'm here to help you with your academic journey. I can assist with study tips, academic guidance, motivation, and general support. What would you like to talk about?`,
    `Hi! I'm your AI study companion. I can help you with study strategies, exam preparation, time management, or just listen to your concerns. What's on your mind?`,
    `Welcome! I'm here to support you in your studies at ${context.schoolName}. I can help with academic questions, study tips, goal setting, and more. What can I help you with today?`,
    `I'm your study assistant and I'm here to help! I can provide guidance on academics, study techniques, motivation, and general support. What would you like to discuss?`
  ]
}

// Generate conversation ID
function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
