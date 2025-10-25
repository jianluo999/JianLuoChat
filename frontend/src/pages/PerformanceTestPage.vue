<template>
  <div class="performance-test-page">
    <div class="test-header">
      <h1>Matrix 房间列表性能测试</h1>
      <p>测试虚拟滚动优化效果</p>
    </div>

    <div class="test-controls">
      <div class="control-group">
        <label>房间数量:</label>
        <select v-model="roomCount" @change="generateRooms">
          <option value="10">10 个房间</option>
          <option value="31">31 个房间 (当前)</option>
          <option value="50">50 个房间</option>
          <option value="100">100 个房间</option>
          <option value="200">200 个房间</option>
        </select>
      </div>

      <div class="control-group">
        <label>渲染模式:</label>
        <select v-model="renderMode">
          <option value="traditional">传统渲染</option>
          <option value="virtual">虚拟滚动</option>
          <option value="auto">自动选择</option>
        </select>
      </div>

      <div class="control-group">
        <button @click="runPerformanceTest" :disabled="isRunningTest" class="test-button">
          {{ isRunningTest ? '测试中...' : '运行性能测试' }}
        </button>
      </div>
    </div>

    <div class="test-results" v-if="testResults.length > 0">
      <h2>测试结果</h2>
      <div class="results-grid">
        <div 
          v-for="result in testResults" 
          :key="result.testName"
          class="result-card"
          :class="{ 'best-performance': result.isBest }"
        >
          <h3>{{ result.testName }}</h3>
          <div class="metrics">
            <div class="metric">
              <span class="metric-label">FPS:</span>
              <span class="metric-value" :class="getFPSClass(result.metrics.fps)">
                {{ result.metrics.fps }}
              </span>
            </div>
            <div class="metric">
              <span class="metric-label">渲染时间:</span>
              <span class="metric-value">{{ result.metrics.renderTime }}ms</span>
            </div>
            <div class="metric">
              <span class="metric-label">DOM 元素:</span>
              <span class="metric-value">{{ result.metrics.domElements }}</span>
            </div>
            <div class="metric">
              <span class="metric-label">内存使用:</span>
              <span class="metric-value">{{ result.metrics.memoryUsage }}MB</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="live-demo">
      <h2>实时演示</h2>
      <div class="demo-controls">
        <label class="demo-toggle">
          <input 
            type="checkbox" 
            v-model="useVirtualScrollInDemo"
            @change="updateDemoMode"
          />
          <span>启用虚拟滚动</span>
        </label>
        <div class="performance-metrics">
          <span class="fps-display">FPS: {{ currentFPS }}</span>
          <span class="render-time">渲染: {{ renderTime }}ms</span>
        </div>
      </div>

      <div class="demo-container">
        <!-- 虚拟滚动演示 -->
        <VirtualRoomList
          v-if="useVirtualScrollInDemo"
          :rooms="testRooms"
          :selected-room="selectedRoom"
          :container-height="400"
          :item-height="72"
          :show-performance-metrics="true"
          @room-selected="selectRoom"
          class="demo-room-list"
        />

        <!-- 传统渲染演示 -->
        <div 
          v-else
          class="traditional-room-list demo-room-list"
          :style="{ height: '400px', overflowY: 'auto' }"
        >
          <div
            v-for="room in testRooms"
            :key="room.id"
            class="room-item"
            :class="{ active: room.id === selectedRoom }"
            @click="selectRoom(room.id)"
          >
            <div class="room-avatar">
              <div class="avatar-placeholder">
                {{ getRoomInitials(room.name) }}
              </div>
            </div>
            <div class="room-info">
              <div class="room-name">{{ room.name }}</div>
              <div class="room-preview" v-if="room.lastMessage">
                {{ room.lastMessage.senderName }}: {{ room.lastMessage.content }}
              </div>
              <div class="room-topic" v-else-if="room.topic">
                {{ room.topic }}
              </div>
            </div>
            <div class="room-badges">
              <div v-if="room.unreadCount > 0" class="unread-badge">
                {{ room.unreadCount }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="optimization-tips">
      <h2>优化建议</h2>
      <div class="tips-grid">
        <div class="tip-card" v-for="tip in optimizationTips" :key="tip.title">
          <div class="tip-icon">{{ tip.icon }}</div>
          <h3>{{ tip.title }}</h3>
          <p>{{ tip.description }}</p>
          <div class="tip-impact" :class="tip.impact">
            影响: {{ tip.impact }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import VirtualRoomList from '@/components/VirtualRoomList.vue'
import { performanceTester, runQuickPerformanceTest } from '@/utils/performanceTest'

// 状态管理
const roomCount = ref(31)
const renderMode = ref('auto')
const isRunningTest = ref(false)
const testResults = ref<any[]>([])
const selectedRoom = ref('')

// 演示相关
const useVirtualScrollInDemo = ref(true)
const testRooms = ref<any[]>([])
const currentFPS = ref(60)
const renderTime = ref(0)

// 性能监控
let frameCount = 0
let lastTime = performance.now()

// 优化建议
const optimizationTips = [
  {
    icon: '🚀',
    title: '虚拟滚动',
    description: '只渲染可见区域的房间项，大幅减少 DOM 元素数量',
    impact: 'high'
  },
  {
    icon: '💾',
    title: '数据懒加载',
    description: '按需加载房间详细信息，减少初始内存占用',
    impact: 'medium'
  },
  {
    icon: '🔍',
    title: '搜索防抖',
    description: '延迟搜索执行，避免频繁的过滤操作',
    impact: 'medium'
  },
  {
    icon: '🖼️',
    title: '图片懒加载',
    description: '延迟加载房间头像，提升初始渲染速度',
    impact: 'low'
  },
  {
    icon: '⚡',
    title: 'Web Workers',
    description: '在后台线程处理数据，避免阻塞主线程',
    impact: 'high'
  },
  {
    icon: '📦',
    title: '数据缓存',
    description: '缓存房间数据，减少重复的网络请求',
    impact: 'medium'
  }
]

// 计算属性
const bestResult = computed(() => {
  if (testResults.value.length === 0) return null
  return testResults.value.reduce((best, current) => 
    current.metrics.fps > best.metrics.fps ? current : best
  )
})

// 方法
const generateRooms = () => {
  testRooms.value = performanceTester.generateTestRooms(parseInt(roomCount.value))
}

const runPerformanceTest = async () => {
  isRunningTest.value = true
  testResults.value = []
  
  try {
    const count = parseInt(roomCount.value)
    
    if (renderMode.value === 'traditional' || renderMode.value === 'auto') {
      const traditionalResult = await performanceTester.testRenderPerformance(count, false)
      testResults.value.push({
        testName: `传统渲染 (${count} 个房间)`,
        roomCount: count,
        metrics: traditionalResult,
        timestamp: Date.now(),
        isBest: false
      })
    }
    
    if (renderMode.value === 'virtual' || renderMode.value === 'auto') {
      const virtualResult = await performanceTester.testRenderPerformance(count, true)
      testResults.value.push({
        testName: `虚拟滚动 (${count} 个房间)`,
        roomCount: count,
        metrics: virtualResult,
        timestamp: Date.now(),
        isBest: false
      })
    }
    
    // 标记最佳性能结果
    if (bestResult.value) {
      const best = testResults.value.find(r => r.metrics.fps === bestResult.value.metrics.fps)
      if (best) best.isBest = true
    }
    
  } catch (error) {
    console.error('性能测试失败:', error)
  } finally {
    isRunningTest.value = false
  }
}

const selectRoom = (roomId: string) => {
  selectedRoom.value = roomId
}

const updateDemoMode = () => {
  console.log(`演示模式切换到: ${useVirtualScrollInDemo.value ? '虚拟滚动' : '传统渲染'}`)
}

const getRoomInitials = (name: string): string => {
  return name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2)
}

const getFPSClass = (fps: number): string => {
  if (fps >= 55) return 'fps-excellent'
  if (fps >= 45) return 'fps-good'
  if (fps >= 30) return 'fps-fair'
  return 'fps-poor'
}

// FPS 监控
const updateFPS = () => {
  frameCount++
  const now = performance.now()
  
  if (now - lastTime >= 1000) {
    currentFPS.value = Math.round((frameCount * 1000) / (now - lastTime))
    frameCount = 0
    lastTime = now
  }
  
  requestAnimationFrame(updateFPS)
}

// 生命周期
onMounted(() => {
  generateRooms()
  updateFPS()
  performanceTester.startFPSMonitoring()
})

onUnmounted(() => {
  // 清理资源
})
</script>

<style scoped>
.performance-test-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background: linear-gradient(180deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%);
  color: #e0e6ed;
  min-height: 100vh;
}

.test-header {
  text-align: center;
  margin-bottom: 30px;
}

.test-header h1 {
  color: #64b5f6;
  margin-bottom: 10px;
}

.test-header p {
  color: #b0bec5;
}

.test-controls {
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: center;
}

.control-group label {
  font-size: 14px;
  color: #b0bec5;
  font-weight: 500;
}

.control-group select {
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #3a4a5c;
  border-radius: 4px;
  color: #e0e6ed;
  font-size: 14px;
}

.test-button {
  padding: 10px 20px;
  background: linear-gradient(135deg, #64b5f6, #42a5f5);
  border: none;
  border-radius: 6px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.test-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(100, 181, 246, 0.3);
}

.test-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.test-results {
  margin-bottom: 40px;
}

.test-results h2 {
  color: #64b5f6;
  margin-bottom: 20px;
  text-align: center;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.result-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #3a4a5c;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;
}

.result-card.best-performance {
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.1);
}

.result-card h3 {
  color: #e0e6ed;
  margin-bottom: 15px;
  font-size: 16px;
}

.metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(58, 74, 92, 0.3);
}

.metric-label {
  color: #b0bec5;
  font-size: 13px;
}

.metric-value {
  color: #e0e6ed;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.fps-excellent { color: #4caf50; }
.fps-good { color: #8bc34a; }
.fps-fair { color: #ff9800; }
.fps-poor { color: #f44336; }

.live-demo {
  margin-bottom: 40px;
}

.live-demo h2 {
  color: #64b5f6;
  margin-bottom: 20px;
  text-align: center;
}

.demo-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
}

.demo-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #b0bec5;
}

.demo-toggle input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #64b5f6;
}

.performance-metrics {
  display: flex;
  gap: 20px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.fps-display {
  color: #4caf50;
}

.render-time {
  color: #64b5f6;
}

.demo-container {
  border: 1px solid #3a4a5c;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.2);
}

.demo-room-list {
  background: linear-gradient(180deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%);
}

.traditional-room-list {
  scrollbar-width: thin;
  scrollbar-color: rgba(100, 181, 246, 0.3) transparent;
}

.traditional-room-list::-webkit-scrollbar {
  width: 6px;
}

.traditional-room-list::-webkit-scrollbar-thumb {
  background: rgba(100, 181, 246, 0.3);
  border-radius: 3px;
}

.room-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid rgba(58, 74, 92, 0.3);
  transition: background-color 0.2s ease;
  min-height: 72px;
}

.room-item:hover {
  background: rgba(100, 181, 246, 0.1);
}

.room-item.active {
  background: rgba(100, 181, 246, 0.2);
  border-left: 3px solid #64b5f6;
}

.room-avatar {
  width: 40px;
  height: 40px;
  margin-right: 12px;
  flex-shrink: 0;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #64b5f6, #42a5f5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.room-info {
  flex: 1;
  min-width: 0;
}

.room-name {
  font-weight: 600;
  font-size: 14px;
  color: #e0e6ed;
  margin-bottom: 4px;
}

.room-preview, .room-topic {
  font-size: 12px;
  color: #b0bec5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.room-badges {
  flex-shrink: 0;
}

.unread-badge {
  background: #4caf50;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 600;
  min-width: 16px;
  text-align: center;
}

.optimization-tips {
  margin-bottom: 40px;
}

.optimization-tips h2 {
  color: #64b5f6;
  margin-bottom: 20px;
  text-align: center;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.tip-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #3a4a5c;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
}

.tip-card:hover {
  transform: translateY(-2px);
  border-color: #64b5f6;
}

.tip-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.tip-card h3 {
  color: #e0e6ed;
  margin-bottom: 10px;
  font-size: 16px;
}

.tip-card p {
  color: #b0bec5;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 10px;
}

.tip-impact {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.tip-impact.high {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.tip-impact.medium {
  background: rgba(255, 152, 0, 0.2);
  color: #ff9800;
}

.tip-impact.low {
  background: rgba(158, 158, 158, 0.2);
  color: #9e9e9e;
}
</style>