<template>
  <div class="message-input-container">
    <!-- 回复预览 -->
    <div v-if="replyingTo" class="reply-preview">
      <div class="reply-content">
        <div class="reply-header">
          <span class="reply-icon">↳</span>
          <span class="reply-user">{{ replyingTo.senderName }}</span>
        </div>
        <div class="reply-message">{{ replyingTo.content }}</div>
      </div>
      <button @click="cancelReply" class="cancel-reply">×</button>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <!-- 工具栏 -->
      <div class="input-toolbar">
        <button
          @click="toggleEmoji"
          class="toolbar-btn"
          :class="{ active: showEmoji }"
          title="表情符号"
        >
          😊
        </button>
        
        <button
          @click="attachFile"
          class="toolbar-btn"
          title="附件"
        >
          📎
        </button>
        
        <button
          @click="toggleFormatting"
          class="toolbar-btn"
          :class="{ active: showFormatting }"
          title="格式化"
        >
          <svg viewBox="0 0 24 24">
            <path d="M5,4V7H10.5V19H13.5V7H19V4H5Z"/>
          </svg>
        </button>
        
        <button
          v-if="supportsEncryption"
          @click="toggleEncryption"
          class="toolbar-btn encryption-btn"
          :class="{ active: encryptionEnabled }"
          title="端到端加密"
        >
          🔐
        </button>
      </div>

      <!-- 格式化工具栏 -->
      <div v-if="showFormatting" class="formatting-toolbar">
        <button @click="insertFormat('**', '**')" class="format-btn" title="粗体">
          <strong>B</strong>
        </button>
        <button @click="insertFormat('*', '*')" class="format-btn" title="斜体">
          <em>I</em>
        </button>
        <button @click="insertFormat('`', '`')" class="format-btn" title="代码">
          <code>&lt;/&gt;</code>
        </button>
        <button @click="insertFormat('```\n', '\n```')" class="format-btn" title="代码块">
          { }
        </button>
        <button @click="insertFormat('> ', '')" class="format-btn" title="引用">
          "
        </button>
      </div>

      <!-- 表情选择器 -->
      <div v-if="showEmoji" class="emoji-picker" ref="emojiPicker">
        <!-- 搜索框 -->
        <div class="emoji-search">
          <input
            v-model="emojiSearch"
            type="text"
            placeholder="🔍 搜索表情..."
            class="search-input"
          />
        </div>
        
        <!-- 分类标签 -->
        <div class="emoji-categories">
          <button
            v-for="category in emojiCategories"
            :key="category.name"
            @click="selectedEmojiCategory = category.name"
            :class="['emoji-category-btn', { active: selectedEmojiCategory === category.name }]"
          >
            {{ category.icon }}
          </button>
        </div>
        
        <!-- 表情网格 -->
        <div class="emoji-grid">
          <button
            v-for="emoji in filteredEmojis"
            :key="emoji"
            @click="insertEmoji(emoji)"
            class="emoji-btn"
            :title="emoji"
          >
            {{ emoji }}
          </button>
        </div>
        
        <!-- 搜索结果提示 -->
        <div v-if="emojiSearch && filteredEmojis.length === 0" class="no-results">
          没有找到匹配的表情
        </div>
      </div>

      <!-- 主输入框 -->
      <div class="input-wrapper">
        <textarea
          ref="messageInput"
          v-model="message"
          @keydown="handleKeyDown"
          @input="handleInput"
          @paste="handlePaste"
          :placeholder="placeholder"
          class="message-textarea"
          :disabled="disabled"
          rows="1"
        ></textarea>
        
        <div class="input-actions">
          <!-- 发送按钮 -->
          <button
            @click="sendMessage"
            :disabled="!canSend"
            class="send-button"
            :class="{ sending: sending }"
          >
            <svg v-if="!sending" viewBox="0 0 24 24">
              <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
            </svg>
            <div v-else class="sending-spinner"></div>
          </button>
        </div>
      </div>

      <!-- 输入状态 -->
      <div class="input-status">
        <div class="typing-indicator" v-if="showTyping">
          <span class="typing-users">{{ typingUsers.join(', ') }}</span>
          <span class="typing-text">正在输入...</span>
        </div>
        
        <div class="message-info">
          <span v-if="encryptionEnabled" class="encryption-status">🔐 加密</span>
          <span class="char-count" :class="{ warning: message.length > 4000 }">
            {{ message.length }}/5000
          </span>
        </div>
      </div>
    </div>

    <!-- 文件上传预览 -->
    <div v-if="uploadingFiles.length > 0" class="file-upload-preview">
      <div
        v-for="file in uploadingFiles"
        :key="file.id"
        class="file-preview"
        :class="{ 'upload-failed': file.progress === -1, 'upload-complete': file.progress === 100 }"
      >
        <div class="file-info">
          <div class="file-icon">
            {{ getFileIcon(file) }}
          </div>
          <div class="file-details">
            <div class="file-name">{{ file.name }}</div>
            <div class="file-size">{{ formatFileSize(file.size) }}</div>
            <div class="file-status">
              <span v-if="file.progress === -1" class="status-failed">❌ 上传失败</span>
              <span v-else-if="file.progress === 100" class="status-success">✅ 上传成功</span>
              <span v-else class="status-uploading">📤 上传中... {{ file.progress }}%</span>
            </div>
          </div>
        </div>
        <div v-if="file.progress >= 0 && file.progress < 100" class="file-progress">
          <div class="progress-bar" :style="{ width: file.progress + '%' }"></div>
        </div>
        <button @click="removeFile(file.id)" class="remove-file">×</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useMatrixStore } from '@/stores/matrix'

const matrixStore = useMatrixStore()

const props = defineProps<{
  roomId: string
  placeholder?: string
  disabled?: boolean
  supportsEncryption?: boolean
  replyingTo?: any
}>()

const emit = defineEmits<{
  'send-message': [content: string, options?: any]
  'cancel-reply': []
  'typing-start': []
  'typing-stop': []
}>()

// 状态
const message = ref('')
const sending = ref(false)
const showEmoji = ref(false)
const showFormatting = ref(false)
const encryptionEnabled = ref(false)
const selectedEmojiCategory = ref('smileys')
const emojiSearch = ref('')
const uploadingFiles = ref<any[]>([])
const typingUsers = ref<string[]>([])
const messageInput = ref<HTMLTextAreaElement>()
const emojiPicker = ref<HTMLElement>()

// 表情符号数据
const emojiCategories = ref([
  { 
    name: 'smileys', 
    icon: '😊', 
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'] 
  },
  { 
    name: 'gestures', 
    icon: '👍', 
    emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁️', '👅', '👄', '👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', '👨‍🦰', '👨‍🦱', '👨‍🦳', '👨‍🦲', '👩', '👩‍🦰', '👩‍🦱', '👩‍🦳', '👩‍🦲', '🧓', '👴', '👵', '🙍', '🙎', '🙅', '🙆', '💁', '🙋', '🧏', '🙇', '🤦', '🤷', '👮', '🕵️', '💂', '👷', '🤴', '👸', '👳', '👲', '🧕', '🤵', '👰', '🤰', '🤱', '👼', '🎅', '🤶', '🦸', '🦹', '🧙', '🧚', '🧛', '🧜', '🧝', '🧞', '🧟', '💆', '💇', '🚶', '🏃', '💃', '🕺', '🕴️', '👯', '🧖', '🧗', '🤺', '🏇', '⛷️', '🏂', '🏌️', '🏄', '🚣', '🏊', '⛹️', '🏋️', '🚴', '🚵', '🤸', '🤼', '🤽', '🤾', '🤹', '🧘', '🛀', '🛌', '👭', '👫', '👬', '💏', '💑', '👪'] 
  },
  { 
    name: 'hearts', 
    icon: '❤️', 
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭'] 
  },
  { 
    name: 'symbols', 
    icon: '✨', 
    emojis: ['✨', '⭐', '🌟', '💫', '⚡', '🔥', '💥', '💦', '💨', '💧', '🌊', '🎯', '🎲', '🎪', '🎭', '🖼️', '🎨', '🧵', '🪡', '🧶', '🪢', '👓', '🕶️', '🥽', '🥼', '🦺', '👔', '👕', '👖', '🧣', '🧤', '🧥', '🧦', '👗', '👘', '🥻', '🩱', '🩲', '🩳', '👙', '👚', '👛', '👜', '👝', '🛍️', '🎒', '🩴', '👞', '👟', '🥾', '🥿', '👠', '👡', '🩰', '👢', '👑', '👒', '🎩', '🎓', '🧢', '🪖', '⛑️', '💄', '💍', '💼'] 
  },
  { 
    name: 'objects', 
    icon: '🎉', 
    emojis: ['🎉', '🎊', '🎈', '🎁', '🎀', '🎄', '🎃', '🎆', '🎇', '🧨', '✨', '🎎', '🎏', '🎐', '🎑', '🧧', '🎀', '🎁', '🎗️', '🎟️', '🎫', '🎪', '🎭', '🖼️', '🎨', '🧵', '🪡', '🧶', '🪢', '👓', '🕶️', '🥽', '🥼', '🦺', '👔', '👕', '👖', '🧣', '🧤', '🧥', '🧦', '👗', '👘', '🥻', '🩱', '🩲', '🩳', '👙', '👚', '👛', '👜', '👝', '🛍️', '🎒', '🩴', '👞', '👟', '🥾', '🥿', '👠', '👡', '🩰', '👢', '👑', '👒', '🎩', '🎓', '🧢', '🪖', '⛑️', '💄', '💍', '💼'] 
  },
  { 
    name: 'animals', 
    icon: '🐶', 
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱', '🐛', '🦋', '🐌', '🐞', '🐜', '🪰', '🪲', '🪳', '🦟', '🦗', '🕷️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🦣', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🪶', '🐓', '🦃', '🦤', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', '🦫', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔'] 
  },
  { 
    name: 'food', 
    icon: '🍎', 
    emojis: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🧈', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '🫖', '☕', '🍵', '🧃', '🥤', '🧋', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾', '🧊', '🥄', '🍴', '🍽️', '🥣', '🥡', '🥢'] 
  },
  { 
    name: 'travel', 
    icon: '🚗', 
    emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🦯', '🦽', '🦼', '🛴', '🚲', '🛵', '🏍️', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩️', '💺', '🛰️', '🚀', '🛸', '🚁', '🛶', '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚢', '⚓', '🪝', '🌋', '🗻', '🏕️', '🏖️', '🏜️', '🏝️', '🏞️', '🏟️', '🏛️', '🏗️', '🧱', '🪨', '🪵', '🛖', '🏘️', '🏚️', '🏠', '🏡', '🏢', '🏣', '🏤', '🏥', '🏦', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏯', '🏰', '💒', '🗼', '🗽', '⛪', '🕌', '🛕', '🕍', '⛩️', '🕋', '⛲', '⛺', '🌁', '🌃', '🏙️', '🌄', '🌅', '🌆', '🌇', '🌉', '🎠', '🎡', '🎢', '💈', '🎪', '🚂', '🚃', '🚄', '🚅', '🚆', '🚇', '🚈', '🚉', '🚊', '🚝', '🚞', '🚋', '🚌', '🚍', '🚎', '🚐', '🚑', '🚒', '🚓', '🚔', '🚕', '🚖', '🚗', '🚘', '🚙', '🚚', '🚛', '🚜', '🚲', '🛴', '🛵', '🏍️', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩️', '💺', '🛰️', '🚀', '🛸', '🚁', '🛶', '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚢', '⚓', '🪝', '⛽', '🚧', '🚦', '🚥', '🚏', '🗺️', '🗿', '🪦', '🪧'] 
  },
  { 
    name: 'activities', 
    icon: '⚽', 
    emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️', '🤾', '🏌️', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚴', '🚵', '🎯', '🎮', '🕹️', '🎲', '🧩', '🧸', '🪅', '🪆', '♠️', '♥️', '♦️', '♣️', '♟️', '🃏', '🀄', '🎴', '🎭', '🖼️', '🎨', '🧵', '🪡', '🧶', '🪢', '👓', '🕶️', '🥽', '🥼', '🦺', '👔', '👕', '👖', '🧣', '🧤', '🧥', '🧦', '👗', '👘', '🥻', '🩱', '🩲', '🩳', '👙', '👚', '👛', '👜', '👝', '🛍️', '🎒', '🩴', '👞', '👟', '🥾', '🥿', '👠', '👡', '🩰', '👢', '👑', '👒', '🎩', '🎓', '🧢', '🪖', '⛑️', '💄', '💍', '💼'] 
  }
])

// 计算属性
const currentEmojis = computed(() => {
  const category = emojiCategories.value.find(c => c.name === selectedEmojiCategory.value)
  return category?.emojis || []
})

const filteredEmojis = computed(() => {
  if (!emojiSearch.value) {
    return currentEmojis.value
  }
  
  const searchTerm = emojiSearch.value.toLowerCase()
  return currentEmojis.value.filter(emoji => 
    emoji.includes(searchTerm) || 
    emoji.includes(emojiSearch.value)
  )
})

const canSend = computed(() => {
  return message.value.trim().length > 0 && !sending.value && !props.disabled
})

const showTyping = computed(() => {
  return typingUsers.value.length > 0
})

// 方法
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  } else if (event.key === 'Escape') {
    if (props.replyingTo) {
      cancelReply()
    }
  }
}

const handleInput = () => {
  // 自动调整高度
  nextTick(() => {
    if (messageInput.value) {
      messageInput.value.style.height = 'auto'
      messageInput.value.style.height = messageInput.value.scrollHeight + 'px'
    }
  })

  // 发送输入状态
  emit('typing-start')
}

const handlePaste = (event: ClipboardEvent) => {
  console.log('📋 粘贴事件触发')
  const items = event.clipboardData?.items
  let hasImage = false
  
  if (items) {
    console.log(`📄 剪贴板中有 ${items.length} 个项目`)
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      console.log(`📄 项目 ${i}: ${item.type}`)
      
      // 检测各种图片类型
      if (item.type.indexOf('image') !== -1 || 
          item.type === 'image/png' || 
          item.type === 'image/jpeg' || 
          item.type === 'image/gif' || 
          item.type === 'image/webp') {
        console.log('🖼️ 检测到图片文件')
        const file = item.getAsFile()
        if (file) {
          console.log(`📤 获取到文件: ${file.name} (${file.size} bytes)`)
          hasImage = true
          uploadFile(file)
        } else {
          console.log('❌ 无法从剪贴板项目获取文件，尝试备用方案')
          // 备用方案：尝试从剪贴板数据中获取图片
          try {
            const blob = item.getAsFile()
            if (blob) {
              const file = new File([blob], 'pasted-image.png', { type: 'image/png' })
              hasImage = true
              uploadFile(file)
            }
          } catch (error) {
            console.error('备用方案也失败了:', error)
          }
        }
      }
    }
  } else {
    console.log('❌ 剪贴板中没有项目，尝试检查files属性')
    // 检查是否有files属性
    if (event.clipboardData?.files && event.clipboardData.files.length > 0) {
      console.log(`📄 通过files属性找到 ${event.clipboardData.files.length} 个文件`)
      for (let i = 0; i < event.clipboardData.files.length; i++) {
        const file = event.clipboardData.files[i]
        if (file.type.startsWith('image/')) {
          console.log(`🖼️ 检测到图片文件: ${file.name}`)
          hasImage = true
          uploadFile(file)
        }
      }
    }
  }
  
  // 如果检测到图片，阻止默认粘贴行为
  if (hasImage) {
    console.log('🛑 阻止默认粘贴行为')
    event.preventDefault()
  } else {
    console.log('📝 允许默认文本粘贴行为')
  }
}

const sendMessage = async () => {
  if (!canSend.value) return

  const content = message.value.trim()
  sending.value = true

  try {
    const options = {
      encrypted: encryptionEnabled.value,
      replyTo: props.replyingTo?.id
    }

    emit('send-message', content, options)
    message.value = ''
    
    if (props.replyingTo) {
      cancelReply()
    }

    // 重置输入框高度
    nextTick(() => {
      if (messageInput.value) {
        messageInput.value.style.height = 'auto'
      }
    })
  } catch (error) {
    console.error('Failed to send message:', error)
  } finally {
    sending.value = false
  }
}

const cancelReply = () => {
  emit('cancel-reply')
}

const toggleEmoji = () => {
  showEmoji.value = !showEmoji.value
  showFormatting.value = false
  if (showEmoji.value) {
    emojiSearch.value = ''
    selectedEmojiCategory.value = 'smileys'
  }
}

const toggleFormatting = () => {
  showFormatting.value = !showFormatting.value
  showEmoji.value = false
}

const toggleEncryption = () => {
  encryptionEnabled.value = !encryptionEnabled.value
}

const insertEmoji = (emoji: string) => {
  const textarea = messageInput.value
  if (textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = message.value
    message.value = text.substring(0, start) + emoji + text.substring(end)
    
    nextTick(() => {
      textarea.focus()
      textarea.setSelectionRange(start + emoji.length, start + emoji.length)
    })
  }
  showEmoji.value = false
}

const insertFormat = (before: string, after: string) => {
  const textarea = messageInput.value
  if (textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = message.value
    const selectedText = text.substring(start, end)
    
    message.value = text.substring(0, start) + before + selectedText + after + text.substring(end)
    
    nextTick(() => {
      textarea.focus()
      const newPos = start + before.length + selectedText.length + after.length
      textarea.setSelectionRange(newPos, newPos)
    })
  }
}

const attachFile = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = true
  input.accept = 'image/*,video/*,audio/*,.pdf,.doc,.docx,.txt'
  
  input.onchange = (event: any) => {
    const files = event.target.files
    for (let i = 0; i < files.length; i++) {
      uploadFile(files[i])
    }
  }
  
  input.click()
}

const uploadFile = async (file: File) => {
  // 检查文件大小限制（10MB）
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    alert(`文件大小超过限制（${maxSize / 1024 / 1024}MB），请选择较小的文件`)
    return
  }

  const fileObj = {
    id: Date.now() + Math.random(),
    name: file.name || 'pasted-image.png',
    size: file.size,
    progress: 0,
    file,
    status: 'uploading' as 'uploading' | 'success' | 'failed'
  }

  uploadingFiles.value.push(fileObj)

  try {
    // 显示上传进度
    fileObj.progress = 10
    fileObj.status = 'uploading'

    // 上传文件到Matrix
    const contentUri = await matrixStore.uploadFileToMatrix(file)
    fileObj.progress = 80

    if (contentUri) {
      // 发送文件消息
      await matrixStore.sendFileMessage(props.roomId, file, contentUri)
      fileObj.progress = 100
      fileObj.status = 'success'

      // 移除上传完成的文件
      setTimeout(() => {
        const index = uploadingFiles.value.findIndex(f => f.id === fileObj.id)
        if (index > -1) {
          uploadingFiles.value.splice(index, 1)
        }
      }, 2000)

      console.log(`✅ 文件 ${file.name} 上传并发送成功`)
    }
  } catch (error) {
    console.error('❌ 文件上传失败:', error)
    fileObj.progress = -1 // 标记为失败
    fileObj.status = 'failed'

    // 尝试备用上传方案
    try {
      console.log('🔄 尝试备用上传方案...')
      await uploadFileAlternative(file)
    } catch (altError) {
      console.error('❌ 备用上传方案也失败了:', altError)
    }

    // 5秒后移除失败的文件
    setTimeout(() => {
      const index = uploadingFiles.value.findIndex(f => f.id === fileObj.id)
      if (index > -1) {
        uploadingFiles.value.splice(index, 1)
      }
    }, 5000)
  }
}

// 备用文件上传方案
const uploadFileAlternative = async (file: File) => {
  console.log('🔄 使用备用方案上传文件')
  
  // 如果Matrix上传失败，尝试直接发送base64编码的图片
  const reader = new FileReader()
  
  return new Promise((resolve, reject) => {
    reader.onload = async (e) => {
      try {
        const base64Data = e.target?.result as string
        console.log('📊 文件已转换为base64，准备发送...')
        
        // 直接发送图片消息
        await matrixStore.sendMatrixMessage(props.roomId, {
          msgtype: 'm.image',
          body: file.name || '图片',
          url: base64Data,
          info: {
            mimetype: file.type,
            size: file.size
          }
        })
        
        console.log('✅ 备用方案上传成功')
        resolve(true)
      } catch (error) {
        console.error('❌ 备用方案上传失败:', error)
        reject(error)
      }
    }
    
    reader.onerror = (error) => {
      console.error('❌ 文件读取失败:', error)
      reject(error)
    }
    
    reader.readAsDataURL(file)
  })
}

const removeFile = (fileId: number) => {
  const index = uploadingFiles.value.findIndex(f => f.id === fileId)
  if (index !== -1) {
    uploadingFiles.value.splice(index, 1)
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileIcon = (file: any) => {
  const type = file.file.type
  if (type.startsWith('image/')) return '🖼️'
  if (type.startsWith('video/')) return '🎥'
  if (type.startsWith('audio/')) return '🎵'
  if (type.includes('pdf')) return '📄'
  if (type.includes('word') || type.includes('doc')) return '📝'
  if (type.includes('excel') || type.includes('sheet')) return '📊'
  if (type.includes('powerpoint') || type.includes('presentation')) return '📽️'
  if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return '📦'
  return '📄'
}

// 点击外部关闭表情选择器
const handleClickOutside = (event: MouseEvent) => {
  if (emojiPicker.value && !emojiPicker.value.contains(event.target as Node)) {
    showEmoji.value = false
  }
}

// 生命周期
onMounted(() => {
  if (messageInput.value) {
    messageInput.value.focus()
  }
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  emit('typing-stop')
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.message-input-container {
  background: #ffffff;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.reply-preview {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: #f0f0f0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.reply-content {
  flex: 1;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.reply-icon {
  color: #576b95;
  font-size: 12px;
}

.reply-user {
  color: #576b95;
  font-size: 12px;
  font-weight: 500;
}

.reply-message {
  color: #999;
  font-size: 12px;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cancel-reply {
  background: none;
  border: none;
  color: #666;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.cancel-reply:hover {
  background: rgba(0, 0, 0, 0.1);
}

.input-area {
  padding: 12px 16px;
}

.input-toolbar {
  display: flex; /* 显示工具栏，让用户可以使用表情等功能 */
  gap: 8px;
  margin-bottom: 8px;
}

.toolbar-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 14px;
}

.toolbar-btn:hover,
.toolbar-btn.active {
  background: rgba(0, 0, 0, 0.1);
}

.toolbar-btn svg {
  width: 16px;
  height: 16px;
  fill: #e0e6ed;
}

.encryption-btn.active {
  background: rgba(255, 167, 38, 0.2);
}

.formatting-toolbar {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.format-btn {
  padding: 4px 8px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: #e0e6ed;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background 0.3s ease;
}

.format-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.emoji-picker {
  position: absolute;
  bottom: 100%;
  left: 0;
  z-index: 1000;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 320px;
  max-height: 400px;
  overflow-y: auto;
}

.emoji-search {
  margin-bottom: 12px;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: #f9f9f9;
}

.search-input:focus {
  outline: none;
  border-color: #07c160;
  background: #fff;
}

.emoji-categories {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.emoji-category-btn {
  padding: 6px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s ease;
}

.emoji-category-btn:hover,
.emoji-category-btn.active {
  background: rgba(100, 181, 246, 0.2);
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.emoji-btn {
  padding: 6px;
  border: none;
  background: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: background 0.3s ease;
}

.emoji-btn:hover {
  background: rgba(0, 123, 255, 0.1);
}

.no-results {
  text-align: center;
  color: #999;
  font-size: 14px;
  padding: 20px;
}

/* 滚动条样式 */
.emoji-picker::-webkit-scrollbar {
  width: 6px;
}

.emoji-picker::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.emoji-picker::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.emoji-picker::-webkit-scrollbar-thumb:hover {
  background: #999;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  background: #f5f5f5;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  padding: 8px 12px;
}

.message-textarea {
  flex: 1;
  background: none;
  border: none;
  color: #333;
  font-size: 14px;
  line-height: 1.4;
  resize: none;
  min-height: 20px;
  max-height: 120px;
  overflow-y: auto;
  font-family: inherit;
}

.message-textarea:focus {
  outline: none;
}

.message-textarea::placeholder {
  color: #999;
}

.input-actions {
  display: flex;
  align-items: center;
}

.send-button {
  width: 32px;
  height: 32px;
  border: none;
  background: #07c160;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.send-button:hover:not(:disabled) {
  background: #06ad56;
}

.send-button:disabled {
  background: #ddd;
  cursor: not-allowed;
}

.send-button svg {
  width: 16px;
  height: 16px;
  fill: #ffffff;
}

.sending-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(26, 26, 46, 0.3);
  border-top: 2px solid #1a1a2e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.input-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
  font-size: 12px;
}

.typing-indicator {
  color: #999;
}

.typing-users {
  font-weight: 500;
}

.message-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #999;
}

.encryption-status {
  color: #07c160;
}

.char-count.warning {
  color: #fa5151;
}

.file-upload-preview {
  padding: 12px 16px;
  border-top: 1px solid #3a4a5c;
}

.file-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.file-preview.upload-failed {
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.3);
}

.file-preview.upload-complete {
  background: rgba(52, 199, 89, 0.1);
  border: 1px solid rgba(52, 199, 89, 0.3);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.file-icon {
  font-size: 1.5rem;
}

.file-details {
  flex: 1;
}

.file-name {
  font-size: 0.9rem;
  color: #e0e6ed;
}

.file-size {
  font-size: 0.8rem;
  color: #b0bec5;
}

.file-status {
  font-size: 0.75rem;
  margin-top: 2px;
}

.status-uploading {
  color: #64b5f6;
}

.status-success {
  color: #4caf50;
}

.status-failed {
  color: #f44336;
}

.file-progress {
  width: 100px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: #64b5f6;
  transition: width 0.3s ease;
}

.remove-file {
  background: none;
  border: none;
  color: #e0e6ed;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.remove-file:hover {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
}
</style>
