<template>
  <div class="encryption-status" :class="statusClass">
    <div class="status-indicator" @click="showDetails = !showDetails">
      <svg class="encryption-icon" viewBox="0 0 24 24">
        <path v-if="status === 'encrypted'" d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"/>
        <path v-else-if="status === 'unencrypted'" d="M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10A2,2 0 0,0 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17Z"/>
        <path v-else-if="status === 'warning'" d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.1 16,12.7V16.2C16,16.8 15.4,17.3 14.8,17.3H9.2C8.6,17.3 8,16.8 8,16.2V12.7C8,12.1 8.6,11.5 9.2,11.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10V11.5H13.5V10C13.5,8.7 12.8,8.2 12,8.2Z"/>
        <path v-else d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
      </svg>
      
      <span class="status-text">{{ statusText }}</span>
      
      <svg v-if="hasDetails" class="expand-icon" :class="{ expanded: showDetails }" viewBox="0 0 24 24">
        <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
      </svg>
    </div>
    
    <div v-if="showDetails && hasDetails" class="status-details">
      <div class="detail-section">
        <h4>{{ $t('matrix.encryption.roomSecurity') }}</h4>
        <div class="detail-item">
          <span class="label">{{ $t('matrix.encryption.algorithm') }}:</span>
          <span class="value">{{ encryptionInfo.algorithm || 'N/A' }}</span>
        </div>
        <div class="detail-item">
          <span class="label">{{ $t('matrix.encryption.sessionId') }}:</span>
          <span class="value monospace">{{ truncateId(encryptionInfo.sessionId) }}</span>
        </div>
      </div>
      
      <div v-if="deviceInfo.length > 0" class="detail-section">
        <h4>{{ $t('matrix.encryption.devices') }}</h4>
        <div class="device-list">
          <div 
            v-for="device in deviceInfo" 
            :key="device.deviceId"
            class="device-item"
            :class="device.verified ? 'verified' : 'unverified'"
          >
            <div class="device-info">
              <span class="device-name">{{ device.displayName || device.deviceId }}</span>
              <span class="device-id monospace">{{ truncateId(device.deviceId) }}</span>
            </div>
            <div class="device-status">
              <svg class="device-icon" viewBox="0 0 24 24">
                <path v-if="device.verified" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                <path v-else d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
              </svg>
              <span>{{ device.verified ? $t('matrix.encryption.verified') : $t('matrix.encryption.unverified') }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="status === 'warning'" class="detail-section warning-section">
        <h4>{{ $t('matrix.encryption.securityWarning') }}</h4>
        <ul class="warning-list">
          <li v-for="warning in warnings" :key="warning">{{ warning }}</li>
        </ul>
        <div class="warning-actions">
          <button @click="verifyDevices" class="verify-button">
            {{ $t('matrix.encryption.verifyDevices') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface DeviceInfo {
  deviceId: string
  displayName?: string
  verified: boolean
  userId: string
}

interface EncryptionInfo {
  algorithm?: string
  sessionId?: string
  rotationPeriod?: number
}

interface Props {
  status: 'encrypted' | 'unencrypted' | 'warning' | 'error'
  encryptionInfo?: EncryptionInfo
  deviceInfo?: DeviceInfo[]
  warnings?: string[]
  roomId?: string
}

const props = withDefaults(defineProps<Props>(), {
  encryptionInfo: () => ({}),
  deviceInfo: () => [],
  warnings: () => []
})

const emit = defineEmits(['verify-devices', 'enable-encryption'])

const showDetails = ref(false)

const statusClass = computed(() => `status-${props.status}`)

const statusText = computed(() => {
  switch (props.status) {
    case 'encrypted':
      return 'Encrypted'
    case 'unencrypted':
      return 'Not encrypted'
    case 'warning':
      return 'Security warning'
    case 'error':
      return 'Encryption error'
    default:
      return 'Unknown'
  }
})

const hasDetails = computed(() => {
  return props.encryptionInfo.algorithm || 
         props.deviceInfo.length > 0 || 
         props.warnings.length > 0
})

const truncateId = (id?: string): string => {
  if (!id) return 'N/A'
  return id.length > 16 ? `${id.substring(0, 8)}...${id.substring(id.length - 8)}` : id
}

const verifyDevices = () => {
  emit('verify-devices', props.roomId)
}
</script>

<style scoped>
.encryption-status {
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.status-encrypted {
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.status-unencrypted {
  background: rgba(255, 183, 77, 0.1);
  border: 1px solid rgba(255, 183, 77, 0.3);
}

.status-warning {
  background: rgba(255, 152, 0, 0.1);
  border: 1px solid rgba(255, 152, 0, 0.3);
}

.status-error {
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.status-indicator:hover {
  background: rgba(255, 255, 255, 0.05);
}

.encryption-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.status-encrypted .encryption-icon {
  fill: #4caf50;
}

.status-unencrypted .encryption-icon {
  fill: #ffb74d;
}

.status-warning .encryption-icon {
  fill: #ff9800;
}

.status-error .encryption-icon {
  fill: #f44336;
}

.status-text {
  font-size: 0.85rem;
  font-weight: 500;
  flex: 1;
}

.status-encrypted .status-text {
  color: #4caf50;
}

.status-unencrypted .status-text {
  color: #ffb74d;
}

.status-warning .status-text {
  color: #ff9800;
}

.status-error .status-text {
  color: #f44336;
}

.expand-icon {
  width: 16px;
  height: 16px;
  fill: #b0bec5;
  transition: transform 0.3s ease;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.status-details {
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-section {
  margin-bottom: 16px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h4 {
  color: #e0e6ed;
  font-size: 0.9rem;
  margin-bottom: 8px;
  font-weight: 600;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 0.8rem;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.label {
  color: #b0bec5;
}

.value {
  color: #e0e6ed;
  font-weight: 500;
}

.monospace {
  font-family: 'Courier New', monospace;
}

.device-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.device-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  border-left: 3px solid transparent;
}

.device-item.verified {
  border-left-color: #4caf50;
}

.device-item.unverified {
  border-left-color: #ff9800;
}

.device-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.device-name {
  font-size: 0.85rem;
  color: #e0e6ed;
  font-weight: 500;
}

.device-id {
  font-size: 0.75rem;
  color: #b0bec5;
}

.device-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
}

.device-icon {
  width: 12px;
  height: 12px;
}

.device-item.verified .device-icon {
  fill: #4caf50;
}

.device-item.verified .device-status span {
  color: #4caf50;
}

.device-item.unverified .device-icon {
  fill: #ff9800;
}

.device-item.unverified .device-status span {
  color: #ff9800;
}

.warning-section {
  background: rgba(255, 152, 0, 0.1);
  padding: 12px;
  border-radius: 6px;
  border: 1px solid rgba(255, 152, 0, 0.2);
}

.warning-list {
  margin: 8px 0;
  padding-left: 16px;
  color: #ffb74d;
  font-size: 0.8rem;
}

.warning-list li {
  margin-bottom: 4px;
}

.warning-actions {
  margin-top: 12px;
}

.verify-button {
  background: #ff9800;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.verify-button:hover {
  background: #f57c00;
}
</style>
