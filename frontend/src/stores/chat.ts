import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export interface Message {
  id: string
  roomId: string
  sender: string
  content: string
  messageType: 'text' | 'image' | 'file'
  timestamp: string
  status: 'sending' | 'sent' | 'delivered' | 'read'
}

export interface Room {
  id: string
  name: string
  type: 'direct' | 'group'
  avatarUrl?: string
  lastMessage?: Message
  unreadCount: number
  members: string[]
  isTyping: string[]
}

export interface TypingIndicator {
  roomId: string
  userId: string
  isTyping: boolean
}

export const useChatStore = defineStore('chat', () => {
  // State
  const rooms = ref<Room[]>([])
  const messages = ref<Map<string, Message[]>>(new Map())
  const currentRoomId = ref<string | null>(null)
  const onlineUsers = ref<Set<string>>(new Set())
  const typingIndicators = ref<Map<string, Set<string>>>(new Map())
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const currentRoom = computed(() => 
    rooms.value.find(room => room.id === currentRoomId.value)
  )
  
  const currentMessages = computed(() => 
    currentRoomId.value ? messages.value.get(currentRoomId.value) || [] : []
  )
  
  const sortedRooms = computed(() => 
    [...rooms.value].sort((a, b) => {
      const aTime = a.lastMessage?.timestamp || '0'
      const bTime = b.lastMessage?.timestamp || '0'
      return new Date(bTime).getTime() - new Date(aTime).getTime()
    })
  )

  const totalUnreadCount = computed(() => 
    rooms.value.reduce((total, room) => total + room.unreadCount, 0)
  )

  // Actions
  const fetchRooms = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.get('/api/rooms')
      rooms.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch rooms'
    } finally {
      loading.value = false
    }
  }

  const fetchMessages = async (roomId: string, limit = 50, before?: string) => {
    try {
      const params = { limit, before }
      const response = await axios.get(`/api/rooms/${roomId}/messages`, { params })
      
      const roomMessages = messages.value.get(roomId) || []
      if (before) {
        // Prepend older messages
        messages.value.set(roomId, [...response.data, ...roomMessages])
      } else {
        // Set initial messages
        messages.value.set(roomId, response.data)
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch messages'
    }
  }

  const sendMessage = async (roomId: string, content: string, messageType: Message['messageType'] = 'text') => {
    const tempId = `temp_${Date.now()}`
    const tempMessage: Message = {
      id: tempId,
      roomId,
      sender: 'me', // Will be replaced with actual user info
      content,
      messageType,
      timestamp: new Date().toISOString(),
      status: 'sending'
    }

    // Add temporary message to UI
    const roomMessages = messages.value.get(roomId) || []
    messages.value.set(roomId, [...roomMessages, tempMessage])

    try {
      const response = await axios.post(`/api/rooms/${roomId}/messages`, {
        content,
        messageType
      })

      // Replace temporary message with actual message
      const updatedMessages = roomMessages.map(msg => 
        msg.id === tempId ? { ...response.data, status: 'sent' as const } : msg
      )
      messages.value.set(roomId, updatedMessages)

      // Update room's last message
      const room = rooms.value.find(r => r.id === roomId)
      if (room) {
        room.lastMessage = response.data
      }

    } catch (err: any) {
      // Mark message as failed
      const updatedMessages = roomMessages.map(msg => 
        msg.id === tempId ? { ...msg, status: 'failed' as any } : msg
      )
      messages.value.set(roomId, updatedMessages)
      
      error.value = err.response?.data?.message || 'Failed to send message'
    }
  }

  const createRoom = async (name: string, type: Room['type'], members: string[] = []) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.post('/api/rooms', {
        name,
        type,
        members
      })
      
      rooms.value.unshift(response.data)
      return { success: true, room: response.data }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create room'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const joinRoom = async (roomId: string) => {
    try {
      await axios.post(`/api/rooms/${roomId}/join`)
      await fetchRooms() // Refresh rooms list
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to join room'
    }
  }

  const leaveRoom = async (roomId: string) => {
    try {
      await axios.post(`/api/rooms/${roomId}/leave`)
      rooms.value = rooms.value.filter(room => room.id !== roomId)
      messages.value.delete(roomId)
      
      if (currentRoomId.value === roomId) {
        currentRoomId.value = null
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to leave room'
    }
  }

  const setCurrentRoom = (roomId: string | null) => {
    currentRoomId.value = roomId
    
    if (roomId) {
      // Mark messages as read
      markRoomAsRead(roomId)
      
      // Fetch messages if not already loaded
      if (!messages.value.has(roomId)) {
        fetchMessages(roomId)
      }
    }
  }

  const markRoomAsRead = (roomId: string) => {
    const room = rooms.value.find(r => r.id === roomId)
    if (room) {
      room.unreadCount = 0
    }
  }

  const addMessage = (message: Message) => {
    const roomMessages = messages.value.get(message.roomId) || []
    messages.value.set(message.roomId, [...roomMessages, message])
    
    // Update room's last message and unread count
    const room = rooms.value.find(r => r.id === message.roomId)
    if (room) {
      room.lastMessage = message
      if (message.roomId !== currentRoomId.value) {
        room.unreadCount++
      }
    }
  }

  const updateMessageStatus = (messageId: string, status: Message['status']) => {
    for (const [roomId, roomMessages] of messages.value.entries()) {
      const messageIndex = roomMessages.findIndex(msg => msg.id === messageId)
      if (messageIndex !== -1) {
        roomMessages[messageIndex].status = status
        messages.value.set(roomId, [...roomMessages])
        break
      }
    }
  }

  const setUserOnline = (userId: string) => {
    onlineUsers.value.add(userId)
  }

  const setUserOffline = (userId: string) => {
    onlineUsers.value.delete(userId)
  }

  const setTyping = (roomId: string, userId: string, isTyping: boolean) => {
    const roomTyping = typingIndicators.value.get(roomId) || new Set()
    
    if (isTyping) {
      roomTyping.add(userId)
    } else {
      roomTyping.delete(userId)
    }
    
    typingIndicators.value.set(roomId, roomTyping)
  }

  const getTypingUsers = (roomId: string) => {
    return Array.from(typingIndicators.value.get(roomId) || [])
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    rooms,
    messages,
    currentRoomId,
    onlineUsers,
    loading,
    error,
    
    // Getters
    currentRoom,
    currentMessages,
    sortedRooms,
    totalUnreadCount,
    
    // Actions
    fetchRooms,
    fetchMessages,
    sendMessage,
    createRoom,
    joinRoom,
    leaveRoom,
    setCurrentRoom,
    markRoomAsRead,
    addMessage,
    updateMessageStatus,
    setUserOnline,
    setUserOffline,
    setTyping,
    getTypingUsers,
    clearError
  }
})
