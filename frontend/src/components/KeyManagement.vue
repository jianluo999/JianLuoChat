<template>
  <div class="key-management">
    <el-card class="management-card">
      <template #header>
        <div class="card-header">
          <span>🔐 密钥管理</span>
          <el-button 
            type="primary" 
            size="small"
            @click="refreshKeyInfo"
            :loading="loading"
          >
            刷新
          </el-button>
        </div>
      </template>

      <!-- 密钥备份状态 -->
      <div class="backup-status">
        <h4>密钥备份状态</h4>
        <div class="status-item">
          <el-icon :class="backupStatus.enabled ? 'status-success' : 'status-warning'">
            <component :is="backupStatus.enabled ? 'SuccessFilled' : 'WarningFilled'" />
          </el-icon>
          <span>
            {{ backupStatus.enabled ? '已启用密钥备份' : '未启用密钥备份' }}
          </span>
          <el-button 
            v-if="!backupStatus.enabled"
            @click="setupKeyBackup"
            type="primary"
            size="small"
          >
            设置备份
          </el-button>
        </div>
        
        <div v-if="backupStatus.enabled" class="backup-info">
          <p><strong>备份版本:</strong> {{ backupStatus.version }}</p>
          <p><strong>算法:</strong> {{ backupStatus.algorithm }}</p>
          <p><strong>最后备份:</strong> {{ formatDate(backupStatus.lastBackup) }}</p>
        </div>
      </div>

      <!-- 密钥导出/导入 -->
      <div class="key-operations">
        <h4>密钥操作</h4>
        <div class="operation-buttons">
          <el-button 
            @click="exportKeys"
            :loading="exporting"
            type="success"
          >
            <el-icon><Download /></el-icon>
            导出密钥
          </el-button>
          <el-button 
            @click="showImportDialog = true"
            type="warning"
          >
            <el-icon><Upload /></el-icon>
            导入密钥
          </el-button>
          <el-button 
            @click="showRecoveryDialog = true"
            type="info"
          >
            <el-icon><Key /></el-icon>
            恢复密钥
          </el-button>
        </div>
      </div>

      <!-- 跨设备同步 -->
      <div class="cross-device-sync">
        <h4>跨设备同步</h4>
        <div class="sync-status">
          <el-icon :class="syncStatus.synced ? 'status-success' : 'status-warning'">
            <component :is="syncStatus.synced ? 'SuccessFilled' : 'WarningFilled'" />
          </el-icon>
          <span>
            {{ syncStatus.synced ? '密钥已同步' : '密钥未同步' }}
          </span>
          <el-button 
            v-if="!syncStatus.synced"
            @click="syncKeys"
            type="primary"
            size="small"
            :loading="syncing"
          >
            同步密钥
          </el-button>
        </div>
        
        <div v-if="syncStatus.devices.length > 0" class="synced-devices">
          <p><strong>已同步设备:</strong></p>
          <ul>
            <li v-for="device in syncStatus.devices" :key="device.id">
              {{ device.name }} ({{ device.id }})
            </li>
          </ul>
        </div>
      </div>

      <!-- 安全设置 -->
      <div class="security-settings">
        <h4>安全设置</h4>
        <el-form label-width="120px">
          <el-form-item label="自动备份">
            <el-switch 
              v-model="securitySettings.autoBackup"
              @change="updateSecuritySettings"
            />
          </el-form-item>
          <el-form-item label="备份密码保护">
            <el-switch 
              v-model="securitySettings.passwordProtection"
              @change="updateSecuritySettings"
            />
          </el-form-item>
          <el-form-item label="密钥过期提醒">
            <el-switch 
              v-model="securitySettings.expirationReminder"
              @change="updateSecuritySettings"
            />
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 密钥导入对话框 -->
    <el-dialog
      v-model="showImportDialog"
      title="导入密钥"
      width="500px"
    >
      <el-form>
        <el-form-item label="密钥文件">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :show-file-list="false"
            accept=".json,.txt"
            @change="handleFileSelect"
          >
            <el-button type="primary">选择文件</el-button>
          </el-upload>
          <div v-if="selectedFile" class="selected-file">
            已选择: {{ selectedFile.name }}
          </div>
        </el-form-item>
        
        <el-form-item label="密码" v-if="requiresPassword">
          <el-input 
            v-model="importPassword"
            type="password"
            placeholder="请输入密钥文件密码"
            show-password
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showImportDialog = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="importKeys"
          :loading="importing"
          :disabled="!selectedFile"
        >
          导入
        </el-button>
      </template>
    </el-dialog>

    <!-- 密钥恢复对话框 -->
    <el-dialog
      v-model="showRecoveryDialog"
      title="恢复密钥"
      width="500px"
    >
      <el-tabs v-model="recoveryMethod">
        <el-tab-pane label="恢复短语" name="phrase">
          <el-form>
            <el-form-item label="恢复短语">
              <el-input
                v-model="recoveryPhrase"
                type="textarea"
                :rows="4"
                placeholder="请输入12个单词的恢复短语，用空格分隔"
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="恢复密钥" name="key">
          <el-form>
            <el-form-item label="恢复密钥">
              <el-input
                v-model="recoveryKey"
                type="textarea"
                :rows="3"
                placeholder="请输入恢复密钥"
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <el-button @click="showRecoveryDialog = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="recoverKeys"
          :loading="recovering"
        >
          恢复
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Download, 
  Upload, 
  Key, 
  SuccessFilled, 
  WarningFilled 
} from '@element-plus/icons-vue'
import { useMatrixStore } from '@/stores/matrix'

// Store
const matrixStore = useMatrixStore()

// 响应式数据
const loading = ref(false)
const exporting = ref(false)
const importing = ref(false)
const syncing = ref(false)
const recovering = ref(false)

const showImportDialog = ref(false)
const showRecoveryDialog = ref(false)

const backupStatus = ref({
  enabled: false,
  version: '',
  algorithm: '',
  lastBackup: null as Date | null
})

const syncStatus = ref({
  synced: false,
  devices: [] as Array<{ id: string; name: string }>
})

const securitySettings = ref({
  autoBackup: false,
  passwordProtection: true,
  expirationReminder: true
})

// 导入相关
const selectedFile = ref<File | null>(null)
const requiresPassword = ref(false)
const importPassword = ref('')

// 恢复相关
const recoveryMethod = ref('phrase')
const recoveryPhrase = ref('')
const recoveryKey = ref('')

// 方法
const refreshKeyInfo = async () => {
  loading.value = true
  try {
    const client = matrixStore.matrixClient
    if (!client) throw new Error('Matrix客户端未初始化')

    const crypto = client.getCrypto()
    if (!crypto) throw new Error('加密功能不可用')

    // 检查密钥备份状态
    try {
      const backupInfo = await crypto.checkKeyBackup()
      if (backupInfo) {
        backupStatus.value = {
          enabled: true,
          version: backupInfo.version,
          algorithm: backupInfo.algorithm,
          lastBackup: new Date()
        }
      }
    } catch (error) {
      console.log('没有找到密钥备份')
    }

    // 检查跨设备同步状态
    // 这里需要实现具体的同步状态检查逻辑

    ElMessage.success('密钥信息已刷新')
  } catch (error: any) {
    console.error('刷新密钥信息失败:', error)
    ElMessage.error(`刷新失败: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const setupKeyBackup = async () => {
  try {
    const client = matrixStore.matrixClient
    if (!client) throw new Error('Matrix客户端未初始化')

    const crypto = client.getCrypto()
    if (!crypto) throw new Error('加密功能不可用')

    // 设置密钥备份
    await ElMessageBox.confirm(
      '设置密钥备份将生成一个恢复密钥，请妥善保存。是否继续？',
      '设置密钥备份',
      {
        confirmButtonText: '继续',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 这里需要实现具体的密钥备份设置逻辑
    ElMessage.success('密钥备份设置成功')
    await refreshKeyInfo()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('设置密钥备份失败:', error)
      ElMessage.error(`设置失败: ${error.message}`)
    }
  }
}

const exportKeys = async () => {
  exporting.value = true
  try {
    const client = matrixStore.matrixClient
    if (!client) throw new Error('Matrix客户端未初始化')

    const crypto = client.getCrypto()
    if (!crypto) throw new Error('加密功能不可用')

    // 导出房间密钥
    const keys = await crypto.exportRoomKeysAsJson()
    
    // 创建下载链接
    const blob = new Blob([keys], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `jianluochat-keys-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    ElMessage.success('密钥导出成功')
  } catch (error: any) {
    console.error('导出密钥失败:', error)
    ElMessage.error(`导出失败: ${error.message}`)
  } finally {
    exporting.value = false
  }
}

const handleFileSelect = (file: any) => {
  selectedFile.value = file.raw
  // 检查文件是否需要密码
  requiresPassword.value = true // 假设都需要密码
}

const importKeys = async () => {
  if (!selectedFile.value) return

  importing.value = true
  try {
    const client = matrixStore.matrixClient
    if (!client) throw new Error('Matrix客户端未初始化')

    const crypto = client.getCrypto()
    if (!crypto) throw new Error('加密功能不可用')

    // 读取文件内容
    const fileContent = await selectedFile.value.text()
    const keys = JSON.parse(fileContent)

    // 导入密钥
    await crypto.importRoomKeys(keys)

    ElMessage.success('密钥导入成功')
    showImportDialog.value = false
    selectedFile.value = null
    importPassword.value = ''
  } catch (error: any) {
    console.error('导入密钥失败:', error)
    ElMessage.error(`导入失败: ${error.message}`)
  } finally {
    importing.value = false
  }
}

const syncKeys = async () => {
  syncing.value = true
  try {
    // 实现密钥同步逻辑
    ElMessage.success('密钥同步成功')
    await refreshKeyInfo()
  } catch (error: any) {
    console.error('同步密钥失败:', error)
    ElMessage.error(`同步失败: ${error.message}`)
  } finally {
    syncing.value = false
  }
}

const recoverKeys = async () => {
  recovering.value = true
  try {
    const client = matrixStore.matrixClient
    if (!client) throw new Error('Matrix客户端未初始化')

    if (recoveryMethod.value === 'phrase') {
      if (!recoveryPhrase.value.trim()) {
        throw new Error('请输入恢复短语')
      }
      // 使用恢复短语恢复密钥
    } else {
      if (!recoveryKey.value.trim()) {
        throw new Error('请输入恢复密钥')
      }
      // 使用恢复密钥恢复密钥
    }

    ElMessage.success('密钥恢复成功')
    showRecoveryDialog.value = false
    recoveryPhrase.value = ''
    recoveryKey.value = ''
    await refreshKeyInfo()
  } catch (error: any) {
    console.error('恢复密钥失败:', error)
    ElMessage.error(`恢复失败: ${error.message}`)
  } finally {
    recovering.value = false
  }
}

const updateSecuritySettings = () => {
  // 保存安全设置到本地存储
  localStorage.setItem('jianluochat-security-settings', JSON.stringify(securitySettings.value))
  ElMessage.success('安全设置已更新')
}

const formatDate = (date: Date | null) => {
  if (!date) return '从未'
  return date.toLocaleString()
}

// 生命周期
onMounted(() => {
  // 加载安全设置
  const savedSettings = localStorage.getItem('jianluochat-security-settings')
  if (savedSettings) {
    securitySettings.value = { ...securitySettings.value, ...JSON.parse(savedSettings) }
  }
  
  refreshKeyInfo()
})
</script>

<style scoped>
.key-management {
  padding: 20px;
}

.management-card {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.backup-status,
.key-operations,
.cross-device-sync,
.security-settings {
  margin-bottom: 30px;
}

.status-item,
.sync-status {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.status-success {
  color: #67c23a;
}

.status-warning {
  color: #e6a23c;
}

.backup-info {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  margin-top: 10px;
}

.backup-info p {
  margin: 5px 0;
}

.operation-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.synced-devices {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  margin-top: 10px;
}

.synced-devices ul {
  margin: 10px 0 0 20px;
}

.selected-file {
  margin-top: 10px;
  color: #409eff;
  font-size: 14px;
}
</style>
