<template>
  <div class="register-container">
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
        <div class="terminal-title">{{ t('register.title') }} - JIANLUOCHAT MATRIX</div>
      </div>

      <!-- 终端内容 -->
      <div class="terminal-content">
        <!-- ASCII艺术标题 -->
        <div class="ascii-art">
          <pre class="retro-title" v-if="isZh">

                           加入去中心化聊天世界                            
                             

          </pre>
          <pre class="retro-title" v-else>

               CREATE MATRIX ACCOUNT                        
             Join Decentralized Chat World               

          </pre>
        </div>

        <!-- 注册表单 -->
        <div class="register-form">
          <div class="form-header">
            <span class="prompt">root@jianluochat:~$</span>
            <span class="command">{{ isZh ? 'register --new-user' : 'register --new-user' }}</span>
          </div>

          <form @submit.prevent="handleRegister">
            <div class="input-group">
              <label class="input-label">{{ t('common.username').toUpperCase() }}:</label>
              <input
                v-model="registerForm.username"
                type="text"
                class="retro-input"
                :placeholder="t('register.usernamePlaceholder')"
                :class="{ 'error': usernameError }"
                @input="clearErrors"
              />
              <div v-if="usernameError" class="error-message">{{ usernameError }}</div>
            </div>

            <div class="input-group">
              <label class="input-label">{{ t('common.email').toUpperCase() }}:</label>
              <input
                v-model="registerForm.email"
                type="email"
                class="retro-input"
                :placeholder="t('register.emailPlaceholder')"
                :class="{ 'error': emailError }"
                @input="clearErrors"
              />
              <div v-if="emailError" class="error-message">{{ emailError }}</div>
            </div>

            <div class="input-group">
              <label class="input-label">{{ t('common.displayName').toUpperCase() }}:</label>
              <input
                v-model="registerForm.displayName"
                type="text"
                class="retro-input"
                :placeholder="t('register.displayNamePlaceholder')"
                :class="{ 'error': displayNameError }"
                @input="clearErrors"
              />
              <div v-if="displayNameError" class="error-message">{{ displayNameError }}</div>
            </div>

            <div class="input-group">
              <label class="input-label">{{ t('common.password').toUpperCase() }}:</label>
              <input
                v-model="registerForm.password"
                type="password"
                class="retro-input"
                :placeholder="t('register.passwordPlaceholder')"
                :class="{ 'error': passwordError }"
                @input="clearErrors"
              />
              <div v-if="passwordError" class="error-message">{{ passwordError }}</div>
            </div>

            <div class="input-group">
              <label class="input-label">{{ isZh ? '确认密码' : 'CONFIRM PASSWORD' }}:</label>
              <input
                v-model="registerForm.confirmPassword"
                type="password"
                class="retro-input"
                :placeholder="t('register.confirmPasswordPlaceholder')"
                :class="{ 'error': confirmPasswordError }"
                @input="clearErrors"
                @keyup.enter="handleRegister"
              />
              <div v-if="confirmPasswordError" class="error-message">{{ confirmPasswordError }}</div>
            </div>

            <div class="button-group">
              <button
                type="submit"
                class="retro-button register-btn"
                :disabled="authStore.loading"
              >
                <span v-if="authStore.loading">{{ isZh ? '创建中...' : 'CREATING...' }}</span>
                <span v-else>[ {{ t('register.registerButton') }} ]</span>
              </button>
            </div>
          </form>

          <!-- 登录链接 -->
          <div class="login-link">
            <span class="prompt">{{ isZh ? '已有账号？' : 'ALREADY HAVE ACCOUNT?' }}</span>
            <button
              class="link-button"
              @click="$router.push('/login')"
            >
              {{ t('register.loginLink') }}
            </button>
          </div>

          <!-- 错误信息 -->
          <div v-if="authStore.error" class="error-display">
            <span class="error-prefix">{{ isZh ? '错误' : 'ERROR' }}:</span>
            <span class="error-text">{{ authStore.error }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { useLanguage } from '@/composables/useLanguage'
import LanguageSwitch from '@/components/LanguageSwitch.vue'

const router = useRouter()
const authStore = useAuthStore()
const { isZh, t } = useLanguage()

const registerForm = reactive({
  username: '',
  email: '',
  displayName: '',
  password: '',
  confirmPassword: ''
})

// 错误状态
const usernameError = ref('')
const emailError = ref('')
const displayNameError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')

const clearErrors = () => {
  usernameError.value = ''
  emailError.value = ''
  displayNameError.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''
  authStore.error = ''
}

const validateForm = () => {
  let isValid = true
  clearErrors()

  // 验证用户名
  if (!registerForm.username.trim()) {
    usernameError.value = t('register.usernameRequired')
    isValid = false
  } else if (registerForm.username.length < 3 || registerForm.username.length > 20) {
    usernameError.value = t('register.usernameLength')
    isValid = false
  } else if (!/^[a-zA-Z0-9_]+$/.test(registerForm.username)) {
    usernameError.value = t('register.usernamePattern')
    isValid = false
  }

  // 验证邮箱
  if (!registerForm.email.trim()) {
    emailError.value = t('register.emailRequired')
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
    emailError.value = t('register.emailInvalid')
    isValid = false
  }

  // 验证显示名称
  if (registerForm.displayName.length > 50) {
    displayNameError.value = t('register.displayNameLength')
    isValid = false
  }

  // 验证密码
  if (!registerForm.password) {
    passwordError.value = t('register.passwordRequired')
    isValid = false
  } else if (registerForm.password.length < 6) {
    passwordError.value = t('register.passwordLength')
    isValid = false
  }

  // 验证确认密码
  if (!registerForm.confirmPassword) {
    confirmPasswordError.value = t('register.confirmPasswordRequired')
    isValid = false
  } else if (registerForm.confirmPassword !== registerForm.password) {
    confirmPasswordError.value = t('register.passwordMismatch')
    isValid = false
  }

  return isValid
}

const handleRegister = async () => {
  if (!validateForm()) return

  const { confirmPassword, ...registerData } = registerForm
  const result = await authStore.register(registerData)

  if (result.success) {
    ElMessage.success(t('register.registerSuccess'))
    router.push('/chat')
  } else {
    ElMessage.error(result.error || t('register.registerFailed'))
  }
}
</script>

<style scoped>
/* 基础容器样式 */
.register-container {
  min-height: 100vh;
  background: #000000;
  color: #00ff00;
  font-family: 'Courier New', monospace;
  position: relative;
  overflow: hidden;
}

/* 矩阵背景效果 */
.matrix-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 20% 50%, rgba(0, 255, 0, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(0, 255, 0, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(0, 255, 0, 0.1) 0%, transparent 50%);
  animation: matrix-pulse 4s ease-in-out infinite alternate;
  z-index: 0;
}

@keyframes matrix-pulse {
  0% { opacity: 0.3; }
  100% { opacity: 0.7; }
}

/* 语言切换 */
.language-switch-container {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

/* 终端窗口 */
.terminal-window {
  position: relative;
  z-index: 1;
  max-width: 600px;
  margin: 50px auto;
  background: rgba(0, 0, 0, 0.9);
  border: 2px solid #00ff00;
  border-radius: 8px;
  box-shadow:
    0 0 20px rgba(0, 255, 0, 0.3),
    inset 0 0 20px rgba(0, 255, 0, 0.1);
}

/* 终端标题栏 */
.terminal-header {
  background: linear-gradient(90deg, #003300, #004400);
  padding: 10px 15px;
  border-bottom: 1px solid #00ff00;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.terminal-buttons {
  display: flex;
  gap: 8px;
}

.btn-close, .btn-minimize, .btn-maximize {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid #00ff00;
}

.btn-close { background: #ff4444; }
.btn-minimize { background: #ffaa00; }
.btn-maximize { background: #00ff00; }

.terminal-title {
  font-size: 14px;
  font-weight: bold;
  text-shadow: 0 0 5px #00ff00;
}

/* 终端内容 */
.terminal-content {
  padding: 30px;
  min-height: 400px;
}

/* ASCII艺术 */
.ascii-art {
  text-align: center;
  margin-bottom: 30px;
}

.retro-title {
  font-size: 10px;
  line-height: 1.2;
  color: #00ff00;
  text-shadow: 0 0 10px #00ff00;
  animation: flicker 2s infinite alternate;
}

/* 表单样式 */
.register-form {
  margin-top: 20px;
}

.form-header {
  margin-bottom: 20px;
  font-size: 14px;
}

.prompt {
  color: #00ff00;
  text-shadow: 0 0 5px #00ff00;
}

.command {
  color: #ffffff;
  margin-left: 10px;
}

.input-group {
  margin-bottom: 20px;
}

.input-label {
  display: block;
  margin-bottom: 8px;
  color: #00ff00;
  font-size: 14px;
  font-weight: bold;
  text-shadow: 0 0 5px #00ff00;
}

.retro-input {
  width: 100%;
  padding: 12px 15px;
  background: rgba(0, 20, 0, 0.9);
  border: 2px solid #003300;
  border-radius: 4px;
  color: #00ff00;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  transition: all 0.3s ease;
  box-sizing: border-box;
  text-shadow: 0 0 3px #00ff00;
}

.retro-input:focus {
  outline: none;
  border-color: #00ff00;
  box-shadow: 0 0 15px rgba(0, 255, 0, 0.5), inset 0 0 10px rgba(0, 255, 0, 0.1);
  text-shadow: 0 0 5px #00ff00;
  background: rgba(0, 30, 0, 0.95);
}

.retro-input.error {
  border-color: #ff4444;
  box-shadow: 0 0 10px rgba(255, 68, 68, 0.3);
}

.retro-input::placeholder {
  color: #006600;
}

.error-message {
  color: #ff6666;
  font-size: 12px;
  margin-top: 5px;
  text-shadow: 0 0 5px #ff6666;
}

/* 按钮样式 */
.button-group {
  margin: 30px 0 20px 0;
}

.retro-button {
  width: 100%;
  padding: 15px;
  background: linear-gradient(45deg, #003300, #004400);
  border: 2px solid #00ff00;
  border-radius: 4px;
  color: #00ff00;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-shadow: 0 0 5px #00ff00;
  text-transform: uppercase;
}

.retro-button:hover:not(:disabled) {
  background: linear-gradient(45deg, #004400, #005500);
  box-shadow: 0 0 15px rgba(0, 255, 0, 0.4);
  transform: translateY(-2px);
}

.retro-button:active {
  transform: translateY(0);
}

.retro-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 链接样式 */
.login-link {
  text-align: center;
  margin: 20px 0;
  font-size: 14px;
}

.link-button {
  background: none;
  border: none;
  color: #00ff00;
  cursor: pointer;
  text-decoration: underline;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  margin-left: 10px;
  transition: all 0.3s ease;
  text-shadow: 0 0 5px #00ff00;
}

.link-button:hover {
  color: #ffffff;
  text-shadow: 0 0 10px #00ff00;
}

/* 错误显示 */
.error-display {
  margin-top: 20px;
  padding: 15px;
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid #ff4444;
  border-radius: 4px;
  font-size: 14px;
}

.error-prefix {
  color: #ff6666;
  font-weight: bold;
  text-shadow: 0 0 5px #ff6666;
}

.error-text {
  color: #ff6666;
  margin-left: 10px;
}

/* 动画效果 */
@keyframes flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
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
