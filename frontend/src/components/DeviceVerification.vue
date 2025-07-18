<template>
  <div class="device-verification">
    <!-- 设备验证对话框 -->
    <el-dialog
      v-model="showVerificationDialog"
      title="设备验证"
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div v-if="verificationState === 'waiting'">
        <div class="verification-waiting">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <p>等待对方接受验证请求...</p>
          <p class="text-sm text-gray-500">请在另一台设备上确认验证请求</p>
        </div>
      </div>

      <div v-else-if="verificationState === 'sas'">
        <div class="sas-verification">
          <h3>短认证字符串 (SAS) 验证</h3>
          <p class="mb-4">请确认以下表情符号在两台设备上是否相同：</p>
          
          <div class="sas-emojis">
            <div 
              v-for="(emoji, index) in sasEmojis" 
              :key="index"
              class="emoji-item"
            >
              <span class="emoji">{{ emoji.emoji }}</span>
              <span class="emoji-name">{{ emoji.name }}</span>
            </div>
          </div>

          <div class="verification-actions">
            <el-button @click="confirmSasMatch" type="primary">
              ✅ 表情符号匹配
            </el-button>
            <el-button @click="cancelVerification" type="danger">
              ❌ 表情符号不匹配
            </el-button>
          </div>
        </div>
      </div>

      <div v-else-if="verificationState === 'qr'">
        <div class="qr-verification">
          <h3>QR码验证</h3>
          <div class="qr-code-container">
            <canvas ref="qrCanvas" class="qr-code"></canvas>
          </div>
          <p class="text-sm text-gray-500 mt-2">
            请使用另一台设备扫描此QR码
          </p>
          
          <div class="verification-actions">
            <el-button @click="switchToSas" type="default">
              切换到表情符号验证
            </el-button>
            <el-button @click="cancelVerification" type="danger">
              取消验证
            </el-button>
          </div>
        </div>
      </div>

      <div v-else-if="verificationState === 'success'">
        <div class="verification-success">
          <el-icon class="success-icon"><SuccessFilled /></el-icon>
          <h3>验证成功！</h3>
          <p>设备已成功验证，现在可以安全地进行端到端加密通信。</p>
        </div>
      </div>

      <div v-else-if="verificationState === 'failed'">
        <div class="verification-failed">
          <el-icon class="error-icon"><CircleCloseFilled /></el-icon>
          <h3>验证失败</h3>
          <p>{{ verificationError }}</p>
          <el-button @click="retryVerification" type="primary">
            重试验证
          </el-button>
        </div>
      </div>

      <template #footer v-if="verificationState === 'success' || verificationState === 'failed'">
        <el-button @click="closeVerificationDialog">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 设备列表 -->
    <div class="device-list" v-if="showDeviceList">
      <h3>我的设备</h3>
      <div class="devices">
        <div 
          v-for="device in userDevices" 
          :key="device.deviceId"
          class="device-item"
          :class="{ 'current-device': device.isCurrentDevice }"
        >
          <div class="device-info">
            <div class="device-name">{{ device.displayName || device.deviceId }}</div>
            <div class="device-id">{{ device.deviceId }}</div>
            <div class="device-status">
              <el-tag 
                :type="device.verified ? 'success' : 'warning'"
                size="small"
              >
                {{ device.verified ? '已验证' : '未验证' }}
              </el-tag>
              <el-tag v-if="device.isCurrentDevice" type="info" size="small">
                当前设备
              </el-tag>
            </div>
          </div>
          <div class="device-actions">
            <el-button 
              v-if="!device.verified && !device.isCurrentDevice"
              @click="startDeviceVerification(device)"
              size="small"
              type="primary"
            >
              验证设备
            </el-button>
            <el-button 
              v-if="device.verified"
              @click="showDeviceDetails(device)"
              size="small"
              type="default"
            >
              查看详情
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading, SuccessFilled, CircleCloseFilled } from '@element-plus/icons-vue'
import { useMatrixStore } from '@/stores/matrix'

// Props
interface Props {
  showDeviceList?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showDeviceList: true
})

// Store
const matrixStore = useMatrixStore()

// 响应式数据
const showVerificationDialog = ref(false)
const verificationState = ref<'waiting' | 'sas' | 'qr' | 'success' | 'failed'>('waiting')
const verificationError = ref('')
const currentVerificationRequest = ref<any>(null)
const sasEmojis = ref<Array<{ emoji: string; name: string }>>([])
const userDevices = ref<Array<{
  deviceId: string
  displayName?: string
  verified: boolean
  isCurrentDevice: boolean
  lastSeen?: number
}>>([])

// QR码相关
const qrCanvas = ref<HTMLCanvasElement>()

// 方法
const loadUserDevices = async () => {
  try {
    const client = matrixStore.matrixClient
    if (!client) return

    const crypto = client.getCrypto()
    if (!crypto) return

    const userId = client.getUserId()
    if (!userId) return

    // 获取用户的所有设备
    const devices = await crypto.getUserDevices(userId)
    const currentDeviceId = client.getDeviceId()

    userDevices.value = Array.from(devices.values()).map(device => ({
      deviceId: device.deviceId,
      displayName: device.displayName,
      verified: device.verified,
      isCurrentDevice: device.deviceId === currentDeviceId,
      lastSeen: device.lastSeen
    }))
  } catch (error) {
    console.error('加载设备列表失败:', error)
    ElMessage.error('加载设备列表失败')
  }
}

const startDeviceVerification = async (device: any) => {
  try {
    const client = matrixStore.matrixClient
    if (!client) throw new Error('Matrix客户端未初始化')

    const crypto = client.getCrypto()
    if (!crypto) throw new Error('加密功能不可用')

    const userId = client.getUserId()
    if (!userId) throw new Error('用户ID不可用')

    // 开始设备验证
    const verificationRequest = await crypto.requestDeviceVerification(userId, device.deviceId)
    currentVerificationRequest.value = verificationRequest

    // 监听验证事件
    verificationRequest.on('change', handleVerificationChange)

    showVerificationDialog.value = true
    verificationState.value = 'waiting'

    ElMessage.info('验证请求已发送，请在目标设备上确认')
  } catch (error: any) {
    console.error('启动设备验证失败:', error)
    ElMessage.error(`启动设备验证失败: ${error.message}`)
  }
}

const handleVerificationChange = () => {
  const request = currentVerificationRequest.value
  if (!request) return

  if (request.phase === 'started') {
    // 验证已开始，检查可用的方法
    const verifier = request.verifier
    if (verifier) {
      if (verifier.getShowSasCallbacks) {
        // SAS验证
        verificationState.value = 'sas'
        const sasCallbacks = verifier.getShowSasCallbacks()
        if (sasCallbacks) {
          sasEmojis.value = sasCallbacks.sas.emoji || []
        }
      } else if (verifier.getShowQrCodeCallbacks) {
        // QR码验证
        verificationState.value = 'qr'
        nextTick(() => {
          generateQRCode()
        })
      }
    }
  } else if (request.phase === 'done') {
    verificationState.value = 'success'
    loadUserDevices() // 重新加载设备列表
  } else if (request.phase === 'cancelled') {
    verificationState.value = 'failed'
    verificationError.value = '验证被取消'
  }
}

const confirmSasMatch = async () => {
  try {
    const request = currentVerificationRequest.value
    if (request && request.verifier) {
      await request.verifier.verify()
    }
  } catch (error: any) {
    console.error('确认SAS匹配失败:', error)
    verificationState.value = 'failed'
    verificationError.value = error.message
  }
}

const cancelVerification = async () => {
  try {
    const request = currentVerificationRequest.value
    if (request) {
      await request.cancel()
    }
    closeVerificationDialog()
  } catch (error) {
    console.error('取消验证失败:', error)
  }
}

const switchToSas = () => {
  verificationState.value = 'sas'
}

const generateQRCode = () => {
  // QR码生成逻辑
  // 这里需要实现QR码生成，可以使用qrcode库
  console.log('生成QR码')
}

const retryVerification = () => {
  verificationState.value = 'waiting'
  verificationError.value = ''
}

const closeVerificationDialog = () => {
  showVerificationDialog.value = false
  currentVerificationRequest.value = null
  verificationState.value = 'waiting'
  verificationError.value = ''
  sasEmojis.value = []
}

const showDeviceDetails = (device: any) => {
  ElMessage.info(`设备详情: ${device.displayName || device.deviceId}`)
}

// 生命周期
onMounted(() => {
  if (props.showDeviceList) {
    loadUserDevices()
  }
})

// 暴露方法给父组件
defineExpose({
  loadUserDevices,
  startDeviceVerification
})
</script>

<style scoped>
.device-verification {
  padding: 20px;
}

.verification-waiting {
  text-align: center;
  padding: 40px 20px;
}

.loading-icon {
  font-size: 48px;
  color: #409eff;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.sas-verification {
  text-align: center;
}

.sas-emojis {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 20px 0;
  flex-wrap: wrap;
}

.emoji-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  min-width: 80px;
}

.emoji {
  font-size: 32px;
  margin-bottom: 8px;
}

.emoji-name {
  font-size: 12px;
  color: #606266;
}

.qr-verification {
  text-align: center;
}

.qr-code-container {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.qr-code {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.verification-success,
.verification-failed {
  text-align: center;
  padding: 40px 20px;
}

.success-icon {
  font-size: 48px;
  color: #67c23a;
  margin-bottom: 20px;
}

.error-icon {
  font-size: 48px;
  color: #f56c6c;
  margin-bottom: 20px;
}

.verification-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.device-list {
  margin-top: 20px;
}

.devices {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.device-item {
  display: flex;
  justify-content: between;
  align-items: center;
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fafafa;
}

.device-item.current-device {
  border-color: #409eff;
  background: #ecf5ff;
}

.device-info {
  flex: 1;
}

.device-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.device-id {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.device-status {
  display: flex;
  gap: 8px;
}

.device-actions {
  display: flex;
  gap: 8px;
}
</style>
