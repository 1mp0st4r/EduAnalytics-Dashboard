// Rasa AI Chatbot Integration Service
// Connects Next.js app with Rasa chatbot

interface RasaResponse {
  text?: string
  buttons?: Array<{
    title: string
    payload: string
  }>
  image?: string
  custom?: any
}

interface RasaMessage {
  message: string
  sender: string
  metadata?: {
    student_id?: string
    user_type?: string
  }
}

export class RasaService {
  private rasaUrl: string
  private sessionId: string

  constructor(sessionId: string = 'default') {
    this.rasaUrl = process.env.RASA_URL || 'http://localhost:5005'
    this.sessionId = sessionId
  }

  /**
   * Send a message to Rasa and get response
   */
  async sendMessage(message: string, studentContext?: any): Promise<string> {
    try {
      const payload: RasaMessage = {
        message: message,
        sender: this.sessionId,
        metadata: {
          student_id: studentContext?.studentId,
          user_type: 'student'
        }
      }

      const response = await fetch(`${this.rasaUrl}/webhooks/rest/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Rasa API error: ${response.status}`)
      }

      const responses: RasaResponse[] = await response.json()
      
      // Combine all text responses
      const textResponses = responses
        .filter(r => r.text)
        .map(r => r.text)
        .join('\n')

      return textResponses || "I'm sorry, I didn't understand that. Could you please rephrase?"

    } catch (error) {
      console.error('Rasa service error:', error)
      return "I'm having trouble responding right now. Please try again later."
    }
  }

  /**
   * Start a new conversation session
   */
  async startSession(studentId: string): Promise<void> {
    this.sessionId = `student_${studentId}_${Date.now()}`
    
    // Send initial greeting
    await this.sendMessage("hello", { studentId })
  }

  /**
   * Get conversation history (if using Rasa with database)
   */
  async getConversationHistory(limit: number = 10): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.rasaUrl}/conversations/${this.sessionId}/messages?limit=${limit}`
      )
      
      if (response.ok) {
        return await response.json()
      }
      
      return []
    } catch (error) {
      console.error('Error fetching conversation history:', error)
      return []
    }
  }

  /**
   * Check if Rasa service is healthy
   */
  async isHealthy(): Promise<boolean> {
    try {
      const response = await fetch(`${this.rasaUrl}/health`)
      return response.ok
    } catch (error) {
      return false
    }
  }

  /**
   * Train the Rasa model (admin only)
   */
  async trainModel(): Promise<boolean> {
    try {
      const response = await fetch(`${this.rasaUrl}/model/train`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          config: "config.yml",
          domain: "domain.yml",
          nlu: "data/nlu.yml",
          stories: "data/stories.yml"
        })
      })

      return response.ok
    } catch (error) {
      console.error('Error training Rasa model:', error)
      return false
    }
  }

  /**
   * Get model info
   */
  async getModelInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.rasaUrl}/status`)
      if (response.ok) {
        return await response.json()
      }
      return null
    } catch (error) {
      console.error('Error getting model info:', error)
      return null
    }
  }
}

// Export singleton instance
export const rasaService = new RasaService()
