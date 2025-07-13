<template>
  <div class="message-bubble" :class="{ 'own-message': isOwnMessage }">
    <div v-if="!isOwnMessage" class="sender-avatar">
      <el-avatar :size="32">
        {{ message.sender[0] }}
      </el-avatar>
    </div>
    
    <div class="message-content">
      <div v-if="!isOwnMessage" class="sender-name">
        {{ message.sender }}
      </div>
      
      <div class="message-body" :class="messageTypeClass">
        <!-- 文本消息 -->
        <div v-if="message.messageType === 'text'" class="text-message">
          {{ message.content }}
        </div>
        
        <!-- 图片消息 -->
        <div v-else-if="message.messageType === 'image'" class="image-message">
          <el-image
            :src="message.content"
            fit="cover"
            style="max-width: 200px; max-height: 200px; border-radius: 8px;"
            :preview-src-list="[message.content]"
          />
        </div>
        
        <!-- 文件消息 -->
        <div v-else-if="message.messageType === 'file'" class="file-message">
          <div class="file-info">
            <el-icon class="file-icon"><Document /></el-icon>
            <div class="file-details">
              <div class="file-name">{{ getFileName(message.content) }}</div>
              <div class="file-size">{{ getFileSize(message.content) }}</div>
            </div>
          </div>
          <el-button type="primary" size="small" @click="downloadFile">
            下载
          </el-button>
        </div>
      </div>
      
      <div class="message-meta">
        <span class="message-time">{{ formatTime(message.timestamp) }}</span>
        <div v-if="isOwnMessage" class="message-status">
          <el-icon v-if="message.status === 'sending'" class="status-icon sending">
            <Loading />
          </el-icon>
          <el-icon v-else-if="message.status === 'sent'" class="status-icon sent">
            <Check />
          </el-icon>
          <el-icon v-else-if="message.status === 'delivered'" class="status-icon delivered">
            <Check />
          </el-icon>
          <el-icon v-else-if="message.status === 'read'" class="status-icon read">
            <Check />
          </el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Document, Loading, Check } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import type { Message } from '@/stores/chat'

interface Props {
  message: Message
}

const props = defineProps<Props>()
const authStore = useAuthStore()

const isOwnMessage = computed(() => 
  props.message.sender === authStore.currentUser?.username
)

const messageTypeClass = computed(() => ({
  'text-bubble': props.message.messageType === 'text',
  'media-bubble': props.message.messageType === 'image' || props.message.messageType === 'file',
  'own-bubble': isOwnMessage.value,
  'other-bubble': !isOwnMessage.value
}))

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const getFileName = (filePath: string) => {
  return filePath.split('/').pop() || 'unknown'
}

const getFileSize = (filePath: string) => {
  // This would typically come from the server
  return '未知大小'
}

const downloadFile = () => {
  // Implement file download logic
  window.open(props.message.content, '_blank')
}
</script>

<style scoped>
.message-bubble {
  display: flex;
  margin-bottom: 12px;
  max-width: 70%;
}

.message-bubble.own-message {
  flex-direction: row-reverse;
  margin-left: auto;
}

.sender-avatar {
  margin-right: 8px;
  flex-shrink: 0;
}

.own-message .sender-avatar {
  margin-right: 0;
  margin-left: 8px;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.sender-name {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
  font-weight: 500;
}

.message-body {
  border-radius: 12px;
  padding: 8px 12px;
  word-wrap: break-word;
  position: relative;
}

.text-bubble.other-bubble {
  background: white;
  border: 1px solid #e4e7ed;
}

.text-bubble.own-bubble {
  background: #409eff;
  color: white;
}

.media-bubble {
  background: transparent;
  padding: 4px;
}

.text-message {
  line-height: 1.4;
}

.image-message {
  border-radius: 8px;
  overflow: hidden;
}

.file-message {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 12px;
  min-width: 200px;
}

.file-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.file-icon {
  font-size: 24px;
  color: #409eff;
  margin-right: 12px;
}

.file-details {
  flex: 1;
}

.file-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 2px;
}

.file-size {
  font-size: 12px;
  color: #909399;
}

.message-meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 4px;
  gap: 4px;
}

.own-message .message-meta {
  justify-content: flex-start;
}

.message-time {
  font-size: 11px;
  color: #c0c4cc;
}

.message-status {
  display: flex;
  align-items: center;
}

.status-icon {
  font-size: 12px;
}

.status-icon.sending {
  color: #909399;
  animation: spin 1s linear infinite;
}

.status-icon.sent {
  color: #67c23a;
}

.status-icon.delivered {
  color: #67c23a;
}

.status-icon.read {
  color: #409eff;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 消息气泡箭头效果 */
.text-bubble.other-bubble::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 12px;
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-right: 8px solid white;
}

.text-bubble.own-bubble::before {
  content: '';
  position: absolute;
  right: -8px;
  top: 12px;
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 8px solid #409eff;
}
</style>
