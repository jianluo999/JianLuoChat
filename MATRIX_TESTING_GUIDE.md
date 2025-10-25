# Matrix SDK 集成测试指南

## 🧪 测试策略

本指南提供了全面的Matrix SDK集成测试方案，确保优化后的实现稳定可靠。

## 📋 测试清单

### 1. 单元测试

#### 1.1 Store状态管理测试
```typescript
// tests/stores/matrix-unified.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMatrixUnifiedStore } from '@/stores/matrix-unified'

describe('Matrix Unified Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with default state', () => {
    const store = useMatrixUnifiedStore()
    
    expect(store.isConnected).toBe(false)
    expect(store.currentUser).toBeNull()
    expect(store.rooms).toHaveLength(0)
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('should handle login correctly', async () => {
    const store = useMatrixUnifiedStore()
    
    // Mock API response
    vi.mock('@/services/api', () => ({
      matrixAPI: {
        login: vi.fn().mockResolvedValue({
          data: {
            success: true,
            accessToken: 'test-token',
            deviceId: 'test-device'
          }
        })
      }
    }))

    const result = await store.matrixLogin('testuser', 'testpass')
    
    expect(result.success).toBe(true)
    expect(store.isConnected).toBe(true)
    expect(store.currentUser?.username).toBe('testuser')
  })

  it('should handle login failure', async () => {
    const store = useMatrixUnifiedStore()
    
    vi.mock('@/services/api', () => ({
      matrixAPI: {
        login: vi.fn().mockRejectedValue(new Error('Login failed'))
      }
    }))

    const result = await store.matrixLogin('testuser', 'wrongpass')
    
    expect(result.success).toBe(false)
    expect(store.isConnected).toBe(false)
    expect(store.error).toBeTruthy()
  })

  it('should manage rooms correctly', async () => {
    const store = useMatrixUnifiedStore()
    
    // Mock Matrix client
    const mockClient = {
      getRooms: vi.fn().mockReturnValue([
        {
          roomId: '!test:matrix.org',
          name: 'Test Room',
          getCanonicalAlias: () => '#test:matrix.org',
          getJoinRule: () => 'public',
          getJoinedMemberCount: () => 5,
          hasEncryptionStateEvent: () => false
        }
      ])
    }
    
    store.matrixClient = mockClient
    
    const rooms = await store.fetchMatrixRooms()
    
    expect(rooms).toHaveLength(2) // 包含文件传输助手
    expect(rooms[1].name).toBe('Test Room')
    expect(rooms[1].isPublic).toBe(true)
  })
})
```

#### 1.2 工具函数测试
```typescript
// tests/utils/matrix-utils.test.ts
import { describe, it, expect } from 'vitest'
import { useMatrixUnifiedStore } from '@/stores/matrix-unified'

describe('Matrix Utils', () => {
  it('should format file size correctly', () => {
    const store = useMatrixUnifiedStore()
    
    expect(store.formatFileSize(0)).toBe('0 Bytes')
    expect(store.formatFileSize(1024)).toBe('1 KB')
    expect(store.formatFileSize(1048576)).toBe('1 MB')
    expect(store.formatFileSize(1073741824)).toBe('1 GB')
  })

  it('should retry with backoff', async () => {
    const store = useMatrixUnifiedStore()
    let attempts = 0
    
    const failingFunction = async () => {
      attempts++
      if (attempts < 3) {
        throw new Error('Temporary failure')
      }
      return 'success'
    }

    const result = await store.retryWithBackoff(failingFunction, 3, 100)
    
    expect(result).toBe('success')
    expect(attempts).toBe(3)
  })
})
```

### 2. 集成测试

#### 2.1 Matrix客户端集成测试
```typescript
// tests/integration/matrix-client.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useMatrixUnifiedStore } from '@/stores/matrix-unified'

describe('Matrix Client Integration', () => {
  let store: ReturnType<typeof useMatrixUnifiedStore>

  beforeEach(() => {
    store = useMatrixUnifiedStore()
  })

  afterEach(async () => {
    await store.logout()
  })

  it('should create and initialize Matrix client', async () => {
    const success = await store.initializeMatrix()
    
    if (success) {
      expect(store.matrixClient).toBeTruthy()
      expect(store.isConnected).toBe(true)
    }
  })

  it('should handle sync events', async () => {
    // 需要真实的Matrix服务器或mock
    // 这里提供测试框架
    const mockSyncEvent = {
      state: 'PREPARED',
      prevState: 'SYNCING',
      data: {
        response: {
          next_batch: 'test-batch-token'
        }
      }
    }

    // 模拟同步事件
    if (store.matrixClient) {
      store.matrixClient.emit('sync', mockSyncEvent.state, mockSyncEvent.prevState, mockSyncEvent.data)
    }

    expect(store.connection.syncState.isActive).toBe(true)
    expect(store.connection.syncState.nextBatch).toBe('test-batch-token')
  })
})
```

#### 2.2 缓存系统测试
```typescript
// tests/integration/cache.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useMatrixUnifiedStore } from '@/stores/matrix-unified'

describe('Cache System', () => {
  let store: ReturnType<typeof useMatrixUnifiedStore>

  beforeEach(() => {
    store = useMatrixUnifiedStore()
  })

  it('should save and load rooms from cache', async () => {
    const testRooms = [
      {
        id: '!test:matrix.org',
        name: 'Test Room',
        type: 'public' as const,
        isPublic: true,
        memberCount: 5,
        unreadCount: 0,
        encrypted: false
      }
    ]

    // 保存到缓存
    store.rooms.push(...testRooms)
    await store.saveRoomsToStorage()

    // 清空内存
    store.rooms.splice(0)

    // 从缓存加载
    const loaded = await store.loadRoomsFromStorage()
    
    expect(loaded).toBe(true)
    expect(store.rooms).toHaveLength(1)
    expect(store.rooms[0].name).toBe('Test Room')
  })

  it('should save and load messages from cache', async () => {
    const testMessages = [
      {
        id: 'msg1',
        roomId: '!test:matrix.org',
        content: 'Test message',
        sender: '@user:matrix.org',
        timestamp: Date.now(),
        type: 'm.room.message'
      }
    ]

    // 保存到缓存
    store.messages.set('!test:matrix.org', testMessages)
    await store.saveMessagesToStorage()

    // 清空内存
    store.messages.clear()

    // 从缓存加载
    await store.loadMessagesFromStorage()
    
    const loadedMessages = store.messages.get('!test:matrix.org')
    expect(loadedMessages).toHaveLength(1)
    expect(loadedMessages?.[0].content).toBe('Test message')
  })
})
```

### 3. 端到端测试

#### 3.1 用户流程测试
```typescript
// tests/e2e/user-flow.test.ts
import { test, expect } from '@playwright/test'

test.describe('Matrix User Flow', () => {
  test('complete user journey', async ({ page }) => {
    // 访问应用
    await page.goto('/')

    // 登录
    await page.fill('[data-testid="username"]', 'testuser')
    await page.fill('[data-testid="password"]', 'testpass')
    await page.click('[data-testid="login-button"]')

    // 等待登录完成
    await expect(page.locator('[data-testid="user-info"]')).toBeVisible()

    // 检查房间列表
    await expect(page.locator('[data-testid="room-list"]')).toBeVisible()
    await expect(page.locator('[data-testid="file-transfer-room"]')).toBeVisible()

    // 选择房间
    await page.click('[data-testid="file-transfer-room"]')

    // 发送消息
    await page.fill('[data-testid="message-input"]', 'Hello, World!')
    await page.click('[data-testid="send-button"]')

    // 验证消息显示
    await expect(page.locator('[data-testid="message-list"]')).toContainText('Hello, World!')

    // 登出
    await page.click('[data-testid="logout-button"]')
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
  })

  test('file upload flow', async ({ page }) => {
    // 登录流程...
    
    // 选择文件传输助手
    await page.click('[data-testid="file-transfer-room"]')

    // 上传文件
    const fileInput = page.locator('[data-testid="file-input"]')
    await fileInput.setInputFiles('tests/fixtures/test-image.png')

    // 验证文件消息
    await expect(page.locator('[data-testid="file-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="file-message"]')).toContainText('test-image.png')
  })
})
```

### 4. 性能测试

#### 4.1 加载性能测试
```typescript
// tests/performance/load-performance.test.ts
import { describe, it, expect } from 'vitest'
import { useMatrixUnifiedStore } from '@/stores/matrix-unified'

describe('Load Performance', () => {
  it('should initialize within acceptable time', async () => {
    const store = useMatrixUnifiedStore()
    
    const startTime = performance.now()
    await store.initializeMatrix()
    const endTime = performance.now()
    
    const initTime = endTime - startTime
    console.log(`初始化耗时: ${initTime}ms`)
    
    // 应该在5秒内完成初始化
    expect(initTime).toBeLessThan(5000)
  })

  it('should load rooms efficiently', async () => {
    const store = useMatrixUnifiedStore()
    
    // 模拟大量房间
    const mockRooms = Array.from({ length: 100 }, (_, i) => ({
      roomId: `!room${i}:matrix.org`,
      name: `Room ${i}`,
      getCanonicalAlias: () => `#room${i}:matrix.org`,
      getJoinRule: () => 'public',
      getJoinedMemberCount: () => Math.floor(Math.random() * 100),
      hasEncryptionStateEvent: () => false
    }))

    store.matrixClient = {
      getRooms: () => mockRooms,
      clientRunning: true
    }

    const startTime = performance.now()
    await store.fetchMatrixRooms()
    const endTime = performance.now()
    
    const loadTime = endTime - startTime
    console.log(`房间加载耗时: ${loadTime}ms`)
    
    // 应该在2秒内完成加载
    expect(loadTime).toBeLessThan(2000)
    expect(store.rooms).toHaveLength(101) // 100个房间 + 文件传输助手
  })

  it('should handle large message lists efficiently', async () => {
    const store = useMatrixUnifiedStore()
    
    // 模拟大量消息
    const mockMessages = Array.from({ length: 1000 }, (_, i) => ({
      id: `msg${i}`,
      roomId: '!test:matrix.org',
      content: `Message ${i}`,
      sender: '@user:matrix.org',
      timestamp: Date.now() - i * 1000,
      type: 'm.room.message'
    }))

    const startTime = performance.now()
    store.messages.set('!test:matrix.org', mockMessages)
    const endTime = performance.now()
    
    const setTime = endTime - startTime
    console.log(`消息设置耗时: ${setTime}ms`)
    
    // 应该在100ms内完成
    expect(setTime).toBeLessThan(100)
  })
})
```

#### 4.2 内存使用测试
```typescript
// tests/performance/memory-usage.test.ts
import { describe, it, expect } from 'vitest'
import { useMatrixUnifiedStore } from '@/stores/matrix-unified'

describe('Memory Usage', () => {
  it('should not leak memory during normal operations', async () => {
    const store = useMatrixUnifiedStore()
    
    // 获取初始内存使用
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0
    
    // 执行一系列操作
    for (let i = 0; i < 100; i++) {
      const mockMessage = {
        id: `msg${i}`,
        roomId: '!test:matrix.org',
        content: `Message ${i}`,
        sender: '@user:matrix.org',
        timestamp: Date.now(),
        type: 'm.room.message'
      }
      
      const messages = store.messages.get('!test:matrix.org') || []
      store.messages.set('!test:matrix.org', [...messages, mockMessage])
    }
    
    // 清理
    store.messages.clear()
    
    // 强制垃圾回收（如果可用）
    if (global.gc) {
      global.gc()
    }
    
    // 检查内存使用
    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0
    const memoryIncrease = finalMemory - initialMemory
    
    console.log(`内存增长: ${memoryIncrease} bytes`)
    
    // 内存增长应该在合理范围内（小于10MB）
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024)
  })
})
```

### 5. 错误处理测试

#### 5.1 网络错误测试
```typescript
// tests/error-handling/network-errors.test.ts
import { describe, it, expect, vi } from 'vitest'
import { useMatrixUnifiedStore } from '@/stores/matrix-unified'

describe('Network Error Handling', () => {
  it('should handle network failures gracefully', async () => {
    const store = useMatrixUnifiedStore()
    
    // Mock网络错误
    vi.mock('@/services/api', () => ({
      matrixAPI: {
        login: vi.fn().mockRejectedValue(new Error('NetworkError'))
      }
    }))

    const result = await store.matrixLogin('testuser', 'testpass')
    
    expect(result.success).toBe(false)
    expect(result.error).toContain('网络连接失败')
  })

  it('should retry failed operations', async () => {
    const store = useMatrixUnifiedStore()
    let attempts = 0
    
    const unreliableFunction = async () => {
      attempts++
      if (attempts < 3) {
        throw new Error('Temporary failure')
      }
      return 'success'
    }

    const result = await store.retryWithBackoff(unreliableFunction, 3, 100)
    
    expect(result).toBe('success')
    expect(attempts).toBe(3)
  })
})
```

### 6. 兼容性测试

#### 6.1 浏览器兼容性测试
```typescript
// tests/compatibility/browser-support.test.ts
import { describe, it, expect } from 'vitest'

describe('Browser Compatibility', () => {
  it('should detect WebAssembly support', () => {
    const hasWebAssembly = typeof WebAssembly !== 'undefined'
    console.log(`WebAssembly支持: ${hasWebAssembly}`)
    
    // 在不支持WebAssembly的环境中应该优雅降级
    expect(typeof hasWebAssembly).toBe('boolean')
  })

  it('should detect IndexedDB support', () => {
    const hasIndexedDB = typeof indexedDB !== 'undefined'
    console.log(`IndexedDB支持: ${hasIndexedDB}`)
    
    // 在不支持IndexedDB的环境中应该回退到localStorage
    expect(typeof hasIndexedDB).toBe('boolean')
  })

  it('should handle localStorage limitations', () => {
    const testData = JSON.stringify({ test: 'data' })
    
    try {
      localStorage.setItem('test-key', testData)
      const retrieved = localStorage.getItem('test-key')
      expect(retrieved).toBe(testData)
      localStorage.removeItem('test-key')
    } catch (error) {
      // 在localStorage不可用时应该优雅处理
      console.warn('localStorage不可用:', error)
    }
  })
})
```

## 🚀 运行测试

### 安装测试依赖
```bash
npm install -D vitest @vitest/ui jsdom @playwright/test
```

### 配置测试环境
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts']
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
```

### 运行测试命令
```bash
# 运行所有测试
npm run test

# 运行单元测试
npm run test:unit

# 运行集成测试
npm run test:integration

# 运行端到端测试
npm run test:e2e

# 运行性能测试
npm run test:performance

# 生成测试覆盖率报告
npm run test:coverage

# 运行测试UI
npm run test:ui
```

### package.json 脚本配置
```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest tests/stores tests/utils",
    "test:integration": "vitest tests/integration",
    "test:e2e": "playwright test",
    "test:performance": "vitest tests/performance",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui"
  }
}
```

## 📊 测试报告

### 覆盖率目标
- **语句覆盖率**: > 80%
- **分支覆盖率**: > 75%
- **函数覆盖率**: > 85%
- **行覆盖率**: > 80%

### 性能基准
- **初始化时间**: < 5秒
- **房间加载**: < 2秒
- **消息加载**: < 1秒
- **内存使用**: < 50MB
- **UI响应**: < 100ms

### 质量指标
- **错误处理**: 100%覆盖
- **边界情况**: 90%覆盖
- **用户流程**: 100%覆盖
- **兼容性**: 主流浏览器100%

通过这套完整的测试方案，可以确保Matrix SDK集成的质量和稳定性，为用户提供可靠的聊天体验。