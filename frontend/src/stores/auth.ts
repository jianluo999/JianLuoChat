import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI, userAPI } from '@/services/api'

export interface User {
  id: number
  username: string
  email: string
  displayName?: string
  avatarUrl?: string
  status?: 'ONLINE' | 'OFFLINE' | 'AWAY' | 'BUSY'
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  displayName?: string
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const loading = ref(false)
  const error = ref<string | null>(null)
  const initialized = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const currentUser = computed(() => user.value)

  // Actions
  const login = async (credentials: LoginRequest) => {
    loading.value = true
    error.value = null

    try {
      const response = await authAPI.login(credentials)
      const { token: authToken, user: userData } = response.data

      token.value = authToken
      user.value = { ...userData, status: 'ONLINE' as const }

      localStorage.setItem('token', authToken)

      return { success: true }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Login failed'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const register = async (userData: RegisterRequest) => {
    loading.value = true
    error.value = null

    try {
      const response = await authAPI.register(userData)
      const { token: authToken, user: newUser } = response.data

      token.value = authToken
      user.value = { ...newUser, status: 'ONLINE' as const }

      localStorage.setItem('token', authToken)

      return { success: true }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Registration failed'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    console.log('Auth store logout called')
    console.log('Before logout - token:', !!token.value, 'user:', !!user.value)

    user.value = null
    token.value = null
    error.value = null

    localStorage.removeItem('token')

    console.log('After logout - token:', !!token.value, 'user:', !!user.value)
    console.log('isAuthenticated after logout:', isAuthenticated.value)
  }

  const updateProfile = async (profileData: Partial<User>) => {
    loading.value = true
    error.value = null

    try {
      const response = await userAPI.updateProfile(profileData)
      user.value = { ...user.value!, ...response.data }
      return { success: true }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Profile update failed'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const updateStatus = async (status: User['status']) => {
    if (!user.value || !status) return

    try {
      await userAPI.updateStatus(status)
      user.value.status = status
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Status update failed'
    }
  }

  const initializeAuth = async () => {
    if (initialized.value) return

    const storedToken = localStorage.getItem('token')
    console.log('Initializing auth, stored token:', storedToken ? 'exists' : 'not found')
    if (storedToken) {
      token.value = storedToken
      console.log('Token set, isAuthenticated:', isAuthenticated.value)

      // Verify token and get user info
      await fetchCurrentUser()
    }

    initialized.value = true
  }

  const fetchCurrentUser = async () => {
    if (!token.value) return

    try {
      const response = await authAPI.getCurrentUser()
      user.value = { ...response.data, status: response.data.status || 'ONLINE' as const }
    } catch (err: any) {
      console.error('Failed to fetch current user:', err)
      // Only logout if it's a 401 (unauthorized) error
      if (err.response?.status === 401) {
        logout()
      }
      // For other errors (network issues, etc.), keep the token and try again later
    }
  }

  // Initialize auth on store creation
  initializeAuth()

  return {
    // State
    user,
    token,
    loading,
    error,
    initialized,

    // Getters
    isAuthenticated,
    currentUser,

    // Actions
    login,
    register,
    logout,
    updateProfile,
    updateStatus,
    fetchCurrentUser,
    initializeAuth
  }
})
