<template>
  <div class="encryption-indicator">
    <!-- 房间加密状态指示器 -->
    <div 
      v-if="type === 'room'"
      class="room-encryption-status"
      :class="encryptionClass"
      @click="showDetails = !showDetails"
    >
      <el-icon class="encryption-icon">
        <component :is="encryptionIcon" />
      </el-icon>
      <span class="encryption-text">{{ encryptionText }}</span>
      <el-icon class="expand-icon" v-if="showExpandIcon">
        <ArrowDown />
      </el-icon>
      
      <!-- 详细信息弹出层 -->
      <div v-if="showDetails" class="encryption-details">
        <div class="detail-item">
          <strong>加密状态:</strong> {{ encryptionStatus }}
        </div>
        <div class="detail-item" v-if="algorithm">
          <strong>加密算法:</strong> {{ algorithm }}
        </div>
        <div class="detail-item" v-if="memberCount">
          <strong>房间成员:</strong> {{ memberCount }} 人
        </div>
        <div class="detail-item" v-if="verifiedDevices !== null">
          <strong>已验证设备:</strong> {{ verifiedDevices }}/{{ totalDevices }}
        </div>
        <div class="detail-item" v-if="lastKeyRotation">
          <strong>最后密钥轮换:</strong> {{ formatDate(lastKeyRotation) }}
        </div>
        
        <div class="detail-actions" v-if="encrypted">
          <el-button size="small" @click="manageKeys">
            管理密钥
          </el-button>
          <el-button size="small" @click="verifyDevices">
            验证设备
          </el-button>
        </div>
      </div>
    </div>

    <!-- 消息加密状态指示器 -->
    <div 
      v-else-if="type === 'message'"
      class="message-encryption-status"
      :class="encryptionClass"
      :title="encryptionTooltip"
    >
      <el-icon class="encryption-icon">
        <component :is="encryptionIcon" />
      </el-icon>
    </div>

    <!-- 设备验证状态指示器 -->
    <div 
      v-else-if="type === 'device'"
      class="device-encryption-status"
      :class="encryptionClass"
    >
      <el-icon class="encryption-icon">
        <component :is="encryptionIcon" />
      </el-icon>
      <span class="encryption-text">{{ encryptionText }}</span>
      <el-button 
        v-if="!verified && canVerify"
        size="small"
        type="primary"
        @click="$emit('verify-device')"
      >
        验证
      </el-button>
    </div>

    <!-- 全局加密状态指示器 -->
    <div 
      v-else-if="type === 'global'"
      class="global-encryption-status"
      :class="encryptionClass"
      @click="showGlobalDetails = !showGlobalDetails"
    >
      <el-icon class="encryption-icon">
        <component :is="encryptionIcon" />
      </el-icon>
      <span class="encryption-text">{{ encryptionText }}</span>
      
      <!-- 全局加密详情 -->
      <el-popover
        v-model:visible="showGlobalDetails"
        placement="bottom"
        width="300"
        trigger="click"
      >
        <template #reference>
          <el-icon class="expand-icon">
            <InfoFilled />
          </el-icon>
        </template>
        
        <div class="global-encryption-details">
          <h4>端到端加密状态</h4>
          <div class="detail-item">
            <strong>加密引擎:</strong> {{ cryptoEngine }}
          </div>
          <div class="detail-item">
            <strong>设备ID:</strong> {{ deviceId }}
          </div>
          <div class="detail-item">
            <strong>已验证设备:</strong> {{ globalVerifiedDevices }}
          </div>
          <div class="detail-item">
            <strong>密钥备份:</strong> 
            <el-tag :type="keyBackupEnabled ? 'success' : 'warning'" size="small">
              {{ keyBackupEnabled ? '已启用' : '未启用' }}
            </el-tag>
          </div>
          
          <div class="global-actions">
            <el-button size="small" @click="$emit('manage-encryption')">
              管理加密
            </el-button>
          </div>
        </div>
      </el-popover>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { 
  Lock, 
  Unlock, 
  Warning, 
  Shield, 
  ArrowDown, 
  InfoFilled 
} from '@element-plus/icons-vue'

// Props
interface Props {
  type: 'room' | 'message' | 'device' | 'global'
  encrypted?: boolean
  verified?: boolean
  algorithm?: string
  memberCount?: number
  verifiedDevices?: number
  totalDevices?: number
  lastKeyRotation?: Date
  canVerify?: boolean
  // 全局状态相关
  cryptoEngine?: string
  deviceId?: string
  globalVerifiedDevices?: number
  keyBackupEnabled?: boolean
  // 消息相关
  decrypted?: boolean
  decryptionError?: string
}

const props = withDefaults(defineProps<Props>(), {
  encrypted: false,
  verified: false,
  canVerify: true,
  decrypted: true,
  cryptoEngine: 'Rust Crypto',
  globalVerifiedDevices: 0,
  keyBackupEnabled: false
})

// Emits
defineEmits<{
  'verify-device': []
  'manage-encryption': []
}>()

// 响应式数据
const showDetails = ref(false)
const showGlobalDetails = ref(false)

// 计算属性
const encryptionClass = computed(() => {
  if (props.type === 'message') {
    if (!props.encrypted) return 'unencrypted'
    if (props.decryptionError) return 'decryption-error'
    if (!props.decrypted) return 'decrypting'
    return 'encrypted'
  }
  
  if (props.type === 'device') {
    return props.verified ? 'verified' : 'unverified'
  }
  
  if (props.type === 'global') {
    return props.encrypted ? 'crypto-enabled' : 'crypto-disabled'
  }
  
  // room type
  if (!props.encrypted) return 'unencrypted'
  if (props.verifiedDevices !== null && props.totalDevices !== null) {
    const ratio = props.verifiedDevices / props.totalDevices
    if (ratio === 1) return 'fully-verified'
    if (ratio > 0.5) return 'partially-verified'
    return 'unverified'
  }
  return 'encrypted'
})

const encryptionIcon = computed(() => {
  if (props.type === 'message') {
    if (!props.encrypted) return 'Unlock'
    if (props.decryptionError) return 'Warning'
    return 'Lock'
  }
  
  if (props.type === 'device') {
    return props.verified ? 'Shield' : 'Warning'
  }
  
  if (props.type === 'global') {
    return props.encrypted ? 'Shield' : 'Unlock'
  }
  
  // room type
  if (!props.encrypted) return 'Unlock'
  if (props.verifiedDevices !== null && props.totalDevices !== null) {
    const ratio = props.verifiedDevices / props.totalDevices
    if (ratio === 1) return 'Shield'
    if (ratio > 0.5) return 'Lock'
    return 'Warning'
  }
  return 'Lock'
})

const encryptionText = computed(() => {
  if (props.type === 'message') {
    if (!props.encrypted) return '未加密'
    if (props.decryptionError) return '解密失败'
    if (!props.decrypted) return '解密中...'
    return '已加密'
  }
  
  if (props.type === 'device') {
    return props.verified ? '已验证' : '未验证'
  }
  
  if (props.type === 'global') {
    return props.encrypted ? '加密已启用' : '加密未启用'
  }
  
  // room type
  if (!props.encrypted) return '未加密房间'
  if (props.verifiedDevices !== null && props.totalDevices !== null) {
    const ratio = props.verifiedDevices / props.totalDevices
    if (ratio === 1) return '完全验证'
    if (ratio > 0.5) return '部分验证'
    return '未验证设备'
  }
  return '加密房间'
})

const encryptionStatus = computed(() => {
  if (!props.encrypted) return '此房间未启用端到端加密'
  return '此房间已启用端到端加密，消息仅对房间成员可见'
})

const encryptionTooltip = computed(() => {
  if (!props.encrypted) return '此消息未加密'
  if (props.decryptionError) return `解密失败: ${props.decryptionError}`
  return '此消息已端到端加密'
})

const showExpandIcon = computed(() => {
  return props.type === 'room' && props.encrypted
})

// 方法
const formatDate = (date: Date) => {
  return date.toLocaleString()
}

const manageKeys = () => {
  // 触发密钥管理
  console.log('管理密钥')
}

const verifyDevices = () => {
  // 触发设备验证
  console.log('验证设备')
}
</script>

<style scoped>
.encryption-indicator {
  display: inline-block;
}

/* 房间加密状态 */
.room-encryption-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.room-encryption-status:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.room-encryption-status.unencrypted {
  color: #909399;
  background-color: #f5f7fa;
}

.room-encryption-status.encrypted {
  color: #409eff;
  background-color: #ecf5ff;
}

.room-encryption-status.fully-verified {
  color: #67c23a;
  background-color: #f0f9ff;
}

.room-encryption-status.partially-verified {
  color: #e6a23c;
  background-color: #fdf6ec;
}

.room-encryption-status.unverified {
  color: #f56c6c;
  background-color: #fef0f0;
}

/* 消息加密状态 */
.message-encryption-status {
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
}

.message-encryption-status.unencrypted .encryption-icon {
  color: #909399;
}

.message-encryption-status.encrypted .encryption-icon {
  color: #67c23a;
}

.message-encryption-status.decryption-error .encryption-icon {
  color: #f56c6c;
}

.message-encryption-status.decrypting .encryption-icon {
  color: #e6a23c;
  animation: pulse 1.5s infinite;
}

/* 设备验证状态 */
.device-encryption-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 4px;
}

.device-encryption-status.verified {
  color: #67c23a;
  background-color: #f0f9ff;
}

.device-encryption-status.unverified {
  color: #e6a23c;
  background-color: #fdf6ec;
}

/* 全局加密状态 */
.global-encryption-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.global-encryption-status:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.global-encryption-status.crypto-enabled {
  color: #67c23a;
  background-color: #f0f9ff;
}

.global-encryption-status.crypto-disabled {
  color: #f56c6c;
  background-color: #fef0f0;
}

/* 详细信息 */
.encryption-details {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 16px;
  z-index: 1000;
  margin-top: 4px;
}

.detail-item {
  margin-bottom: 8px;
  font-size: 14px;
}

.detail-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}

.global-encryption-details {
  padding: 8px 0;
}

.global-encryption-details h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
}

.global-actions {
  margin-top: 12px;
  text-align: center;
}

/* 图标样式 */
.encryption-icon {
  font-size: 16px;
}

.expand-icon {
  font-size: 14px;
  opacity: 0.7;
}

/* 动画 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .encryption-details {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 400px;
  }
}
</style>
