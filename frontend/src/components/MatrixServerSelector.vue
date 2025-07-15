<template>
  <div class="matrix-server-selector">
    <div class="selector-header">
      <h3>🌐 选择 Matrix 服务器</h3>
      <button @click="$emit('cancel')" class="close-btn">×</button>
    </div>
    
    <div class="server-list">
      <div 
        v-for="server in servers" 
        :key="server.url"
        class="server-item"
        :class="{ active: selectedServer === server.url }"
        @click="selectServer(server)"
      >
        <div class="server-info">
          <h4>{{ server.name }}</h4>
          <p class="server-url">{{ server.url }}</p>
          <p class="server-description">{{ server.description }}</p>
          <div class="server-stats">
            <span class="stat">👥 {{ server.users || 'N/A' }} 用户</span>
            <span class="stat">🏠 {{ server.rooms || 'N/A' }} 房间</span>
            <span class="status" :class="server.status">{{ getStatusText(server.status) }}</span>
          </div>
        </div>
        <div class="server-actions">
          <button 
            @click.stop="testConnection(server)"
            :disabled="testing[server.url]"
            class="test-btn"
          >
            {{ testing[server.url] ? '测试中...' : '测试连接' }}
          </button>
        </div>
      </div>
    </div>

    <div class="custom-server">
      <h4>自定义服务器</h4>
      <div class="custom-input-group">
        <input 
          v-model="customServerUrl"
          placeholder="输入服务器URL (例: matrix.org)"
          class="custom-input"
          @keyup.enter="addCustomServer"
        />
        <button @click="addCustomServer" class="add-btn">添加</button>
      </div>
    </div>

    <div class="selector-actions">
      <button @click="$emit('cancel')" class="cancel-btn">取消</button>
      <button 
        @click="confirmSelection"
        :disabled="!selectedServer"
        class="confirm-btn"
      >
        确认选择
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['server-selected', 'cancel'])

// 响应式数据
const selectedServer = ref('')
const customServerUrl = ref('')
const testing = ref({})

// 预定义服务器列表
const servers = ref([
  {
    name: 'Matrix.org',
    url: 'matrix.org',
    description: 'Matrix 官方服务器',
    status: 'online',
    users: '1M+',
    rooms: '100K+'
  },
  {
    name: 'Mozilla Matrix',
    url: 'mozilla.org',
    description: 'Mozilla 官方 Matrix 服务器',
    status: 'online',
    users: '10K+',
    rooms: '1K+'
  },
  {
    name: 'KDE Matrix',
    url: 'kde.org',
    description: 'KDE 社区 Matrix 服务器',
    status: 'online',
    users: '5K+',
    rooms: '500+'
  },
  {
    name: 'GNOME Matrix',
    url: 'gnome.org',
    description: 'GNOME 社区 Matrix 服务器',
    status: 'online',
    users: '3K+',
    rooms: '300+'
  },
  {
    name: 'Fedora Matrix',
    url: 'fedora.im',
    description: 'Fedora 社区 Matrix 服务器',
    status: 'online',
    users: '2K+',
    rooms: '200+'
  }
])

// 方法
const selectServer = (server) => {
  selectedServer.value = server.url
}

const testConnection = async (server) => {
  testing.value[server.url] = true
  try {
    // 模拟连接测试
    await new Promise(resolve => setTimeout(resolve, 1000))
    server.status = 'online'
    console.log(`Connection test successful for ${server.url}`)
  } catch (error) {
    server.status = 'offline'
    console.error(`Connection test failed for ${server.url}:`, error)
  } finally {
    testing.value[server.url] = false
  }
}

const addCustomServer = () => {
  if (!customServerUrl.value.trim()) return
  
  const customServer = {
    name: customServerUrl.value,
    url: customServerUrl.value,
    description: '自定义服务器',
    status: 'unknown',
    users: 'N/A',
    rooms: 'N/A'
  }
  
  servers.value.push(customServer)
  customServerUrl.value = ''
}

const confirmSelection = () => {
  if (selectedServer.value) {
    const server = servers.value.find(s => s.url === selectedServer.value)
    emit('server-selected', server)
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'online': return '在线'
    case 'offline': return '离线'
    case 'unknown': return '未知'
    default: return '未知'
  }
}

// 生命周期
onMounted(() => {
  // 默认选择 matrix.org
  selectedServer.value = 'matrix.org'
})
</script>

<style scoped>
.matrix-server-selector {
  background: #0f0f23;
  border: 2px solid #00ff88;
  border-radius: 12px;
  padding: 20px;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  color: #00ff88;
  font-family: 'Courier New', monospace;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #00ff88;
}

.selector-header h3 {
  margin: 0;
  color: #00ff88;
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
}

.close-btn {
  background: none;
  border: none;
  color: #00ff88;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.server-list {
  margin-bottom: 20px;
}

.server-item {
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.server-item:hover {
  border-color: #00ff88;
  background: rgba(0, 255, 136, 0.2);
}

.server-item.active {
  border-color: #00ff88;
  background: rgba(0, 255, 136, 0.3);
  box-shadow: 0 0 15px rgba(0, 255, 136, 0.3);
}

.server-info h4 {
  margin: 0 0 5px 0;
  color: #00ff88;
}

.server-url {
  margin: 0 0 5px 0;
  color: rgba(0, 255, 136, 0.8);
  font-size: 14px;
}

.server-description {
  margin: 0 0 10px 0;
  color: rgba(0, 255, 136, 0.7);
  font-size: 12px;
}

.server-stats {
  display: flex;
  gap: 15px;
  font-size: 11px;
}

.stat {
  color: rgba(0, 255, 136, 0.6);
}

.status {
  font-weight: bold;
}

.status.online {
  color: #00ff88;
}

.status.offline {
  color: #ff4444;
}

.status.unknown {
  color: #ffaa00;
}

.test-btn {
  background: rgba(0, 255, 136, 0.2);
  border: 1px solid #00ff88;
  color: #00ff88;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
}

.test-btn:hover:not(:disabled) {
  background: rgba(0, 255, 136, 0.3);
}

.test-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.custom-server {
  margin-bottom: 20px;
  padding-top: 15px;
  border-top: 1px solid rgba(0, 255, 136, 0.3);
}

.custom-server h4 {
  margin: 0 0 10px 0;
  color: #00ff88;
}

.custom-input-group {
  display: flex;
  gap: 10px;
}

.custom-input {
  flex: 1;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid #00ff88;
  color: #00ff88;
  padding: 8px 12px;
  border-radius: 4px;
  font-family: inherit;
}

.custom-input::placeholder {
  color: rgba(0, 255, 136, 0.6);
}

.add-btn, .confirm-btn {
  background: linear-gradient(45deg, #00ff88, #00cc6a);
  border: none;
  color: #000;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-family: inherit;
  transition: all 0.3s ease;
}

.add-btn:hover, .confirm-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 255, 136, 0.4);
}

.selector-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 15px;
  border-top: 1px solid rgba(0, 255, 136, 0.3);
}

.cancel-btn {
  background: rgba(255, 68, 68, 0.2);
  border: 1px solid #ff4444;
  color: #ff4444;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: rgba(255, 68, 68, 0.3);
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
