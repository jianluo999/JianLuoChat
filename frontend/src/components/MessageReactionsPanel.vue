<template>
  <div class="message-reactions-panel">
    <!-- 消息反应显示 -->
    <div class="reactions-display" v-if="message.reactions && Object.keys(message.reactions).length > 0">
      <div
        v-for="(reaction, emoji) in message.reactions"
        :key="emoji"
        class="reaction-item"
        :class="{ 'has-reacted': reaction.hasReacted }"
        @click="toggleReaction(emoji)"
        :title="getReactionTooltip(reaction)"
      >
        <span class="reaction-emoji">{{ emoji }}</span>
        <span class="reaction-count">{{ reaction.count }}</span>
      </div>
    </div>

    <!-- 添加反应按钮 -->
    <div class="add-reaction-container" v-if="showAddButton">
      <button
        @click="toggleEmojiPicker"
        class="add-reaction-btn"
        :class="{ active: showEmojiPicker }"
        title="添加反应"
      >
        😊
      </button>

      <!-- 表情符号选择器 -->
      <div v-if="showEmojiPicker" class="emoji-picker" ref="emojiPicker">
        <div class="emoji-categories">
          <div
            v-for="category in emojiCategories"
            :key="category.name"
            class="emoji-category"
          >
            <div class="category-title">{{ category.title }}</div>
            <div class="emoji-grid">
              <button
                v-for="emoji in category.emojis"
                :key="emoji"
                @click="addReaction(emoji)"
                class="emoji-btn"
                :title="emoji"
              >
                {{ emoji }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMatrixStore } from '@/stores/matrix'
import type { MatrixMessage, MessageReaction } from '@/stores/matrix'

const props = defineProps<{
  message: MatrixMessage
  roomId: string
  showAddButton?: boolean
}>()

const matrixStore = useMatrixStore()

const showEmojiPicker = ref(false)
const emojiPicker = ref<HTMLElement>()

// 表情符号分类
const emojiCategories = ref([
  {
    name: 'smileys',
    title: '😊 表情',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳']
  },
  {
    name: 'gestures',
    title: '👍 手势',
    emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '🤲', '🤝', '🙏']
  },
  {
    name: 'hearts',
    title: '❤️ 爱心',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟']
  },
  {
    name: 'symbols',
    title: '✨ 符号',
    emojis: ['✨', '⭐', '🌟', '💫', '⚡', '🔥', '💯', '✅', '❌', '⚠️', '❗', '❓', '💭', '💬', '🗯️', '💤']
  }
])

const toggleReaction = async (emoji: string) => {
  if (!props.message.eventId) return

  try {
    const reaction = props.message.reactions?.[emoji]
    if (reaction?.hasReacted) {
      // 移除反应
      await matrixStore.removeReaction(props.roomId, props.message.eventId, emoji)
    } else {
      // 添加反应
      await matrixStore.addReaction(props.roomId, props.message.eventId, emoji)
    }
  } catch (error) {
    console.error('切换反应失败:', error)
  }
}

const addReaction = async (emoji: string) => {
  if (!props.message.eventId) return

  try {
    await matrixStore.addReaction(props.roomId, props.message.eventId, emoji)
    showEmojiPicker.value = false
  } catch (error) {
    console.error('添加反应失败:', error)
  }
}

const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value
}

const getReactionTooltip = (reaction: MessageReaction): string => {
  if (reaction.count === 1) {
    return reaction.hasReacted ? '你' : '1人'
  } else {
    const others = reaction.count - (reaction.hasReacted ? 1 : 0)
    if (reaction.hasReacted) {
      return others > 0 ? `你和其他${others}人` : '你'
    } else {
      return `${reaction.count}人`
    }
  }
}

// 点击外部关闭表情选择器
const handleClickOutside = (event: MouseEvent) => {
  if (emojiPicker.value && !emojiPicker.value.contains(event.target as Node)) {
    showEmojiPicker.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.message-reactions-panel {
  margin-top: 5px;
  position: relative;
}

.reactions-display {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 5px;
}

.reaction-item {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
}

.reaction-item:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.reaction-item.has-reacted {
  background: rgba(0, 255, 0, 0.2);
  border-color: #00ff00;
  color: #00ff00;
}

.reaction-emoji {
  font-size: 14px;
}

.reaction-count {
  font-size: 11px;
  font-weight: bold;
  min-width: 12px;
  text-align: center;
}

.add-reaction-container {
  position: relative;
  display: inline-block;
}

.add-reaction-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
}

.add-reaction-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.add-reaction-btn.active {
  background: rgba(0, 255, 0, 0.2);
  border-color: #00ff00;
}

.emoji-picker {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  background: #222;
  border: 2px solid #00ff00;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  width: 300px;
  max-height: 400px;
  overflow-y: auto;
}

.emoji-categories {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.emoji-category {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-title {
  color: #00ff00;
  font-weight: bold;
  font-size: 12px;
  padding-bottom: 5px;
  border-bottom: 1px solid #333;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
}

.emoji-btn {
  background: none;
  border: 1px solid transparent;
  border-radius: 6px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 16px;
}

.emoji-btn:hover {
  background: rgba(0, 255, 0, 0.1);
  border-color: #00ff00;
}

/* 滚动条样式 */
.emoji-picker::-webkit-scrollbar {
  width: 6px;
}

.emoji-picker::-webkit-scrollbar-track {
  background: #333;
  border-radius: 3px;
}

.emoji-picker::-webkit-scrollbar-thumb {
  background: #00ff00;
  border-radius: 3px;
}

.emoji-picker::-webkit-scrollbar-thumb:hover {
  background: #00cc00;
}
</style>