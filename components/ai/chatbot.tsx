"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Minimize2, 
  Maximize2,
  Loader2,
  Sparkles
} from "lucide-react"

interface ChatMessage {
  id: string
  conversationId: string
  message: string
  response: string
  isUser: boolean
  timestamp: Date
}

interface ChatbotProps {
  className?: string
}

export function Chatbot({ className }: ChatbotProps) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Wait for auth to load before making any decisions
  if (authLoading) {
    return null
  }

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Load chat history on component mount
  useEffect(() => {
    if (user && user.userType === 'student') {
      loadChatHistory()
    }
  }, [user])

  // Only show chatbot for authenticated students
  if (!isAuthenticated || !user || user.userType !== 'student') {
    return null
  }

  const loadChatHistory = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch('/api/chat/history', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setMessages(data.data)
          if (data.data.length > 0) {
            setConversationId(data.data[0].conversation_id)
          }
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      conversationId: conversationId || generateConversationId(),
      message: inputMessage,
      response: '',
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: inputMessage,
          conversationId: conversationId || generateConversationId()
        })
      })

      const data = await response.json()
      
      if (data.success) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          conversationId: data.data.conversationId,
          message: '',
          response: data.data.response,
          isUser: false,
          timestamp: new Date()
        }
        
        setMessages(prev => [...prev, aiMessage])
        setConversationId(data.data.conversationId)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const generateConversationId = () => {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-[9999]">
        <Button
          onClick={() => setIsOpen(true)}
          className={`h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white ${className}`}
          size="lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    )
  }

  return (
    <Card className={`fixed bottom-6 right-6 w-96 h-[500px] shadow-2xl z-[9999] ${isMinimized ? 'h-16' : ''} ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Bot className="h-5 w-5" />
            <Sparkles className="h-4 w-4" />
          </div>
          <CardTitle className="text-lg">AI Study Assistant</CardTitle>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white hover:bg-white/20 h-8 w-8 p-0"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20 h-8 w-8 p-0"
          >
            ×
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <>
          <CardContent className="flex-1 flex flex-col p-0 h-[400px]">
            <ScrollArea className="flex-1 p-4 h-full">
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <Bot className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      Welcome to your AI Study Assistant!
                    </h3>
                    <p className="text-slate-600 text-sm">
                      I'm here to help you with your academic journey. Ask me about your studies, attendance, or any concerns you have.
                    </p>
                  </div>
                )}

                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      message.isUser 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-100 text-slate-900'
                    }`}>
                      <div className="flex items-start space-x-2">
                        {!message.isUser && (
                          <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm">{message.isUser ? message.message : message.response}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                        {message.isUser && (
                          <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 rounded-lg px-3 py-2 flex items-center space-x-2">
                      <Bot className="h-4 w-4" />
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-slate-600">Thinking...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="border-t p-4 bg-white">
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  className="flex-1 h-10 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  disabled={isLoading}
                  autoFocus
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  size="sm"
                  className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  )
}