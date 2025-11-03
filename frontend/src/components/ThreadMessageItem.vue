<template>
  <div 
    class="thread-message-item" 
    :class="{ 
      'own-message': message.isOwn,
      'editing': isEditing,
      'deleted': message.isRedacted 
    }"
    @contextmenu.prevent="showContextMenu"
  >
    <!-- 消息头部 -->
    <div class="thread-message-header">
      <div class="sender-info">
        <div class="sender-avatar">
          {{ getSenderInitials(message.senderName) }}
        </div>
        <div class="sender-details">
          <span class="sender-name">{{ message.senderName }}</span>
          <span class="message-time">{{ formatTime(message.timestamp) }}</span>
        </div>
      </div>
    </div>

    <!-- 消息内容 -->
    <div class="thread-message-content">
      <!-- 编辑模式 -->
      <div v-if="isEditing" class="edit-mode">
        <textarea
          ref="editInput"
          v-model="editContent"
          @keydown="handleEditKeydown"
          class="edit-textarea"
          placeholder="编辑消息..."
        ></textarea>
        <div class="edit-actions">
          <button @click="cancelEdit" class="cancel-btn">取消</button>
          <button @click="saveEdit" class="save-btn" :disabled="!editContent.trim()">保存</button>
        </div>
      </div>

      <!-- 正常显示模式 -->
      <div v-else class="message-body">
        <!-- 已删除消息 -->
        <div v-if="message.isRedacted" class="deleted-message">
          <span class="deleted-icon">🗑️</span>
          <span class="deleted-text">此消息已被删除</span>
        </div>

        <!-- 正常消息 -->
        <div v-else class="message-text">
          <div v-html="formatMessageContent(message.content)"></div>
          <div v-if="message.isEdited" class="edited-indicator">
            <span class="edited-text">(已编辑)</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 消息操作按钮 -->
    <div class="thread-message-actions" v-if="!message.isRedacted && !isEditing">
      <button @click="handleReply" class="action-btn reply-btn" title="回复">
        <span class="action-icon">↩️</span>
      </button>
      <button 
        v-if="message.isOwn" 
        @click="handleEdit" 
        class="action-btn edit-btn" 
        title="编辑"
      >
        <span class="action-icon">✏️</span>
      </button>
      <button 
        v-if="message.isOwn" 
        @click="handleDelete" 
        class="action-btn delete-btn" 
        title="删除"
      >
        <span class="action-icon">🗑️</span>
      </button>
    </div>

    <!-- 右键菜单 -->
    <div
      v-if="showMenu"
      class="context-menu"
      :style="{ left: menuX + 'px', top: menuY + 'px' }"
      @click.stop
    >
      <div class="context-menu-item" @click="handleReply">
        <span class="menu-icon">↩️</span>
        <span class="menu-text">回复</span>
      </div>
      <div v-if="message.isOwn" class="context-menu-item" @click="handleEdit">
        <span class="menu-icon">✏️</span>
        <span class="menu-text">编辑</span>
      </div>
      <div class="context-menu-item" @click="copyMessage">
        <span class="menu-icon">📋</span>
        <span class="menu-text">复制</span>
      </div>
      <div class="context-menu-divider"></div>
      <div v-if="message.isOwn" class="context-menu-item danger" @click="handleDelete">
        <span class="menu-icon">🗑️</span>
        <span class="menu-text">删除</span>
      </div>
    </div>
  </div>

  <!-- 点击遮罩关闭菜单 -->
  <div
    v-if="showMenu"
    class="context-menu-overlay"
    @click="hideContextMenu"
  ></div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'

interface Props {
  message: any
  roomId: string
  isThreadMessage?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  reply: [message: any]
  edit: [message: any]
  delete: [message: any]
}>()

// 响应式数据
const isEditing = ref(false)
const editContent = ref('')
const editInput = ref<HTMLTextAreaElement>()
const showMenu = ref(false)
const menuX = ref(0)
const menuY = ref(0)

// 方法
const getSenderInitials = (name: string) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const formatMessageContent = (content: string) => {
  if (!content) return ''
  
  // 简单的文本格式化
  return content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
}

const showContextMenu = (event: MouseEvent) => {
  event.preventDefault()
  menuX.value = event.clientX
  menuY.value = event.clientY
  showMenu.value = true
}

const hideContextMenu = () => {
  showMenu.value = false
}

const handleReply = () => {
  emit('reply', props.message)
  hideContextMenu()
}

const handleEdit = async () => {
  isEditing.value = true
  editContent.value = props.message.content
  hideContextMenu()
  
  await nextTick()
  editInput.value?.focus()
}

const handleDelete = () => {
  if (confirm('确定要删除这条消息吗？')) {
    emit('delete', props.message)
  }
  hideContextMenu()
}

const cancelEdit = () => {
  isEditing.value = false
  editContent.value = ''
}

const saveEdit = () => {
  if (editContent.value.trim()) {
    // 这里应该调用编辑消息的API
    console.log('保存编辑:', editContent.value)
    isEditing.value = false
    editContent.value = ''
  }
}

const handleEditKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    saveEdit()
  } else if (event.key === 'Escape') {
    cancelEdit()
  }
}

const copyMessage = async () => {
  try {
    await navigator.clipboard.writeText(props.message.content)
    console.log('消息已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
  }
  hideContextMenu()
}
</script>

<style scoped>
.thread-message-item {
  margin-bottom: 16px;
  position: relative;
  padding: 12px;
  border-radius: 8px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.thread-message-item:hover {
  background: #f1f3f4;
  border-color: #dee2e6;
}

.thread-message-item.own-message {
  background: #e3f2fd;
  border-color: #bbdefb;
  margin-left: 20px;
}

.thread-message-item.own-message:hover {
  background: #d1e7dd;
}

.thread-message-item.editing {
  background: #fff3cd;
  border-color: #ffeaa7;
}

.thread-message-item.deleted {
  background: #f8d7da;
  border-color: #f5c6cb;
  opacity: 0.7;
}

/* 消息头部 */
.thread-message-header {
  margin-bottom: 8px;
}

.sender-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sender-avatar {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  font-weight: bold;
  flex-shrink: 0;
}

.sender-details {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sender-name {
  font-weight: 600;
  color: #495057;
  font-size: 13px;
}

.message-time {
  font-size: 11px;
  color: #6c757d;
}

/* 消息内容 */
.thread-message-content {
  margin-bottom: 8px;
}

.message-body {
  line-height: 1.4;
}

.message-text {
  color: #212529;
  font-size: 14px;
}

.deleted-message {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6c757d;
  font-style: italic;
}

.deleted-icon {
  font-size: 12px;
}

.edited-indicator {
  margin-top: 4px;
}

.edited-text {
  font-size: 11px;
  color: #6c757d;
  font-style: italic;
}

/* 编辑模式 */
.edit-mode {
  background: white;
  border-radius: 6px;
  padding: 8px;
  border: 1px solid #dee2e6;
}

.edit-textarea {
  width: 100%;
  border: none;
  outline: none;
  resize: vertical;
  min-height: 60px;
  font-size: 14px;
  font-family: inherit;
  line-height: 1.4;
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.cancel-btn,
.save-btn {
  padding: 4px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-btn {
  background: #6c757d;
  color: white;
}

.cancel-btn:hover {
  background: #5a6268;
}

.save-btn {
  background: #007bff;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #0056b3;
}

.save-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

/* 消息操作按钮 */
.thread-message-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.thread-message-item:hover .thread-message-actions {
  opacity: 1;
}

.action-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  transform: scale(1.1);
}

.action-icon {
  font-size: 12px;
}

.reply-btn:hover {
  background: rgba(0, 123, 255, 0.1);
}

.edit-btn:hover {
  background: rgba(255, 193, 7, 0.1);
}

.delete-btn:hover {
  background: rgba(220, 53, 69, 0.1);
}

/* 右键菜单 */
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 120px;
  padding: 4px 0;
  font-size: 13px;
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.context-menu-item:hover {
  background: #f8f9fa;
}

.context-menu-item.danger {
  color: #dc3545;
}

.context-menu-item.danger:hover {
  background: #f8d7da;
}

.menu-icon {
  font-size: 12px;
  width: 16px;
  text-align: center;
}

.menu-text {
  flex: 1;
}

.context-menu-divider {
  height: 1px;
  background: #dee2e6;
  margin: 4px 0;
}

.context-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background: transparent;
}
</style>