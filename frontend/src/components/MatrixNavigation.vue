<template>
  <div class="matrix-navigation">
    <div class="nav-header">
      <div class="app-logo">
        <div class="logo-text">JIANLUOCHAT</div>
        <div class="logo-subtitle">MATRIX CLIENT</div>
      </div>
      <div class="nav-toggle" @click="toggleNav">
        <span class="toggle-icon">{{ navExpanded ? '◀' : '▶' }}</span>
      </div>
    </div>

    <div class="nav-content" :class="{ expanded: navExpanded }">
      <!-- Matrix协议信息 -->
      <div class="protocol-info">
        <div class="protocol-header">MATRIX PROTOCOL</div>
        <div class="protocol-description">
          <div class="protocol-feature">
            <span class="feature-icon">🌐</span>
            <span class="feature-text">去中心化通信</span>
          </div>
          <div class="protocol-feature">
            <span class="feature-icon">🔐</span>
            <span class="feature-text">端到端加密</span>
          </div>
          <div class="protocol-feature">
            <span class="feature-icon">🔗</span>
            <span class="feature-text">联邦化支持</span>
          </div>
        </div>
      </div>

      <!-- Matrix状态 -->
      <div class="matrix-status">
        <div class="status-header">MATRIX STATUS</div>
        <div class="status-info">
          <div class="status-line">
            <span class="status-label">HOMESERVER:</span>
            <span class="status-value">{{ matrixStore.connection.homeserver }}</span>
          </div>
          <div class="status-line">
            <span class="status-label">CONNECTION:</span>
            <span class="status-indicator" :class="connectionStatus">●</span>
            <span class="status-text">{{ getStatusText() }}</span>
          </div>
          <div class="status-line" v-if="matrixStore.currentUser">
            <span class="status-label">USER:</span>
            <span class="status-value">@{{ matrixStore.currentUser.username }}:jianluochat.com</span>
          </div>
        </div>
      </div>

      <!-- 快速操作 -->
      <div class="quick-actions">
        <div class="actions-header">QUICK ACTIONS</div>
        <div class="action-buttons">
          <button
            v-if="matrixStore.currentUser"
            @click="createRoom"
            class="action-btn"
          >
            <span class="btn-icon">🏠</span>
            <span class="btn-text">CREATE ROOM</span>
          </button>

          <button
            @click="testConnection"
            class="action-btn"
          >
            <span class="btn-icon">🔧</span>
            <span class="btn-text">TEST CONNECTION</span>
          </button>

          <button
            v-if="matrixStore.currentUser"
            @click="logout"
            class="action-btn logout"
          >
            <span class="btn-icon">🚪</span>
            <span class="btn-text">LOGOUT</span>
          </button>
        </div>
      </div>

      <!-- Matrix协议信1息 -->
      <div class="protocol-info" v-if="$route.path === '/matrix'">
        <div class="info-header">MATRIX PROTOCOL</div>
        <div class="info-content">
          <div class="info-item">
            <span class="info-icon">🌐</span>
            <span class="info-text">Decentralized</span>
          </div>
          <div class="info-item">
            <span class="info-icon">🔐</span>
            <span class="info-text">End-to-End Encrypted</span>
          </div>
          <div class="info-item">
            <span class="info-icon">⚡</span>
            <span class="info-text">Real-time Sync</span>
          </div>
          <div class="info-item">
            <span class="info-icon">🔄</span>
            <span class="info-text">Federation Ready</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMatrixStore } from '@/stores/matrix'

const router = useRouter()
const matrixStore = useMatrixStore()

const navExpanded = ref(false)

const emit = defineEmits<{
  'create-room': []
  'test-connection': []
}>()

const connectionStatus = computed(() => {
  if (matrixStore.isConnected) return 'connected'
  if (matrixStore.loading) return 'connecting'
  return 'disconnected'
})

const getStatusText = () => {
  switch (connectionStatus.value) {
    case 'connected': return 'ONLINE'
    case 'connecting': return 'CONNECTING...'
    case 'disconnected': return 'OFFLINE'
    default: return 'UNKNOWN'
  }
}

const toggleNav = () => {
  navExpanded.value = !navExpanded.value
}

const createRoom = () => {
  emit('create-room')
}

const testConnection = () => {
  emit('test-connection')
}

const logout = () => {
  matrixStore.disconnect()
  router.push('/matrix')
}
</script>

<style scoped>
.matrix-navigation {
  position: fixed;
  top: 0;
  left: 0;
  width: 60px;
  height: 100vh;
  background: rgba(0, 0, 0, 0.95);
  border-right: 2px solid #00ff00;
  font-family: 'Share Tech Mono', monospace;
  z-index: 1000;
  transition: width 0.3s ease;
}

.matrix-navigation:hover,
.matrix-navigation.expanded {
  width: 280px;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  border-bottom: 1px solid #003300;
  background: rgba(0, 255, 0, 0.05);
}

.app-logo {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.matrix-navigation:hover .app-logo,
.matrix-navigation.expanded .app-logo {
  opacity: 1;
}

.logo-text {
  color: #00ff00;
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 2px;
}

.logo-subtitle {
  color: #00cccc;
  font-size: 10px;
  letter-spacing: 1px;
}

.nav-toggle {
  color: #00ff00;
  cursor: pointer;
  padding: 5px;
  border: 1px solid #003300;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.nav-toggle:hover {
  background: rgba(0, 255, 0, 0.1);
  box-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
}

.toggle-icon {
  font-size: 12px;
}

.nav-content {
  padding: 20px 15px;
  height: calc(100vh - 80px);
  overflow-y: auto;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.matrix-navigation:hover .nav-content,
.matrix-navigation.expanded .nav-content {
  opacity: 1;
}

.matrix-status, .quick-actions, .protocol-info {
  margin-bottom: 25px;
  padding: 15px;
  border: 1px solid #003300;
  border-radius: 4px;
  background: rgba(0, 255, 0, 0.02);
}

.protocol-header, .status-header, .actions-header, .info-header {
  color: #00ff00;
  font-weight: bold;
  font-size: 11px;
  margin-bottom: 10px;
  text-align: center;
  border-bottom: 1px solid #003300;
  padding-bottom: 5px;
}

.protocol-description {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.protocol-feature {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid #003300;
  border-radius: 3px;
  background: rgba(0, 255, 0, 0.05);
  transition: all 0.3s ease;
}

.protocol-feature:hover {
  border-color: #00ff00;
  background: rgba(0, 255, 0, 0.1);
}

.feature-icon {
  font-size: 14px;
}

.feature-text {
  font-size: 11px;
  font-weight: bold;
  color: #e0e6ed;
}



.status-line {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  font-size: 10px;
}

.status-label {
  color: #00ff00;
  font-weight: bold;
  min-width: 80px;
  margin-right: 5px;
}

.status-value {
  color: #00cccc;
  font-size: 9px;
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
  font-size: 9px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: none;
  border: 1px solid #003300;
  color: #666;
  font-family: 'Share Tech Mono', monospace;
  font-size: 10px;
  cursor: pointer;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  border-color: #00ff00;
  color: #00ff00;
  background: rgba(0, 255, 0, 0.1);
}

.action-btn.logout {
  border-color: #ff0000;
  color: #ff0000;
}

.action-btn.logout:hover {
  background: rgba(255, 0, 0, 0.1);
  box-shadow: 0 0 5px rgba(255, 0, 0, 0.3);
}

.btn-icon {
  font-size: 12px;
}

.btn-text {
  font-weight: bold;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  color: #666;
}

.info-icon {
  font-size: 12px;
}

.info-text {
  color: #00ff00;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

/* 滚动条样式 */
.nav-content::-webkit-scrollbar {
  width: 4px;
}

.nav-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
}

.nav-content::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 0, 0.3);
  border-radius: 2px;
}

.nav-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 0, 0.5);
}
</style>
