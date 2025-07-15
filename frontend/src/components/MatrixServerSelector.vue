<template>
  <div class="matrix-server-selector">
    <div class="server-header">
      <h3>{{ $t('matrix.selectServer') }}</h3>
      <p class="server-description">{{ $t('matrix.serverDescription') }}</p>
    </div>
    
    <div class="server-options">
      <!-- 预设服务器 -->
      <div class="preset-servers">
        <h4>{{ $t('matrix.popularServers') }}</h4>
        <div class="server-list">
          <div 
            v-for="server in presetServers" 
            :key="server.name"
            class="server-item"
            :class="{ active: selectedServer === server.name }"
            @click="selectServer(server.name)"
          >
            <div class="server-info">
              <div class="server-name">{{ server.name }}</div>
              <div class="server-desc">{{ server.description }}</div>
              <div class="server-status" :class="server.status">
                <span class="status-dot"></span>
                {{ $t(`matrix.status.${server.status}`) }}
              </div>
            </div>
            <div class="server-federation">
              <span class="federation-badge">{{ $t('matrix.federated') }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 自定义服务器 -->
      <div class="custom-server">
        <h4>{{ $t('matrix.customServer') }}</h4>
        <div class="input-group">
          <input 
            v-model="customServerUrl"
            type="text"
            :placeholder="$t('matrix.serverUrlPlaceholder')"
            class="server-input"
            @input="validateCustomServer"
          />
          <button 
            @click="testCustomServer"
            :disabled="!customServerUrl || testing"
            class="test-button"
          >
            <span v-if="testing" class="loading-spinner"></span>
            {{ testing ? $t('matrix.testing') : $t('matrix.test') }}
          </button>
        </div>
        <div v-if="customServerError" class="error-message">
          {{ customServerError }}
        </div>
        <div v-if="customServerInfo" class="server-info-display">
          <div class="info-item">
            <span class="label">{{ $t('matrix.serverName') }}:</span>
            <span class="value">{{ customServerInfo.server_name }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ $t('matrix.version') }}:</span>
            <span class="value">{{ customServerInfo.version }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="server-actions">
      <button 
        @click="$emit('cancel')"
        class="cancel-button"
      >
        {{ $t('common.cancel') }}
      </button>
      <button 
        @click="confirmServer"
        :disabled="!selectedServer"
        class="confirm-button"
      >
        {{ $t('common.confirm') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { matrixAPI } from '@/services/api'

const emit = defineEmits(['server-selected', 'cancel'])

const selectedServer = ref('')
const customServerUrl = ref('')
const customServerError = ref('')
const customServerInfo = ref(null)
const testing = ref(false)

const presetServers = ref([
  {
    name: 'matrix.org',
    description: 'Official Matrix.org homeserver',
    status: 'online'
  },
  {
    name: 'mozilla.org',
    description: 'Mozilla Matrix homeserver',
    status: 'online'
  },
  {
    name: 'kde.org',
    description: 'KDE Community homeserver',
    status: 'online'
  }
])

const selectServer = (serverName: string) => {
  selectedServer.value = serverName
  customServerUrl.value = ''
  customServerError.value = ''
  customServerInfo.value = null
}

const validateCustomServer = () => {
  if (customServerUrl.value) {
    selectedServer.value = customServerUrl.value
    customServerError.value = ''
  }
}

const testCustomServer = async () => {
  if (!customServerUrl.value) return
  
  testing.value = true
  customServerError.value = ''
  customServerInfo.value = null
  
  try {
    const response = await matrixAPI.getServerInfo(customServerUrl.value)
    customServerInfo.value = response.data
    selectedServer.value = customServerUrl.value
  } catch (error: any) {
    customServerError.value = error.response?.data?.message || 'Failed to connect to server'
    selectedServer.value = ''
  } finally {
    testing.value = false
  }
}

const confirmServer = () => {
  if (selectedServer.value) {
    emit('server-selected', selectedServer.value)
  }
}

onMounted(async () => {
  try {
    const response = await matrixAPI.discoverServers()
    if (response.data && response.data.length > 0) {
      presetServers.value = response.data
    }
  } catch (error) {
    console.warn('Failed to load server list:', error)
  }
})
</script>

<style scoped>
.matrix-server-selector {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid #3a4a5c;
  border-radius: 12px;
  padding: 24px;
  color: #e0e6ed;
  max-width: 600px;
  margin: 0 auto;
}

.server-header {
  text-align: center;
  margin-bottom: 24px;
}

.server-header h3 {
  color: #64b5f6;
  margin-bottom: 8px;
  font-size: 1.5rem;
}

.server-description {
  color: #b0bec5;
  font-size: 0.9rem;
}

.server-options {
  margin-bottom: 24px;
}

.preset-servers, .custom-server {
  margin-bottom: 24px;
}

.preset-servers h4, .custom-server h4 {
  color: #81c784;
  margin-bottom: 12px;
  font-size: 1.1rem;
}

.server-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.server-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #3a4a5c;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.server-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #64b5f6;
}

.server-item.active {
  background: rgba(100, 181, 246, 0.2);
  border-color: #64b5f6;
}

.server-info {
  flex: 1;
}

.server-name {
  font-weight: 600;
  color: #e0e6ed;
  margin-bottom: 4px;
}

.server-desc {
  font-size: 0.85rem;
  color: #b0bec5;
  margin-bottom: 4px;
}

.server-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4caf50;
}

.federation-badge {
  background: rgba(129, 199, 132, 0.2);
  color: #81c784;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  border: 1px solid #81c784;
}

.input-group {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.server-input {
  flex: 1;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #3a4a5c;
  border-radius: 6px;
  color: #e0e6ed;
  font-size: 0.9rem;
}

.server-input:focus {
  outline: none;
  border-color: #64b5f6;
}

.test-button {
  padding: 10px 16px;
  background: #64b5f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

.test-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  color: #f44336;
  font-size: 0.85rem;
  margin-top: 4px;
}

.server-info-display {
  background: rgba(255, 255, 255, 0.05);
  padding: 12px;
  border-radius: 6px;
  margin-top: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.label {
  color: #b0bec5;
  font-size: 0.85rem;
}

.value {
  color: #e0e6ed;
  font-size: 0.85rem;
  font-weight: 500;
}

.server-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-button, .confirm-button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.cancel-button {
  background: rgba(255, 255, 255, 0.1);
  color: #e0e6ed;
}

.cancel-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.confirm-button {
  background: #4caf50;
  color: white;
}

.confirm-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.confirm-button:not(:disabled):hover {
  background: #45a049;
}
</style>
