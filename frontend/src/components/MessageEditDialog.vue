<template>
  <div class="message-edit-dialog" v-if="visible">
    <div class="dialog-overlay" @click="closeDialog"></div>
    <div class="dialog-content">
      <div class="dialog-header">
        <h3>✏️ 编辑消息</h3>
        <button @click="closeDialog" class="close-btn">✕</button>
      </div>
      
      <div class="dialog-body">
        <div class="original-message">
          <div class="original-label">原消息:</div>
          <div class="original-content">{{ originalContent }}</div>
        </div>

        <div class="edit-form">
          <textarea
            v-model="editedContent"
            ref="textareaRef"
            class="edit-textarea"
            placeholder="编辑你的消息..."
            @keydown="handleKeydown"
          ></textarea>
          
          <div class="edit-info">
            <div class="char-count">
              {{ editedContent.length }}/4000
            </div>
            <div class="edit-hint">
              按 Ctrl+Enter 保存，Esc 取消
            </div>
          </div>
        </div>

        <div class="edit-options">
          <label class="option-item">
            <input type="checkbox" v-model="markAsEdited" />
            <span>标记为已编辑</span>
          </label>
          <label class="option-item">
            <input type="checkbox" v-model="notifyUsers" />
            <span>通知房间成员</span>
          </label>
        </div>
      </div>
      
      <div class="dialog-footer">
        <button @click="closeDialog" class="cancel-btn">取消</button>
        <button 
          @click="saveEdit" 
          :disabled="!canSave || isSaving"
          class="save-btn"
        >
          {{ isSaving ? '保存中...' : '保存' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useMatrixStore } from '@/stores/matrix'

const props = defineProps<{
  visible: boolean
  roomId: string
  eventId: string
  originalContent: string
}>()

const emit = defineEmits<{
  close: []
  saved: [newContent: string]
}>()

const matrixStore = useMatrixStore()

const editedContent = ref('')
const markAsEdited = ref(true)
const notifyUsers = ref(false)
const isSaving = ref(false)
const textareaRef = ref<HTMLTextAreaElement>()

const canSave = computed(() => {
  return editedContent.value.trim() !== '' && 
         editedContent.value !== props.originalContent &&
         editedContent.value.length <= 4000
})

const saveEdit = async () => {
  if (!canSave.value) return

  try {
    isSaving.value = true

    await matrixStore.editMessage(
      props.roomId, 
      props.eventId, 
      editedContent.value.trim()
    )

    emit('saved', editedContent.value.trim())
    closeDialog()
  } catch (error) {
    console.error('保存编辑失败:', error)
    alert('保存编辑失败: ' + error.message)
  } finally {
    isSaving.value = false
  }
}

const closeDialog = () => {
  editedContent.value = ''
  markAsEdited.value = true
  notifyUsers.value = false
  emit('close')
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && event.ctrlKey) {
    event.preventDefault()
    saveEdit()
  } else if (event.key === 'Escape') {
    event.preventDefault()
    closeDialog()
  }
}

// 监听对话框显示状态，自动聚焦和设置内容
watch(() => props.visible, async (visible) => {
  if (visible) {
    editedContent.value = props.originalContent
    await nextTick()
    if (textareaRef.value) {
      textareaRef.value.focus()
      textareaRef.value.select()
    }
  }
})
</script>

<style scoped>
.message-edit-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
}

.dialog-content {
  position: relative;
  background: #111;
  border: 2px solid #00ff00;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 0 30px rgba(0, 255, 0, 0.3);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #333;
}

.dialog-header h3 {
  color: #00ff00;
  margin: 0;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
}

.close-btn:hover {
  color: #00ff00;
}

.dialog-body {
  padding: 20px;
  max-height: 500px;
  overflow-y: auto;
}

.original-message {
  margin-bottom: 20px;
  padding: 15px;
  background: #222;
  border-radius: 8px;
  border: 1px solid #333;
}

.original-label {
  color: #888;
  font-size: 12px;
  margin-bottom: 8px;
}

.original-content {
  color: #ccc;
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
}

.edit-form {
  margin-bottom: 20px;
}

.edit-textarea {
  width: 100%;
  min-height: 120px;
  background: #222;
  border: 1px solid #444;
  color: #00ff00;
  padding: 15px;
  border-radius: 8px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 14px;
  line-height: 1.4;
  resize: vertical;
  outline: none;
}

.edit-textarea:focus {
  border-color: #00ff00;
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
}

.edit-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.char-count {
  color: #888;
  font-size: 12px;
}

.edit-hint {
  color: #666;
  font-size: 11px;
}

.edit-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px;
  background: #222;
  border-radius: 8px;
  border: 1px solid #333;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ccc;
  cursor: pointer;
  font-size: 14px;
}

.option-item input[type="checkbox"] {
  accent-color: #00ff00;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #333;
}

.cancel-btn, .save-btn {
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-family: 'Share Tech Mono', monospace;
}

.cancel-btn {
  background: #333;
  border: 1px solid #666;
  color: #ccc;
}

.cancel-btn:hover {
  background: #444;
}

.save-btn {
  background: #00ff00;
  border: 1px solid #00ff00;
  color: #000;
  font-weight: bold;
}

.save-btn:hover:not(:disabled) {
  background: #00cc00;
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 滚动条样式 */
.dialog-body::-webkit-scrollbar {
  width: 6px;
}

.dialog-body::-webkit-scrollbar-track {
  background: #333;
  border-radius: 3px;
}

.dialog-body::-webkit-scrollbar-thumb {
  background: #00ff00;
  border-radius: 3px;
}

.dialog-body::-webkit-scrollbar-thumb:hover {
  background: #00cc00;
}
</style>