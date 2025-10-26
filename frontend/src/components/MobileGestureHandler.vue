<template>
  <div 
    class="gesture-handler"
    @touchstart.passive="handleTouchStart"
    @touchmove.passive="handleTouchMove"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchCancel"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface TouchData {
  startX: number
  startY: number
  startTime: number
  currentX: number
  currentY: number
  deltaX: number
  deltaY: number
  velocityX: number
  velocityY: number
}

const touchData = ref<TouchData | null>(null)
const swipeThreshold = 50 // 滑动阈值（像素）
const velocityThreshold = 0.3 // 速度阈值

// 滑动事件处理
const emit = defineEmits<{
  swipeLeft: []
  swipeRight: []
  swipeUp: []
  swipeDown: []
  longPress: []
}>()

const handleTouchStart = (event: TouchEvent) => {
  if (event.touches.length === 1) {
    const touch = event.touches[0]
    touchData.value = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      currentX: touch.clientX,
      currentY: touch.clientY,
      deltaX: 0,
      deltaY: 0,
      velocityX: 0,
      velocityY: 0
    }
  }
}

const handleTouchMove = (event: TouchEvent) => {
  if (!touchData.value) return
  
  const touch = event.touches[0]
  touchData.value.currentX = touch.clientX
  touchData.value.currentY = touch.clientY
  touchData.value.deltaX = touchData.value.currentX - touchData.value.startX
  touchData.value.deltaY = touchData.value.currentY - touchData.value.startY
}

const handleTouchEnd = (event: TouchEvent) => {
  if (!touchData.value) return
  
  const { deltaX, deltaY, startTime } = touchData.value
  const duration = Date.now() - startTime
  
  // 计算速度
  const velocityX = Math.abs(deltaX) / duration
  const velocityY = Math.abs(deltaY) / duration
  
  // 判断滑动方向
  if (Math.abs(deltaX) > swipeThreshold && velocityX > velocityThreshold) {
    if (deltaX > 0) {
      emit('swipeRight')
    } else {
      emit('swipeLeft')
    }
  }
  
  if (Math.abs(deltaY) > swipeThreshold && velocityY > velocityThreshold) {
    if (deltaY > 0) {
      emit('swipeDown')
    } else {
      emit('swipeUp')
    }
  }
  
  // 长按检测（如果移动距离很小，可能是长按）
  if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && duration > 500) {
    emit('longPress')
  }
  
  // 重置触摸数据
  touchData.value = null
}

const handleTouchCancel = () => {
  touchData.value = null
}

// 提供手势检测状态
const isSwiping = computed(() => touchData.value !== null)
const swipeDirection = computed(() => {
  if (!touchData.value) return null
  const { deltaX, deltaY } = touchData.value
  
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return deltaX > 0 ? 'right' : 'left'
  }
  return deltaY > 0 ? 'down' : 'up'
})
</script>

<style scoped>
.gesture-handler {
  position: relative;
  width: 100%;
  height: 100%;
  touch-action: pan-y; /* 允许垂直滚动 */
}

/* 防止默认滚动行为干扰手势检测 */
.gesture-handler::-webkit-scrollbar {
  display: none;
}

.gesture-handler {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>