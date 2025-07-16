<template>
  <div class="layout-selector">
    <div class="selector-header">
      <h1>JianLuoChat 布局选择</h1>
      <p>选择你喜欢的聊天界面风格</p>
    </div>

    <div class="layout-options">
      <div class="layout-card" @click="selectLayout('wechat')">
        <div class="layout-preview wechat-preview">
          <div class="preview-sidebar">
            <div class="preview-user">👤</div>
            <div class="preview-search">🔍</div>
            <div class="preview-chat active">💬 张三</div>
            <div class="preview-chat">👥 工作群</div>
            <div class="preview-chat">💬 李四</div>
          </div>
          <div class="preview-main">
            <div class="preview-header">张三</div>
            <div class="preview-messages">
              <div class="preview-message">你好！</div>
              <div class="preview-message right">最近怎么样？</div>
            </div>
            <div class="preview-input">输入消息...</div>
          </div>
        </div>
        <div class="layout-info">
          <h3>微信风格</h3>
          <p>简洁现代的微信风格界面，熟悉易用</p>
          <div class="layout-features">
            <span class="feature">✓ 简洁设计</span>
            <span class="feature">✓ 熟悉操作</span>
            <span class="feature">✓ 现代感</span>
          </div>
        </div>
      </div>

      <div class="layout-card" @click="selectLayout('element')">
        <div class="layout-preview element-preview">
          <div class="preview-sidebar">
            <div class="preview-nav">🏠 📱 👥 🔍</div>
          </div>
          <div class="preview-middle">
            <div class="preview-room">📱 General</div>
            <div class="preview-room active">💬 Random</div>
            <div class="preview-room">🔧 Tech Talk</div>
          </div>
          <div class="preview-main">
            <div class="preview-header">Random</div>
            <div class="preview-messages">
              <div class="preview-message">Hello everyone!</div>
              <div class="preview-message">How's it going?</div>
            </div>
            <div class="preview-input">Type a message...</div>
          </div>
        </div>
        <div class="layout-info">
          <h3>Element风格</h3>
          <p>专业的Matrix客户端界面，功能丰富</p>
          <div class="layout-features">
            <span class="feature">✓ 专业界面</span>
            <span class="feature">✓ 功能丰富</span>
            <span class="feature">✓ Matrix标准</span>
          </div>
        </div>
      </div>

      <div class="layout-card" @click="selectLayout('retro')">
        <div class="layout-preview retro-preview">
          <div class="preview-sidebar">
            <div class="preview-logo">J</div>
            <div class="preview-nav">
              <div>🏠</div>
              <div>💬</div>
              <div>👥</div>
              <div>🔍</div>
            </div>
          </div>
          <div class="preview-middle">
            <div class="preview-room">> GENERAL</div>
            <div class="preview-room active">> RANDOM</div>
            <div class="preview-room">> TECH</div>
          </div>
          <div class="preview-main">
            <div class="preview-header">> RANDOM_CHANNEL</div>
            <div class="preview-messages">
              <div class="preview-message">> USER_01: HELLO_WORLD</div>
              <div class="preview-message">> USER_02: SYSTEM_OK</div>
            </div>
            <div class="preview-input">> INPUT_</div>
          </div>
        </div>
        <div class="layout-info">
          <h3>复古终端风格</h3>
          <p>经典的绿色终端界面，极客范十足</p>
          <div class="layout-features">
            <span class="feature">✓ 复古风格</span>
            <span class="feature">✓ 终端感</span>
            <span class="feature">✓ 极客范</span>
          </div>
        </div>
      </div>
    </div>

    <div class="selector-footer">
      <p>你可以随时在设置中更改界面风格</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const selectLayout = (layout: string) => {
  switch (layout) {
    case 'wechat':
      router.push('/matrix')
      break
    case 'element':
      router.push('/element')
      break
    case 'retro':
      router.push('/jianluo')
      break
    default:
      router.push('/matrix')
  }
}
</script>

<style scoped>
.layout-selector {
  min-height: 100vh;
  background: linear-gradient(135deg, #2d5a27 0%, #3d6b35 100%);
  padding: 40px 20px;
  font-family: 'Microsoft YaHei', sans-serif;
}

.selector-header {
  text-align: center;
  margin-bottom: 50px;
  color: white;
}

.selector-header h1 {
  font-size: 36px;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.selector-header p {
  font-size: 18px;
  opacity: 0.9;
}

.layout-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

.layout-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.layout-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
}

.layout-preview {
  height: 250px;
  display: flex;
  font-size: 12px;
  position: relative;
}

/* 微信风格预览 */
.wechat-preview {
  background: #f5f5f5;
}

.wechat-preview .preview-sidebar {
  width: 120px;
  background: white;
  border-right: 1px solid #e0e0e0;
  padding: 10px 8px;
}

.wechat-preview .preview-user {
  text-align: center;
  padding: 8px;
  margin-bottom: 10px;
  background: #4CAF50;
  color: white;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  line-height: 14px;
  margin: 0 auto 10px;
}

.wechat-preview .preview-search {
  background: #f0f0f0;
  padding: 6px;
  border-radius: 4px;
  text-align: center;
  margin-bottom: 10px;
}

.wechat-preview .preview-chat {
  padding: 8px;
  margin-bottom: 2px;
  border-radius: 4px;
  cursor: pointer;
}

.wechat-preview .preview-chat.active {
  background: rgba(76, 175, 80, 0.1);
}

.wechat-preview .preview-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.wechat-preview .preview-header {
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  background: white;
  font-weight: bold;
}

.wechat-preview .preview-messages {
  flex: 1;
  padding: 10px;
  background: #f5f5f5;
}

.wechat-preview .preview-message {
  background: white;
  padding: 6px 10px;
  border-radius: 12px;
  margin-bottom: 8px;
  max-width: 70%;
}

.wechat-preview .preview-message.right {
  background: #4CAF50;
  color: white;
  margin-left: auto;
}

.wechat-preview .preview-input {
  padding: 10px;
  background: white;
  border-top: 1px solid #e0e0e0;
  color: #999;
}

/* Element风格预览 */
.element-preview {
  background: #f8f9fa;
}

.element-preview .preview-sidebar {
  width: 60px;
  background: #2d3748;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 5px;
}

.element-preview .preview-nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.element-preview .preview-middle {
  width: 100px;
  background: white;
  border-right: 1px solid #e0e0e0;
  padding: 10px 8px;
}

.element-preview .preview-room {
  padding: 6px;
  margin-bottom: 4px;
  border-radius: 4px;
  font-size: 11px;
}

.element-preview .preview-room.active {
  background: #e3f2fd;
}

.element-preview .preview-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.element-preview .preview-header {
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  background: white;
  font-weight: bold;
}

.element-preview .preview-messages {
  flex: 1;
  padding: 10px;
  background: white;
}

.element-preview .preview-message {
  padding: 4px 0;
  margin-bottom: 6px;
}

.element-preview .preview-input {
  padding: 10px;
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
  color: #999;
}

/* 复古风格预览 */
.retro-preview {
  background: #000;
  color: #00ff00;
  font-family: 'Courier New', monospace;
}

.retro-preview .preview-sidebar {
  width: 50px;
  background: #001100;
  border-right: 1px solid #00ff00;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 5px;
}

.retro-preview .preview-logo {
  border: 1px solid #00ff00;
  padding: 4px;
  margin-bottom: 10px;
}

.retro-preview .preview-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.retro-preview .preview-middle {
  width: 80px;
  background: #001100;
  border-right: 1px solid #00ff00;
  padding: 10px 5px;
}

.retro-preview .preview-room {
  padding: 4px;
  margin-bottom: 4px;
  font-size: 10px;
}

.retro-preview .preview-room.active {
  background: rgba(0, 255, 0, 0.2);
}

.retro-preview .preview-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.retro-preview .preview-header {
  padding: 8px;
  border-bottom: 1px solid #00ff00;
  background: #001100;
}

.retro-preview .preview-messages {
  flex: 1;
  padding: 8px;
  background: #000;
}

.retro-preview .preview-message {
  margin-bottom: 4px;
  font-size: 10px;
}

.retro-preview .preview-input {
  padding: 8px;
  background: #001100;
  border-top: 1px solid #00ff00;
}

.layout-info {
  padding: 20px;
}

.layout-info h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 20px;
}

.layout-info p {
  margin: 0 0 15px 0;
  color: #666;
  line-height: 1.5;
}

.layout-features {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.feature {
  background: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.selector-footer {
  text-align: center;
  margin-top: 40px;
  color: rgba(255, 255, 255, 0.8);
}
</style>
