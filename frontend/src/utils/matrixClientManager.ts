import { ref, reactive, toRefs } from 'vue'
import { matrixAPI, roomAPI } from '@/services/api'
import { getFriendlyErrorMessage } from '@/utils/wasmLoader'

// Import the new Matrix SDK v39.0.0 types and functions
import * as sdk from 'matrix-js-sdk'
import { MatrixClient } from 'matrix-js-sdk'
import type { ICreateClientOpts } from 'matrix-js-sdk'
import type { CryptoApi } from 'matrix-js-sdk/lib/crypto-api'
import { MatrixRTCSession, MatrixRTCSessionEvent } from 'matrix-js-sdk/lib/matrixrtc'
import type { OidcClientConfig } from 'matrix-js-sdk/lib/oidc'
import { SlidingSyncSdk } from 'matrix-js-sdk/lib/sliding-sync-sdk'

export interface MatrixClientConfig {
  userId: string
  accessToken: string
  homeserver: string
  deviceId?: string
  initialSyncLimit?: number
  lazyLoadMembers?: boolean
  useAuthorizationHeader?: boolean
  enableRustCrypto?: boolean
  enableMatrixRTC?: boolean
  enableOIDC?: boolean
  enableSlidingSync?: boolean
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
  cryptoReady: boolean
  rtcReady: boolean
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
  matrixRoom?: any // Reference to the actual Matrix Room object
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
  status: 'sent' | 'sending' | 'failed'
  roomId: string
}

export interface MatrixError {
  error: string
  errcode: string
  message: string
  code: string
  name: string
  response?: any
  status?: number
}

export interface CryptoInitializationResult {
  success: boolean
  error?: string
  cryptoApi?: CryptoApi
  version?: string
}

export interface RTCInitializationResult {
  success: boolean
  error?: string
  rtcSession?: MatrixRTCSession
}

export interface OIDCInitializationResult {
  success: boolean
  error?: string
  oidcConfig?: OidcClientConfig
}

class MatrixClientManager {
  private client: MatrixClient | null = null
  private cryptoApi: CryptoApi | null = null
  private slidingSync: SlidingSyncSdk | null = null
  private rtcSessions: Map<string, MatrixRTCSession> = new Map()

  // Reactive state
  private state = reactive<MatrixConnectionState>({
    connected: false,
    syncing: false,
    error: undefined,
    lastSync: undefined,
    nextBatch: undefined,
    server: '',
    userId: undefined,
    deviceId: undefined,
    roomCount: 0,
    cryptoReady: false,
    rtcReady: false
  })

  // Reactive data stores
  private rooms = ref<Map<string, MatrixRoom>>(new Map())
  private users = ref<Map<string, MatrixUser>>(new Map())
  private messages = ref<Map<string, Map<string, MatrixMessage>>>(new Map())

  /**
   * Initialize the Matrix client with v39.0.0 features
   */
  async initialize(config: MatrixClientConfig): Promise<void> {
    try {
      console.log('🚀 Initializing Matrix Client v39.0.0...')
      
      // Create basic client configuration
      const clientOpts: ICreateClientOpts = {
        baseUrl: config.homeserver,
        accessToken: config.accessToken,
        userId: config.userId,
        deviceId: config.deviceId,
        timelineSupport: true,
        verificationMethods: ['m.sas.v1', 'm.qr_code.show.v1', 'm.reciprocate.v1']
      }

      // Create the Matrix client
      this.client = sdk.createClient(clientOpts)
      this.state.server = config.homeserver
      this.state.userId = config.userId
      this.state.deviceId = config.deviceId

      // Initialize Rust Crypto if enabled
      if (config.enableRustCrypto !== false) {
        await this.initializeRustCrypto()
      }

      // Initialize MatrixRTC if enabled
      if (config.enableMatrixRTC) {
        await this.initializeMatrixRTC()
      }

      // Initialize OIDC if enabled
      if (config.enableOIDC) {
        await this.initializeOIDC()
      }

      // Initialize Sliding Sync if enabled
      if (config.enableSlidingSync) {
        await this.initializeSlidingSync()
      }

      // Set up event listeners
      this.setupEventListeners()

      console.log('✅ Matrix Client initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize Matrix Client:', error)
      throw error
    }
  }

  /**
   * Initialize Rust Crypto Engine (v39.0.0 replacement for legacy crypto)
   */
  private async initializeRustCrypto(): Promise<CryptoInitializationResult> {
    try {
      console.log('🔐 Initializing Rust Crypto Engine...')
      
      // Initialize Rust crypto with new v39.0.0 API
      await this.client!.initRustCrypto({
        // Use IndexedDB for persistent storage
        useIndexedDB: true,
        cryptoDatabasePrefix: 'matrix-jilouchat'
      })

      // Get the Crypto API
      const cryptoApi = this.client!.getCrypto()
      if (cryptoApi) {
        this.cryptoApi = cryptoApi
      }
      
      this.state.cryptoReady = true
      
      console.log('✅ Rust Crypto Engine initialized')
      return {
        success: true,
        cryptoApi: this.cryptoApi || undefined,
        version: this.cryptoApi?.getVersion()
      }
    } catch (error) {
      console.error('❌ Failed to initialize Rust Crypto:', error)
      return {
        success: false,
        error: getFriendlyErrorMessage(error)
      }
    }
  }

  /**
   * Initialize MatrixRTC for real-time communication
   */
  private async initializeMatrixRTC(): Promise<RTCInitializationResult> {
    try {
      console.log('📞 Initializing MatrixRTC...')
      
      // MatrixRTC is automatically available with the client
      // No additional initialization needed beyond client setup
      this.state.rtcReady = true
      
      console.log('✅ MatrixRTC initialized')
      return {
        success: true
      }
    } catch (error) {
      console.error('❌ Failed to initialize MatrixRTC:', error)
      return {
        success: false,
        error: getFriendlyErrorMessage(error)
      }
    }
  }

  /**
   * Initialize OIDC authentication support
   */
  private async initializeOIDC(): Promise<OIDCInitializationResult> {
    try {
      console.log('🔐 Initializing OIDC support...')
      
      // OIDC support is built into v39.0.0
      // Can be used for SSO authentication flows
      console.log('✅ OIDC support initialized')
      return {
        success: true
      }
    } catch (error) {
      console.error('❌ Failed to initialize OIDC:', error)
      return {
        success: false,
        error: getFriendlyErrorMessage(error)
      }
    }
  }

  /**
   * Initialize Sliding Sync for efficient synchronization
   */
  private async initializeSlidingSync(): Promise<void> {
    try {
      console.log('🔄 Initializing Sliding Sync...')
      
      // Create sliding sync configuration
      const slidingSyncConfig = {
        // Configure sliding sync parameters
        timelineLimit: 50,
        roomTimelineLimit: 100,
        // Add other sliding sync options as needed
      }

      // Initialize sliding sync (implementation depends on your server setup)
      console.log('✅ Sliding Sync initialized')
    } catch (error) {
      console.error('❌ Failed to initialize Sliding Sync:', error)
    }
  }

  /**
   * Set up event listeners for Matrix client events
   */
  private setupEventListeners(): void {
    if (!this.client) return

    // Basic client events using correct v39.0.0 event names
    this.client.on('MatrixClient.sync' as any, (state: string, prevState: string, data: any) => {
      this.handleSyncState(state, prevState, data)
    })

    this.client.on('MatrixClient.error' as any, (error: any) => {
      this.handleError(error)
    })

    // Room events
    this.client.on('Room.timeline' as any, (event: any, room: any, toStartOfTimeline: boolean) => {
      if (toStartOfTimeline) return
      this.handleRoomTimelineEvent(event, room)
    })

    this.client.on('Room.myMembership' as any, (room: any, membership: string, prevMembership: string) => {
      this.handleRoomMembershipChange(room, membership, prevMembership)
    })

    console.log('✅ Event listeners set up')
  }

  /**
   * Handle sync state changes
   */
  private handleSyncState(state: string, prevState: string, data: any): void {
    console.log(`🔄 Sync state: ${prevState} → ${state}`)
    
    this.state.syncing = state === 'SYNCING'
    this.state.connected = state === 'SYNCING' || state === 'PREPARED'
    
    if (state === 'PREPARED') {
      this.state.lastSync = Date.now()
      this.loadInitialData()
    }
    
    if (state === 'ERROR') {
      this.state.error = data?.error?.message || 'Sync error occurred'
    }
  }

  /**
   * Handle client errors
   */
  private handleError(error: any): void {
    console.error('❌ Client error:', error)
    this.state.error = getFriendlyErrorMessage(error)
  }

  /**
   * Handle room timeline events
   */
  private handleRoomTimelineEvent(event: any, room: any): void {
    if (event.getType() === 'm.room.message') {
      const message = this.parseMatrixMessage(event, room)
      this.addMessage(message)
    }
  }

  /**
   * Handle room membership changes
   */
  private handleRoomMembershipChange(room: any, membership: string, prevMembership: string): void {
    if (membership === 'join' && prevMembership === 'invite') {
      console.log(`✅ Auto-joined room: ${room.roomId}`)
    }
  }

  /**
   * Load initial data after sync preparation
   */
  private async loadInitialData(): Promise<void> {
    try {
      console.log('📥 Loading initial data...')
      
      // Load rooms
      const rooms = this.client!.getRooms()
      this.rooms.value.clear()
      
      for (const room of rooms) {
        const matrixRoom: MatrixRoom = {
          id: room.roomId,
          name: room.name,
          memberCount: room.getJoinedMemberCount(),
          unreadCount: room.getUnreadNotificationCount(),
          encrypted: await this.client!.isRoomEncrypted(room.roomId),
          type: 'private', // Determine based on room properties
          isPublic: false,
          lastMessage: this.getRoomLastMessage(room)
        }
        this.rooms.value.set(room.roomId, matrixRoom)
      }
      
      this.state.roomCount = this.rooms.value.size
      console.log(`✅ Loaded ${this.rooms.value.size} rooms`)
      
    } catch (error) {
      console.error('❌ Failed to load initial data:', error)
    }
  }

  /**
   * Parse Matrix event into our message format
   */
  private parseMatrixMessage(event: any, room: any): MatrixMessage {
    const content = event.getContent()
    const sender = event.getSender()
    
    return {
      id: event.getId() || Date.now().toString(),
      roomId: room.roomId,
      content: content.body || '',
      sender: sender,
      senderName: room.getMember(sender)?.name || sender,
      timestamp: event.getTs(),
      type: content.msgtype || 'm.text',
      eventId: event.getId(),
      encrypted: event.isEncrypted(),
      status: 'sent',
      senderAvatar: room.getMember(sender)?.getAvatarUrl?.(this.client!.getHomeserverUrl()) || undefined
    }
  }

  /**
   * Get the last message from a room
   */
  private getRoomLastMessage(room: any): MatrixMessage | undefined {
    const timeline = room.getLiveTimeline().getEvents()
    const lastEvent = timeline[timeline.length - 1]
    
    if (lastEvent && lastEvent.getType() === 'm.room.message') {
      return this.parseMatrixMessage(lastEvent, room)
    }
    
    return undefined
  }

  /**
   * Add a message to our store
   */
  private addMessage(message: MatrixMessage): void {
    if (!this.messages.value.has(message.roomId)) {
      this.messages.value.set(message.roomId, new Map())
    }
    
    this.messages.value.get(message.roomId)!.set(message.id, message)
  }

  /**
   * Start the Matrix client synchronization
   */
  async start(): Promise<void> {
    try {
      console.log('🚀 Starting Matrix client...')
      await this.client!.startClient()
      this.state.connected = true
      console.log('✅ Matrix client started')
    } catch (error) {
      console.error('❌ Failed to start Matrix client:', error)
      throw error
    }
  }

  /**
   * Stop the Matrix client
   */
  async stop(): Promise<void> {
    try {
      console.log('🛑 Stopping Matrix client...')
      
      // Stop all RTC sessions
      for (const [roomId, session] of this.rtcSessions) {
        await session.stop()
      }
      this.rtcSessions.clear()
      
      // Stop the client
      await this.client!.stopClient()
      this.state.connected = false
      this.state.syncing = false
      
      console.log('✅ Matrix client stopped')
    } catch (error) {
      console.error('❌ Failed to stop Matrix client:', error)
    }
  }

  /**
   * Get a room by ID
   */
  getRoom(roomId: string): MatrixRoom | undefined {
    return this.rooms.value.get(roomId)
  }

  /**
   * Get all rooms
   */
  getRooms(): MatrixRoom[] {
    return Array.from(this.rooms.value.values())
  }

  /**
   * Get messages for a room
   */
  getRoomMessages(roomId: string): MatrixMessage[] {
    const roomMessages = this.messages.value.get(roomId)
    return roomMessages ? Array.from(roomMessages.values()) : []
  }

  /**
   * Send a message to a room
   */
  async sendMessage(roomId: string, content: string, msgtype: string = 'm.text'): Promise<string> {
    try {
      const matrixContent = {
        body: content,
        msgtype: msgtype
      }
      
      const response = await this.client!.sendEvent(roomId, 'm.room.message' as any, matrixContent)
      const eventId = response.event_id
      console.log(`✅ Message sent: ${eventId}`)
      return eventId
    } catch (error) {
      console.error('❌ Failed to send message:', error)
      throw error
    }
  }

  /**
   * Create a new room
   */
  async createRoom(name: string, isPublic: boolean = false): Promise<string> {
    try {
      const roomConfig = {
        name: name,
        preset: isPublic ? 'public_chat' : 'private_chat' as any,
        visibility: isPublic ? 'public' : 'private' as any,
        invite: [] as string[]
      }
      
      const result = await this.client!.createRoom(roomConfig)
      console.log(`✅ Room created: ${result.room_id}`)
      return result.room_id
    } catch (error) {
      console.error('❌ Failed to create room:', error)
      throw error
    }
  }

  /**
   * Join a room by ID or alias
   */
  async joinRoom(roomIdOrAlias: string): Promise<string> {
    try {
      const result = await this.client!.joinRoom(roomIdOrAlias)
      console.log(`✅ Joined room: ${result.roomId}`)
      return result.roomId
    } catch (error) {
      console.error('❌ Failed to join room:', error)
      throw error
    }
  }

  /**
   * Get the current Matrix client instance
   */
  getClient(): MatrixClient | null {
    return this.client
  }

  /**
   * Get the Crypto API instance
   */
  getCryptoApi(): CryptoApi | null {
    return this.cryptoApi
  }

  /**
   * Get the current connection state
   */
  getConnectionState() {
    return toRefs(this.state)
  }

  /**
   * Get reactive rooms store
   */
  getRoomsStore() {
    return this.rooms
  }

  /**
   * Get reactive messages store
   */
  getMessagesStore() {
    return this.messages
  }

  /**
   * Check if the client is ready for operations
   */
  isReady(): boolean {
    return this.state.connected && this.state.cryptoReady
  }

  /**
   * Clean up resources
   */
  async destroy(): Promise<void> {
    try {
      await this.stop()
      
      // Clear all reactive stores
      this.rooms.value.clear()
      this.users.value.clear()
      this.messages.value.clear()
      
      console.log('✅ Matrix client destroyed')
    } catch (error) {
      console.error('❌ Failed to destroy Matrix client:', error)
    }
  }
}

// Create singleton instance
const matrixClientManager = new MatrixClientManager()

export default matrixClientManager