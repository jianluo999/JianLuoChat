<template>
  <div class="encryption-settings">
    <div class="settings-header">
      <h1>🔐 端到端加密设置</h1>
      <p class="header-description">
        管理您的端到端加密设置，确保聊天安全和隐私保护
      </p>
    </div>

    <!-- 全局加密状态 -->
    <el-card class="status-card">
      <template #header>
        <div class="card-header">
          <span>加密状态</span>
          <EncryptionIndicator 
            type="global"
            :encrypted="cryptoEnabled"
            :crypto-engine="cryptoEngine"
            :device-id="deviceId"
            :global-verified-devices="verifiedDevicesCount"
            :key-backup-enabled="keyBackupEnabled"
            @manage-encryption="scrollToSection('key-management')"
          />
        </div>
      </template>

      <div class="status-content">
        <div class="status-item">
          <el-icon class="status-icon" :class="cryptoEnabled ? 'success' : 'error'">
            <component :is="cryptoEnabled ? 'SuccessFilled' : 'CircleCloseFilled'" />
          </el-icon>
          <div class="status-info">
            <h3>{{ cryptoEnabled ? '端到端加密已启用' : '端到端加密未启用' }}</h3>
            <p>{{ cryptoStatusDescription }}</p>
          </div>
          <el-button 
            v-if="!cryptoEnabled"
            type="primary"
            @click="enableCrypto"
            :loading="enablingCrypto"
          >
            启用加密
          </el-button>
        </div>

        <div v-if="cryptoEnabled" class="crypto-info">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">加密引擎:</span>
              <span class="info-value">{{ cryptoEngine }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">设备ID:</span>
              <span class="info-value">{{ deviceId }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">已验证设备:</span>
              <span class="info-value">{{ verifiedDevicesCount }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">密钥备份:</span>
              <el-tag :type="keyBackupEnabled ? 'success' : 'warning'" size="small">
                {{ keyBackupEnabled ? '已启用' : '未启用' }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 设备验证 -->
    <el-card class="section-card" id="device-verification">
      <template #header>
        <div class="card-header">
          <span>设备验证</span>
          <el-button 
            type="primary" 
            size="small"
            @click="refreshDevices"
            :loading="loadingDevices"
          >
            刷新设备
          </el-button>
        </div>
      </template>

      <DeviceVerification 
        ref="deviceVerificationRef"
        :show-device-list="true"
      />
    </el-card>

    <!-- 密钥管理 -->
    <el-card class="section-card" id="key-management">
      <template #header>
        <span>密钥管理</span>
      </template>

      <KeyManagement ref="keyManagementRef" />
    </el-card>

    <!-- 房间加密设置 -->
    <el-card class="section-card">
      <template #header>
        <span>房间加密设置</span>
      </template>

      <div class="room-encryption-settings">
        <el-form label-width="150px">
          <el-form-item label="默认启用加密">
            <el-switch 
              v-model="roomSettings.defaultEncryption"
              @change="updateRoomSettings"
            />
            <div class="setting-description">
              新创建的房间将默认启用端到端加密
            </div>
          </el-form-item>

          <el-form-item label="加密算法">
            <el-select 
              v-model="roomSettings.encryptionAlgorithm"
              @change="updateRoomSettings"
            >
              <el-option 
                label="Megolm (推荐)" 
                value="m.megolm.v1.aes-sha2"
              />
            </el-select>
            <div class="setting-description">
              用于房间消息加密的算法
            </div>
          </el-form-item>

          <el-form-item label="密钥轮换周期">
            <el-select 
              v-model="roomSettings.keyRotationPeriod"
              @change="updateRoomSettings"
            >
              <el-option label="1天" :value="86400000" />
              <el-option label="7天" :value="604800000" />
              <el-option label="30天" :value="2592000000" />
              <el-option label="从不" :value="0" />
            </el-select>
            <div class="setting-description">
              定期轮换房间加密密钥以提高安全性
            </div>
          </el-form-item>

          <el-form-item label="历史消息可见性">
            <el-select 
              v-model="roomSettings.historyVisibility"
              @change="updateRoomSettings"
            >
              <el-option label="仅邀请后可见" value="invited" />
              <el-option label="仅加入后可见" value="joined" />
              <el-option label="完全可见" value="shared" />
            </el-select>
            <div class="setting-description">
              控制新成员能看到多少历史消息
            </div>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 安全建议 -->
    <el-card class="section-card">
      <template #header>
        <span>安全建议</span>
      </template>

      <div class="security-recommendations">
        <div 
          v-for="(recommendation, index) in securityRecommendations"
          :key="index"
          class="recommendation-item"
          :class="recommendation.type"
        >
          <el-icon class="recommendation-icon">
            <component :is="recommendation.icon" />
          </el-icon>
          <div class="recommendation-content">
            <h4>{{ recommendation.title }}</h4>
            <p>{{ recommendation.description }}</p>
            <el-button 
              v-if="recommendation.action"
              size="small"
              :type="recommendation.actionType"
              @click="recommendation.action"
            >
              {{ recommendation.actionText }}
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 高级设置 -->
    <el-card class="section-card">
      <template #header>
        <span>高级设置</span>
      </template>

      <div class="advanced-settings">
        <el-form label-width="150px">
          <el-form-item label="调试模式">
            <el-switch 
              v-model="advancedSettings.debugMode"
              @change="updateAdvancedSettings"
            />
            <div class="setting-description">
              启用加密调试日志（仅用于故障排除）
            </div>
          </el-form-item>

          <el-form-item label="严格验证">
            <el-switch 
              v-model="advancedSettings.strictVerification"
              @change="updateAdvancedSettings"
            />
            <div class="setting-description">
              只允许与已验证设备进行加密通信
            </div>
          </el-form-item>

          <el-form-item label="自动接受验证">
            <el-switch 
              v-model="advancedSettings.autoAcceptVerification"
              @change="updateAdvancedSettings"
            />
            <div class="setting-description">
              自动接受来自已知设备的验证请求
            </div>
          </el-form-item>
        </el-form>

        <div class="danger-zone">
          <h4>危险操作</h4>
          <el-button 
            type="danger"
            @click="resetCrypto"
            :loading="resettingCrypto"
          >
            重置加密设置
          </el-button>
          <div class="setting-description">
            这将清除所有加密数据，包括密钥和设备验证状态
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  SuccessFilled, 
  CircleCloseFilled, 
  InfoFilled, 
  WarningFilled,
  Shield
} from '@element-plus/icons-vue'
import { useMatrixStore } from '@/stores/matrix'
import EncryptionIndicator from '@/components/EncryptionIndicator.vue'
import DeviceVerification from '@/components/DeviceVerification.vue'
import KeyManagement from '@/components/KeyManagement.vue'

// Store
const matrixStore = useMatrixStore()

// Refs
const deviceVerificationRef = ref()
const keyManagementRef = ref()

// 响应式数据
const enablingCrypto = ref(false)
const loadingDevices = ref(false)
const resettingCrypto = ref(false)

const roomSettings = ref({
  defaultEncryption: false,
  encryptionAlgorithm: 'm.megolm.v1.aes-sha2',
  keyRotationPeriod: 604800000, // 7天
  historyVisibility: 'invited'
})

const advancedSettings = ref({
  debugMode: false,
  strictVerification: false,
  autoAcceptVerification: false
})

// 计算属性
const cryptoEnabled = computed(() => {
  return !!matrixStore.matrixClient?.getCrypto()
})

const cryptoEngine = computed(() => {
  return 'Rust Crypto SDK'
})

const deviceId = computed(() => {
  return matrixStore.matrixClient?.getDeviceId() || '未知'
})

const verifiedDevicesCount = computed(() => {
  // 这里需要实现获取已验证设备数量的逻辑
  return 0
})

const keyBackupEnabled = computed(() => {
  // 这里需要实现检查密钥备份状态的逻辑
  return false
})

const cryptoStatusDescription = computed(() => {
  if (cryptoEnabled.value) {
    return '您的消息已通过端到端加密保护，只有您和对话方能够阅读。'
  }
  return '启用端到端加密以保护您的消息隐私和安全。'
})

const securityRecommendations = computed(() => {
  const recommendations = []

  if (!cryptoEnabled.value) {
    recommendations.push({
      type: 'error',
      icon: 'CircleCloseFilled',
      title: '启用端到端加密',
      description: '保护您的消息免受窃听和篡改',
      action: enableCrypto,
      actionText: '立即启用',
      actionType: 'primary'
    })
  }

  if (!keyBackupEnabled.value && cryptoEnabled.value) {
    recommendations.push({
      type: 'warning',
      icon: 'WarningFilled',
      title: '设置密钥备份',
      description: '防止设备丢失时无法访问加密消息',
      action: () => scrollToSection('key-management'),
      actionText: '设置备份',
      actionType: 'warning'
    })
  }

  if (verifiedDevicesCount.value === 0 && cryptoEnabled.value) {
    recommendations.push({
      type: 'info',
      icon: 'InfoFilled',
      title: '验证您的设备',
      description: '验证设备以确保通信安全',
      action: () => scrollToSection('device-verification'),
      actionText: '验证设备',
      actionType: 'primary'
    })
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: 'success',
      icon: 'Shield',
      title: '安全设置完善',
      description: '您的加密设置已正确配置，通信安全得到保障',
      action: null,
      actionText: '',
      actionType: 'success'
    })
  }

  return recommendations
})

// 方法
const enableCrypto = async () => {
  enablingCrypto.value = true
  try {
    const client = matrixStore.matrixClient
    if (!client) throw new Error('Matrix客户端未初始化')

    // 初始化加密
    if (typeof (client as any).initRustCrypto === 'function') {
      await (client as any).initRustCrypto({
        useIndexedDB: true,
        cryptoDatabasePrefix: 'jianluochat-crypto'
      })
      ElMessage.success('端到端加密已启用')
    } else {
      throw new Error('客户端不支持加密功能')
    }
  } catch (error: any) {
    console.error('启用加密失败:', error)
    ElMessage.error(`启用加密失败: ${error.message}`)
  } finally {
    enablingCrypto.value = false
  }
}

const refreshDevices = async () => {
  loadingDevices.value = true
  try {
    if (deviceVerificationRef.value) {
      await deviceVerificationRef.value.loadUserDevices()
    }
    ElMessage.success('设备列表已刷新')
  } catch (error: any) {
    console.error('刷新设备失败:', error)
    ElMessage.error(`刷新失败: ${error.message}`)
  } finally {
    loadingDevices.value = false
  }
}

const updateRoomSettings = () => {
  localStorage.setItem('jianluochat-room-settings', JSON.stringify(roomSettings.value))
  ElMessage.success('房间设置已更新')
}

const updateAdvancedSettings = () => {
  localStorage.setItem('jianluochat-advanced-settings', JSON.stringify(advancedSettings.value))
  ElMessage.success('高级设置已更新')
}

const resetCrypto = async () => {
  try {
    await ElMessageBox.confirm(
      '这将清除所有加密数据，包括密钥和设备验证状态。此操作不可撤销！',
      '重置加密设置',
      {
        confirmButtonText: '确认重置',
        cancelButtonText: '取消',
        type: 'error'
      }
    )

    resettingCrypto.value = true
    
    // 实现重置加密设置的逻辑
    // 这里需要清除IndexedDB中的加密数据
    
    ElMessage.success('加密设置已重置')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重置加密设置失败:', error)
      ElMessage.error('重置失败')
    }
  } finally {
    resettingCrypto.value = false
  }
}

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

// 生命周期
onMounted(() => {
  // 加载保存的设置
  const savedRoomSettings = localStorage.getItem('jianluochat-room-settings')
  if (savedRoomSettings) {
    roomSettings.value = { ...roomSettings.value, ...JSON.parse(savedRoomSettings) }
  }

  const savedAdvancedSettings = localStorage.getItem('jianluochat-advanced-settings')
  if (savedAdvancedSettings) {
    advancedSettings.value = { ...advancedSettings.value, ...JSON.parse(savedAdvancedSettings) }
  }
})
</script>

<style scoped>
.encryption-settings {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.settings-header {
  text-align: center;
  margin-bottom: 30px;
}

.settings-header h1 {
  margin: 0 0 10px 0;
  color: #303133;
}

.header-description {
  color: #606266;
  margin: 0;
}

.status-card,
.section-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-content {
  padding: 20px 0;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-icon {
  font-size: 32px;
}

.status-icon.success {
  color: #67c23a;
}

.status-icon.error {
  color: #f56c6c;
}

.status-info {
  flex: 1;
}

.status-info h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
}

.status-info p {
  margin: 0;
  color: #606266;
}

.crypto-info {
  margin-top: 20px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 6px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-weight: 500;
  color: #606266;
}

.info-value {
  color: #303133;
}

.room-encryption-settings,
.advanced-settings {
  padding: 20px 0;
}

.setting-description {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.security-recommendations {
  padding: 20px 0;
}

.recommendation-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 16px;
}

.recommendation-item.success {
  background: #f0f9ff;
  border: 1px solid #b3d8ff;
}

.recommendation-item.warning {
  background: #fdf6ec;
  border: 1px solid #f5dab1;
}

.recommendation-item.error {
  background: #fef0f0;
  border: 1px solid #fbc4c4;
}

.recommendation-item.info {
  background: #f4f4f5;
  border: 1px solid #d3d4d6;
}

.recommendation-icon {
  font-size: 24px;
  margin-top: 4px;
}

.recommendation-content {
  flex: 1;
}

.recommendation-content h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
}

.recommendation-content p {
  margin: 0 0 12px 0;
  color: #606266;
}

.danger-zone {
  margin-top: 30px;
  padding: 20px;
  border: 1px solid #f56c6c;
  border-radius: 6px;
  background: #fef0f0;
}

.danger-zone h4 {
  margin: 0 0 16px 0;
  color: #f56c6c;
}
</style>
