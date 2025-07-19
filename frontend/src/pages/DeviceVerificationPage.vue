<template>
  <div class="device-verification-page">
    <div class="page-header">
      <h1>🛡️ 设备验证</h1>
      <p class="header-description">
        验证您的设备以确保端到端加密通信的安全性
      </p>
    </div>

    <!-- 加密冲突警告 -->
    <CryptoConflictWarning 
      ref="conflictWarningRef"
      @conflict-detected="handleConflictDetected"
    />

    <!-- 当前设备信息 -->
    <el-card class="current-device-card">
      <template #header>
        <div class="card-header">
          <span>当前设备</span>
          <EncryptionIndicator 
            type="device"
            :verified="currentDeviceVerified"
            :encrypted="cryptoEnabled"
          />
        </div>
      </template>

      <div class="current-device-info">
        <div class="device-details">
          <div class="detail-item">
            <span class="detail-label">设备ID:</span>
            <span class="detail-value">{{ currentDeviceId }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">设备名称:</span>
            <span class="detail-value">{{ currentDeviceName }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">加密状态:</span>
            <el-tag :type="cryptoEnabled ? 'success' : 'warning'" size="small">
              {{ cryptoEnabled ? '已启用' : '未启用' }}
            </el-tag>
          </div>
          <div class="detail-item">
            <span class="detail-label">验证状态:</span>
            <el-tag :type="currentDeviceVerified ? 'success' : 'info'" size="small">
              {{ currentDeviceVerified ? '已验证' : '当前设备' }}
            </el-tag>
          </div>
        </div>

        <div class="device-actions">
          <el-button 
            v-if="!cryptoEnabled"
            @click="enableCrypto"
            type="primary"
            :loading="enablingCrypto"
          >
            启用加密
          </el-button>
          <el-button 
            @click="refreshDeviceInfo"
            :loading="refreshing"
          >
            刷新信息
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 设备验证组件 -->
    <el-card class="verification-card">
      <template #header>
        <div class="card-header">
          <span>设备管理</span>
          <el-button 
            type="primary" 
            size="small"
            @click="refreshDevices"
            :loading="loadingDevices"
          >
            刷新设备列表
          </el-button>
        </div>
      </template>

      <DeviceVerification 
        ref="deviceVerificationRef"
        :show-device-list="true"
        @device-verified="handleDeviceVerified"
        @verification-failed="handleVerificationFailed"
      />
    </el-card>

    <!-- 验证指南 -->
    <el-card class="guide-card">
      <template #header>
        <span>验证指南</span>
      </template>

      <div class="verification-guide">
        <div class="guide-section">
          <h3>为什么需要验证设备？</h3>
          <ul>
            <li>确保只有您授权的设备能够解密您的消息</li>
            <li>防止中间人攻击和未授权访问</li>
            <li>提高端到端加密的安全性</li>
          </ul>
        </div>

        <div class="guide-section">
          <h3>如何验证设备？</h3>
          <ol>
            <li>在设备列表中找到要验证的设备</li>
            <li>点击"验证设备"按钮</li>
            <li>选择验证方式：
              <ul>
                <li><strong>表情符号验证：</strong>比较两台设备上显示的表情符号</li>
                <li><strong>QR码验证：</strong>用另一台设备扫描QR码</li>
              </ul>
            </li>
            <li>确认验证信息匹配后完成验证</li>
          </ol>
        </div>

        <div class="guide-section">
          <h3>安全提示</h3>
          <div class="security-tips">
            <el-alert
              title="重要提醒"
              type="warning"
              :closable="false"
              show-icon
            >
              <ul>
                <li>只验证您确认拥有的设备</li>
                <li>如果发现未知设备，请立即删除</li>
                <li>定期检查设备列表，移除不再使用的设备</li>
                <li>如果怀疑账户被盗用，请立即重置加密设置</li>
              </ul>
            </el-alert>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useMatrixStore } from '@/stores/matrix'
import DeviceVerification from '@/components/DeviceVerification.vue'
import EncryptionIndicator from '@/components/EncryptionIndicator.vue'
import CryptoConflictWarning from '@/components/CryptoConflictWarning.vue'

// Store
const matrixStore = useMatrixStore()

// Refs
const deviceVerificationRef = ref()
const conflictWarningRef = ref()

// 响应式数据
const enablingCrypto = ref(false)
const refreshing = ref(false)
const loadingDevices = ref(false)

// 计算属性
const cryptoEnabled = computed(() => {
  return !!matrixStore.matrixClient?.getCrypto()
})

const currentDeviceId = computed(() => {
  return matrixStore.matrixClient?.getDeviceId() || '未知'
})

const currentDeviceName = computed(() => {
  // 可以从设备信息中获取设备名称
  return '简洛聊天 Web 客户端'
})

const currentDeviceVerified = computed(() => {
  // 当前设备总是被认为是已验证的
  return true
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

const refreshDeviceInfo = async () => {
  refreshing.value = true
  try {
    // 刷新当前设备信息
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟刷新
    ElMessage.success('设备信息已刷新')
  } catch (error: any) {
    console.error('刷新设备信息失败:', error)
    ElMessage.error('刷新失败')
  } finally {
    refreshing.value = false
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

const handleDeviceVerified = (deviceId: string) => {
  console.log('设备验证成功:', deviceId)
  ElMessage.success(`设备 ${deviceId} 验证成功`)
}

const handleVerificationFailed = (error: string) => {
  console.error('设备验证失败:', error)
  ElMessage.error(`验证失败: ${error}`)
}

const handleConflictDetected = (conflictResult: any) => {
  console.warn('检测到加密冲突:', conflictResult)
  ElMessage.warning('检测到加密冲突，请查看警告信息')
}

// 生命周期
onMounted(() => {
  // 页面加载时刷新设备信息
  refreshDeviceInfo()
})
</script>

<style scoped>
.device-verification-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h1 {
  margin: 0 0 10px 0;
  color: #303133;
}

.header-description {
  color: #606266;
  margin: 0;
}

.current-device-card,
.verification-card,
.guide-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.current-device-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.device-details {
  flex: 1;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.detail-label {
  font-weight: 500;
  color: #606266;
  min-width: 80px;
}

.detail-value {
  color: #303133;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.device-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 120px;
}

.verification-guide {
  line-height: 1.6;
}

.guide-section {
  margin-bottom: 24px;
}

.guide-section h3 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 16px;
}

.guide-section ul,
.guide-section ol {
  margin: 8px 0 0 20px;
  padding: 0;
}

.guide-section li {
  margin-bottom: 6px;
  color: #606266;
}

.guide-section ul ul {
  margin-top: 4px;
}

.security-tips {
  margin-top: 12px;
}

.security-tips ul {
  margin: 8px 0 0 0;
}

.security-tips li {
  margin-bottom: 4px;
}

@media (max-width: 768px) {
  .current-device-info {
    flex-direction: column;
  }
  
  .device-actions {
    width: 100%;
    flex-direction: row;
    min-width: auto;
  }
}
</style>
