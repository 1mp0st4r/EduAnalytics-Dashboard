// Simplified Rasa-like service that works without full Rasa installation
// This provides intelligent responses based on student data

interface StudentContext {
  studentId?: string
  studentName?: string
  classLevel?: string
  attendance?: number
  performance?: number
  riskLevel?: string
  mentorName?: string
  schoolName?: string
}

export class SimpleRasaService {
  private sessionId: string

  constructor(sessionId: string = 'default') {
    this.sessionId = sessionId
  }

  /**
   * Send a message and get intelligent response
   */
  async sendMessage(message: string, studentContext?: StudentContext): Promise<string> {
    const lowerMessage = message.toLowerCase()
    
    // Intent recognition (simplified)
    const intent = this.detectIntent(lowerMessage)
    
    // Generate contextual response
    const response = this.generateResponse(intent, studentContext, message)
    
    return response
  }

  /**
   * Detect user intent from message
   */
  private detectIntent(message: string): string {
    // Greeting
    if (message.includes('hello') || message.includes('hi') || message.includes('namaste') || message.includes('नमस्ते')) {
      return 'greet'
    }
    
    // Attendance
    if (message.includes('attendance') || message.includes('present') || message.includes('उपस्थिति')) {
      return 'ask_attendance'
    }
    
    // Performance
    if (message.includes('marks') || message.includes('grades') || message.includes('performance') || message.includes('नंबर') || message.includes('प्रदर्शन')) {
      return 'ask_performance'
    }
    
    // Risk level
    if (message.includes('risk') || message.includes('dropout') || message.includes('जोखिम')) {
      return 'ask_risk_level'
    }
    
    // Mentor
    if (message.includes('mentor') || message.includes('teacher') || message.includes('मेंटर') || message.includes('शिक्षक')) {
      return 'ask_mentor'
    }
    
    // Study tips
    if (message.includes('study') || message.includes('tips') || message.includes('advice') || message.includes('अध्ययन') || message.includes('सुझाव')) {
      return 'ask_study_tips'
    }
    
    // Help
    if (message.includes('help') || message.includes('मदद')) {
      return 'ask_help'
    }
    
    // Issue/Problem
    if (message.includes('problem') || message.includes('issue') || message.includes('trouble') || message.includes('समस्या') || message.includes('परेशानी')) {
      return 'report_issue'
    }
    
    // Motivation
    if (message.includes('motivation') || message.includes('encourage') || message.includes('motivate') || message.includes('प्रेरणा') || message.includes('हिम्मत')) {
      return 'ask_motivation'
    }
    
    // Goodbye
    if (message.includes('bye') || message.includes('goodbye') || message.includes('अलविदा')) {
      return 'goodbye'
    }
    
    return 'general'
  }

  /**
   * Generate contextual response based on intent and student data
   */
  private generateResponse(intent: string, context?: StudentContext, originalMessage?: string): string {
    const responses = {
      greet: [
        `नमस्ते! मैं आपका AI स्टडी असिस्टेंट हूं। मैं आपकी पढ़ाई में मदद करने के लिए यहां हूं। आप मुझसे कुछ भी पूछ सकते हैं।`,
        `Hello! I'm your AI study assistant. I'm here to help you with your studies. You can ask me anything about your academics, attendance, or any concerns you have.`
      ],
      
      ask_attendance: [
        `आपकी वर्तमान उपस्थिति ${context?.attendance || 'N/A'}% है। ${this.getAttendanceMessage(context?.attendance)}`,
        `Your current attendance is ${context?.attendance || 'N/A'}%. ${this.getAttendanceMessage(context?.attendance)}`
      ],
      
      ask_performance: [
        `आपका वर्तमान प्रदर्शन ${context?.performance || 'N/A'}% है। ${this.getPerformanceMessage(context?.performance)}`,
        `Your current performance is ${context?.performance || 'N/A'}%. ${this.getPerformanceMessage(context?.performance)}`
      ],
      
      ask_risk_level: [
        `आपका वर्तमान जोखिम स्तर ${context?.riskLevel || 'Unknown'} है। ${this.getRiskMessage(context?.riskLevel)}`,
        `Your current risk level is ${context?.riskLevel || 'Unknown'}. ${this.getRiskMessage(context?.riskLevel)}`
      ],
      
      ask_mentor: [
        `आपके मेंटर का नाम ${context?.mentorName || 'Your mentor'} है। आप उनसे संपर्क कर सकते हैं।`,
        `Your mentor's name is ${context?.mentorName || 'Your mentor'}. You can contact them for support.`
      ],
      
      ask_study_tips: [
        `यहां कुछ अध्ययन सुझाव हैं:\n1. नियमित अभ्यास करें\n2. समय सारणी बनाएं\n3. छोटे-छोटे ब्रेक लें\n4. समूह अध्ययन करें`,
        `Here are some study tips:\n1. Practice regularly\n2. Create a schedule\n3. Take short breaks\n4. Study in groups`
      ],
      
      ask_help: [
        `मैं आपकी निम्नलिखित चीजों में मदद कर सकता हूं:\n- उपस्थिति जानकारी\n- प्रदर्शन रिपोर्ट\n- अध्ययन सुझाव\n- मेंटर संपर्क\n- समस्या रिपोर्टिंग`,
        `I can help you with:\n- Attendance information\n- Performance reports\n- Study tips\n- Mentor contact\n- Issue reporting`
      ],
      
      report_issue: [
        `मैं समझ गया कि आपको कुछ समस्या है। कृपया बताएं कि मैं आपकी कैसे मदद कर सकता हूं। आपके मेंटर ${context?.mentorName || 'आपके मेंटर'} भी आपकी मदद कर सकते हैं।`,
        `I understand you're having some issues. Please tell me how I can help you. Your mentor ${context?.mentorName || 'your mentor'} can also assist you.`
      ],
      
      ask_motivation: [
        `आप एक महान छात्र हैं! हर छोटी सफलता मायने रखती है। अपने लक्ष्यों पर केंद्रित रहें। ${context?.studentName ? `Keep going, ${context.studentName}!` : 'Keep going!'}`,
        `You are a great student! Every small success matters. Stay focused on your goals. ${context?.studentName ? `Keep going, ${context.studentName}!` : 'Keep going!'}`
      ],
      
      goodbye: [
        `अच्छा दिन! यदि आपको किसी भी सहायता की आवश्यकता है, तो बस मुझसे बात करें।`,
        `Have a great day! If you need any help, just talk to me.`
      ],
      
      general: [
        `मुझे खेद है, मैं समझ नहीं पाया। क्या आप दोबारा पूछ सकते हैं?`,
        `I'm sorry, I didn't understand. Could you please ask again?`
      ]
    }

    const intentResponses = responses[intent as keyof typeof responses] || responses.general
    return intentResponses[Math.floor(Math.random() * intentResponses.length)]
  }

  /**
   * Get attendance-specific message
   */
  private getAttendanceMessage(attendance?: number): string {
    if (!attendance) return 'Please check with your school for attendance details.'
    
    if (attendance >= 90) {
      return 'Excellent attendance! Keep up the great work! / बहुत बढ़िया उपस्थिति! इसी तरह जारी रखें!'
    } else if (attendance >= 75) {
      return 'Good attendance! Try to maintain this level. / अच्छी उपस्थिति! इस स्तर को बनाए रखने की कोशिश करें।'
    } else if (attendance >= 60) {
      return 'Your attendance needs improvement. Please try to attend classes regularly. / आपकी उपस्थिति में सुधार की आवश्यकता है। कृपया नियमित रूप से कक्षाओं में भाग लें।'
    } else {
      return 'Low attendance is concerning. Please contact your mentor immediately. / कम उपस्थिति चिंताजनक है। कृपया तुरंत अपने मेंटर से संपर्क करें।'
    }
  }

  /**
   * Get performance-specific message
   */
  private getPerformanceMessage(performance?: number): string {
    if (!performance) return 'Please check with your school for performance details.'
    
    if (performance >= 80) {
      return 'Outstanding performance! You are doing great! / उत्कृष्ट प्रदर्शन! आप बहुत अच्छा कर रहे हैं!'
    } else if (performance >= 70) {
      return 'Good performance! Keep up the good work! / अच्छा प्रदर्शन! अच्छा काम जारी रखें!'
    } else if (performance >= 60) {
      return 'Satisfactory performance. There is room for improvement. / संतोषजनक प्रदर्शन। सुधार की गुंजाइश है।'
    } else if (performance >= 50) {
      return 'Your performance needs improvement. Consider seeking extra help. / आपके प्रदर्शन में सुधार की आवश्यकता है। अतिरिक्त सहायता लेने पर विचार करें।'
    } else {
      return 'Performance needs immediate attention. Please contact your mentor. / प्रदर्शन पर तत्काल ध्यान देने की आवश्यकता है। कृपया अपने मेंटर से संपर्क करें।'
    }
  }

  /**
   * Get risk-specific message
   */
  private getRiskMessage(riskLevel?: string): string {
    switch (riskLevel?.toLowerCase()) {
      case 'low':
        return 'You are doing well! Keep up the good work! / आप अच्छा कर रहे हैं! अच्छा काम जारी रखें!'
      case 'medium':
        return 'Stay focused on your studies. Regular attendance and practice will help. / अपनी पढ़ाई पर ध्यान केंद्रित रखें। नियमित उपस्थिति और अभ्यास मदद करेगा।'
      case 'high':
      case 'critical':
        return 'Your situation needs attention. Please contact your mentor and family immediately. / आपकी स्थिति पर ध्यान देने की आवश्यकता है। कृपया तुरंत अपने मेंटर और परिवार से संपर्क करें।'
      default:
        return 'Focus on regular attendance and consistent study habits. / नियमित उपस्थिति और लगातार अध्ययन की आदतों पर ध्यान दें।'
    }
  }

  /**
   * Check if service is healthy
   */
  async isHealthy(): Promise<boolean> {
    return true // Simple service is always healthy
  }
}

// Export singleton instance
export const simpleRasaService = new SimpleRasaService()
