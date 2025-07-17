<template>
  <div class="matrix-real-login">
    <div class="login-container">
      <div class="login-header">
        <h2>{{ $t('matrix.realLogin.title') }}</h2>
        <p>{{ $t('matrix.realLogin.subtitle') }}</p>
      </div>

      <div class="login-form">
        <div class="form-group">
          <label>{{ $t('matrix.realLogin.matrixId') }}</label>
          <div class="matrix-id-input">
            <span class="id-prefix">@</span>
            <input
              v-model="username"
              type="text"
              :placeholder="$t('matrix.realLogin.usernamePlaceholder')"
              class="form-input"
              @keyup.enter="handleLogin"
            />
            <span class="id-colon">:</span>
            <input
              v-model="homeserver"
              type="text"
              :placeholder="$t('matrix.realLogin.homeserverPlaceholder')"
              class="form-input homeserver-input"
              @keyup.enter="handleLogin"
            />
          </div>
          <div class="matrix-id-preview">
            {{ fullMatrixId }}
          </div>
        </div>

        <div class="form-group">
          <label>{{ $t('matrix.realLogin.password') }}</label>
          <input
            v-model="password"
            type="password"
            :placeholder="$t('matrix.realLogin.passwordPlaceholder')"
            class="form-input"
            @keyup.enter="handleLogin"
          />
        </div>

        <div class="homeserver-suggestions">
          <p>{{ $t('matrix.realLogin.popularServers') }}</p>
          <div class="server-chips">
            <button
              v-for="server in popularServers"
              :key="server"
              @click="homeserver = server"
              class="server-chip"
              :class="{ active: homeserver === server }"
            >
              {{ server }}
            </button>
          </div>
        </div>

        <div class="form-actions">
          <button
            @click="handleLogin"
            class="login-btn"
            :disabled="!canLogin || isLoading"
          >
            <span v-if="isLoading" class="loading-spinner"></span>
            {{ isLoading ? $t('matrix.realLogin.connecting') : $t('matrix.realLogin.login') }}
          </button>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="login-help">
          <p>{{ $t('matrix.realLogin.noAccount') }}</p>
          <ul>
            <li>
              <a href="https://app.element.io/#/register" target="_blank">
                {{ $t('matrix.realLogin.registerElement') }}
              </a>
            </li>
            <li>
              <a href="https://matrix.org/docs/guides/introduction" target="_blank">
                {{ $t('matrix.realLogin.learnMore') }}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useMatrixStore } from '@/stores/matrix'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import * as sdk from 'matrix-js-sdk'

export default {
  name: 'MatrixRealLogin',
  emits: ['login-success'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const matrixStore = useMatrixStore()
    const router = useRouter()
    
    const username = ref('')
    const homeserver = ref('matrix.org')
    const password = ref('')
    const isLoading = ref(false)
    const error = ref('')

    const popularServers = [
      'matrix.org',
      'kde.org',
      'mozilla.org',
      't2bot.io',
      'tchncs.de'
    ]

    const fullMatrixId = computed(() => {
      if (username.value && homeserver.value) {
        return `@${username.value}:${homeserver.value}`
      }
      return '@username:homeserver.com'
    })

    const canLogin = computed(() => {
      return username.value.trim() && 
             homeserver.value.trim() && 
             password.value.trim()
    })

    const handleLogin = async () => {
      if (!canLogin.value || isLoading.value) return

      isLoading.value = true
      error.value = ''

      try {
        const baseUrl = `https://${homeserver.value}`
        
        // 创建Matrix客户端
        const client = sdk.createClient({
          baseUrl: baseUrl,
          userId: fullMatrixId.value
        })

        // 尝试登录
        const loginResponse = await client.login('m.login.password', {
          user: username.value,
          password: password.value,
          initial_device_display_name: 'JianLuoChat Matrix Client'
        })

        // 立即保存登录信息到localStorage，确保路由守卫能检测到
        localStorage.setItem('matrix_access_token', loginResponse.access_token)
        localStorage.setItem('matrix_login_info', JSON.stringify({
          userId: loginResponse.user_id,
          accessToken: loginResponse.access_token,
          deviceId: loginResponse.device_id,
          homeserver: homeserver.value
        }))

        // 保存到store
        await matrixStore.setClient(client)
        await matrixStore.setLoginInfo({
          userId: loginResponse.user_id,
          accessToken: loginResponse.access_token,
          deviceId: loginResponse.device_id,
          homeserver: homeserver.value
        })

        emit('login-success', {
          userId: loginResponse.user_id,
          homeserver: homeserver.value
        })

        // 立即跳转到聊天页面
        console.log('登录成功，立即跳转到聊天页面...')
        router.push('/chat')

        // 在后台异步启动客户端
        console.log('在后台启动Matrix客户端...')
        client.startClient().then(() => {
          console.log('Matrix客户端已在后台启动完成')
        }).catch((error) => {
          console.error('后台启动Matrix客户端失败:', error)
        })

      } catch (err) {
        console.error('Matrix login failed:', err)
        
        if (err.errcode === 'M_FORBIDDEN') {
          error.value = t('matrix.realLogin.errors.invalidCredentials')
        } else if (err.errcode === 'M_USER_DEACTIVATED') {
          error.value = t('matrix.realLogin.errors.userDeactivated')
        } else if (err.name === 'ConnectionError') {
          error.value = t('matrix.realLogin.errors.connectionFailed', { server: homeserver.value })
        } else {
          error.value = t('matrix.realLogin.errors.loginFailed', { message: err.message })
        }
      } finally {
        isLoading.value = false
      }
    }

    return {
      username,
      homeserver,
      password,
      isLoading,
      error,
      popularServers,
      fullMatrixId,
      canLogin,
      handleLogin
    }
  }
}
</script>

<style scoped>
.matrix-real-login {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  background: rgba(30, 30, 50, 0.95);
  border: 1px solid #00ff88;
  border-radius: 12px;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 0 30px rgba(0, 255, 136, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  color: #00ff88;
  font-size: 28px;
  margin-bottom: 10px;
  font-family: 'Courier New', monospace;
}

.login-header p {
  color: #a0a0a0;
  font-size: 16px;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  color: #00ff88;
  font-size: 14px;
  margin-bottom: 8px;
  font-family: 'Courier New', monospace;
}

.matrix-id-input {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #333;
  border-radius: 6px;
  padding: 0 12px;
  transition: border-color 0.3s;
}

.matrix-id-input:focus-within {
  border-color: #00ff88;
}

.id-prefix, .id-colon {
  color: #00ff88;
  font-family: 'Courier New', monospace;
  font-weight: bold;
}

.form-input {
  background: transparent;
  border: none;
  color: #ffffff;
  padding: 12px 8px;
  font-size: 16px;
  outline: none;
  flex: 1;
}

.homeserver-input {
  flex: 2;
}

.matrix-id-preview {
  margin-top: 8px;
  color: #00ff88;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  opacity: 0.8;
}

.homeserver-suggestions {
  margin-bottom: 25px;
}

.homeserver-suggestions p {
  color: #a0a0a0;
  font-size: 14px;
  margin-bottom: 10px;
}

.server-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.server-chip {
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid #00ff88;
  color: #00ff88;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.server-chip:hover,
.server-chip.active {
  background: rgba(0, 255, 136, 0.2);
  transform: translateY(-1px);
}

.login-btn {
  width: 100%;
  background: linear-gradient(45deg, #00ff88, #00cc6a);
  border: none;
  color: #000;
  padding: 15px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 255, 136, 0.4);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid #000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid #ff4444;
  color: #ff6666;
  padding: 12px;
  border-radius: 6px;
  margin-top: 15px;
  font-size: 14px;
}

.login-help {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #333;
}

.login-help p {
  color: #a0a0a0;
  font-size: 14px;
  margin-bottom: 10px;
}

.login-help ul {
  list-style: none;
  padding: 0;
}

.login-help li {
  margin-bottom: 8px;
}

.login-help a {
  color: #00ff88;
  text-decoration: none;
  font-size: 14px;
}

.login-help a:hover {
  text-decoration: underline;
}
</style>
