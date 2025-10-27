<template>
  <div class="key-import-manager">
    <div class="key-import-header">
      <h3>导入加密密钥</h3>
      <p>从JSON备份文件导入房间加密密钥以解密历史消息</p>
    </div>

    <div class="key-import-content">
      <!-- 文件上传区域 -->
      <div class="upload-section">
        <input
          type="file"
          accept=".json"
          @change="handleFileUpload"
          ref="fileInput"
          class="file-input"
        />
        <button @click="$refs.fileInput?.click()" class="upload-button">
          {{ selectedFile ? '重新选择文件' : '选择密钥备份文件' }}
        </button>
        
        <div v-if="selectedFile" class="file-info">
          <span class="file-name">{{ selectedFile.name }}</span>
          <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
          <button @click="clearFile" class="clear-button">清除</button>
        </div>
      </div>

      <!-- 导入控制 -->
      <div class="import-controls">
        <div class="options">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              v-model="importOptions.validateKeys"
              true-value="true"
              false-value="false"
            />
            <span>验证密钥格式</span>
          </label>
        </div>
        
        <button 
          @click="startImport"
          :disabled="!selectedFile || isImporting"
          class="import-button"
        >
          {{ isImporting ? '正在导入...' : '开始导入密钥' }}
        </button>
      </div>

      <!-- 进度显示 -->
      <div v-if="showProgress" class="progress-section">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: progress.progress + '%' }"
          ></div>
        </div>
        <div class="progress-text">
          {{ progress.message }}
        </div>
      </div>

      <!-- 结果显示 -->
      <div v-if="importResult" class="result-section">
        <div 
          class="result-message"
          :class="importResult.success ? 'success' : 'error'"
        >
          {{ importResult.success ? '导入成功！' : '导入失败！' }}
        </div>
        <div v-if="importResult.success" class="result-details">
          <p>成功导入 {{ importResult.importedKeys }} 个密钥</p>
          <p>总密钥数: {{ importResult.totalKeys }}</p>
        </div>
        <div v-else class="error-details">
          <p>错误: {{ importResult.error }}</p>
          <div v-if="importResult.errorDetails">详情: {{ importResult.errorDetails }}</div>
        </div>
        <button @click="resetImport" class="reset-button">重新开始</button>
      </div>

      <!-- 提示信息 -->
      <div class="info-section">
        <div class="info-box">
          <h4>使用说明</h4>
          <ul>
            <li>导出的密钥文件通常以 .json 格式保存</li>
            <li>确保文件包含有效的房间密钥</li>
            <li>导入后可能需要重新同步以解密历史消息</li>
            <li>建议在稳定的网络环境下进行操作</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { KeyImportManager, KeyImportOptions, KeyImportProgress } from '../utils/key-import-manager'

// 文件状态
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

// 导入选项
const importOptions = reactive<KeyImportOptions>({
  validateKeys: true
})

// 进度状态
const progress = ref<KeyImportProgress>({
  progress: 0,
  status: 'pending',
  message: '等待开始导入',
  importedKeys: 0,
  totalKeys: 0
})

// 导入状态
const isImporting = ref(false)
const showProgress = ref(false)
const importResult = ref<any>(null)

// 文件处理
const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
  }
}

const clearFile = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return 'Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 导入处理
const startImport = async () => {
  if (!selectedFile.value) return

  try {
    isImporting.value = true
    showProgress.value = true
    importResult.value = null

    // 重置进度
    progress.value = {
      progress: 0,
      status: 'pending',
      message: '正在解析备份文件...',
      importedKeys: 0,
      totalKeys: 0
    }

    // 读取文件内容
    const fileContent = await selectedFile.value.text()
    
    // 创建导入管理器实例
    const keyImportManager = KeyImportManager.getInstance()
    
    // 设置进度回调
    const options: KeyImportOptions = {
      ...importOptions,
      progressCallback: (progressUpdate: KeyImportProgress) => {
        progress.value = progressUpdate
        showProgress.value = true
      }
    }

    // 执行导入
    const result = await keyImportManager.importRoomKeysFromJson(fileContent, options)
    importResult.value = result

    if (result.success) {
      progress.value = {
        progress: 100,
        status: 'completed',
        message: `成功导入 ${result.importedKeys} 个密钥`,
        importedKeys: result.importedKey
        totalKeys: result.totalKeys
      }
    }

  } catch (error: any) {
    console.error('密钥导入失败:', error)
    importResult.value = {
      success: false,
      importedKeys: 0,
      totalKeys: 0,
      error: error.message
    }
    progress.value = {
      progress: 0,
      status: 'failed',
      message: error.message,
      importedKeys: 0,
      totalKeys: 0
    }
  } finally {
    isImporting.value = false
  }
}

// 重置导入
const resetImport = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value = ''
  }
  importResult.value = null
  showProgress.value = false
  progress.value = {
    progress: 0,
    status: 'pending',
    message: '等待开始导入',
    importedKeys: 0,
    total: 0
  }
}
</script>

<style scoped>
.key-import-manager {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.key-import-header {
  margin-bottom: 20px;
}

.key-import-header h3 {
  margin: 0 0 8px 0;
  color: #333;
}

.key-import-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.upload-section {
  margin-bottom: 20px;
}

.file-input {
  display: none;
}

.upload-button {
  display: inline-block;
  padding: 10px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.upload-button:hover {
  background: #0056b3;
}

.file-info {
  margin-top: 10px;
  padding: 10px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-name {
  flex: 1;
  font-family: monospace;
  font-size: 12px;
  color: #666;
}

.file-size {
  color: #999;
  font-size: 12px;
}

.clear-button {
  background: #dc3522;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 12px;
  cursor: pointer;
}

.clear-button:hover {
  background: #c82333;
}

.import-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

.import-button {
  padding: 10px 20px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.import-button:disabled {
  background: #6c71;
  cursor: not-allowed;
}

.import-button:hover:not(:disabled) {
  background: #218838;
}

.progress-section {
  margin: 20px 0;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #28a745;
  transition: width 0.3s ease;
}

.progress-text {
  margin-top: 8px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.result-section {
  margin: 20px 0;
  padding: 16px;
  border-radius: 4px;
}

.result-message {
  font-weight: bold;
  margin-bottom: 10px;
}

.result-message.success {
  color: #28a745;
}

.result-message.error {
  color: #dc3522;
}

.result-details,
.error-details {
  margin-bottom: 10px;
  font-size: 14px;
  color: #666;
}

.reset-button {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.reset-button:hover {
  background: #0056b3;
}

.info-section {
  margin-top: 20px;
  padding: 15px;
  background: white;
  border-radius: 4px;
  border-left: 4px solid #0070ff;
}

.info-box h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.info-box ul {
  margin: 0;
  padding-left: 20px;
}

.info-box li {
  margin-bottom: 5px;
  color: #666;
}
</style>
</content>
<line_count>280</line_count>
</script>
</style>
</content>
</script>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>
</content>
</style>