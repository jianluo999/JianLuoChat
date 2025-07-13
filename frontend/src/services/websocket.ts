import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'

export interface WebSocketMessage {
  type: string
  message: string
  data?: any
  timestamp: string
}

class WebSocketService {
  private socket: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private heartbeatInterval: number | null = null

  connect() {
    const authStore = useAuthStore()

    if (!authStore.token) {
      console.warn('Cannot connect to WebSocket: No authentication token')
      return
    }

    // 构建 WebSocket URL，添加 token 作为查询参数
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
    const wsUrl = baseUrl.replace('http', 'ws').replace('/api', '') + '/api/ws?token=' + authStore.token

    console.log('Connecting to WebSocket:', wsUrl)

    this.socket = new WebSocket(wsUrl)
    this.setupEventListeners()
  }

  private setupEventListeners() {
    if (!this.socket) return

    const chatStore = useChatStore()

    this.socket.onopen = () => {
      console.log('WebSocket connected')
      this.reconnectAttempts = 0
      this.startHeartbeat()
    }

    this.socket.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason)
      this.stopHeartbeat()
      this.handleReconnect()
    }

    this.socket.onerror = (error) => {
      console.error('WebSocket connection error:', error)
      this.handleReconnect()
    }

    this.socket.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data)
        this.handleMessage(data, chatStore)
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }
  }

  private handleMessage(data: WebSocketMessage, chatStore: any) {
    switch (data.type) {
      case 'CONNECTED':
        console.log('WebSocket connection confirmed:', data.message)
        break
      case 'NEW_MESSAGE':
        if (data.data) {
          chatStore.addMessage({
            id: data.data.eventId,
            roomId: data.data.roomId,
            sender: data.data.sender,
            content: data.data.message,
            messageType: 'text',
            timestamp: data.data.timestamp,
            status: 'delivered'
          })
        }
        break
      case 'PONG':
        // 心跳响应
        break
      case 'ERROR':
        console.error('WebSocket error:', data.message)
        break
      default:
        console.log('Unknown message type:', data.type, data)
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      
      setTimeout(() => {
        this.connect()
      }, delay)
    } else {
      console.error('Max reconnection attempts reached')
    }
  }

  sendMessage(type: string, message: string, data?: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const wsMessage: WebSocketMessage = {
        type,
        message,
        data,
        timestamp: new Date().toISOString()
      }
      this.socket.send(JSON.stringify(wsMessage))
    } else {
      console.warn('WebSocket not connected, cannot send message')
    }
  }

  sendChatMessage(roomId: string, content: string) {
    this.sendMessage('CHAT_MESSAGE', content, { roomId, content })
  }

  sendTypingIndicator(roomId: string, isTyping: boolean) {
    this.sendMessage('TYPING', isTyping ? 'User is typing' : 'User stopped typing', {
      roomId,
      isTyping
    })
  }

  ping() {
    this.sendMessage('PING', 'ping')
  }

  disconnect() {
    this.stopHeartbeat()
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN
  }

  // Start periodic ping to keep connection alive
  startHeartbeat() {
    this.heartbeatInterval = window.setInterval(() => {
      if (this.isConnected()) {
        this.ping()
      }
    }, 30000) // Ping every 30 seconds
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }
}

export const websocketService = new WebSocketService()
