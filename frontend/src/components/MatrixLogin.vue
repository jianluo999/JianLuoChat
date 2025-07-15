<template>
  <div class="matrix-login">
    <div class="login-container">
      <!-- Matrix品牌头部 -->
      <div class="matrix-header">
        <div class="matrix-logo">
          <svg class="logo-icon" viewBox="0 0 24 24">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>
          </svg>
          <div class="logo-text">
            <div class="logo-main">Matrix Protocol</div>
            <div class="logo-sub">Decentralized Communication</div>
          </div>
        </div>
        <div class="client-info">
          <div class="client-name">JianluoChat</div>
          <div class="client-version">Matrix Client v1.0</div>
        </div>
      </div>

      <!-- 服务器选择 -->
      <div class="server-selection">
        <div class="server-header">
          <h3>{{ $t('matrix.selectHomeserver') }}</h3>
          <button @click="$emit('change-server')" class="change-server-btn">
            {{ $t('matrix.changeServer') }}
          </button>
        </div>
        <div class="selected-server">
          <div class="server-info">
            <div class="server-name">{{ selectedServer }}</div>
            <div class="server-status" :class="serverStatus">
              <div class="status-dot"></div>
              <span>{{ getServerStatusText() }}</span>
            </div>
          </div>
          <div class="federation-badge">
            <svg class="federation-icon" viewBox="0 0 24 24">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>
            </svg>
            <span>{{ $t('matrix.federated') }}</span>
          </div>
        </div>
      </div>

      <!-- Matrix协议特性展示 -->
      <div class="matrix-features">
        <div class="features-header">
          <h4>{{ $t('matrix.protocolFeatures') }}</h4>
        </div>
        <div class="features-grid">
          <div class="feature-item">
            <svg class="feature-icon" viewBox="0 0 24 24">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>
            </svg>
            <div class="feature-text">
              <div class="feature-title">{{ $t('matrix.federation') }}</div>
              <div class="feature-desc">{{ $t('matrix.federationDesc') }}</div>
            </div>
          </div>
          <div class="feature-item">
            <svg class="feature-icon" viewBox="0 0 24 24">
              <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"/>
            </svg>
            <div class="feature-text">
              <div class="feature-title">{{ $t('matrix.endToEndEncryption') }}</div>
              <div class="feature-desc">{{ $t('matrix.encryptionDesc') }}</div>
            </div>
          </div>
          <div class="feature-item">
            <svg class="feature-icon" viewBox="0 0 24 24">
              <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
            </svg>
            <div class="feature-text">
              <div class="feature-title">{{ $t('matrix.realTimeSync') }}</div>
              <div class="feature-desc">{{ $t('matrix.syncDesc') }}</div>
            </div>
          </div>
          <div class="feature-item">
            <svg class="feature-icon" viewBox="0 0 24 24">
              <path d="M19,19H5V5H19M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3Z"/>
            </svg>
            <div class="feature-text">
              <div class="feature-title">{{ $t('matrix.spacesAndRooms') }}</div>
              <div class="feature-desc">{{ $t('matrix.spacesDesc') }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Matrix登录表单 -->
      <div class="login-form">
        <div class="form-header">
          <h3>{{ $t('matrix.signIn') }}</h3>
          <p>{{ $t('matrix.signInDesc') }}</p>
        </div>

        <form @submit.prevent="handleLogin" class="matrix-form">
          <div class="form-group">
            <label class="form-label">{{ $t('matrix.matrixId') }}</label>
            <div class="matrix-id-input">
              <span class="id-prefix">@</span>
              <input
                v-model="loginForm.username"
                type="text"
                class="form-input"
                :placeholder="$t('matrix.usernamePlaceholder')"
                required
                :disabled="loading"
                @input="validateUsername"
              />
              <span class="id-suffix">:{{ selectedServer }}</span>
            </div>
            <div v-if="usernameError" class="field-error">{{ usernameError }}</div>
          </div>

          <div class="form-group">
            <label class="form-label">{{ $t('matrix.password') }}</label>
            <div class="password-input">
              <input
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                :placeholder="$t('matrix.passwordPlaceholder')"
                required
                :disabled="loading"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="password-toggle"
                :title="showPassword ? $t('matrix.hidePassword') : $t('matrix.showPassword')"
              >
                <svg viewBox="0 0 24 24">
                  <path v-if="showPassword" d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.09L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.76,7.13 11.37,7 12,7Z"/>
                  <path v-else d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C17,4.5 21.27,7.61 23,12C21.27,16.39 17,19.5 12,19.5C7,19.5 2.73,16.39 1,12C2.73,7.61 7,4.5 12,4.5Z"/>
                </svg>
              </button>
            </div>
            <div v-if="passwordError" class="field-error">{{ passwordError }}</div>
          </div>

          <!-- 登录选项 -->
          <div class="login-options">
            <label class="checkbox-label">
              <input type="checkbox" v-model="loginForm.rememberMe" />
              <span class="checkbox-text">{{ $t('matrix.rememberMe') }}</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="loginForm.enableE2EE" />
              <span class="checkbox-text">{{ $t('matrix.enableE2EE') }}</span>
            </label>
          </div>

          <!-- 错误信息 -->
          <div v-if="loginError" class="login-error">
            <svg class="error-icon" viewBox="0 0 24 24">
              <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
            </svg>
            <span>{{ loginError }}</span>
          </div>

          <!-- 登录按钮 -->
          <div class="form-actions">
            <button
              type="submit"
              class="login-button"
              :disabled="!canLogin || loading"
            >
              <span v-if="loading" class="loading-spinner"></span>
              <span>{{ loading ? $t('matrix.signingIn') : $t('matrix.signIn') }}</span>
            </button>
          </div>
        </form>

        <!-- 注册链接 -->
        <div class="register-link">
          <span>{{ $t('matrix.noAccount') }}</span>
          <button @click="showRegister = true" class="link-button">
            {{ $t('matrix.createAccount') }}
          </button>
        </div>
      </div>

      <!-- Matrix协议信息 -->
      <div class="protocol-info">
        <div class="info-header">
          <svg class="info-icon" viewBox="0 0 24 24">
            <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"/>
          </svg>
          <span>{{ $t('matrix.aboutProtocol') }}</span>
        </div>
        <div class="info-content">
          <p>{{ $t('matrix.protocolDescription') }}</p>
          <div class="info-features">
            <div class="info-feature">
              <svg class="feature-icon" viewBox="0 0 24 24">
                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>
              </svg>
              <span>{{ $t('matrix.decentralized') }}</span>
            </div>
            <div class="info-feature">
              <svg class="feature-icon" viewBox="0 0 24 24">
                <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"/>
              </svg>
              <span>{{ $t('matrix.encrypted') }}</span>
            </div>
            <div class="info-feature">
              <svg class="feature-icon" viewBox="0 0 24 24">
                <path d="M16.5,12C19,12 21,14 21,16.5C21,17.38 20.75,18.21 20.31,18.9L23.39,22L22,23.39L18.88,20.32C18.19,20.75 17.37,21 16.5,21C14,21 12,19 12,16.5C12,14 14,12 16.5,12M16.5,14A2.5,2.5 0 0,0 14,16.5A2.5,2.5 0 0,0 16.5,19A2.5,2.5 0 0,0 19,16.5A2.5,2.5 0 0,0 16.5,14M19,3H5C3.89,3 3,3.89 3,5V15A2,2 0 0,0 5,17H9V15H5V5H19V9H21V5C21,3.89 20.1,3 19,3Z"/>
              </svg>
              <span>{{ $t('matrix.openSource') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useMatrixStore } from '@/stores/matrix'
import { matrixAPI } from '@/services/api'

interface Props {
  selectedServer?: string
}

const props = withDefaults(defineProps<Props>(), {
  selectedServer: 'matrix.org'
})

const emit = defineEmits<{
  'login-success': []
  'change-server': []
}>()

const matrixStore = useMatrixStore()

// 表单状态
const loginForm = ref({
  username: '',
  password: '',
  rememberMe: false,
  enableE2EE: true
})

const showPassword = ref(false)
const showRegister = ref(false)
const loading = ref(false)

// 错误状态
const usernameError = ref('')
const passwordError = ref('')
const loginError = ref('')

// 服务器状态
const serverStatus = ref<'online' | 'offline' | 'checking'>('checking')

// 计算属性
const canLogin = computed(() => {
  return loginForm.value.username.trim() &&
         loginForm.value.password.trim() &&
         !loading.value &&
         serverStatus.value === 'online'
})

// 方法
const validateUsername = () => {
  const username = loginForm.value.username.trim()
  if (!username) {
    usernameError.value = 'Username is required'
    return false
  }
  if (!/^[a-z0-9._=-]+$/.test(username)) {
    usernameError.value = 'Username contains invalid characters'
    return false
  }
  usernameError.value = ''
  return true
}

const getServerStatusText = () => {
  switch (serverStatus.value) {
    case 'online':
      return 'Online'
    case 'offline':
      return 'Offline'
    case 'checking':
      return 'Checking...'
    default:
      return 'Unknown'
  }
}
const handleLogin = async () => {
  if (!canLogin.value) return

  // 清除之前的错误
  loginError.value = ''
  usernameError.value = ''
  passwordError.value = ''

  // 验证表单
  if (!validateUsername()) return

  loading.value = true

  try {
    // 构建完整的Matrix ID
    const matrixId = `@${loginForm.value.username.trim()}:${props.selectedServer}`

    // 调用Matrix登录API
    const response = await matrixAPI.login({
      username: matrixId,
      password: loginForm.value.password,
      homeserver: props.selectedServer
    })

    if (response.data.success) {
      // 保存登录信息
      if (loginForm.value.rememberMe) {
        localStorage.setItem('matrix-credentials', JSON.stringify({
          username: loginForm.value.username,
          server: props.selectedServer
        }))
      }

      // 调用Matrix登录
      const matrixResult = await matrixStore.matrixLogin(loginForm.value.username, loginForm.value.password)

      if (matrixResult.success) {
        emit('login-success')
      } else {
        loginError.value = matrixResult.error || 'Matrix login failed'
      }
    } else {
      loginError.value = response.data.message || 'Login failed'
    }
  } catch (error: any) {
    console.error('Matrix login failed:', error)

    if (error.response?.status === 401) {
      loginError.value = 'Invalid username or password'
    } else if (error.response?.status === 403) {
      loginError.value = 'Account is disabled or banned'
    } else if (error.response?.status === 429) {
      loginError.value = 'Too many login attempts. Please try again later'
    } else {
      loginError.value = error.response?.data?.message || 'Connection failed. Please check your network'
    }
  } finally {
    loading.value = false
  }
}

const checkServerStatus = async () => {
  serverStatus.value = 'checking'

  try {
    const response = await matrixAPI.getServerInfo(props.selectedServer)
    serverStatus.value = response.data ? 'online' : 'offline'
  } catch (error) {
    console.warn('Server status check failed:', error)
    serverStatus.value = 'offline'
  }
}

// 监听服务器变化
watch(() => props.selectedServer, () => {
  checkServerStatus()
}, { immediate: true })

// 生命周期
onMounted(() => {
  // 尝试恢复保存的用户名
  const savedCredentials = localStorage.getItem('matrix-credentials')
  if (savedCredentials) {
    try {
      const credentials = JSON.parse(savedCredentials)
      if (credentials.server === props.selectedServer) {
        loginForm.value.username = credentials.username
        loginForm.value.rememberMe = true
      }
    } catch (error) {
      console.warn('Failed to restore credentials:', error)
    }
  }
})
</script>

<style scoped>
.matrix-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  padding: 20px;
}

.login-container {
  max-width: 480px;
  width: 100%;
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%);
  border: 1px solid #3a4a5c;
  border-radius: 16px;
  padding: 32px;
  backdrop-filter: blur(20px);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  color: #e0e6ed;
}

.matrix-header {
  text-align: center;
  margin-bottom: 30px;
}

.matrix-logo {
  margin-bottom: 15px;
}

.logo-main {
  font-size: 36px;
  font-weight: bold;
  color: #00ff00;
  text-shadow: 0 0 10px #00ff00;
  margin-bottom: 5px;
}

.logo-sub {
  font-size: 14px;
  color: #00cccc;
  letter-spacing: 2px;
}

.client-info {
  border-top: 1px solid #003300;
  padding-top: 15px;
}

.client-name {
  color: #00ff00;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 2px;
}

.client-version {
  color: #666;
  font-size: 12px;
}

.server-status, .matrix-features, .login-form, .protocol-info, .connection-test {
  margin-bottom: 25px;
  padding: 15px;
  border: 1px solid #003300;
  border-radius: 4px;
  background: rgba(0, 255, 0, 0.02);
}

.status-header, .features-header, .form-header, .info-header {
  color: #00ff00;
  font-weight: bold;
  font-size: 12px;
  margin-bottom: 10px;
  text-align: center;
  border-bottom: 1px solid #003300;
  padding-bottom: 5px;
}

.status-line {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  font-size: 11px;
}

.status-label {
  color: #00ff00;
  font-weight: bold;
  min-width: 70px;
  margin-right: 8px;
}

.status-value {
  color: #00cccc;
}

.status-indicator {
  margin-right: 5px;
  font-size: 8px;
}

.status-indicator.connected {
  color: #00ff00;
  animation: pulse 2s infinite;
}

.status-indicator.connecting {
  color: #ffff00;
  animation: blink 1s infinite;
}

.status-indicator.disconnected {
  color: #ff0000;
}

.status-text {
  color: #00ff00;
  font-weight: bold;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  border: 1px solid #003300;
  border-radius: 3px;
  background: rgba(0, 255, 0, 0.05);
}

.feature-icon {
  font-size: 16px;
  margin-bottom: 4px;
}

.feature-text {
  color: #00ff00;
  font-size: 9px;
  font-weight: bold;
}

.form-group {
  margin-bottom: 15px;
}

.form-label {
  display: block;
  color: #00ff00;
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 5px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid #003300;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.8);
}

.input-prefix, .input-suffix {
  color: #00cccc;
  padding: 0 8px;
  font-size: 14px;
}

.form-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #00ff00;
  padding: 10px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 14px;
}

.form-input:focus {
  outline: none;
}

.input-wrapper:focus-within {
  border-color: #00ff00;
  box-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
}

.form-input:disabled {
  opacity: 0.5;
}

.form-actions {
  text-align: center;
}

.login-button {
  background: rgba(0, 255, 0, 0.1);
  border: 2px solid #00ff00;
  color: #00ff00;
  padding: 12px 30px;
  font-family: 'Share Tech Mono', monospace;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.login-button:hover:not(:disabled) {
  background: rgba(0, 255, 0, 0.2);
  box-shadow: 0 0 15px rgba(0, 255, 0, 0.5);
}

.login-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

.error-message {
  margin-top: 15px;
  padding: 10px;
  border: 1px solid #ff0000;
  border-radius: 3px;
  background: rgba(255, 0, 0, 0.1);
}

.error-header {
  color: #ff0000;
  font-weight: bold;
  font-size: 11px;
  margin-bottom: 5px;
}

.error-text {
  color: #ff6666;
  font-size: 12px;
  margin-bottom: 8px;
}

.error-dismiss {
  background: none;
  border: 1px solid #ff0000;
  color: #ff0000;
  padding: 2px 8px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 10px;
  cursor: pointer;
}

.error-dismiss:hover {
  background: rgba(255, 0, 0, 0.1);
}

.info-content {
  color: #666;
  font-size: 11px;
  line-height: 1.4;
}

.info-content p {
  margin-bottom: 8px;
}

.info-content ul {
  margin: 0;
  padding-left: 15px;
}

.info-content li {
  margin-bottom: 3px;
}

.test-button {
  background: rgba(0, 204, 204, 0.1);
  border: 1px solid #00cccc;
  color: #00cccc;
  padding: 8px 16px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
}

.test-button:hover:not(:disabled) {
  background: rgba(0, 204, 204, 0.2);
  box-shadow: 0 0 10px rgba(0, 204, 204, 0.3);
}

.test-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.test-result {
  margin-top: 10px;
  text-align: center;
}

.test-status {
  font-weight: bold;
  font-size: 12px;
  margin-bottom: 4px;
}

.test-status.success {
  color: #00ff00;
}

.test-status.error {
  color: #ff0000;
}

.test-details {
  color: #666;
  font-size: 10px;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
