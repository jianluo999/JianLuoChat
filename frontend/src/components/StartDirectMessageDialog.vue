<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal start-dm-modal" @click.stop>
      <div class="modal-header">
        <h2>开始私聊</h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>

      <div class="modal-content">
        <div class="modal-description">
          <p>输入用户ID开始私聊对话。用户ID格式为 <span class="user-id-example">@username:server.com</span></p>
        </div>

        <div class="user-input-section">
          <label for="userId">用户ID</label>
          <input
            id="userId"
            type="text"
            v-model="userId"
            placeholder="@user:matrix.org"
            class="user-input"
            @keyup.enter="startDM"
          />
        </div>

        <div class="dm-tips">
          <h4>隐私提示</h4>
          <p>• 私聊消息只有你和对方能看到</p>
          <p>• 对方会收到你的聊天邀请</p>
          <p>• 对方需要接受邀请才能开始对话</p>
        </div>

        <div class="recent-contacts" v-if="recentContacts.length > 0">
          <h4>最近联系人</h4>
          <div class="contacts-list">
            <div
              v-for="contact in recentContacts"
              :key="contact.userId"
              class="contact-item"
              @click="selectContact(contact.userId)"
            >
              <div class="contact-avatar">
                {{ getContactInitials(contact.displayName || contact.userId) }}
              </div>
              <div class="contact-info">
                <div class="contact-name">{{ contact.displayName || contact.userId }}</div>
                <div class="contact-id">{{ contact.userId }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="server-suggestion">
          <p>需要帮助找到用户？试试这些Matrix服务器：</p>
          <div class="server-links">
            <div class="server-link">
              <a href="https://matrix.org" target="_blank">matrix.org</a>
              <button class="copy-btn" @click="copyToClipboard('matrix.org')">
                <i class="icon-copy"></i>
              </button>
            </div>
            <div class="server-link">
              <a href="https://element.io" target="_blank">element.io</a>
              <button class="copy-btn" @click="copyToClipboard('element.io')">
                <i class="icon-copy"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="$emit('close')">取消</button>
        <button 
          class="btn-primary" 
          @click="startDM"
          :disabled="!userId.trim()"
        >
          开始私聊
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMatrixStore } from '@/stores/matrix'

const emit = defineEmits(['close', 'start-dm'])

const matrixStore = useMatrixStore()
const userId = ref('')

// 模拟最近联系人数据
const recentContacts = computed(() => {
  // 这里应该从Matrix store获取最近联系人
  return [
    {
      userId: '@alice:matrix.org',
      displayName: 'Alice',
    },
    {
      userId: '@bob:element.io',
      displayName: 'Bob',
    }
  ]
})

const getContactInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const selectContact = (contactUserId: string) => {
  userId.value = contactUserId
}

const startDM = () => {
  if (!userId.value.trim()) return
  
  // 验证用户ID格式
  if (!userId.value.startsWith('@') || !userId.value.includes(':')) {
    alert('请输入有效的用户ID格式：@username:server.com')
    return
  }
  
  emit('start-dm', userId.value.trim())
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    console.log('已复制到剪贴板:', text)
  } catch (error) {
    console.error('复制失败:', error)
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.start-dm-modal {
  width: 500px;
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
}

.modal {
  background: #001100;
  border: 2px solid #00ff41;
  border-radius: 4px;
  box-shadow: 0 0 20px rgba(0, 255, 65, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #00ff41;
}

.modal-header h2 {
  color: #00ff41;
  margin: 0;
  text-shadow: 0 0 5px #00ff41;
}

.close-btn {
  background: none;
  border: none;
  color: #00ff41;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(0, 255, 65, 0.1);
  border-radius: 2px;
}

.modal-content {
  padding: 20px;
}

.modal-description {
  color: #00cc33;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 20px;
}

.user-id-example {
  color: #00ff41;
  font-weight: bold;
  background: rgba(0, 255, 65, 0.1);
  padding: 2px 4px;
  border-radius: 2px;
}

.user-input-section {
  margin-bottom: 20px;
}

.user-input-section label {
  display: block;
  color: #00ff41;
  font-size: 14px;
  margin-bottom: 8px;
  font-weight: bold;
}

.user-input {
  width: 100%;
  padding: 12px;
  background: rgba(0, 51, 0, 0.3);
  border: 1px solid #00ff41;
  color: #00ff41;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  border-radius: 2px;
  outline: none;
  transition: all 0.3s;
  box-sizing: border-box;
}

.user-input:focus {
  border-color: #00ff41;
  box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
  background: rgba(0, 51, 0, 0.5);
}

.dm-tips {
  margin: 20px 0;
  padding: 15px;
  background: rgba(0, 51, 0, 0.2);
  border: 1px solid rgba(0, 255, 65, 0.3);
  border-radius: 2px;
}

.dm-tips h4 {
  color: #00ff41;
  margin: 0 0 10px 0;
  font-size: 14px;
}

.dm-tips p {
  color: #00cc33;
  font-size: 12px;
  line-height: 1.4;
  margin: 5px 0;
}

.recent-contacts {
  margin: 20px 0;
}

.recent-contacts h4 {
  color: #00ff41;
  margin: 0 0 10px 0;
  font-size: 14px;
}

.contacts-list {
  max-height: 150px;
  overflow-y: auto;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 8px;
  cursor: pointer;
  border-radius: 2px;
  transition: background 0.3s;
}

.contact-item:hover {
  background: rgba(0, 255, 65, 0.1);
}

.contact-avatar {
  width: 32px;
  height: 32px;
  background: #003300;
  border: 1px solid #00ff41;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00ff41;
  font-size: 12px;
  margin-right: 12px;
}

.contact-info {
  flex: 1;
}

.contact-name {
  color: #00ff41;
  font-size: 14px;
  font-weight: bold;
}

.contact-id {
  color: #00cc33;
  font-size: 12px;
}

.server-suggestion {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid rgba(0, 255, 65, 0.2);
}

.server-suggestion p {
  color: #00cc33;
  font-size: 12px;
  margin-bottom: 10px;
}

.server-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.server-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background: rgba(0, 51, 0, 0.2);
  border: 1px solid rgba(0, 255, 65, 0.3);
  border-radius: 2px;
}

.server-link a {
  color: #00ff41;
  text-decoration: none;
  font-size: 12px;
  flex: 1;
}

.server-link a:hover {
  text-decoration: underline;
}

.copy-btn {
  background: transparent;
  border: 1px solid #00ff41;
  color: #00ff41;
  padding: 4px 8px;
  border-radius: 2px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.copy-btn:hover {
  background: rgba(0, 255, 65, 0.1);
  box-shadow: 0 0 5px rgba(0, 255, 65, 0.3);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid rgba(0, 255, 65, 0.3);
}

.btn {
  padding: 8px 16px;
  border-radius: 2px;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #00ff41;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
}

.btn-secondary {
  background: #003300;
  color: #00ff41;
}

.btn-secondary:hover {
  background: #004400;
  box-shadow: 0 0 5px rgba(0, 255, 65, 0.3);
}

.btn-primary {
  background: #00ff41;
  color: #000000;
}

.btn-primary:hover {
  background: #00cc33;
  box-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
}

.btn-primary:disabled {
  background: #006600;
  color: #003300;
  cursor: not-allowed;
  box-shadow: none;
}

.icon-copy::before { content: "📋"; }
</style>
