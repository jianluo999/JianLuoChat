<template>
  <div class="mobile-login">
    <!-- 顶部状态栏 -->
    <div class="status-bar">
      <div class="time">{{ currentTime }}</div>
      <div class="signals">
        <div class="wifi">📶</div>
        <div class="battery">🔋</div>
      </div>
    </div>

    <!-- 登录内容 -->
    <div class="login-content">
      <!-- 微信Logo -->
      <div class="wechat-logo">
        <svg viewBox="0 0 24 24" class="logo-icon">
          <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>
        </svg>
      </div>

      <h1 class="login-title">微信</h1>
      <p class="login-subtitle">点击登录</p>

      <!-- 登录按钮 -->
      <button class="login-btn" @click="handleLogin">
        <svg viewBox="0 0 24 24" class="login-icon">
          <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>
        </svg>
        <span>微信登录</span>
      </button>

      <!-- 或者使用二维码 -->
      <div class="or-divider">
        <span>或</span>
      </div>

      <button class="qr-login-btn" @click="handleQRLogin">
        <svg viewBox="0 0 24 24" class="qr-icon">
          <path d="M4,4H8V8H4V4M16,4H20V8H16V4M4,16H8V20H4V16M16,16H20V20H16V16M12,4V12H20M4,12H12V20M12,12H20V12H12V20"/>
        </svg>
        <span>扫码登录</span>
      </button>

      <!-- 登录说明 -->
      <div class="login-info">
        <p>使用微信扫描二维码登录</p>
        <p>登录后可与好友聊天、视频通话等</p>
      </div>

      <!-- 底部信息 -->
      <div class="bottom-info">
        <div class="version">版本 3.9.0</div>
        <div class="copyright">© 2025 WeChat. 保留所有权利。</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMatrixStore } from '@/stores/matrix'

const router = useRouter()
const matrixStore = useMatrixStore()

// 状态管理
const currentTime = ref('')

// 获取当前时间
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 启动定时器
onMounted(() => {
  updateTime()
  const timer = setInterval(updateTime, 60000) // 每分钟更新一次
  return () => {
    clearInterval(timer)
  }
})

// 处理登录
const handleLogin = async () => {
  try {
    // 跳转到Matrix登录页面
    router.push('/login')
  } catch (error) {
    console.error('登录失败:', error)
  }
}

// 处理二维码登录
const handleQRLogin = () => {
  console.log('二维码登录')
  // 这里可以实现二维码登录逻辑
}
</script>

<style scoped>
.mobile-login {
  height: 100vh;
  background: linear-gradient(135deg, #e1f5fe, #b3e5fc);
  display: flex;
  flex-direction: column;
}

.status-bar {
  height: 44px;
  background: #000;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  font-size: 12px;
}

.time {
  font-weight: bold;
}

.signals {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

.login-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.wechat-logo {
  margin-bottom: 24px;
}

.logo-icon {
  width: 64px;
  height: 64px;
  fill: #07c160;
}

.login-title {
  font-size: 28px;
  font-weight: 600;
  color: #222;
  margin-bottom: 8px;
  text-align: center;
}

.login-subtitle {
  font-size: 16px;
  color: #666;
  margin-bottom: 40px;
  text-align: center;
}

.login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: #07c160;
  color: white;
  border: none;
  border-radius: 44px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  width: 100%;
  max-width: 300px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(7, 193, 96, 0.3);
}

.login-btn:hover {
  background: #52c41a;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(7, 193, 96, 0.4);
}

.login-icon {
  width: 24px;
  height: 24px;
  fill: white;
}

.qr-login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 44px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  width: 100%;
  max-width: 300px;
  margin-top: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.qr-login-btn:hover {
  background: #e6e6e6;
  transform: translateY(-1px);
}

.qr-icon {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.or-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 24px 0;
  color: #999;
  font-size: 14px;
}

.or-divider::before,
.or-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e8e8e8;
}

.login-info {
  text-align: center;
  margin: 24px 0;
  color: #666;
}

.login-info p {
  margin: 4px 0;
  font-size: 12px;
}

.bottom-info {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  text-align: center;
  color: #999;
  font-size: 10px;
}

.version {
  margin-bottom: 4px;
}

.copyright {
  font-size: 8px;
}

/* 响应式适配 */
@media (max-width: 320px) {
  .login-content {
    padding: 20px 16px;
  }
  
  .wechat-logo {
    margin-bottom: 20px;
  }
  
  .logo-icon {
    width: 56px;
    height: 56px;
  }
  
  .login-title {
    font-size: 24px;
  }
  
  .login-subtitle {
    font-size: 14px;
    margin-bottom: 32px;
  }
  
  .login-btn {
    padding: 14px 28px;
    font-size: 14px;
  }
  
  .qr-login-btn {
    padding: 10px 20px;
    font-size: 12px;
    margin-top: 12px;
  }
  
  .or-divider {
    margin: 20px 0;
  }
  
  .login-info p {
    font-size: 11px;
  }
  
  .bottom-info {
    bottom: 16px;
  }
}
</style>