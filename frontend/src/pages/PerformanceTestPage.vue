<template>
  <div class="performance-test-page">
    <h1>性能测试页面</h1>
    <div class="test-section">
      <h2>测试项目</h2>
      <div class="test-buttons">
        <el-button @click="testWheelEvent">测试Wheel事件</el-button>
        <el-button @click="testScrollPerformance">测试滚动性能</el-button>
        <el-button @click="testFPS">测试FPS</el-button>
        <el-button @click="clearLogs">清除日志</el-button>
      </div>
    </div>

    <div class="test-section">
      <h2>Element Plus 组件测试</h2>
      <div class="element-test">
        <!-- 测试ElTable的wheel事件 -->
        <el-table :data="tableData" style="width: 100%" height="200" border>
          <el-table-column prop="name" label="姓名" width="180"></el-table-column>
          <el-table-column prop="age" label="年龄" width="180"></el-table-column>
          <el-table-column prop="address" label="地址"></el-table-column>
        </el-table>
      </div>
    </div>

    <div class="test-section">
      <h2>性能监控</h2>
      <div class="performance-metrics">
        <div class="metric">
          <span class="label">当前FPS:</span>
          <span class="value" :class="fpsClass">{{ currentFPS }}</span>
        </div>
        <div class="metric">
          <span class="label">Jank计数:</span>
          <span class="value">{{ jankCount }}</span>
        </div>
        <div class="metric">
          <span class="label">滚动事件:</span>
          <span class="value">{{ scrollEventCount }}</span>
        </div>
      </div>
    </div>

    <div class="test-section">
      <h2>事件日志</h2>
      <div class="event-log" ref="eventLogRef">
        <div v-for="(log, index) in eventLogs" :key="index" class="log-entry">
          <span class="timestamp">{{ log.timestamp }}</span>
          <span class="type">{{ log.type }}</span>
          <span class="message">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { ElButton, ElTable, ElTableColumn } from 'element-plus'
import { passiveEventManager } from '@/utils/passiveEventManager'

// 响应式数据
const currentFPS = ref(0)
const jankCount = ref(0)
const scrollEventCount = ref(0)
const eventLogs = ref<Array<{timestamp: string, type: string, message: string}>>([])
const eventLogRef = ref<HTMLElement>()

// 计算属性
const fpsClass = computed(() => {
  return currentFPS.value >= 45 ? 'fps-good' : 'fps-poor'
})
const tableData = ref([
  { name: '张三', age: 25, address: '北京市朝阳区' },
  { name: '李四', age: 30, address: '上海市浦东新区' },
  { name: '王五', age: 35, address: '广州市天河区' },
  { name: '赵六', age: 28, address: '深圳市南山区' },
  { name: '钱七', age: 32, address: '杭州市西湖区' },
  { name: '孙八', age: 29, address: '成都市武侯区' },
])

// 添加日志
const addLog = (type: string, message: string) => {
  const timestamp = new Date().toLocaleTimeString()
  eventLogs.value.unshift({ timestamp, type, message })
  
  // 限制日志数量
  if (eventLogs.value.length > 50) {
    eventLogs.value = eventLogs.value.slice(0, 50)
  }
  
  // 滚动到最新日志
  nextTick(() => {
    if (eventLogRef.value) {
      eventLogRef.value.scrollTop = 0
    }
  })
}

// 测试wheel事件
const testWheelEvent = () => {
  addLog('测试', 'Wheel事件测试开始')
  addLog('信息', '请尝试在表格上使用鼠标滚轮')
}

// 测试滚动性能
const testScrollPerformance = () => {
  addLog('测试', '滚动性能测试开始')
  
  // 创建一个可滚动的元素进行测试
  const scrollContainer = document.createElement('div')
  scrollContainer.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    width: 300px;
    height: 200px;
    overflow: auto;
    background: white;
    border: 2px solid #409EFF;
    transform: translate(-50%, -50%);
    z-index: 1000;
  `
  
  const content = document.createElement('div')
  content.style.height = '1000px'
  content.innerHTML = '<div style="padding: 20px;">滚动测试区域<br/>内容很长...</div>'.repeat(50)
  scrollContainer.appendChild(content)
  
  document.body.appendChild(scrollContainer)
  
  let passive = true
  const testHandler = (e: Event) => {
    scrollEventCount.value++
    addLog('滚动', `检测到滚动事件 (总数: ${scrollEventCount.value})`)
    
    // 检查事件是否被标记为被动
    if (e.cancelable && typeof e.defaultPrevented === 'boolean') {
      if (e.defaultPrevented) {
        addLog('信息', '事件被正确阻止')
      }
    }
  }
  
  // 测试非被动监听器
  scrollContainer.addEventListener('wheel', testHandler, { passive: false })
  addLog('测试', '已添加非被动wheel监听器（应该被自动转换）')
  
  // 3秒后移除
  setTimeout(() => {
    scrollContainer.removeEventListener('wheel', testHandler)
    document.body.removeChild(scrollContainer)
    addLog('测试', '测试完成，已清理')
  }, 3000)
}

// 测试FPS
const testFPS = () => {
  addLog('测试', 'FPS测试开始')
  
  let frameCount = 0
  let lastTime = performance.now()
  let testDuration = 5000 // 5秒测试
  
  const measureFPS = () => {
    const currentTime = performance.now()
    frameCount++
    
    if (currentTime - lastTime >= 1000) {
      const fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
      currentFPS.value = fps
      frameCount = 0
      lastTime = currentTime
      
      addLog('FPS', `当前FPS: ${fps}`)
      
      if (fps < 45) {
        jankCount.value++
        addLog('警告', `低FPS检测: ${fps} (Jank计数: ${jankCount.value})`)
      }
    }
    
    testDuration -= 16 // 约60fps的间隔
    if (testDuration > 0) {
      requestAnimationFrame(measureFPS)
    } else {
      addLog('测试', 'FPS测试完成')
    }
  }
  
  measureFPS()
}

// 清除日志
const clearLogs = () => {
  eventLogs.value = []
  addLog('信息', '日志已清除')
}

// 监听被动事件管理器的性能报告
const handlePerformanceError = (error: any) => {
  addLog('性能', `${error.message} (阈值: ${error.threshold})`)
}

// 生命周期
onMounted(() => {
  addLog('系统', '性能测试页面已加载')
  addLog('系统', '被动事件管理器状态检查...')
  
  // 检查被动事件管理器是否正常工作
  try {
    const listeners = passiveEventManager.getListenersInfo()
    addLog('系统', `被动事件管理器监听器数量: ${listeners.length}`)
  } catch (error) {
    addLog('错误', '无法获取被动事件管理器状态')
  }
  
  // 开始FPS监控
  let lastTime = performance.now()
  let frameCount = 0
  
  const monitorFPS = () => {
    frameCount++
    const currentTime = performance.now()
    
    if (currentTime - lastTime >= 1000) {
      currentFPS.value = Math.round((frameCount * 1000) / (currentTime - lastTime))
      frameCount = 0
      lastTime = currentTime
    }
    
    requestAnimationFrame(monitorFPS)
  }
  
  monitorFPS()
})

onUnmounted(() => {
  addLog('系统', '性能测试页面已卸载')
})
</script>

<style scoped>
.performance-test-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fafafa;
}

.test-section h2 {
  margin-top: 0;
  color: #303133;
}

.test-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.element-test {
  margin-top: 15px;
}

.performance-metrics {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.value {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.fps-good {
  color: #67c23a;
}

.fps-poor {
  color: #f56c6c;
}

.event-log {
  height: 300px;
  overflow-y: auto;
  background: #2c3e50;
  color: #ecf0f1;
  padding: 10px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.log-entry {
  display: flex;
  gap: 10px;
  margin-bottom: 5px;
  padding: 2px 0;
  border-bottom: 1px solid #34495e;
}

.timestamp {
  color: #bdc3c7;
  min-width: 80px;
}

.type {
  color: #3498db;
  min-width: 60px;
  font-weight: bold;
}

.message {
  flex: 1;
}

:deep(.el-table) {
  background: white;
}

:deep(.el-table__body) {
  font-size: 14px;
}
</style>