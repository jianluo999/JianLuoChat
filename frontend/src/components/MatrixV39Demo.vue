<template>
  <div class="matrix-v39-demo">
    <el-card class="demo-card">
      <template #header>
        <div class="card-header">
          <span>Matrix JS SDK v39.0.0 功能演示</span>
          <el-tag :type="connectionStatus.type">{{ connectionStatus.text }}</el-tag>
        </div>
      </template>

      <!-- 连接状态 -->
      <el-row :gutter="20" class="status-row">
        <el-col :span="8">
          <el-statistic title="同步状态" :value="syncStatus" />
        </el-col>
        <el-col :span="8">
          <el-statistic title="房间数量" :value="totalRooms" />
        </el-col>
        <el-col :span="8">
          <el-statistic title="未读消息" :value="totalUnread" />
        </el-col>
      </el-row>

      <!-- 功能演示区域 -->
      <el-tabs v-model="activeTab" class="demo-tabs">
        <!-- 基础功能 -->
        <el-tab-pane label="基础功能" name="basic">
          <div class="demo-section">
            <h3>登录测试</h3>
            <el-form :model="loginForm" inline>
              <el-form-item label="用户名">
                <el-input v-model="loginForm.username" placeholder="输入用户名" />
              </el-form-item>
              <el-form-item label="密码">
                <el-input v-model="loginForm.password" type="password" placeholder="输入密码" />
              </el-form-item>
              <el-form-item>
                <el-button 
                  type="primary" 
                  @click="testLogin"
                  :loading="loading"
                >
                  登录测试
                </el-button>
              </el-form-item>
            </el-form>

            <h3>房间管理</h3>
            <el-space>
              <el-button @click="fetchRooms" :loading="loading">刷新房间列表</el-button>
              <el-button @click="showCreateRoomDialog = true">创建房间</el-button>
              <el-button @click="showJoinRoomDialog = true">加入房间</el-button>
            </el-space>
          </div>
        </el-tab-pane>

        <!-- 消息功能 -->
        <el-tab-pane label="消息功能" name="messages">
          <div class="demo-section">
            <h3>发送消息</h3>
            <el-form :model="messageForm" inline>
              <el-form-item label="房间ID">
                <el-select v-model="messageForm.roomId" placeholder="选择房间">
                  <el-option
                    v-for="room in availableRooms"
                    :key="room.id"
                    :label="room.name"
                    :value="room.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="消息内容">
                <el-input v-model="messageForm.content" placeholder="输入消息" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="sendMessage" :loading="loading">
                  发送消息
                </el-button>
              </el-form-item>
            </el-form>

            <h3>文件上传</h3>
            <el-upload
              :before-upload="handleFileUpload"
              :show-file-list="false"
              action="#"
            >
              <el-button type="success">上传文件</el-button>
            </el-upload>
          </div>
        </el-tab-pane>

        <!-- 高级功能 -->
        <el-tab-pane label="高级功能" name="advanced">
          <div class="demo-section">
            <h3>加密功能</h3>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="加密状态">
                <el-tag :type="cryptoStatus.ready ? 'success' : 'danger'">
                  {{ cryptoStatus.ready ? '已启用' : '未启用' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="交叉签名">
                <el-tag :type="cryptoStatus.crossSigningReady ? 'success' : 'warning'">
                  {{ cryptoStatus.crossSigningReady ? '已设置' : '未设置' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="密钥备份">
                <el-tag :type="cryptoStatus.keyBackupEnabled ? 'success' : 'warning'">
                  {{ cryptoStatus.keyBackupEnabled ? '已启用' : '未启用' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="设备验证">
                <el-tag :type="cryptoStatus.deviceVerified ? 'success' : 'warning'">
                  {{ cryptoStatus.deviceVerified ? '已验证' : '未验证' }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>

            <el-space class="crypto-actions">
              <el-button @click="setupCrossSigning">设置交叉签名</el-button>
              <el-button @click="setupKeyBackup">设置密钥备份</el-button>
            </el-space>

            <h3>线程功能</h3>
            <el-form :model="threadForm" inline>
              <el-form-item label="根消息ID">
                <el-input v-model="threadForm.rootEventId" placeholder="输入根消息ID" />
              </el-form-item>
              <el-form-item label="回复内容">
                <el-input v-model="threadForm.content" placeholder="输入回复内容" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="sendThreadReply" :loading="loading">
                  发送线程回复
                </el-button>
              </el-form-item>
            </el-form>

            <h3>空间管理</h3>
            <el-form :model="spaceForm" inline>
              <el-form-item label="空间名称">
                <el-input v-model="spaceForm.name" placeholder="输入空间名称" />
              </el-form-item>
              <el-form-item label="空间描述">
                <el-input v-model="spaceForm.topic" placeholder="输入空间描述" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="createSpace" :loading="loading">
                  创建空间
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 性能监控 -->
        <el-tab-pane label="性能监控" name="performance">
          <div class="demo-section">
            <h3>性能指标</h3>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="同步耗时">
                {{ performanceMetrics.syncDuration }}ms
              </el-descriptions-item>
              <el-descriptions-item label="消息处理时间">
                {{ performanceMetrics.messageProcessingTime }}ms
              </el-descriptions-item>
              <el-descriptions-item label="加密时间">
                {{ performanceMetrics.encryptionTime }}ms
              </el-descriptions-item>
              <el-descriptions-item label="解密时间">
                {{ performanceMetrics.decryptionTime }}ms
              </el-descriptions-item>
              <el-descriptions-item label="内存使用">
                {{ formatBytes(performanceMetrics.memoryUsage) }}
              </el-descriptions-item>
              <el-descriptions-item label="网络延迟">
                {{ performanceMetrics.networkLatency }}ms
              </el-descriptions-item>
            </el-descriptions>

            <el-button @click="refreshMetrics" class="refresh-btn">刷新指标</el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 创建房间对话框 -->
    <el-dialog v-model="showCreateRoomDialog" title="创建房间" width="500px">
      <el-form :model="createRoomForm" label-width="100px">
        <el-form-item label="房间名称">
          <el-input v-model="createRoomForm.name" placeholder="输入房间名称" />
        </el-form-item>
        <el-form-item label="房间主题">
          <el-input v-model="createRoomForm.topic" placeholder="输入房间主题" />
        </el-form-item>
        <el-form-item label="房间类型">
          <el-radio-group v-model="createRoomForm.isPublic">
            <el-radio :label="false">私有房间</el-radio>
            <el-radio :label="true">公开房间</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="启用加密">
          <el-switch v-model="createRoomForm.encrypted" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateRoomDialog = false">取消</el-button>
        <el-button type="primary" @click="createRoom" :loading="loading">创建</el-button>
      </template>
    </el-dialog>

    <!-- 加入房间对话框 -->
    <el-dialog v-model="showJoinRoomDialog" title="加入房间" width="400px">
      <el-form :model="joinRoomForm" label-width="100px">
        <el-form-item label="房间地址">
          <el-input 
            v-model="joinRoomForm.roomIdOrAlias" 
            placeholder="输入房间ID或别名，如：#room:matrix.org"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showJoinRoomDialog = false">取消</el-button>
        <el-button type="primary" @click="joinRoom" :loading="loading">加入</el-button>
      </template>
    </el-dialog>

    <!-- 日志显示 -->
    <el-card class="log-card" v-if="logs.length > 0">
      <template #header>
        <div class="card-header">
          <span>操作日志</span>
          <el-button size="small" @click="clearLogs">清空日志</el-button>
        </div>
      </template>
      <div class="log-content">
        <div 
          v-for="(log, index) in logs" 
          :key="index" 
          :class="['log-item', `log-${log.type}`]"
        >
          <span class="log-time">{{ formatTime(log.timestamp) }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useMatrixV39Store } from '@/stores/matrix-v39-clean'

// Store
const matrixStore = useMatrixV39Store()

// 响应式数据
const activeTab = ref('basic')
const loading = ref(false)
const logs = ref<Array<{type: string, message: string, timestamp: number}>>([])

// 表单数据
const loginForm = ref({
  username: '',
  password: ''
})

const messageForm = ref({
  roomId: '',
  content: ''
})

const threadForm = ref({
  rootEventId: '',
  content: ''
})

const spaceForm = ref({
  name: '',
  topic: ''
})

const createRoomForm = ref({
  name: '',
  topic: '',
  isPublic: false,
  encrypted: true
})

const joinRoomForm = ref({
  roomIdOrAlias: ''
})

// 对话框状态
const showCreateRoomDialog = ref(false)
const showJoinRoomDialog = ref(false)

// 计算属性
const connectionStatus = computed(() => {
  if (matrixStore.isConnected) {
    return { type: 'success', text: '已连接' }
  } else if (matrixStore.loading) {
    return { type: 'warning', text: '连接中' }
  } else {
    return { type: 'danger', text: '未连接' }
  }
})

const syncStatus = computed(() => {
  const state = matrixStore.connection.syncState.state
  const stateMap: Record<string, string> = {
    'STOPPED': '已停止',
    'SYNCING': '同步中',
    'PREPARED': '已准备',
    'CATCHUP': '追赶中',
    'ERROR': '错误'
  }
  return stateMap[state] || state
})

const totalRooms = computed(() => 
  matrixStore.rooms.length + matrixStore.spaces.length + matrixStore.directMessages.length
)

const totalUnread = computed(() => matrixStore.totalUnreadCount)

const availableRooms = computed(() => [
  ...matrixStore.rooms,
  ...matrixStore.directMessages
])

const cryptoStatus = computed(() => matrixStore.cryptoStatus)
const performanceMetrics = computed(() => matrixStore.getPerformanceMetrics())

// 方法
const addLog = (type: string, message: string) => {
  logs.value.unshift({
    type,
    message,
    timestamp: Date.now()
  })
  
  // 限制日志数量
  if (logs.value.length > 50) {
    logs.value = logs.value.slice(0, 50)
  }
}

const testLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    ElMessage.error('请输入用户名和密码')
    return
  }

  loading.value = true
  addLog('info', `尝试登录: ${loginForm.value.username}`)

  try {
    const result = await matrixStore.matrixLogin(
      loginForm.value.username,
      loginForm.value.password
    )

    if (result.success) {
      ElMessage.success('登录成功')
      addLog('success', `登录成功: ${result.user?.displayName}`)
    } else {
      ElMessage.error(result.error || '登录失败')
      addLog('error', `登录失败: ${result.error}`)
    }
  } catch (error: any) {
    ElMessage.error(error.message || '登录异常')
    addLog('error', `登录异常: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const fetchRooms = async () => {
  loading.value = true
  addLog('info', '刷新房间列表')

  try {
    await matrixStore.fetchMatrixRooms()
    ElMessage.success('房间列表刷新成功')
    addLog('success', `房间列表刷新成功，共 ${totalRooms.value} 个房间`)
  } catch (error: any) {
    ElMessage.error(error.message || '刷新房间列表失败')
    addLog('error', `刷新房间列表失败: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const sendMessage = async () => {
  if (!messageForm.value.roomId || !messageForm.value.content) {
    ElMessage.error('请选择房间并输入消息内容')
    return
  }

  loading.value = true
  addLog('info', `发送消息到房间: ${messageForm.value.roomId}`)

  try {
    await matrixStore.sendMatrixMessage(
      messageForm.value.roomId,
      messageForm.value.content
    )
    ElMessage.success('消息发送成功')
    addLog('success', '消息发送成功')
    messageForm.value.content = ''
  } catch (error: any) {
    ElMessage.error(error.message || '消息发送失败')
    addLog('error', `消息发送失败: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const handleFileUpload = async (file: File) => {
  if (!messageForm.value.roomId) {
    ElMessage.error('请先选择房间')
    return false
  }

  loading.value = true
  addLog('info', `上传文件: ${file.name}`)

  try {
    await matrixStore.sendFileMessage(messageForm.value.roomId, file)
    ElMessage.success('文件上传成功')
    addLog('success', `文件上传成功: ${file.name}`)
  } catch (error: any) {
    ElMessage.error(error.message || '文件上传失败')
    addLog('error', `文件上传失败: ${error.message}`)
  } finally {
    loading.value = false
  }

  return false // 阻止默认上传行为
}

const setupCrossSigning = async () => {
  try {
    const { value: password } = await ElMessageBox.prompt(
      '设置交叉签名需要验证密码',
      '密码验证',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputType: 'password'
      }
    )

    loading.value = true
    addLog('info', '设置交叉签名')

    const result = await matrixStore.setupCrossSigning(password)
    if (result) {
      ElMessage.success('交叉签名设置成功')
      addLog('success', '交叉签名设置成功')
    } else {
      ElMessage.error('交叉签名设置失败')
      addLog('error', '交叉签名设置失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '交叉签名设置异常')
      addLog('error', `交叉签名设置异常: ${error.message}`)
    }
  } finally {
    loading.value = false
  }
}

const setupKeyBackup = async () => {
  loading.value = true
  addLog('info', '设置密钥备份')

  try {
    const result = await matrixStore.setupKeyBackup()
    if (result) {
      ElMessage.success('密钥备份设置成功')
      addLog('success', '密钥备份设置成功')
    } else {
      ElMessage.error('密钥备份设置失败')
      addLog('error', '密钥备份设置失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '密钥备份设置异常')
    addLog('error', `密钥备份设置异常: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const sendThreadReply = async () => {
  if (!messageForm.value.roomId || !threadForm.value.rootEventId || !threadForm.value.content) {
    ElMessage.error('请填写完整的线程回复信息')
    return
  }

  loading.value = true
  addLog('info', `发送线程回复: ${threadForm.value.rootEventId}`)

  try {
    await matrixStore.sendThreadReply(
      messageForm.value.roomId,
      threadForm.value.rootEventId,
      threadForm.value.content
    )
    ElMessage.success('线程回复发送成功')
    addLog('success', '线程回复发送成功')
    threadForm.value.content = ''
  } catch (error: any) {
    ElMessage.error(error.message || '线程回复发送失败')
    addLog('error', `线程回复发送失败: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const createSpace = async () => {
  if (!spaceForm.value.name) {
    ElMessage.error('请输入空间名称')
    return
  }

  loading.value = true
  addLog('info', `创建空间: ${spaceForm.value.name}`)

  try {
    await matrixStore.createSpace(
      spaceForm.value.name,
      spaceForm.value.topic,
      false
    )
    ElMessage.success('空间创建成功')
    addLog('success', `空间创建成功: ${spaceForm.value.name}`)
    spaceForm.value.name = ''
    spaceForm.value.topic = ''
  } catch (error: any) {
    ElMessage.error(error.message || '空间创建失败')
    addLog('error', `空间创建失败: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const createRoom = async () => {
  if (!createRoomForm.value.name) {
    ElMessage.error('请输入房间名称')
    return
  }

  loading.value = true
  addLog('info', `创建房间: ${createRoomForm.value.name}`)

  try {
    await matrixStore.createRoom({
      name: createRoomForm.value.name,
      topic: createRoomForm.value.topic,
      isPublic: createRoomForm.value.isPublic,
      encrypted: createRoomForm.value.encrypted
    })
    ElMessage.success('房间创建成功')
    addLog('success', `房间创建成功: ${createRoomForm.value.name}`)
    showCreateRoomDialog.value = false
    createRoomForm.value = {
      name: '',
      topic: '',
      isPublic: false,
      encrypted: true
    }
  } catch (error: any) {
    ElMessage.error(error.message || '房间创建失败')
    addLog('error', `房间创建失败: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const joinRoom = async () => {
  if (!joinRoomForm.value.roomIdOrAlias) {
    ElMessage.error('请输入房间地址')
    return
  }

  loading.value = true
  addLog('info', `加入房间: ${joinRoomForm.value.roomIdOrAlias}`)

  try {
    await matrixStore.joinRoom(joinRoomForm.value.roomIdOrAlias)
    ElMessage.success('房间加入成功')
    addLog('success', `房间加入成功: ${joinRoomForm.value.roomIdOrAlias}`)
    showJoinRoomDialog.value = false
    joinRoomForm.value.roomIdOrAlias = ''
  } catch (error: any) {
    ElMessage.error(error.message || '房间加入失败')
    addLog('error', `房间加入失败: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const refreshMetrics = () => {
  addLog('info', '刷新性能指标')
  // 性能指标会自动更新
}

const clearLogs = () => {
  logs.value = []
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString()
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 生命周期
onMounted(async () => {
  addLog('info', 'Matrix V39 演示组件已加载')
  
  // 尝试初始化 Matrix
  try {
    const initialized = await matrixStore.initializeMatrix()
    if (initialized) {
      addLog('success', 'Matrix 初始化成功')
    } else {
      addLog('info', 'Matrix 未初始化，请先登录')
    }
  } catch (error: any) {
    addLog('error', `Matrix 初始化失败: ${error.message}`)
  }
})

onUnmounted(() => {
  addLog('info', 'Matrix V39 演示组件已卸载')
})
</script>

<style scoped>
.matrix-v39-demo {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-row {
  margin-bottom: 20px;
}

.demo-tabs {
  margin-top: 20px;
}

.demo-section {
  padding: 20px 0;
}

.demo-section h3 {
  margin: 20px 0 10px 0;
  color: #409eff;
}

.crypto-actions {
  margin-top: 15px;
}

.refresh-btn {
  margin-top: 15px;
}

.log-card {
  margin-top: 20px;
}

.log-content {
  max-height: 300px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.log-item {
  display: flex;
  margin-bottom: 5px;
  padding: 5px;
  border-radius: 3px;
}

.log-time {
  color: #909399;
  margin-right: 10px;
  min-width: 80px;
}

.log-message {
  flex: 1;
}

.log-success {
  background-color: #f0f9ff;
  color: #67c23a;
}

.log-error {
  background-color: #fef0f0;
  color: #f56c6c;
}

.log-warning {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.log-info {
  background-color: #f4f4f5;
  color: #909399;
}
</style>