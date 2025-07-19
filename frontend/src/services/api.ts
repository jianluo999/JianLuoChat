import axios from 'axios'
import { errorHandler } from '@/utils/errorHandler'
import { safeNetworkRequest } from '@/utils/networkInterceptor'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // 处理网络错误
    const url = error.config?.url || 'unknown'
    const method = error.config?.method?.toUpperCase() || 'GET'
    
    // 检查是否是APM相关错误，如果是则静默处理
    if (url.includes('apm-volcano') || url.includes('monitor_web')) {
      console.debug('🔇 APM request error silenced:', url)
      return Promise.reject(error)
    }

    // 处理认证错误
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      console.log('JWT token expired or invalid, cleared from localStorage')
      
      errorHandler.handleAuthError({
        message: 'Authentication token expired or invalid',
        operation: 'validation',
        isTokenExpired: true,
        shouldRedirect: true,
        redirectPath: '/login',
        context: { url, method, status: 401 }
      })
    }
    // 处理其他HTTP错误
    else if (error.response) {
      errorHandler.handleNetworkError({
        url,
        status: error.response.status,
        statusText: error.response.statusText,
        method,
        message: `HTTP ${error.response.status}: ${error.response.statusText}`,
        retryCount: 0,
        isTimeout: false,
        context: {
          responseData: error.response.data,
          requestData: error.config?.data
        }
      })
    }
    // 处理网络连接错误
    else if (error.request) {
      errorHandler.handleNetworkError({
        url,
        status: 0,
        statusText: 'Network Error',
        method,
        message: error.message || 'Network request failed',
        retryCount: 0,
        isTimeout: error.code === 'ECONNABORTED' || error.message.includes('timeout'),
        context: {
          errorCode: error.code,
          requestData: error.config?.data
        }
      })
    }
    // 处理其他错误
    else {
      errorHandler.handleNetworkError({
        url,
        status: 0,
        statusText: 'Unknown Error',
        method,
        message: error.message || 'Unknown network error',
        retryCount: 0,
        isTimeout: false,
        context: {
          errorType: 'unknown',
          originalError: error
        }
      })
    }

    return Promise.reject(error)
  }
)

export default api

// API endpoints
export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (userData: { username: string; email: string; password: string; displayName?: string }) =>
    api.post('/auth/register', userData),
  
  logout: () => api.post('/auth/logout'),
  
  refreshToken: () => api.post('/auth/refresh'),
  
  getCurrentUser: () => api.get('/users/me')
}

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  
  updateProfile: (data: any) => api.put('/users/profile', data),
  
  updateStatus: (status: string) => api.put('/users/status', { status }),
  
  searchUsers: (query: string) => api.get(`/users/search?q=${query}`),
  
  getOnlineUsers: () => api.get('/users/online')
}

export const roomAPI = {
  // 获取用户的Matrix房间列表（包含世界频道）
  getRooms: () => api.get('/rooms'),

  // 获取世界频道
  getWorldChannel: () => api.get('/rooms/world'),

  // 获取用户的私密房间
  getPrivateRoom: () => api.get('/rooms/private'),

  // 获取用户可访问的房间列表
  getAccessibleRooms: () => api.get('/rooms/accessible'),

  // 创建Matrix房间
  createRoom: (data: { name: string; type?: string }) =>
    api.post('/rooms', data),

  // 创建群聊房间
  createGroupRoom: (data: { name: string; description?: string }) =>
    api.post('/rooms/group', data),

  // 加入Matrix房间
  joinRoom: (roomId: string) => api.post(`/rooms/${roomId}/join`),

  // 离开Matrix房间
  leaveRoom: (roomId: string) => api.post(`/rooms/${roomId}/leave`),

  // 获取房间信息
  getRoomInfo: (roomId: string) => api.get(`/rooms/${roomId}`),

  // 发送消息到指定房间
  sendMessage: (roomId: string, data: { message: string }) =>
    api.post(`/rooms/${roomId}/messages`, data)
}

export const messageAPI = {
  // 获取房间消息
  getRoomMessages: (roomId: string, params?: { limit?: number; before?: string }) =>
    api.get(`/rooms/${roomId}/messages`, { params }),

  // 获取世界频道消息
  getWorldMessages: (params?: { limit?: number }) =>
    api.get('/rooms/world/messages', { params }),

  // 发送消息（通过房间API）
  sendMessage: (roomId: string, data: { message: string }) =>
    api.post(`/rooms/${roomId}/messages`, data)
}

export const matrixAPI = {
  // Matrix登录
  login: (credentials: { username: string; password: string; homeserver?: string }) =>
    api.post('/matrix/login', credentials),

  // Matrix注册
  register: (userData: { username: string; password: string; homeserver?: string }) =>
    api.post('/matrix/register', userData),

  // 获取Matrix状态
  getStatus: () => api.get('/matrix/status'),

  // 测试Matrix连接
  testConnection: () => api.get('/matrix/test/connection'),

  // 获取连接状态
  getConnection: () => api.get('/matrix/test/connection'),

  // 获取世界频道
  getWorldChannel: () => api.get('/matrix/world-channel'),

  // 获取房间消息
  getRoomMessages: (params: { roomId: string; limit?: number; from?: string }) =>
    api.get(`/matrix/rooms/${params.roomId}/messages`, { params }),

  // 发送消息
  sendMessage: (data: { roomId: string; content: string; type?: string }) => {
    // 世界频道使用不同的API端点
    if (data.roomId === 'world') {
      return api.post(`/rooms/world/messages`, data)
    }
    return api.post(`/matrix/rooms/${data.roomId}/messages`, data)
  },

  // Matrix同步
  sync: (params: { username: string; since?: string; timeout?: number }) =>
    api.post('/matrix/test/sync', params),

  // Matrix同步相关
  getSyncStatus: () => api.get('/matrix/test/sync/status'),
  startSync: (username: string) => api.post('/matrix/test/sync/start', { username }),
  stopSync: () => api.post('/matrix/test/sync/stop'),

  // Matrix房间操作（通过统一的rooms API）
  createRoom: (data: { name: string; public?: boolean; topic?: string }) =>
    api.post('/rooms', { ...data, type: 'matrix' }),

  // 加入Matrix房间
  joinRoom: (roomIdOrAlias: string) =>
    api.post(`/matrix/rooms/join`, { roomIdOrAlias }),

  // 获取世界频道消息
  getWorldChannelMessages: (limit = 50) =>
    api.get(`/rooms/world/messages?limit=${limit}`),

  // Matrix联邦相关
  discoverServers: () => api.get('/matrix/servers'),
  getServerInfo: (serverName: string) => api.get(`/matrix/servers/${serverName}`),

  // Matrix设备和加密
  getDevices: () => api.get('/matrix/devices'),
  verifyDevice: (deviceId: string) => api.post(`/matrix/devices/${deviceId}/verify`),

  // Matrix用户搜索
  searchUsers: (query: string) => api.get(`/matrix/users/search?q=${query}`)
}

// 邀请系统API
export const invitationAPI = {
  // 发送房间邀请
  sendInvitation: (data: { targetUserId: string; roomId: string; message?: string }) =>
    api.post('/invitations', data),

  // 获取收到的邀请（待处理的邀请）
  getReceivedInvitations: () => api.get('/invitations/pending'),

  // 获取发送的邀请
  getSentInvitations: () => api.get('/invitations/sent'),

  // 接受邀请
  acceptInvitation: (invitationId: string) => api.post(`/invitations/${invitationId}/accept`),

  // 拒绝邀请
  rejectInvitation: (invitationId: string) => api.post(`/invitations/${invitationId}/reject`),

  // 撤销邀请
  revokeInvitation: (invitationId: string) => api.delete(`/invitations/${invitationId}`)
}

export const fileAPI = {
  uploadFile: (file: File, roomId?: string) => {
    const formData = new FormData()
    formData.append('file', file)
    if (roomId) {
      formData.append('roomId', roomId)
    }
    
    return api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  downloadFile: (fileId: string) => api.get(`/files/${fileId}`, {
    responseType: 'blob'
  }),
  
  deleteFile: (fileId: string) => api.delete(`/files/${fileId}`)
}
