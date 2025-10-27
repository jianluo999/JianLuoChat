<template>
  <div class="theme-selector">
    <div class="theme-header">
      <h3>🎨 选择主题</h3>
      <p>个性化你的聊天体验</p>
    </div>
    
    <div class="theme-grid">
      <div
        v-for="theme in themes"
        :key="theme.id"
        class="theme-card"
        :class="{ active: currentTheme === theme.id }"
        @click="selectTheme(theme.id)"
      >
        <div class="theme-preview" :style="{ backgroundColor: theme.primaryColor }">
          <div class="preview-header" :style="{ backgroundColor: theme.headerColor }">
            <div class="preview-title">{{ theme.name }}</div>
          </div>
          <div class="preview-content">
            <div class="preview-message sent" :style="{ backgroundColor: theme.sentMessageColor }">
              <div class="message-text">你好！</div>
            </div>
            <div class="preview-message received" :style="{ backgroundColor: theme.receivedMessageColor }">
              <div class="message-text">你好，很高兴认识你！</div>
            </div>
          </div>
        </div>
        <div class="theme-info">
          <div class="theme-name">{{ theme.name }}</div>
          <div class="theme-description">{{ theme.description }}</div>
        </div>
      </div>
    </div>
    
    <div class="theme-actions">
      <div class="action-hint">
        💡 选择主题后会立即应用到整个界面
      </div>
      <div class="action-buttons">
        <button @click="goToChat" class="view-effect-btn">
          🎨 查看聊天界面效果
        </button>
        <button @click="forceRefreshTheme" class="refresh-theme-btn">
          🔄 强制刷新主题
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTheme } from '@/utils/themeManager'

interface Theme {
  id: string
  name: string
  description: string
  primaryColor: string
  headerColor: string
  sentMessageColor: string
  receivedMessageColor: string
  textColor: string
  backgroundColor: string
}

const themes = ref<Theme[]>([
  {
    id: 'retro-green',
    name: '复古绿色',
    description: '经典Matrix终端风格',
    primaryColor: '#000000',
    headerColor: '#001100',
    sentMessageColor: '#00ff00',
    receivedMessageColor: '#003300',
    textColor: '#00ff00',
    backgroundColor: '#000000'
  },
  {
    id: 'wechat-classic',
    name: '微信经典',
    description: '熟悉的微信绿色主题',
    primaryColor: '#f7f7f7',
    headerColor: '#393a3e',
    sentMessageColor: '#95ec69',
    receivedMessageColor: '#ffffff',
    textColor: '#000000',
    backgroundColor: '#f7f7f7'
  },
  {
    id: 'dark-blue',
    name: '深蓝夜间',
    description: '护眼的深蓝色主题',
    primaryColor: '#1a1a2e',
    headerColor: '#16213e',
    sentMessageColor: '#0f3460',
    receivedMessageColor: '#533483',
    textColor: '#ffffff',
    backgroundColor: '#1a1a2e'
  },
  {
    id: 'purple-dream',
    name: '紫色梦幻',
    description: '优雅的紫色渐变',
    primaryColor: '#2d1b69',
    headerColor: '#11998e',
    sentMessageColor: '#38ef7d',
    receivedMessageColor: '#667eea',
    textColor: '#ffffff',
    backgroundColor: '#2d1b69'
  }
])

const { applyTheme: applyThemeManager, getCurrentTheme, loadTheme } = useTheme()
const currentTheme = ref<string>('retro-green')

const selectTheme = (themeId: string) => {
  console.log('🎨 选择主题:', themeId)
  currentTheme.value = themeId
  const theme = themes.value.find(t => t.id === themeId)
  if (theme) {
    console.log('🎨 应用主题:', theme.name)
    
    // 使用主题管理器应用主题
    applyThemeManager(themeId)
    
    // 显示成功提示
    showSuccessMessage(`主题 "${theme.name}" 已应用 - 整个界面已更新！`)
  } else {
    console.error('❌ 未找到主题:', themeId)
  }
}

const forceStyleRefresh = () => {
  // 强制重新计算所有CSS变量
  const allElements = document.querySelectorAll('*')
  allElements.forEach(el => {
    if (el instanceof HTMLElement) {
      const computedStyle = window.getComputedStyle(el)
      // 触发重新计算
      el.style.display = 'none'
      el.offsetHeight // 强制重排
      el.style.display = ''
    }
  })
  
  console.log('🎨 强制刷新所有元素样式完成')
}

const goToChat = () => {
  // 触发父组件切换到聊天界面
  const event = new CustomEvent('switchToChat', {
    bubbles: true,
    detail: { from: 'theme-selector' }
  })
  document.dispatchEvent(event)
}

const forceRefreshTheme = () => {
  console.log('🔄 强制刷新主题')
  // 重新应用当前主题
  applyThemeManager(currentTheme.value)
  showSuccessMessage('主题已强制刷新！')
}

const showSuccessMessage = (message: string) => {
  // 创建临时提示元素
  const toast = document.createElement('div')
  toast.textContent = message
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #00ff00;
    color: #000;
    padding: 12px 20px;
    border-radius: 6px;
    font-weight: bold;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0, 255, 0, 0.3);
    animation: slideIn 0.3s ease-out;
  `
  
  // 添加动画样式
  const style = document.createElement('style')
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `
  document.head.appendChild(style)
  
  document.body.appendChild(toast)
  
  // 3秒后移除
  setTimeout(() => {
    toast.remove()
    style.remove()
  }, 3000)
}

const applyTheme = (theme: Theme) => {
  console.log('🎨 开始应用主题:', theme.name)
  
  // 更新body类名以应用主题
  document.body.className = `theme-${theme.id}`
  
  // 强制重新渲染所有组件
  setTimeout(() => {
    // 触发窗口resize事件来强制重新渲染
    window.dispatchEvent(new Event('resize'))
  }, 100)
  
  console.log('🎨 主题应用完成，body类名:', document.body.className)
  console.log('🎨 主题变量已设置，整个应用界面将更新')
}

onMounted(() => {
  const savedTheme = localStorage.getItem('selected-theme')
  if (savedTheme) {
    currentTheme.value = savedTheme
    const theme = themes.value.find(t => t.id === savedTheme)
    if (theme) {
      applyTheme(theme)
    }
  }
})
</script>

<style scoped>
.theme-selector {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.theme-header {
  text-align: center;
  margin-bottom: 30px;
}

.theme-header h3 {
  color: #00ff00;
  font-size: 24px;
  margin-bottom: 10px;
}

.theme-header p {
  color: #888;
  font-size: 14px;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.theme-card {
  border: 2px solid transparent;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #111;
  position: relative;
}

.theme-card:hover {
  border-color: #00ff00;
  box-shadow: 0 4px 20px rgba(0, 255, 0, 0.3);
}

.theme-card.active {
  border-color: #00ff00;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
  transform: scale(1.02);
}

.theme-card.active::after {
  content: '✓';
  position: absolute;
  top: 10px;
  right: 10px;
  background: #00ff00;
  color: #000;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.theme-preview {
  height: 120px;
  position: relative;
  overflow: hidden;
}

.preview-header {
  height: 30px;
  display: flex;
  align-items: center;
  padding: 0 15px;
}

.preview-title {
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.preview-content {
  padding: 10px;
  height: 90px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-message {
  padding: 6px 10px;
  border-radius: 12px;
  max-width: 70%;
  font-size: 11px;
}

.preview-message.sent {
  align-self: flex-end;
  color: #000;
}

.preview-message.received {
  align-self: flex-start;
  color: #000;
}

.theme-info {
  padding: 15px;
  background: #222;
}

.theme-name {
  color: #00ff00;
  font-weight: bold;
  margin-bottom: 5px;
}

.theme-description {
  color: #888;
  font-size: 12px;
}

.theme-actions {
  margin-top: 30px;
  padding: 20px;
  background: #222;
  border-radius: 12px;
  border: 1px solid #333;
  text-align: center;
}

.action-hint {
  color: #888;
  font-size: 14px;
  margin-bottom: 15px;
  line-height: 1.4;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.view-effect-btn, .refresh-theme-btn {
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 140px;
}

.view-effect-btn {
  background: linear-gradient(135deg, #00ff00, #00cc00);
  color: #000;
  box-shadow: 0 4px 12px rgba(0, 255, 0, 0.3);
}

.view-effect-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 255, 0, 0.4);
}

.refresh-theme-btn {
  background: linear-gradient(135deg, #666, #888);
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.refresh-theme-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}
</style>