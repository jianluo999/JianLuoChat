import { ref, computed, nextTick } from 'vue'
import { matrixAPI, roomAPI } from '@/services/api'
import { initializeCryptoInitialization, getFriendlyErrorMessage } from '@/utils/wasmLoader'
import { cryptoConflictManager } from '@/utils/cryptoConflictManager'

export interface MatrixClientConfig {
  userId: string
  accessToken: string
  homeserver: string
  deviceId?: string
  initialSyncLimit?: number
  lazyLoadMembers?: boolean
  useAuthorizationHeader?: boolean
}

export interface MatrixConnectionState {
  connected: boolean
  syncing: boolean
  error?: string
  lastSync?: number
  nextBatch?: string
  server: string
  userId?: string
  deviceId?: string
  roomCount: number
}

export interface MatrixRoom {
  id: string
  name: string
  alias?: string
  topic?: string
  type: 'public' | 'private' | 'world' | 'space'
  isPublic: boolean
  memberCount: number
  unreadCount: number
  encrypted: boolean
  joinRule?: string
  historyVisibility?: string
  avatarUrl?: string
  isFileTransferRoom?: boolean
  lastMessage?: MatrixMessage
}

export interface MatrixMessage {
  id: string
  roomId: string
  content: string
  sender: string
  senderName?: string
  timestamp: number
  type: string
  eventId?: string
  encrypted?: boolean
  status: 'sending' | 'sent' | 'delivered' | 'failed'
  senderId?: string
  roomId?: string
  timestamp?: number
  type?: string
  eventId?: string
  encrypted?: boolean
  status?: 'sending' | 'sent' | 'delivered' | 'failed'
  senderName?: string
  senderAvatar?: string
  edited?: boolean
  isRedacted?: boolean
  reactions?: Record<string, { count: number; users: string[]; hasReacted: boolean }>
  replyTo?: {
    eventId: string
    senderName: string
    content: string
    roomId: string
    timestamp: number
    sender: string
  }
  fileInfo?: {
    name: string
    size: number
    type: string
    url: string
    isImage: boolean
    url?: string
    name?: string
    size?: number
    type?: string
    isImage?: boolean
    url?: string
    name?: string
    size?: number
    type?: string
    isImage?: boolean
    mxcUrl?: string
  }
}

export interface MatrixUser {
  id: string
  username: string
  displayName?: string
  avatarUrl?: string
  presence?: 'online' | 'offline' | 'unavailable'
  lastSeen?: number
  statusMessage?: string
  isTyping?: boolean
  typingRoomId?: string
  typingTimeout?: number
  typingUsers?: Map<string, number>
  typingTimeout?: number
  typingUsers?: Map<string, number>
  typingTimeout?: number
  typingUsers?: Map<string, number>
  typingTimeout?: number
  typingUsers?: Map<string, number>
  typingTimeout?: number
  typingUsers?: Map<strinumber>
}

export interface MatrixEvent {
  type: string
  stateKey?: string
  content: any
  sender: string
  eventId: string
  timestamp: number
  room: string
  prevEvents: string[]
  roomState: any
  unsigned?: any
  signatures?: Record<string, Record<string, string>>
  unsigned?: any
  signatures?: Record<string, Record<string, string>>
  unsigned?: any
  signatures?: Record<string, Record<string, string>>
  unsigned?: any
  signatures?: Record<string, Record<strinRecord<string, string>>
  unsigned?: any
  signatures?: Record<string, Record<string, string>>
  status: 'sent' | 'sending' | 'failed'
  roomId: string
  sender: string
  timestamp: number
  type: string
  content: any
  eventId?: string
  unsigned?: any
  signatures?: Record<string, string>
  unsigned?: any
  signatures?: Record<string, string>
  unsigned?: any
  signatures?: string
  unsigned?: any
  signatures?: string
  unsigned?: any
  signatures?: string
  unsigned?: any
  signatures?: string
  unsigned?: any
  signaturestring
}

export interface MatrixError {
  error: string
  errcode: string
  error: string
  errcode: string
  error: string
  errcode: string
  error: string
  errcode: string
  error: string
  errcode: string
  error: string
  errcode: string
  error: string
  err: any
  message: string
  code: string
  name: string
  response?: any
  response?: any
  response?: any
  response?: any
  response?: any
  response?: any
  response?: any
  response?: any
  response?: any
  response?: any
  response?: string
  status?: number
  status?: number
  status?: number
  status?: number
  status?: number
  status?: number
  status?: number
  status?: number
  status?: number
  status?: number
  status: number
  status: number
  status: number
  status: number
  status: number
  status: string
  status: string
  status: string
  status: string
  status: string
  status: string
  status: string
  status: string
  status: string
  status: string
  status: string
  status: string
  status: string
  status: string
  status: string
  status: string
  status: string
  status: string
  status: string
  status: string
  status: string
  status: string
  status: string
  status: string
  status: string
  status: string
  status: string
  status: string
  status: string
  status: string
  status: string
  status: string
  status: string
  status: string
  status: string
  status: string
  status: string
  status: string
  status: string
  status: string
  status: string
  status: string
  status: string
  status: string
  <string, string>
  <string, string>
  <string, string>
  <string, string>
  <string, string>
  <string, string>
  <string, string>
  <string, string>
  <string, string>
  <string, string>
  <string, string>
  <string, string>
  <string, string>
  <string, string>
  <string, string>
  <string, string>
  <string, string>
  <string, string>
  <string, string>
  <string, string>
  <string, string>
  <string, string>
  <string, string>
  <string, string>
  <string, string>
  <string, string>
  <string, string>
  <string, string>
  <string, string>
  <string, string>
  <string, string>
  <string, string>
  <string, string>
  <string, string>
  <string, string>
  <string, string>
  <string, string>
  <line_count>1000</line> 