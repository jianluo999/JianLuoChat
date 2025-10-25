<template>
  <div v-if="visible" class="search-dialog-overlay" @click="closeDialog">
    <div class="search-dialog" @click.stop>
      <div class="search-header">
        <h3>消息搜索</h3>
        <button @click="closeDialog" class="close-btn">×</button>
      </div>

      <div class="search-input-area">
        <div class="search-input-wrapper">
          <input
            ref="searchInput"
            v-model="searchQuery"
            @input="handleSearchInput"
            @keydown.enter="performSearch"
            placeholder="搜索消息内容..."
            class="search-input"
          />
          <button 
            @click="performSearch" 
            :disabled="!searchQuery.trim() || searching"
            class="search-btn"
          >
            <span v-if="!searching">🔍</span>
            <span v-else class="searching-spinner"></span>
          </button>
        </div>

        <div class="search-options">
          <label class="search-option">
            <input type="radio" v-model="searchScope" value="current" />
            <span>当前房间</span>
          </label>
          <label class="search-option">
            <input type="radio" v-model="searchScope" value="all" />
            <span>所有房间</span>
          </label>
        </div>
      </div>

      <div class="search-results">
        <!-- 搜索状态 -->
        <div v-if="searching" class="search-status">
          <div class="loading-spinner"></div>
          <span>搜索中...</span>
        </div>

        <!-- 搜索结果为空 -->
        <div v-else-if="searchPerformed && searchResults.length === 0" class="no-results">
          <div class="no-results-icon">🔍</div>
          <div class="no-results-text">
            <p>未找到相关消息</p>
            <p class="no-results-hint">尝试使用不同的关键词</p>
          </div>
        </div>

        <!-- 搜索结果列表 -->
        <div v-else-if="searchResults.length > 0" class="results-list">
          <div class="results-header">
            <span class="results-count">找到 {{ searchResults.length }} 条消息</span>
          </div>

          <div
            v-for="(result, index) in searchResults"
            :key="result.result.event_id"
            @click="jumpToMessage(result)"
            class="result-item"
            :class="{ 'selected': selectedIndex === index }"
          >
            <div class="result-content">
              <div class="result-header">
                <span class="result-sender">{{ getSenderName(result.result.sender) }}</span>
                <span class="result-time">{{ formatTime(result.result.origin_server_ts) }}</span>
                <span v-if="result.room_name" class="result-room">{{ result.room_name }}</span>
              </div>
              
              <div class="result-message">
                <div v-html="highlightSearchTerm(result.result.content.body)"></div>
              </div>

              <!-- 上下文消息 -->
              <div v-if="result.context" class="result-context">
                <div v-if="result.context.events_before?.length" class="context-before">
                  <div
                    v-for="event in result.context.events_before"
                    :key="event.event_id"
                    class="context-message"
                  >
                    <span class="context-sender">{{ getSenderName(event.sender) }}:</span>
                    <span class="context-content">{{ event.content.body }}</span>
                  </div>
                </div>

                <div v-if="result.context.events_after?.length" class="context-after">
                  <div
                    v-for="event in result.context.events_after"
                    :key="event.event_id"
                    class="context-message"
                  >
                    <span class="context-sender">{{ getSenderName(event.sender) }}:</span>
                    <span class="context-content">{{ event.content.body }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="result-actions">
              <button @click.stop="jumpToMessage(result)" class="jump-btn">
                跳转
              </button>
            </div>
          </div>
        </div>

        <!-- 初始状态 -->
        <div v-else class="search-placeholder">
          <div class="placeholder-icon">💬</div>
          <div class="placeholder-text">
            <p>输入关键词搜索消息</p>
            <p class="placeholder-hint">支持搜索文本内容</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { useMatrixStore } from '@/stores/matrix'

const props = defineProps<{
  visible: boolean
  roomId?: string
}>()

const emit = defineEmits<{
  'close': []
  'jump-to-message': [eventId: string, roomId?: string]
}>()

const matrixStore = useMatrixStore()

// 状态
const searchQuery = ref('')
const searchScope = ref<'current' | 'all'>('current')
const searching = ref(false)
const searchPerformed = ref(false)
const searchResults = ref<any[]>([])
const selectedIndex = ref(-1)
const searchInput = ref<HTMLInputElement>()

// 搜索防抖
let searchTimeout: NodeJS.Timeout | null = null

// 监听对话框显示状态
watch(() => props.visible, (visible) => {
  if (visible) {
    nextTick(() => {
      searchInput.value?.focus()
    })
  } else {
    // 重置状态
    searchQuery.value = ''
    searchResults.value = []
    searchPerformed.value = false
    selectedIndex.value = -1
  }
})

// 方法
const closeDialog = () => {
  emit('close')
}

const handleSearchInput = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  // 防抖搜索
  searchTimeout = setTimeout(() => {
    if (searchQuery.value.trim()) {
      performSearch()
    }
  }, 500)
}

const performSearch = async () => {
  const query = searchQuery.value.trim()
  if (!query) return

  searching.value = true
  searchPerformed.value = true
  searchResults.value = []

  try {
    if (searchScope.value === 'current' && props.roomId) {
      // 搜索当前房间
      const results = await matrixStore.searchMessages(props.roomId, query)
      searchResults.value = results
    } else {
      // 搜索所有房间
      const allResults: any[] = []
      const rooms = matrixStore.rooms
      
      for (const room of rooms) {
        try {
          const results = await matrixStore.searchMessages(room.id, query)
          const resultsWithRoom = results.map(result => ({
            ...result,
            room_id: room.id,
            room_name: room.name
          }))
          allResults.push(...resultsWithRoom)
        } catch (error) {
          console.warn(`搜索房间 ${room.id} 失败:`, error)
        }
      }
      
      // 按时间排序
      allResults.sort((a, b) => b.result.origin_server_ts - a.result.origin_server_ts)
      searchResults.value = allResults
    }
  } catch (error) {
    console.error('搜索失败:', error)
    // TODO: 显示错误提示
  } finally {
    searching.value = false
  }
}

const jumpToMessage = (result: any) => {
  const eventId = result.result.event_id
  const roomId = result.room_id || props.roomId
  
  emit('jump-to-message', eventId, roomId)
  closeDialog()
}

const getSenderName = (senderId: string) => {
  // TODO: 从Matrix store获取用户显示名称
  return senderId.split(':')[0].substring(1) // 简单处理，去掉@和域名
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  } else if (diffDays === 1) {
    return '昨天 ' + date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  } else if (diffDays < 7) {
    return diffDays + '天前'
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

const highlightSearchTerm = (text: string) => {
  if (!searchQuery.value.trim()) return text
  
  const regex = new RegExp(`(${escapeRegExp(searchQuery.value)})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
</script>

<style scoped>
.search-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.search-dialog {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.search-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s ease;
}

.close-btn:hover {
  background: #f5f5f5;
}

.search-input-area {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.search-input-wrapper {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.search-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  border-color: #2196F3;
}

.search-btn {
  padding: 10px 16px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s ease;
  min-width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-btn:hover:not(:disabled) {
  background: #1976D2;
}

.search-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.searching-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.search-options {
  display: flex;
  gap: 16px;
}

.search-option {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.search-option input[type="radio"] {
  margin: 0;
}

.search-results {
  flex: 1;
  overflow-y: auto;
  min-height: 200px;
}

.search-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  color: #666;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #2196F3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.no-results, .search-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #666;
}

.no-results-icon, .placeholder-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-results-text, .placeholder-text {
  line-height: 1.5;
}

.no-results-hint, .placeholder-hint {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.results-list {
  padding: 16px 0;
}

.results-header {
  padding: 0 20px 12px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 8px;
}

.results-count {
  font-size: 12px;
  color: #666;
}

.result-item {
  display: flex;
  padding: 12px 20px;
  cursor: pointer;
  transition: background 0.2s ease;
  border-bottom: 1px solid #f8f8f8;
}

.result-item:hover,
.result-item.selected {
  background: #f5f5f5;
}

.result-content {
  flex: 1;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 12px;
}

.result-sender {
  font-weight: 500;
  color: #2196F3;
}

.result-time {
  color: #999;
}

.result-room {
  background: #e3f2fd;
  color: #1976d2;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.result-message {
  margin-bottom: 8px;
  line-height: 1.4;
}

.result-message :deep(mark) {
  background: #ffeb3b;
  padding: 1px 2px;
  border-radius: 2px;
}

.result-context {
  font-size: 12px;
  color: #666;
  border-left: 2px solid #e0e0e0;
  padding-left: 8px;
  margin-top: 8px;
}

.context-message {
  margin-bottom: 2px;
}

.context-sender {
  font-weight: 500;
}

.context-content {
  margin-left: 4px;
}

.result-actions {
  display: flex;
  align-items: center;
}

.jump-btn {
  padding: 6px 12px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s ease;
}

.jump-btn:hover {
  background: #1976D2;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>