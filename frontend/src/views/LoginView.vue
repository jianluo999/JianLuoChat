<template>
  <div class="login-container">
    <!-- 背景矩阵效果 -->
    <div class="matrix-bg"></div>

    <!-- 语言切换 -->
    <div class="language-switch-container">
      <LanguageSwitch />
    </div>

    <!-- 主要内容 -->
    <div class="terminal-window">
      <!-- 终端标题栏 -->
      <div class="terminal-header">
        <div class="terminal-buttons">
          <span class="btn-close"></span>
          <span class="btn-minimize"></span>
          <span class="btn-maximize"></span>
        </div>
        <div class="terminal-title">JIANLUOCHAT MATRIX PROTOCOL v2.0.1</div>
      </div>

      <!-- 终端内容 -->
      <div class="terminal-content">
        <!-- ASCII艺术标题 -->
        <div class="ascii-art">
          <pre class="retro-title" v-if="isZh">
══════════════════════════════════════════════════════════════
                  JIANLUOCHAT MATRIX                        
                去中心化即时通讯系统                      
══════════════════════════════════════════════════════════════
          </pre>
          <pre class="retro-title" v-else>
══════════════════════════════════════════════════════════════
                 JIANLUOCHAT MATRIX                        
              Decentralized Chat System                   
══════════════════════════════════════════════════════════════
          </pre>
        </div>

        <!-- 系统信息 -->
        <div class="system-info">
          <div class="info-line">
            <span class="prompt">{{ isZh ? '系统' : 'SYSTEM' }}:</span>
            <span class="typing-text">{{ isZh ? 'Matrix协议集成已激活...' : 'Matrix Protocol Integration Active...' }}</span>
          </div>
          <div class="info-line">
            <span class="prompt">{{ isZh ? '状态' : 'STATUS' }}:</span>
            <span class="status-ok">{{ isZh ? '联邦已启用' : 'FEDERATION ENABLED' }}</span>
          </div>
          <div class="info-line">
            <span class="prompt">{{ isZh ? '世界' : 'WORLD' }}:</span>
            <span class="world-channel">#world:jianluochat.com</span>
          </div>
        </div>

        <!-- 登录表单 -->
        <div class="login-form">
          <div class="form-header">
            <span class="prompt">root@jianluochat:~$</span>
            <span class="command">{{ isZh ? 'login --secure' : 'login --secure' }}</span>
          </div>

          <form @submit.prevent="handleLogin">
            <div class="input-group">
              <label class="input-label">{{ t('common.username').toUpperCase() }}:</label>
              <input
                v-model="loginForm.username"
                type="text"
                class="retro-input"
                :placeholder="t('login.usernamePlaceholder')"
                :class="{ 'error': usernameError }"
                @input="clearErrors"
              />
              <div v-if="usernameError" class="error-message">{{ usernameError }}</div>
            </div>

            <div class="input-group">
              <label class="input-label">{{ t('common.password').toUpperCase() }}:</label>
              <input
                v-model="loginForm.password"
                type="password"
                class="retro-input"
                :placeholder="t('login.passwordPlaceholder')"
                :class="{ 'error': passwordError }"
                @input="clearErrors"
                @keyup.enter="handleLogin"
              />
              <div v-if="passwordError" class="error-message">{{ passwordError }}</div>
            </div>

            <div class="button-group">
              <button
                type="submit"
                class="retro-button login-btn"
                :disabled="authStore.loading"
              >
                <span v-if="authStore.loading">{{ isZh ? '认证中...' : 'AUTHENTICATING...' }}</span>
                <span v-else>[ {{ t('login.loginButton') }} ]</span>
              </button>
            </div>
          </form>

          <!-- 注册链接 -->
          <div class="register-link">
            <span class="prompt">{{ isZh ? '新用户？' : 'NEW USER?' }}</span>
            <button
              class="link-button"
              @click="$router.push('/register')"
            >
              {{ t('login.registerLink') }}
            </button>
          </div>

          <!-- 错误信息 -->
          <div v-if="authStore.error" class="error-display">
            <span class="error-prefix">{{ isZh ? '错误' : 'ERROR' }}:</span>
            <span class="error-text">{{ authStore.error }}</span>
          </div>
        </div>

        <!-- 底部信息 -->
        <div class="footer-info">
          <div class="info-line">
            <span class="prompt">{{ isZh ? '信息' : 'INFO' }}:</span>
            <span>{{ isZh ? '基于Matrix协议 | 端到端加密' : 'Powered by Matrix Protocol | End-to-End Encryption' }}</span>
          </div>
          <div class="info-line">
            <span class="prompt">{{ isZh ? '帮助' : 'HELP' }}:</span>
            <span>{{ isZh ? '输入 help 查看可用命令' : 'Type help for available commands' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLanguage } from '@/composables/useLanguage'
import LanguageSwitch from '@/components/LanguageSwitch.vue'

const router = useRouter()
const authStore = useAuthStore()
const { isZh, t } = useLanguage()

const loginForm = reactive({
  username: '',
  password: ''
})

const usernameError = ref('')
const passwordError = ref('')

const clearErrors = () => {
  usernameError.value = ''
  passwordError.value = ''
  authStore.error = ''
}

const validateForm = () => {
  let isValid = true

  if (!loginForm.username.trim()) {
    usernameError.value = 'Matrix ID required'
    isValid = false
  } else if (loginForm.username.length < 3) {
    usernameError.value = 'Matrix ID too short (min 3 chars)'
    isValid = false
  }

  if (!loginForm.password.trim()) {
    passwordError.value = 'Access token required'
    isValid = false
  } else if (loginForm.password.length < 6) {
    passwordError.value = 'Invalid token format (min 6 chars)'
    isValid = false
  }

  return isValid
}

const handleLogin = async () => {
  clearErrors()

  if (!validateForm()) {
    return
  }

  const result = await authStore.login(loginForm)

  if (result.success) {
    console.log('Matrix connection established')
    console.log('User authenticated:', authStore.user)

    // 显示连接成功的终端效果
    showConnectionSuccess()

    // 等待动画完成后跳转
    setTimeout(() => {
      router.push('/chat')
    }, 1500)
  } else {
    console.error('Matrix authentication failed:', result.error)
  }
}

const showConnectionSuccess = () => {
  // 这里可以添加连接成功的动画效果
  console.log('CONNECTION ESTABLISHED - ENTERING MATRIX...')
}

// 打字机效果
onMounted(() => {
  const typingElements = document.querySelectorAll('.typing-text')
  typingElements.forEach((element, index) => {
    const text = element.textContent || ''
    element.textContent = ''

    setTimeout(() => {
      let i = 0
      const typeInterval = setInterval(() => {
        if (i < text.length) {
          element.textContent += text.charAt(i)
          i++
        } else {
          clearInterval(typeInterval)
        }
      }, 50)
    }, index * 1000)
  })
})
</script>

<style scoped>
.login-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000;
  overflow: hidden;
}

/* 矩阵背景效果 */
.matrix-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 25% 25%, rgba(0, 255, 0, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(0, 255, 0, 0.1) 0%, transparent 50%);
  z-index: 1;
}

.matrix-bg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(90deg, rgba(0, 255, 0, 0.03) 1px, transparent 1px),
    linear-gradient(rgba(0, 255, 0, 0.03) 1px, transparent 1px);
  background-size: 20px 20px;
  animation: matrix-scroll 20s linear infinite;
}

@keyframes matrix-scroll {
  0% { transform: translateY(0); }
  100% { transform: translateY(20px); }
}

/* 终端窗口 */
.terminal-window {
  position: relative;
  z-index: 10;
  width: 800px;
  max-width: 90vw;
  background: rgba(0, 0, 0, 0.95);
  border: 2px solid #00ff00;
  border-radius: 8px;
  box-shadow:
    0 0 30px rgba(0, 255, 0, 0.5),
    inset 0 0 30px rgba(0, 255, 0, 0.1);
  backdrop-filter: blur(10px);
}

.terminal-header {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: rgba(0, 255, 0, 0.1);
  border-bottom: 1px solid #00ff00;
}

.terminal-buttons {
  display: flex;
  gap: 8px;
}

.terminal-buttons span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid #00ff00;
}

.btn-close { background: rgba(255, 0, 0, 0.3); }
.btn-minimize { background: rgba(255, 255, 0, 0.3); }
.btn-maximize { background: rgba(0, 255, 0, 0.3); }

.terminal-title {
  flex: 1;
  text-align: center;
  color: #00ff00;
  font-family: 'Share Tech Mono', monospace;
  font-size: 14px;
  font-weight: bold;
  text-shadow: 0 0 5px #00ff00;
}

.terminal-content {
  padding: 20px;
  min-height: 500px;
}

/* ASCII艺术 */
.ascii-art {
  text-align: center;
  margin-bottom: 30px;
}

.ascii-art pre {
  color: #00ff00;
  font-size: 12px;
  line-height: 1.2;
  text-shadow: 0 0 10px #00ff00;
  animation: flicker 3s infinite;
}

/* 系统信息 */
.system-info {
  margin-bottom: 30px;
}

.info-line {
  display: flex;
  margin-bottom: 8px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 14px;
}

.prompt {
  color: #00ff00;
  font-weight: bold;
  min-width: 80px;
  text-shadow: 0 0 5px #00ff00;
}

.typing-text {
  color: #00cccc;
  border-right: 2px solid #00ff00;
  animation: blink-caret 1s step-end infinite;
}

.status-ok {
  color: #00ff00;
  text-shadow: 0 0 5px #00ff00;
}

.world-channel {
  color: #ffff00;
  text-shadow: 0 0 5px #ffff00;
}

/* 登录表单 */
.login-form {
  margin-bottom: 30px;
}

.form-header {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 14px;
}

.command {
  color: #00cccc;
}

.input-group {
  margin-bottom: 20px;
}

.input-label {
  display: block;
  color: #00ff00;
  font-family: 'Share Tech Mono', monospace;
  font-size: 14px;
  margin-bottom: 8px;
  text-shadow: 0 0 5px #00ff00;
}

.retro-input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(0, 20, 0, 0.9);
  border: 2px solid #003300;
  border-radius: 4px;
  color: #00ff00;
  font-family: 'Share Tech Mono', monospace;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
  text-shadow: 0 0 3px #00ff00;
  box-sizing: border-box;
}

.retro-input:focus {
  border-color: #00ff00;
  box-shadow: 0 0 15px rgba(0, 255, 0, 0.5), inset 0 0 10px rgba(0, 255, 0, 0.1);
  text-shadow: 0 0 5px #00ff00;
  background: rgba(0, 30, 0, 0.95);
}

.retro-input.error {
  border-color: #ff0000;
  box-shadow: 0 0 15px rgba(255, 0, 0, 0.5);
}

.error-message {
  color: #ff0000;
  font-family: 'Share Tech Mono', monospace;
  font-size: 12px;
  margin-top: 5px;
  text-shadow: 0 0 5px #ff0000;
}

.button-group {
  text-align: center;
  margin: 30px 0;
}

.login-btn {
  padding: 15px 40px;
  font-size: 16px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 2px;
  transition: all 0.3s ease;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.register-link {
  text-align: center;
  margin: 20px 0;
  font-family: 'Share Tech Mono', monospace;
  font-size: 14px;
}

.link-button {
  background: none;
  border: none;
  color: #00cccc;
  cursor: pointer;
  text-decoration: underline;
  font-family: 'Share Tech Mono', monospace;
  margin-left: 10px;
  transition: all 0.3s ease;
}

.link-button:hover {
  color: #00ff00;
  text-shadow: 0 0 5px #00ff00;
}

.error-display {
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #ff0000;
  background: rgba(255, 0, 0, 0.1);
  font-family: 'Share Tech Mono', monospace;
  font-size: 14px;
}

.error-prefix {
  color: #ff0000;
  font-weight: bold;
  text-shadow: 0 0 5px #ff0000;
}

.error-text {
  color: #ff6666;
  margin-left: 10px;
}

/* 底部信息 */
.footer-info {
  border-top: 1px solid #003300;
  padding-top: 20px;
  font-size: 12px;
}

/* 动画效果 */
@keyframes flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

@keyframes blink-caret {
  from, to { border-color: transparent; }
  50% { border-color: #00ff00; }
}

/* 语言切换 */
.language-switch-container {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .terminal-window {
    width: 95vw;
    margin: 10px;
  }

  .ascii-art pre {
    font-size: 8px;
  }

  .terminal-content {
    padding: 15px;
  }

  .language-switch-container {
    top: 10px;
    right: 10px;
  }
}
</style>
