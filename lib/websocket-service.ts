"use client"

import { io, Socket } from 'socket.io-client'

interface NotificationData {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  timestamp: string
  read: boolean
  userId?: string
  userType?: string
}

interface WebSocketService {
  socket: Socket | null
  isConnected: boolean
  connect: (token: string) => void
  disconnect: () => void
  onNotification: (callback: (notification: NotificationData) => void) => void
  onConnect: (callback: () => void) => void
  onDisconnect: (callback: () => void) => void
  markAsRead: (notificationId: string) => void
}

class WebSocketServiceImpl implements WebSocketService {
  socket: Socket | null = null
  isConnected = false

  connect(token: string) {
    if (this.socket?.connected) {
      return
    }

    this.socket = io(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001', {
      auth: {
        token
      },
      transports: ['websocket', 'polling']
    })

    this.socket.on('connect', () => {
      this.isConnected = true
      console.log('WebSocket connected')
    })

    this.socket.on('disconnect', () => {
      this.isConnected = false
      console.log('WebSocket disconnected')
    })

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
      this.isConnected = false
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  onNotification(callback: (notification: NotificationData) => void) {
    if (this.socket) {
      this.socket.on('notification', callback)
    }
  }

  onConnect(callback: () => void) {
    if (this.socket) {
      this.socket.on('connect', callback)
    }
  }

  onDisconnect(callback: () => void) {
    if (this.socket) {
      this.socket.on('disconnect', callback)
    }
  }

  markAsRead(notificationId: string) {
    if (this.socket) {
      this.socket.emit('mark_notification_read', notificationId)
    }
  }
}

export const webSocketService = new WebSocketServiceImpl()
