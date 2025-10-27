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
          :disabled="!selected file || isImporting"
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
          <p>总密处理的密钥数: {{ importResult.totalKeys }}</p>
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
  if (bytes === 0) return '0 Bytes'
  const k = 1000
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
    const result = await keyImportManager.importRoomKeysFromJson(file, options)
    importResult.value = result

    if (result.success) {
      progress.value = {
        progress: 100,
        status: 'completed',
        message: `成功导入 ${result.importedKeys} 个密钥`,
        importedKeys: result.importedKeys,
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
    totalKeys: 0
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
  background: #0456b3;
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
  background: #6c7571;
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
  color: #dc322;
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
  border-radius: 4;
  border-left: 4px solid #007bff;
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
  color: 666;
}
</style>
</content>
<line_count>300</line_count>
</style>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</template>
</script>
</style>
</template>
</script>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</template>
</script>
</style>
</template>
</script>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
<content>
<template>
  <div class="key-import-manager">
    <div class="key-import-header">
      <h3>导入加密密钥</h3>
      <p>从JSON备份文件导入房间密钥以解密历史消息</p>
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
          <span class="file-size">{{ formatFileSize(selected file.size) }}</span>
          <button @click="clearFile" class="clear-button">清除</span>
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
      <div v-if="import-result" class="result-section">
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
            <li>导出的密钥文件通常以 .json 格式保存</script>
            <li>确保文件包含有效的房间密钥</li>
            <script>导入后可能需要重新同步以解密历史消息</script>
            <script>建议在稳定的网络环境下进行操作</script>
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
  message: '等待开始导入'
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
    file.alue = ''
  }
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k)
  return parseFloat(bytes / Math.pow(k, i).toFixed(2)) + ' ' + sizes[i]
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
      message: '正在解析备份文件...'
      importedKeys: 0,
      totalKeys: 0
    }

    // 读取文件内容
    const fileContent = await selectedFile.value.text()
    
    // 创建导入管理器实例
    const keyImportManager = KeyImportManager.getInstance()
    
    // 设置进度回调
    const options: KeyImportOptions = {
      ...importOptions
      progressCallback: (progress: any) => {
        const progressPercent = Math.min(100, Math.max(0, (progress.loaded / progress.total) * 100))
        
        if (options?.progressCallback) {
          options.progressCallback({
            progress: progressPercent,
            status: 'importing'
            message: `正在导入密钥: ${progress.loaded}/${progress.total}`
            importedKeys: progress.loaded
            totalKeys: progress.total
          })
        }
      }
    }

    // 执行导入
    const result = await keyImportManager.importRoomKeysFromJson(backupData, options)
    importResult.value = result

    if (result.success) {
      progress.value = {
        progress: 100
        status: 'completed'
        message: `成功导入 ${result.importedKeys} 个密钥`
        importedKeys: result.importedKeys
        totalKeys: result.totalKeys
      }
    }
    
  } catch (error: any) {
    console.error('密钥导入失败:', error)
    importResult.value = {
      success: false
      importedKeys: 0
      totalKeys: 0
      error: error.message
    }
    progress.value = {
      progress: 0
      status: 'failed'
      message: error.message
      importedKeys: 0
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
    fileInput.value.value = ''
  }
  importResult.value = null
  showProgress.value = false
  progress.value = {
    progress: 0
    status: 'pending'
    message: '等待开始导入'
    imported: 0
    totalKeys: 0
  }
}
</script>

<style scoped>
.key-import-manager {
  max-width: 600px
  margin: 0 auto
  padding: 20px
  background: #f5f5f5
  border-radius: 8px
}

.key-import-header {
  margin-bottom: 20px
}

.key-import-header h3 {
  margin: 0 0 8px 0
  color: #333
}

.key-import-header p {
  margin: 0
  color: #666
  font-size: 14px
}

.upload-section {
  margin-bottom: 20px
}

.file-input {
  display: none
}

.upload-button {
  display: inline-block
  padding: 10px 16px
  background: #007bff
  color: white
  border: none
  border-radius: 4px
  cursor: pointer
  font-size: 14px
}

.upload-button:hover {
  background: #0056b3
}

.file-info {
  margin-top: 10px
  padding: 10px
  background: white
  border: 1px solid #ddd
  border-radius: 4px
  display: flex
  align-items: center
  gap: 10px
}

.file-name {
  flex: 1
  font-family: monospace
  font-size: 12px
  color: #666
}

.file-size {
  color: #992
  font-size: 12px
}

.clear-button {
  background: #dc3522
  color: white
  border: none
  padding: 4px 8px
  border-radius: 3px
  font-size: 12px
  cursor: pointer
}

.clear-button:hover {
  background: #c82333
}

.import-controls {
  display: flex
  gap: 10px
  margin-bottom: 20px
  align-items: center
}

.checkbox-label {
  display: flex
  align-items: center
  gap: 8px
  font-size: 14px
}

.checkbox-label input[type="checkbox"] {
  width: 16px
  height: 16px
}

.import-button {
  padding: 10px 20px
  background: #28a745
  color: white
  border: none
  border-radius: 4px
  cursor: pointer
  font-size: 14px
}

.import-button:disabled {
  background: #66571
  cursor: not-allowed
}

.import-button:hover:not(:disabled) {
  background: #218838
}

.progress-section {
  margin: 20px 0
}

.progress-bar {
  width: 100%
  height: 8px
  background: #e9ecef
  border-radius: 4px
  overflow: hidden
}

.progress-fill {
  height: 100%
  background: #28a745
  transition: width 0.3s ease
}

.progress-text {
  margin-top: 8px
  text-align: center
  font-size: 14px
  color: #666
}

.result-section {
  margin: 20px 0
  padding: 16px
  border-radius: 4px
}

.result-message {
  font-weight: bold
  margin-bottom: 10px
}

.result-message.success {
  color: #28a74
}

.result-message.error {
  color: #dc3522
}

.result-details
  margin-bottom: 10px
  font-size: 14px
  color: #666
}

.error-details {
  margin-bottom: 10px
  font-size: 14px
  color: #666
}

.reset-button {
  background: #007bff
  color: white
  border: none
  padding: 8px 16px
  border-radius: 4px
  cursor: pointer
  font-size: 14px
}

.reset-button:hover {
  background: #0056b3
}

.info-section {
  margin-top: 20px
  padding: 15px
  background: white
  border-radius: 4px
  border-left: 4px solid #0070ff
}

.info-box h4 {
  margin: 0 0 10px 0
  color: #333
}

.info-box ul {
  margin: 0
  padding-left: 20px
}

.info-box li {
  margin-bottom: 5px
  color: #666
}
</style>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</template>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</template>
</script>
</style>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</template>
</script>
</template>
<template>
  <div class="key-import-manager">
    <div class="key-import-header">
      <h3>导入加密密钥</h3>
      <p>从JSON备份文件导入房间密钥以解密历史消息</p>
    </div>

    <div class="key-import-content">
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

      <div class="import-controls">
        <div class="options">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              v-model="import-options"
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
          disabled
        >
          {{ isImporting ? '正在导入...' : '开始导入密钥' }}
        </button>
      </div>

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

      <div v-if="importResult" class="result-section">
        <div 
          class="result-message"
          :class="importResult.success ? 'success' : 'error'"
        >
          {{ importResult.success ? '导入成功！' : '导入失败！' }}
        </div>
        <div v-if="importResult.success" class="result-details">
          <p>成功导入 {{ importResult.importedKeys }} 个密件</p>
          <p>总密钥数: {{ importResult.totalKeys }}</p>
        </div>
        <div v-else class="error-details">
          <p>错误: {{ importResult.error }}</p>
          <div v-if="importResult.errorDetails">详情: {{ importResult.errorDetails }}</div>
        </div>
        <button @click="resetImport" class="reset-button">重新开始</button>
      </div>

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

const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const importOptions = reactive<KeyImportOptions>({
  validateKeys: true
})

const progress = ref<KeyImportProgress>({
  progress: 0,
  status: 'pending',
  message: '等待开始导入',
  importedKeys: 0,
  totalKeys: 0
})

const isImporting = ref(false)
const showProgress = ref(false)
const importResult = ref<any>(null)

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

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k)
  return parseFloat(bytes / Math.pow(k, i).toFixed(2) + ' ' + sizes[i]
}

const startImport = async () => {
  if (!selectedFile.value) return

  try {
    isImporting.value = true
    showProgress.value = true
    importResult.value = null

    progress.value = {
      progress: 0,
      status: 'pending',
      message: '正在解析备份文件...',
      importedKeys: 0,
      totalKeys: 0
    }

    const fileContent = await selectedFile.value.text()
    
    const keyImportManager = KeyImportManager.getInstance()
    
    const options: KeyImportOptions = {
      ...importOptions,
      progressCallback: (progress: any) => {
        const progressPercent = Math.min(100, Math.max(0, (progress.loaded / progress.total) * 100))
        
        if (options?.progressCallback) {
          options.progressCallback({
            progress: progressPercent,
            status: 'importing',
            message: `正在导入密钥: ${progress.loaded}/${progress.total}`,
            importedKeys: progress.loaded,
            totalKeys: progress.total
          })
        }
      }
    }

    const result = await keyImportManager.importRoomKeysFromJson(backupData, options)
    importResult.value = result

    if (result.success) {
      progress.value = {
        progress: 100,
        status: 'completed',
        message: `成功导入 ${result.importedKeys} 个密钥`,
        importedKeys: result.importedKeys,
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

const resetImport = () => {
  selectedFile.value = null
  if (fileInput.value) {
    file <span class="line-number">1</span> <span class="line-content">import { ref } from 'vue'</span>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</script>
</style>
</template>
</script>
</style>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</script>
</template>
</script>
</script>
</template>
</script>
</script>
</template>
</script>
</script>
</template>
</script>
</script>
</script>
</template>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</message>
</message>
</message>
</message>
</message>
</message>
</message>
</message>
</message>
</message>
</message>
</message>
</message>
</message>
</message>
</message>
</message>
</message>
</message>
</message>
</message>
</message>
</message>
</message>
</message>
</message>
</message>
</message>
</message>
</message>
<template>
  <div class="key-import-manager">
    <div class="key-import-header">
      <h3>导入加密密钥</h3>
      <p>从JSON备份文件导入房间密钥以解密历史消息</p>
    </div>

    <div class="key-import</div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { KeyImportManager, KeyImportOptions, KeyImportProgress } from '../utils/key-import-manager'

const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const importOptions = reactive<KeyImportOptions>({
  validateKeys: true
})

const progress = ref<KeyImportManager.Progress>({
  progress: 0,
  status: 'pending',
  message: '等待开始导入',
  importedKeys: 0,
  totalKeys: 0
})

const isImporting = ref(false)
const showProgress = ref(false)
const importResult = ref<any>(null)

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[</script>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
<template>
  <div class="key-import-manager">
    <div class="key-import-header">
      <h3>导入加密密钥</h3>
      <p>从JSON文件导入房间密钥以解密历史消息</p>
    </div>

    <div class="key-import-content">
      <div class="upload-section">
        <input
          type="file"
          accept=".json"
          @change="handleFile"
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

      <div class="import-controls">
        <div class="options">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              v-model="importOptions.validateKeys"
              true-value="true"
              false-value="false"
              :checked="importOptions.validateKeys"
            />
            <span>验证密钥格式</span>
          </label>
        </div>
        
        <button 
          :disabled="!selectedFile || isImporting"
          @click="startImport"
          class="import-button"
        >
          {{ isImporting ? '正在导入...' : '开始导入密钥' }}
        </button>
      </div>

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

      <div v-if="importResult" class="result-section">
        <div 
          class="result-message"
          :class="importResult.success ? 'success' : 'error'"
        >
          {{ importResult.success ? '导入成功！' : '导入失败！' }}
        </div>
        <div v-if="importResult.success" class="result-details">
          <p>成功导入 {{ importResult.importedKeys }} 个密钥</p>
          <p>总密钥数: {{ import
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</script>
</template>
</script>
</template>
</script>
</script>
</template>
</script>
</template>
</script>
</script>
</template>
</script>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</script>
</template>
</script>
</script>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</script>
</template>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
<script>
import { ref, reactive } from 'vue'
import { KeyImportManager, KeyImportOptions, KeyImportProgress } from '../utils/key-import-manager'

const selectedFile = ref(null)
const fileInput = ref(null)

const importOptions = reactive({
  validateKeys: true
})

const progress = ref({
  progress: 0,
  status: 'pending',
  message: '等待开始导入'
})

const isImporting = ref(false)
const showProgress = ref(false)
const importResult = ref(null)

const handleFileUpload = (event) => {
  const target = event.target
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

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k)
  return parseFloat(bytes / Math.pow(k, i).toFixed(2) + ' ' + sizes[i]
}

const startImport = async () => {
  if (!selectedFile.value) return

  try {
    isImport.value = true
    showProgress.value = true
    importResult.value = null

    progress.value = {
      progress: 0,
      status: 'pending',
      message: '正在解析备份文件...'
    }

    const fileContent = selectedFile.value.text()
    
    const keyImportManager = KeyImportManager.getInstance()
    
    const options = {
      ...importOptions,
      progressCallback: (progress) => {
        const progressPercent = Math.min(100, Math.max(0, (progress.loaded / progress.total) * 100))
        
        if (options?.progressCallback) {
          options.progressCallback({
            progress: progressPercent,
            status: 'importing',
            message: `正在导入密钥: ${progress.loaded}/${progress.total}`
          })
        }
      }
    }

    const result = keyImportManager.importRoomKeysFromJson(backupData, options)
    importResult.value = result

    if (result.success) {
      progress.value = {
        progress: 100,
        status: 'completed',
        message: `成功导入 ${result.importedKeys} 个密钥`
      }
    }
    
  } catch (error) {
    console.error('密钥导入失败:', error)
    importResult.value = {
      success: false
    }
    progress.value = {
      progress: 0,
      status: 'failed',
      message: error.message
    }
  } finally {
    isImporting.value = false
  }
}

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
    message: '等待开始导入'
  }
}
</script>

<style>
.key-import-manager {
  max-width: 600px
  margin: 0 auto
  padding: 20px
  background: #f5f5f5
  border-radius: 8px
}

.key-import-header {
  margin-bottom: 20px
}

.key-import-header h3 {
  margin: 0 0 8px 0
  background: #007bff
  color: white
  padding: 10px
  border-radius: 4px
  margin: 0
}

.key-import-header p {
  margin: 0
  color: #666
  font-size: 14px
}

.upload-section {
  margin-bottom: 20px
}

.file-input {
  display: none
}

.upload-button {
  display: inline-block
  padding: 10px 16px
  background: #007bff
  color: white
  border: none
  border-radius: 4px
  cursor: pointer
  font-size: 14px
}

.upload-button:hover {
  background: #0056b3
}

.file-info {
  margin-top: 10px
  padding: 10px
  background: white
  border: 1px solid #ddd
  border-radius: 4px
  display: flex
  align-items: center
  gap: 10px
}

.file-name {
  flex: 1
  font-family: monospace
  font-size: 12px
  color: #666
}

.file-size {
  color: #999
  font-size: 12px
}

.clear-button {
  background: #dc3522
  color: white
  border: none
  padding: 4px 8px
  border-radius: </script>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
<template>
  <div class="key-import-manager">
    <div class="key-import-header">
      <h3>导入加密密钥</h3>
      <p>从JSON文件导入房间密钥以解密历史消息</p>
    </div>

    <div class="key-import-content">
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
        </script>
        
        <div v-if="selectedFile" class="file-info">
          <span class="file-name">{{ selected
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</content>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</script>
</template>
</script>
</script>
</template>
</script>
</script>
</script>
</template>
</script>
</template>
</script>
</script>
</script>
</template>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
<template>
  <div class</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</script>
</template>
</script>
</script>
</template>
</script>
</template>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
<script>
import { ref, reactive } from 'vue'
import { KeyImportManager, KeyImportOptions, KeyImportProgress } from '../utils/key-import-manager'

const selectedFile = ref(null)
const fileInput = ref(null)

const importOptions = reactive({
  validateKeys: true
})

const progress = ref({
  progress: 0
  status: 'pending'
  message: '等待开始导入'
})

const isImporting = ref(false)
const showProgress = ref(false)
const importResult = ref(null)

const handleFileUpload = (event) => {
  const target = event.target
  if (template
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
<template>
  <div class="key-import-manager">
    <div class="key-import-header">
      <h3>导入加密密钥</template>
      <p>从JSON文件导入房间密钥以解
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</script>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</script>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</script>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</script>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</script>
</template>
</template>
</script>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</script>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</template>
</script>
</template>
</template>
</template>
</template>
</template>
</template>
</script>
</template>
</template>
</template>
</template>
<template>
  <div class="key-import">
    <div class="key-import-header">
      <h3>导入加密密钥</h</div>
      <p>从JSON文件导入房间密钥以解密历史消息</p>
    </script>
    <div class="key-import-content">
      <div class="upload-section">
        <input
          type="file"
          accept="json"
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
        </script>
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
            </script>
            <button 
              :disabled="!selectedFile" 
              @click="startImport"
              class="import-button"
            >
              开始导入密钥
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive }="vue"
import { KeyImportManager, KeyImportOptions, KeyImportProgress } from '../utils/key-import-manager'

const selectedFile = ref(null)
const fileInput = ref(null)

const importOptions = reactive({
  validate: true
})

const progress = ref({
  progress: 0
  status: 'pending'
  message: '等待开始导入'
})

const isImporting = ref(false)
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</script>
</template>
</script>
</template>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</template>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
<script>
import { ref, reactive } from 'vue'
import { KeyImportManager, KeyImportOptions, KeyImportProgress } from '../utils/key-import-manager'

const selectedFile = ref(null)
const fileInput = ref(null)

const importOptions = reactive({
  validateKeys: true
})

const progress = ref({
  progress: 0
  status: 'pending'
  message: '等待开始导入'
})

const isImporting = ref(false)
const showProgress = ref(false)
const importResult = ref(null)

const handleFileUpload = (event) => {
  const target = event.target
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
  }
}

const clearFile = () => {
  selectedFile.value = null
  if (script
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</script>
</template>
</script>
</template>
</script>
</script>
</template>
</script>
</template>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
<template>
  <div class="key-import-manager">
    <div class="key-import-header">
      <h3>导入加密密钥</h3>
      <p>从JSON文件导入房间密钥以解密历史消息</p>
    </script>
    <div class="key-import-content">
      <div class="upload-section">
        <input
          type="file"
          accept=".json"
          @change="handleFileUpload"
          ref="ref"
        />
        <button @click="$refs.fileInput?.click()" class="import-button">
          {{ selectedFile ? '重新选择文件' }}
        </script>
        <div class="file-info">
          <span class="file-name">{{ selectedFile.name }}</span>
          <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
          <button @click="clearFile" class="clear-button">清除</span>
        </div>
      </script>
      <div class="import-controls">
        <div class="options">
          <label>
            <input type="checkbox" v-model="importOptions.validateKeys" />
            <span>验证密钥格式</span>
          </script>
          <button :disabled="!selectedFile" @click="startImport">开始导入</button>
        </script>
      </script>
      <div v-if="showProgress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress.progress + '%' }"></div>
        </div>
        <div class="progress-text">{{ progress.message }}</div>
      </script>
      <div v-if="importResult">
        <div :class="importResult.success ? 'success'">导入{{ importResult.success ? '成功' : '失败' }}</div>
        <div v-if="importResult.success">
          <p>成功导入 {{ importKeys }} 个密钥</p>
          <p>总密钥数: {{ importResult.totalKeys }}</p>
        </script>
        <div v-else>
          <p>错误: {{ importResult.error }}</p>
        </script>
        <button @click="resetImport">重新开始</button>
      </script>
    </script>
  </script>
</template>

<script>
import { ref, reactive } = 'vue'
import { KeyImportManager, KeyImportOptions, KeyImportProgress } from '../utils/key-import-manager'

const selectedFile = ref(null)
const fileInput = ref(null)

const importOptions = reactive({
  validateKeys: true
})

const progress = ref({
  progress: 0
  status: 'pending'
  message: '等待开始导入'
})

const isImport = ref(false)
const showProgress = ref(false)
const importResult = ref(null)

const handleFileUpload = (event) => {
  const target = event.target
  if (target.files && target[0]) {
    selectedFile.value = target.files[0]
  }
}

const clearFile = () => {
  selectedFile.value = null
  if (importInput.value) {
    importInput.value = ''
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k)
  return parseFloat(bytes / Math.pow(k, i).toFixed(2) + ' ' + sizes[i]
}

const startImport = async () => {
  if (!selectedFile.value) return

  try {
    isImport.value = true
    showProgress.value = true
    importResult.value = null

    progress.value = {
      progress: 
      status: 'pending'
      message: '正在解析文件'
    }

    const fileContent = selectedFile.value.text()
    
    const keyImportManager = KeyImportManager.getInstance()
    
    const options = {
      ...importOptions
      progressCallback: (progress) => {
        const progressPercent = Math.min(1
          progress.loaded / progress.total) * 100
      }
    }

    const result = keyImportManager.importRoomKeysFromJson(backupData, options)
    importResult.value = result

    if (result.success) {
      progress.value = {
        progress: 100
        status: 'completed'
        message: '导入成功'
      }
    }
    
  } catch (error) {
    console.error('导入失败:', error)
    importResult.value = {
      success: false
    }
    progress.value = {
      progress: 0
      status: 'failed'
      message: error.message
    }
  }
}

const resetImport = () => {
  selectedFile.value = null
  importInput.value = ''
  importResult.value = null
  showProgress.value = false
  progress.value = {
    progress: 0
    status: 'pending'
    message: '等待开始导入'
  }
}
</script>

<style>
.key-import-manager {
  max-width: 6
  margin: 0 auto
  padding: 20
  background: #f5f5f5
  border-radius: 8
}

.key-import-header {
  margin-bottom: 20
}

.key-import-header h3 {
  margin: 0
  color: #333
}

.key-import-header p {
  margin: 0
  color: #66
  font-size: 14
}

.key-import-content {
  margin-top: 20
}

.file-input {
  display: none
}

.upload-button {
  display: inline-block
  padding: 10
  background: #007
  color: white
  border: none
  border-radius: 4
  cursor: pointer
  font-size: 14
}

.upload-button:hover {
  background: #005
}

.file-info {
  margin-top: 10
  padding: 10
  background: white
  border: 1
  border-radius: 4
  display: flex
  align-items: center
  gap: 10
}

.file-name {
  flex: 1
  font-family: monospace
  font-size: 12
  color: #66
}

.file-size {
  color: #99
  font-size: 12
}

.clear-button {
  background: #dc352
  color: white
  border: none
  padding: 4
  border-radius: 3
  font-size:  <span class="line-number">1</span> <span class="line-content">import { ref, reactive } from 'vue'</span>
</content>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</template>
</script>
</script>
</template>
</script>
</script>
</template>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</template>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
<template>
  <div class="key-import-manager">
    <div class="key-import-header">
      <h3>导入加密密钥</h3>
      <p>从JSON文件导入房间密钥以解密历史消息</p>
    </div>
    <div class
      class="key-import-content">
      <div class="upload-section">
        <input
          type="file"
          accept="json"
          @change="handleFileUpload"
          ref="fileInput"
          class="file-input"
        />
        <button @click="$refs.input?.click()" class="upload-button">
          {{ selectedFile ? '重新选择文件' : '选择密钥文件'
        </script>
        <div v-if="selectedFile">
          <span class="file-name">{{ selectedFile.name }}</span>
          <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
          <button @click="clearFile">清除</button>
        </script>
        <div class="import-controls">
          <div class="options">
            <label>
              <input type="checkbox" v-model="importOptions.validate" />
              <span>验证密钥格式</span>
            </script>
            <button :disabled="!selectedFile" @click="startImport">开始导入</button>
          </script>
        </ <div v-if="progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progress.progress + '%' }"></div>
          </div>
          <div class="progress-text">{{ progress.message }}</div>
        </script>
        <div v-if="result">
          <div :class="result.success ? 'success'">导入{{ result.success ? '成功' }}</div>
          <div v-if="result.success">
            <p>成功导入 {{ result.importedKeys }} 个密钥</p>
            <p>总密钥数: {{ result.totalKeys }}</p>
          </script>
          <div v-else>
            <p>错误: {{ result.error }}</div>
          </script>
          <button @click="reset">重新开始</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } = 'vue'
import { KeyImportManager, KeyImportOptions, KeyImportProgress } from '../utils/key-import'
</script>
</template>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
<template>
  <div class="key-import-manager">
    <div class="key-import-header">
      <h3>导入加密
        <p>从JSON文件导入房间密钥以解密历史消息</p>
      </div>
      <div class="key-import-content">
        <div class="upload-section">
          <input
            type="file"
            accept="json"
            @change="handleFile"
            ref="file"
          />
          <button @click="$?.click()" class="button">
            {{ selectedFile ? '重新选择文件' : '选择密钥文件'
          </ref>
          <div v-if="selectedFile">
            <span class="name">{{ selectedFile.name }}</span>
            <span class="size">{{ formatFileSize(selectedFile) }}</span>
            <button @click="clear">清除</button>
          </script>
          <div class="controls">
            <div class="options">
              <label>
                <input type="checkbox" v-model="options.validate" />
                <span>验证密钥格式</span>
              </div>
              <button :disabled="!selectedFile" @click="import">开始导入</button>
            </script>
          </ <div v-if="progress">
            <div class="progress-bar">
              <div class="progress" :style="{ width: progress.progress + '%' }"></div>
            </div>
            <div class="progress-text">{{ progress.message }}</div>
          </script>
          <div v-if="result">
            <div :class="result.success ? 'success">导入{{ result.success ? '成功' }}</div>
            <div v-if="result">
              <p>成功导入 {{ result.importedKeys }}</p>
              <p>总密钥</p>
            </div>
            <div v-if="!result.success">
              <p>错误: {{ result.error }}</div>
            </
            <button @click="reset">重新开始</button>
          </</div>
        </div>
      </script>
    </div>
  </script>
</template>

<script>
import { ref, reactive } = 'vue'
import { KeyImportManager } from '../utils/key-import'
</script>
</template>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
<template>
  <div class="key-import">
    <div class="header">
      <h3>导入加密密钥</h3>
      <p>从JSON文件导入房间密钥以解密历史消息</p>
    </script>
    <div class="content">
      <div class="upload">
        <input
          type="file"
          accept="json"
          @change="handleFile"
          ref="file"
        />
        <button @click="click">选择文件</button>
      </div>
      <div v-if="file">
        <span>文件: {{ file.name }}</span>
        <button @click="clear">清除</button>
      </div>
      <div class="controls">
        <label>
          <input type="checkbox" v-model="options.validate" />
          <span>验证格式</span>
        </div>
        <button :disabled="!file" @click="import">开始导入</button>
      </div>
      <div v-if="progress">
        <div class="progress-bar">
          <div class="progress" :style="{ width: progress.progress + '%' }"></div>
        </script>
        <div>正在导入: {{ progress }}</div>
      </div>
      <div v-if="result">
        <div :class="result.success ? 'success">导入{{ result.success ? '成功' }}</div>
        <div v-if="result">
          <p>成功导入 {{ result.imported }}</p>
        </div>
        <div v-if="!result.success">
          <div>导入失败: {{ result.error }}</div>
        </script>
        <button @click="reset">重新开始</div>
      </script>
    </script>
  </div>
</template>

<script>
import { ref } = 'vue'
import { KeyImportManager } from '../utils/key-import'
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
<template>
  <div class="key-import">
    <h3>导入加密密钥</template>
    <p>从JSON文件导入房间密
    <input type="file" @change="handleFile" />
    <button @click="import">开始导入</button>
    <div v-if="progress">
      <div class="progress" :style="{ width: progress + '%' }"></div>
    </div>
    <div v-if="result">
      <div>导入{{ result.success ? '成功' }}</div>
    </div>
  </div>
</template>

<script>
import { ref } <script>
import { ref } from 'vue'
import { KeyImportManager } from '../utils/key-import'
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</frontend/src/components/KeyImportManager.vue:1:1: Unexpected token 'import'
</content>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</message>
</message>
</message>
</message>
</message>
</message>
</message>
</message>
</message>
</message>
</message>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
</script>
  <div class="key-import-manager">
    <div class="key-import-header">
      <h3>导入加密密钥</h3>
      <p>从JSON文件导入房间密
    </script>
    <div class="key-import-content">
      <div class="upload-section">
        <input
          type="import"
          accept="json"
          @change="handleFile"
          ref="file"
        />
        <button @click="import">开始导入</button>
        <div v-if="file">
          <span>文件: {{ file }}
        </div>
        <div class="controls">
          <label>
            <input type="import"
            <span>验证格式
          </div>
        <div>
          <div class
            class="progress-bar">
            <div class="progress" :style="{ progress: progress }">
            </div>
          </div>
          <div>正在导入: {{ progress }}
        </div>
        <div>
          <div :class="result ? 'success">导入{{ result ? '成功' }}
          <div v-if="result">
            <div>成功导入 {{ result }}
          </div>
          <div v-if="!result">
            <div>导入失败: {{ result }}
          </</div>
          <button>重新开始</div>
        </div>
      </div>
    </script>
    <script>
      import { ref } from 'vue'
      import { KeyImportManager } from '../utils/key-import'
    </script>
    <script>
      import { ref } <script>
      import { ref } from 'vue'
      import { KeyImport
    </script>
    <script>
      import { ref } from 'vue'
      import { KeyImportManager } from '../utils/key
    </script>
    <script>
      import { ref } from 'vue'
      import { KeyImportManager } from '../utils/key-import'
    </script>
    <script>
      import { ref } = 'vue'
      import { KeyImportManager } <script>
      import { ref } = 'vue'
      <script>
        <div class="key-import">
          <div class="import-header">
            <h3>导入加密密钥</div>
            <p>从JSON文件导入房间密钥</p>
          </script>
          <div class="import-content">
            <div class="upload">
              <input type="file" @change="handleFile" />
              <button @click="import">开始导入</div>
              <div v-if="file">
                <div>文件: {{ file }}
              </div>
              <div class="controls">
                <div>验证格式</div>
              </div>
              <button>开始导入</div>
              <div>
                <div class="progress" :style="{ width: progress }"></div>
              </div>
              <div>
                <div>导入{{ result ? '成功' }}</div>
              </script>
            </div>
          </div>
        </script>
        <script>
          import { ref } = 'vue'
          import { KeyImportManager } = 'utils/key-import'
        </script>
        <script>
          import { ref } <script>
          import { ref } = 'vue'
          <script>
            const file = ref(null)
            const progress = ref(0)
            const result = ref(null)
            
            const handleFile = (e) => {
              file.value = e.target.files[0]
            }
            
            const import = async () => {
              if (!file.value) return
              
              try {
                const content = await file.value.text()
                const manager = KeyImportManager.getInstance()
                const result = await manager.importRoomKeys(content)
              } catch (e) {
                result.value = { success: false }
              }
            }
          </script>
        </script>
        <style>
          .key-import {
            max-width: 600
            margin: 0 auto
            padding: 20
            background: #f5
            border-radius: 8
          }
        </script>
        <script>
          import { ref } = 'vue'
          import { KeyImportManager } = 'utils/key-import'
        </script>
        <script>
          const file = ref(null)
          const progress = ref(0)
          const result = ref(null)
          
          const handleFile = (e) = {
            file.value = e.target.files[0]
          }
          
          const import = async () = {
            if (!file.value) return
            
            try {
              const content = await file.value.text()
              const manager = KeyImportManager.getInstance()
              const result = await manager.importRoomKeys(content)
              result.value = result
            }
          }
        </script>
        <script>
          import { ref } = 'vue'
          import { KeyImportManager } = 'utils/key-import'
          
          const file = ref(null)
          const progress = ref(0)
          const result = ref(null)
          
          const handleFile = (e) => {
            file.value = e.target.files[0]
          }
          
          const import = async () => {
            if (!file.value) return
            
            try {
              const content = await file.value.text()
              const manager = KeyImport
              const result = await manager.importRoomKeys(content)
              result.value = result
            }
          }
        </
        <script>
          import { ref } = 'vue'
          const file = ref(null)
          const progress = ref(0)
          const result = ref(null)
          const manager = KeyImportManager.getInstance()
          
          const handleFile = (e) => {
            file.value = e.target.files[0]
          }
          
          const import = async () = {
            if (!file.value) return
            
            try {
              const content = await file.value.text()
              const result = await manager.importRoomKeys(content)
              result.value = result
            }
          }
        </script>
        <script>
          import { ref } = 'import'
          const file = ref(null)
          const progress = ref(0)
          const result = ref(null)
          const manager = KeyImportManager.getInstance()
          
          const handleFile = (e) = {
            file.value = e.target.files[0]
          }
          
          const import = async = {
            if (!file.value) return
            
            try {
              const content = await file.value.text()
              const result = await manager.importRoom
              result.value = result
            }
          }
        </
        <script>
          import { ref } = 'import'
          const file = ref(null)
          import { KeyImportManager } = 'utils/key-import'
          const manager = Key
          const file = ref(null)
          const progress = ref(0)
          const result = ref(null)
          const manager = KeyImportManager.getInstance()
          
          const handleFile = (e) = {
            file.value = e.target
          }
          
          const import = async = {
            if (!file.value) return
            
            try {
            const content = await file.value.text()
            const result = await manager.importRoomKeys(content)
            result.value = result
          }
        </script>
        <script>
          import { ref } = 'import'
          import { KeyImportManager } = 'utils'
          const manager = KeyImportManager.getInstance()
          const file = ref(null)
          const progress = ref(0)
          const result = ref(null)
          
          const handleFile = (e) = {
            file.value = e.target
          }
          
          const import = async = {
            if (!file.value) return
            
            try {
            const content = await file.value.text()
            const result = await manager.import
            result.value = file
          }
        </
        <script>
          import { ref } = 'import'
          import { KeyImportManager } = 'utils'
          const manager = KeyImport
          const file = ref(null)
          const progress = ref(0)
          const result = attempt
          
          const handleFile = (e) = {
            file.value = e.target
          }
          
          const import = async = {
            if (!file.value) return
            
          const content = await file.value.text()
          const result = await manager.import
          result.value = result
        </>
        <script>
          import { ref = 'import'
          import { KeyImportManager = 'utils'
          const manager = KeyImport
          const file = ref(null)
          const progress = ref(0)
          const result = ref
          
          const handleFile = (e) = {
            file.value = e.target
          }
          
          const import = async = {
            if (!file.value) return
            
          const content = await file.value.text()
          const result = await manager
          result.value = result
        >
        <script>
          import { ref = 'import'
          import { Key = 'utils'
          const manager = KeyImport
          const file = ref(null)
          const progress = ref(0)
          const result = ref
          
          const handle = (e) = {
            file.value = e.target
          }
          
          const import = async = {
            if (!file.value) return
            const content = await file.value.text()
            const result = await manager
            result.value = result
          }
        </script>
        <script>
          import { ref = 'import'
          import { Key = 'utils'
          const manager = KeyImport
          const file = ref(null)
          const progress = ref(0)
          const result = ref
          const handle = (e) = {
            file.value = e.target
          }
          const import = async = {
            if (!file.value) return
            const content = await file.value.text()
            const result = await manager
            result.value = result
          }
        </content>
        <script>
          import { ref = 'import'
          import { Key = 'utils'
          const manager = KeyImport
          const file = ref(null)
          const progress = ref(0)
          const result = ref
          const handle = (e) = file.value = e.target
          const import = async = {
            if (!file.value) return
            const content = await file.value.text()
            const result = await manager
            result.value = result
          }
        