import axios from 'axios'

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
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      window.location.href = '/login'
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
  getRooms: () => api.get('/rooms'),
  
  createRoom: (data: { name: string; type: string; members?: string[] }) =>
    api.post('/rooms', data),
  
  joinRoom: (roomId: string) => api.post(`/rooms/${roomId}/join`),
  
  leaveRoom: (roomId: string) => api.post(`/rooms/${roomId}/leave`),
  
  getRoomInfo: (roomId: string) => api.get(`/rooms/${roomId}`),
  
  updateRoom: (roomId: string, data: any) => api.put(`/rooms/${roomId}`, data),
  
  deleteRoom: (roomId: string) => api.delete(`/rooms/${roomId}`)
}

export const messageAPI = {
  getMessages: (roomId: string, params?: { limit?: number; before?: string }) =>
    api.get(`/rooms/${roomId}/messages`, { params }),
  
  sendMessage: (roomId: string, data: { content: string; messageType?: string }) =>
    api.post(`/rooms/${roomId}/messages`, data),
  
  deleteMessage: (roomId: string, messageId: string) =>
    api.delete(`/rooms/${roomId}/messages/${messageId}`),
  
  markAsRead: (roomId: string, messageId: string) =>
    api.put(`/rooms/${roomId}/messages/${messageId}/read`)
}

export const matrixAPI = {
  login: (credentials: { username: string; password: string }) =>
    api.post('/matrix/login', credentials),
  
  register: (userData: { username: string; password: string }) =>
    api.post('/matrix/register', userData),
  
  createRoom: (data: { name: string; public?: boolean }) =>
    api.post('/matrix/rooms', data),
  
  joinRoom: (roomId: string) => api.post(`/matrix/rooms/${roomId}/join`),
  
  sendMessage: (roomId: string, data: { message: string }) =>
    api.post(`/matrix/rooms/${roomId}/messages`, data),
  
  getSyncStatus: () => api.get('/matrix/sync/status'),
  
  startSync: () => api.post('/matrix/sync/start'),
  
  stopSync: () => api.post('/matrix/sync/stop'),
  
  getStatus: () => api.get('/matrix/status')
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
