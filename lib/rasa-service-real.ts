/**
 * Real Rasa AI Chat Service Integration
 * Connects to actual Rasa server for intelligent conversations
 */

interface RasaMessage {
  text: string
  intent?: {
    name: string
    confidence: number
  }
  entities?: Array<{
    entity: string
    value: string
    confidence: number
  }>
}

interface RasaResponse {
  recipient_id: string
  text: string
  buttons?: Array<{
    title: string
    payload: string
  }>
  image?: string
  custom?: any
}

interface StudentContext {
  studentId: string
  studentName: string
  classLevel: string
  attendance: number
  performance: number
  riskLevel: string
  mentorName: string
  schoolName: string
}

export class RealRasaService {
  private rasaUrl: string
  private conversationId: string
  private studentContext: StudentContext | null = null

  constructor(conversationId?: string) {
    this.rasaUrl = process.env.RASA_URL || 'http://localhost:5005'
    this.conversationId = conversationId || `student_${Date.now()}`
  }

  /**
   * Send message to Rasa server and get AI response
   */
  async sendMessage(message: string, context?: StudentContext): Promise<string> {
    try {
      // Update student context if provided
      if (context) {
        this.studentContext = context
      }

      // Prepare the request payload
      const payload = {
        sender: this.conversationId,
        message: message,
        metadata: {
          student_context: this.studentContext
        }
      }

      console.log(`[Rasa Service] Sending message to Rasa server: ${this.rasaUrl}`)
      console.log(`[Rasa Service] Conversation ID: ${this.conversationId}`)
      console.log(`[Rasa Service] Message: ${message}`)

      // Send request to Rasa server
      const response = await fetch(`${this.rasaUrl}/webhooks/rest/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Rasa server responded with status: ${response.status}`)
      }

      const rasaResponse: RasaResponse[] = await response.json()
      
      if (rasaResponse && rasaResponse.length > 0) {
        // Extract text from Rasa response
        const responseText = rasaResponse
          .map(response => response.text)
          .filter(text => text && text.trim().length > 0)
          .join('\n\n')

        if (responseText) {
          console.log(`[Rasa Service] ✅ Received response: ${responseText.substring(0, 100)}...`)
          return this.enhanceResponseWithContext(responseText)
        }
      }

      // If no valid response, return a fallback
      return this.getFallbackResponse(message)

    } catch (error) {
      console.error('[Rasa Service] Error communicating with Rasa server:', error)
      return this.getFallbackResponse(message)
    }
  }

  /**
   * Enhance Rasa response with student-specific context
   */
  private enhanceResponseWithContext(responseText: string): string {
    if (!this.studentContext) {
      return responseText
    }

    const { studentName, attendance, performance, riskLevel, mentorName, schoolName } = this.studentContext

    // Add personalized context to the response
    let enhancedResponse = responseText

    // Replace placeholders with actual student data
    enhancedResponse = enhancedResponse.replace(/\{student_name\}/g, studentName || 'Student')
    enhancedResponse = enhancedResponse.replace(/\{attendance\}/g, attendance?.toString() || 'Unknown')
    enhancedResponse = enhancedResponse.replace(/\{performance\}/g, performance?.toString() || 'Unknown')
    enhancedResponse = enhancedResponse.replace(/\{risk_level\}/g, riskLevel || 'Unknown')
    enhancedResponse = enhancedResponse.replace(/\{mentor_name\}/g, mentorName || 'Your mentor')
    enhancedResponse = enhancedResponse.replace(/\{school_name\}/g, schoolName || 'Your school')

    return enhancedResponse
  }

  /**
   * Get fallback response when Rasa is not available
   */
  private getFallbackResponse(message: string): string {
    console.log('[Rasa Service] Using fallback response (Rasa server unavailable)')
    
    const lowerMessage = message.toLowerCase()
    
    // Basic intent detection
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return `Hello! I'm your AI study assistant. I'm here to help you with your academic journey. How can I assist you today?`
    }
    
    if (lowerMessage.includes('attendance')) {
      const attendance = this.studentContext?.attendance || 'Unknown'
      return `Your current attendance is ${attendance}%. Regular attendance is crucial for academic success. Would you like tips on improving your attendance?`
    }
    
    if (lowerMessage.includes('marks') || lowerMessage.includes('grades') || lowerMessage.includes('performance')) {
      const performance = this.studentContext?.performance || 'Unknown'
      return `Your current performance is ${performance}%. I can help you develop study strategies to improve your academic results. What subjects are you working on?`
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      return `I'm here to help! I can assist you with study tips, academic guidance, motivation, and connecting you with resources. What specific area would you like help with?`
    }
    
    // Default response
    return `I understand you're asking about "${message}". I'm your AI study assistant and I'm here to help you succeed academically. Could you tell me more about what you'd like to know?`
  }

  /**
   * Test connection to Rasa server
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log(`[Rasa Service] Testing connection to: ${this.rasaUrl}`)
      
      const response = await fetch(`${this.rasaUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        console.log('[Rasa Service] ✅ Connection successful')
        return true
      } else {
        console.log(`[Rasa Service] ❌ Connection failed: ${response.status}`)
        return false
      }
    } catch (error) {
      console.error('[Rasa Service] ❌ Connection error:', error)
      return false
    }
  }

  /**
   * Get conversation history (if supported by Rasa)
   */
  async getConversationHistory(): Promise<RasaMessage[]> {
    try {
      const response = await fetch(`${this.rasaUrl}/conversations/${this.conversationId}/messages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        return await response.json()
      }
      
      return []
    } catch (error) {
      console.error('[Rasa Service] Error getting conversation history:', error)
      return []
    }
  }

  /**
   * Set student context for personalized responses
   */
  setStudentContext(context: StudentContext): void {
    this.studentContext = context
    console.log(`[Rasa Service] Updated student context for: ${context.studentName}`)
  }

  /**
   * Get current conversation ID
   */
  getConversationId(): string {
    return this.conversationId
  }

  /**
   * Reset conversation
   */
  resetConversation(): void {
    this.conversationId = `student_${Date.now()}`
    this.studentContext = null
    console.log(`[Rasa Service] Reset conversation: ${this.conversationId}`)
  }
}

// Export singleton instance
export const rasaService = new RealRasaService()
