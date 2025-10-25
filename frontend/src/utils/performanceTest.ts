/**
 * Matrix 房间列表性能测试工具
 */

interface PerformanceMetrics {
  fps: number
  renderTime: number
  memoryUsage: number
  domElements: number
  scrollPerformance: number
}

interface TestResult {
  testName: string
  roomCount: number
  metrics: PerformanceMetrics
  timestamp: number
}

class RoomListPerformanceTester {
  private results: TestResult[] = []
  private frameCount = 0
  private lastTime = performance.now()
  private currentFPS = 0

  /**
   * 生成测试用的房间数据
   */
  generateTestRooms(count: number) {
    const rooms = []
    for (let i = 0; i < count; i++) {
      rooms.push({
        id: `!room${i}:matrix.org`,
        name: `测试房间 ${i + 1}`,
        alias: `#test-room-${i}:matrix.org`,
        topic: `这是第 ${i + 1} 个测试房间的主题描述`,
        type: Math.random() > 0.8 ? 'public' : 'private',
        isPublic: Math.random() > 0.8,
        memberCount: Math.floor(Math.random() * 100) + 1,
        unreadCount: Math.floor(Math.random() * 10),
        mentionCount: Math.random() > 0.9 ? Math.floor(Math.random() * 3) : 0,
        encrypted: Math.random() > 0.5,
        joinRule: Math.random() > 0.8 ? 'public' : 'invite',
        lastActivity: Date.now() - Math.floor(Math.random() * 86400000), // 随机时间
        lastMessage: Math.random() > 0.3 ? {
          sender: `@user${Math.floor(Math.random() * 10)}:matrix.org`,
          senderName: `用户${Math.floor(Math.random() * 10)}`,
          content: `这是一条测试消息内容 ${Math.random().toString(36).substring(7)}`
        } : undefined,
        avatarUrl: Math.random() > 0.7 ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}` : undefined
      })
    }
    return rooms
  }

  /**
   * 开始 FPS 监控
   */
  startFPSMonitoring() {
    const updateFPS = () => {
      this.frameCount++
      const now = performance.now()
      
      if (now - this.lastTime >= 1000) {
        this.currentFPS = Math.round((this.frameCount * 1000) / (now - this.lastTime))
        this.frameCount = 0
        this.lastTime = now
      }
      
      requestAnimationFrame(updateFPS)
    }
    
    updateFPS()
  }

  /**
   * 测试渲染性能
   */
  async testRenderPerformance(roomCount: number, useVirtualScroll: boolean = false): Promise<PerformanceMetrics> {
    const testRooms = this.generateTestRooms(roomCount)
    
    // 开始性能测量
    const startTime = performance.now()
    performance.mark('render-start')
    
    // 模拟渲染过程
    const container = document.createElement('div')
    container.style.height = '400px'
    container.style.overflow = 'auto'
    document.body.appendChild(container)
    
    if (useVirtualScroll) {
      // 虚拟滚动：只渲染可见项目
      const visibleCount = Math.min(10, roomCount) // 假设只有10个可见
      for (let i = 0; i < visibleCount; i++) {
        const roomElement = this.createRoomElement(testRooms[i])
        container.appendChild(roomElement)
      }
    } else {
      // 传统渲染：渲染所有项目
      testRooms.forEach(room => {
        const roomElement = this.createRoomElement(room)
        container.appendChild(roomElement)
      })
    }
    
    performance.mark('render-end')
    performance.measure('room-list-render', 'render-start', 'render-end')
    
    const renderTime = performance.now() - startTime
    
    // 测试滚动性能
    const scrollStartTime = performance.now()
    await this.testScrollPerformance(container)
    const scrollTime = performance.now() - scrollStartTime
    
    // 获取内存使用情况
    const memoryUsage = this.getMemoryUsage()
    
    // 计算 DOM 元素数量
    const domElements = container.querySelectorAll('*').length
    
    // 清理
    document.body.removeChild(container)
    
    return {
      fps: this.currentFPS,
      renderTime: Math.round(renderTime),
      memoryUsage,
      domElements,
      scrollPerformance: Math.round(scrollTime)
    }
  }

  /**
   * 创建房间元素
   */
  private createRoomElement(room: any): HTMLElement {
    const roomDiv = document.createElement('div')
    roomDiv.className = 'room-item'
    roomDiv.style.cssText = `
      display: flex;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #3a4a5c;
      min-height: 72px;
      background: rgba(0, 0, 0, 0.1);
    `
    
    // 头像
    const avatar = document.createElement('div')
    avatar.className = 'room-avatar'
    avatar.style.cssText = `
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #64b5f6, #42a5f5);
      margin-right: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
    `
    avatar.textContent = room.name.substring(0, 2).toUpperCase()
    
    // 房间信息
    const info = document.createElement('div')
    info.className = 'room-info'
    info.style.cssText = 'flex: 1; min-width: 0;'
    
    const name = document.createElement('div')
    name.className = 'room-name'
    name.style.cssText = 'font-weight: 600; font-size: 14px; color: #e0e6ed;'
    name.textContent = room.name
    
    const preview = document.createElement('div')
    preview.className = 'room-preview'
    preview.style.cssText = 'font-size: 12px; color: #b0bec5; margin-top: 4px;'
    preview.textContent = room.lastMessage?.content || room.topic || ''
    
    info.appendChild(name)
    info.appendChild(preview)
    
    // 徽章
    const badges = document.createElement('div')
    badges.className = 'room-badges'
    badges.style.cssText = 'display: flex; flex-direction: column; align-items: flex-end; gap: 4px;'
    
    if (room.unreadCount > 0) {
      const unreadBadge = document.createElement('div')
      unreadBadge.className = 'unread-badge'
      unreadBadge.style.cssText = `
        background: #4caf50;
        color: white;
        border-radius: 10px;
        padding: 2px 6px;
        font-size: 10px;
        font-weight: 600;
        min-width: 16px;
        text-align: center;
      `
      unreadBadge.textContent = room.unreadCount.toString()
      badges.appendChild(unreadBadge)
    }
    
    roomDiv.appendChild(avatar)
    roomDiv.appendChild(info)
    roomDiv.appendChild(badges)
    
    return roomDiv
  }

  /**
   * 测试滚动性能
   */
  private async testScrollPerformance(container: HTMLElement): Promise<void> {
    return new Promise((resolve) => {
      let scrollCount = 0
      const maxScrolls = 10
      
      const scrollTest = () => {
        if (scrollCount < maxScrolls) {
          container.scrollTop = (scrollCount / maxScrolls) * container.scrollHeight
          scrollCount++
          requestAnimationFrame(scrollTest)
        } else {
          resolve()
        }
      }
      
      scrollTest()
    })
  }

  /**
   * 获取内存使用情况
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return Math.round(memory.usedJSHeapSize / 1024 / 1024) // MB
    }
    return 0
  }

  /**
   * 运行完整的性能测试套件
   */
  async runPerformanceTestSuite(): Promise<TestResult[]> {
    console.log('🚀 开始 Matrix 房间列表性能测试...')
    
    this.startFPSMonitoring()
    
    const testCases = [
      { name: '小规模-传统渲染', roomCount: 10, useVirtualScroll: false },
      { name: '小规模-虚拟滚动', roomCount: 10, useVirtualScroll: true },
      { name: '中规模-传统渲染', roomCount: 31, useVirtualScroll: false },
      { name: '中规模-虚拟滚动', roomCount: 31, useVirtualScroll: true },
      { name: '大规模-传统渲染', roomCount: 100, useVirtualScroll: false },
      { name: '大规模-虚拟滚动', roomCount: 100, useVirtualScroll: true },
    ]
    
    for (const testCase of testCases) {
      console.log(`📊 测试: ${testCase.name} (${testCase.roomCount} 个房间)`)
      
      // 等待一段时间让 FPS 稳定
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const metrics = await this.testRenderPerformance(testCase.roomCount, testCase.useVirtualScroll)
      
      const result: TestResult = {
        testName: testCase.name,
        roomCount: testCase.roomCount,
        metrics,
        timestamp: Date.now()
      }
      
      this.results.push(result)
      
      console.log(`✅ ${testCase.name} 完成:`, {
        FPS: metrics.fps,
        渲染时间: `${metrics.renderTime}ms`,
        内存使用: `${metrics.memoryUsage}MB`,
        DOM元素: metrics.domElements,
        滚动性能: `${metrics.scrollPerformance}ms`
      })
    }
    
    this.generateReport()
    return this.results
  }

  /**
   * 生成性能报告
   */
  private generateReport() {
    console.log('\n📈 性能测试报告')
    console.log('=' .repeat(80))
    
    const traditionalResults = this.results.filter(r => r.testName.includes('传统渲染'))
    const virtualResults = this.results.filter(r => r.testName.includes('虚拟滚动'))
    
    console.log('\n🔍 传统渲染 vs 虚拟滚动对比:')
    
    for (let i = 0; i < traditionalResults.length; i++) {
      const traditional = traditionalResults[i]
      const virtual = virtualResults[i]
      
      if (traditional && virtual && traditional.roomCount === virtual.roomCount) {
        const roomCount = traditional.roomCount
        
        console.log(`\n📊 ${roomCount} 个房间:`)
        console.log(`  FPS: ${traditional.metrics.fps} → ${virtual.metrics.fps} (${this.calculateImprovement(traditional.metrics.fps, virtual.metrics.fps)}%)`)
        console.log(`  渲染时间: ${traditional.metrics.renderTime}ms → ${virtual.metrics.renderTime}ms (${this.calculateImprovement(traditional.metrics.renderTime, virtual.metrics.renderTime, true)}%)`)
        console.log(`  DOM元素: ${traditional.metrics.domElements} → ${virtual.metrics.domElements} (${this.calculateImprovement(traditional.metrics.domElements, virtual.metrics.domElements, true)}%)`)
        console.log(`  内存使用: ${traditional.metrics.memoryUsage}MB → ${virtual.metrics.memoryUsage}MB (${this.calculateImprovement(traditional.metrics.memoryUsage, virtual.metrics.memoryUsage, true)}%)`)
      }
    }
    
    console.log('\n💡 优化建议:')
    const largeScaleTraditional = traditionalResults.find(r => r.roomCount >= 50)
    if (largeScaleTraditional && largeScaleTraditional.metrics.fps < 45) {
      console.log('  ⚠️  大规模房间列表 FPS 过低，强烈建议启用虚拟滚动')
    }
    
    const highMemoryUsage = this.results.find(r => r.metrics.memoryUsage > 20)
    if (highMemoryUsage) {
      console.log('  ⚠️  内存使用过高，建议实现数据懒加载')
    }
    
    console.log('\n✅ 测试完成!')
  }

  /**
   * 计算性能提升百分比
   */
  private calculateImprovement(oldValue: number, newValue: number, isLowerBetter: boolean = false): string {
    if (oldValue === 0) return '0'
    
    const improvement = isLowerBetter 
      ? ((oldValue - newValue) / oldValue) * 100
      : ((newValue - oldValue) / oldValue) * 100
    
    return improvement > 0 ? `+${improvement.toFixed(1)}` : improvement.toFixed(1)
  }

  /**
   * 导出测试结果
   */
  exportResults(): string {
    return JSON.stringify(this.results, null, 2)
  }
}

// 导出测试工具
export const performanceTester = new RoomListPerformanceTester()

// 便捷的测试函数
export const runQuickPerformanceTest = async (roomCount: number = 31) => {
  console.log(`🔬 快速性能测试 (${roomCount} 个房间)`)
  
  const tester = new RoomListPerformanceTester()
  tester.startFPSMonitoring()
  
  // 等待 FPS 稳定
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const traditionalMetrics = await tester.testRenderPerformance(roomCount, false)
  const virtualMetrics = await tester.testRenderPerformance(roomCount, true)
  
  console.log('\n📊 测试结果:')
  console.log('传统渲染:', traditionalMetrics)
  console.log('虚拟滚动:', virtualMetrics)
  
  const fpsImprovement = ((virtualMetrics.fps - traditionalMetrics.fps) / traditionalMetrics.fps * 100).toFixed(1)
  const renderTimeImprovement = ((traditionalMetrics.renderTime - virtualMetrics.renderTime) / traditionalMetrics.renderTime * 100).toFixed(1)
  const domReduction = ((traditionalMetrics.domElements - virtualMetrics.domElements) / traditionalMetrics.domElements * 100).toFixed(1)
  
  console.log('\n🎯 性能提升:')
  console.log(`  FPS 提升: ${fpsImprovement}%`)
  console.log(`  渲染时间减少: ${renderTimeImprovement}%`)
  console.log(`  DOM 元素减少: ${domReduction}%`)
  
  return { traditionalMetrics, virtualMetrics }
}

// 在浏览器控制台中使用的全局函数
if (typeof window !== 'undefined') {
  (window as any).runMatrixPerformanceTest = () => performanceTester.runPerformanceTestSuite()
  (window as any).runQuickMatrixTest = runQuickPerformanceTest
}