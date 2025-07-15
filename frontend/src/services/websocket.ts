import { useAuthStore } from '@/stores/auth'
import { useMatrixStore } from '@/stores/matrix'

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
  private eventListeners: { [key: string]: Function[] } = {}

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

    const matrixStore = useMatrixStore()

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
        this.handleMessage(data, matrixStore)
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }
  }

  private handleMessage(data: WebSocketMessage, matrixStore: any) {
    switch (data.type) {
      case 'CONNECTED':
        console.log('WebSocket connection confirmed:', data.message)
        break
      case 'NEW_MESSAGE':
        if (data.data) {
          // 添加Matrix消息
          matrixStore.addMatrixMessage(data.data.roomId, {
            id: data.data.eventId,
            roomId: data.data.roomId,
            content: data.data.message,
            sender: data.data.sender,
            timestamp: data.data.timestamp,
            type: 'm.room.message',
            eventId: data.data.eventId,
            encrypted: false
          })
        }
        break
      case 'WORLD_MESSAGE':
        console.log('WebSocket received WORLD_MESSAGE:', data)
        this.emit('worldMessage', data.data)
        break
      case 'WORLD_JOINED':
        this.emit('worldJoined', data.data)
        break
      case 'TYPING_INDICATOR':
        this.emit('typingIndicator', data.data)
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

  on(event: string, callback: Function) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = []
    }
    this.eventListeners[event].push(callback)
  }

  off(event: string, callback: Function) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback)
    }
  }

  private emit(event: string, data: any) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data))
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

  sendWorldMessage(content: string) {
    this.sendMessage('WORLD_MESSAGE', content, { content })
  }

  joinWorld() {
    this.sendMessage('JOIN_WORLD', 'Joining world channel')
  }

  sendTypingIndicator(roomId: string, isTyping: boolean) {
    this.sendMessage('TYPING', isTyping ? 'User is typing' : 'User stopped typing', {
      roomCode: roomId === 'world' ? 'WORLD' : roomId,
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
