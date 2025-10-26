# Matrix 房间列表缓存优化指南

## 问题分析

根据日志分析，主要问题包括：

1. **重复获取房间数据**：协调器不断触发房间数据加载，即使已经有35个房间
2. **消息重复加载**：每次都在加载消息，导致严重卡顿
3. **缺乏智能缓存**：没有有效的缓存机制避免重复请求
4. **频率控制缺失**：没有限制请求频率，导致资源浪费

## 解决方案

### 1. 智能缓存策略 (`roomListStabilizer.ts`)

**核心功能：**
- 房间列表缓存（30秒有效期）
- 消息缓存（1分钟有效期）
- 频率控制（每分钟最多3次房间获取，10次消息获取）
- 防重复请求机制
- 降级缓存策略

**使用方法：**
```typescript
import { getStableRoomList, getStableMessages } from '@/utils/roomListStabilizer'

// 获取稳定的房间列表
const rooms = await getStableRoomList('matrix.ts', async () => {
  return await actualFetchFunction()
})

// 获取稳定的消息列表
const messages = await getStableMessages(roomId, 'matrix.ts', async () => {
  return await actualMessageFetch()
})
```

### 2. 协调器集成 (`matrixStoreCoordinator.ts`)

**改进内容：**
- 集成智能缓存策略
- 减少消息加载房间数量（从5个减少到3个）
- 减少消息加载数量（从50条减少到30条）
- 添加缓存统计和管理功能

**新增方法：**
```typescript
// 强制刷新缓存
matrixStoreCoordinator.forceRefreshCache('matrix.ts')

// 获取缓存统计
const stats = matrixStoreCoordinator.getCoordinationStatus()
console.log(stats.cache)
```

### 3. Matrix Store 优化 (`matrix.ts`)

**改进内容：**
- `fetchMatrixRooms()` 集成智能缓存
- `fetchMatrixMessages()` 集成智能缓存
- 减少默认消息加载数量
- 禁用自动分页加载

## 使用指南

### 立即生效的优化

1. **自动缓存**：所有房间和消息请求现在都会自动使用缓存
2. **频率限制**：重复请求会被自动阻止
3. **降级策略**：网络问题时会使用过期缓存

### 手动控制

```javascript
// 在浏览器控制台中使用

// 查看缓存统计
window.cacheTest.stats()

// 开始监控缓存性能
window.cacheTest.start(5000) // 每5秒监控一次

// 运行压力测试
window.cacheTest.stress(10) // 10次迭代

// 清理缓存
window.cacheTest.cleanup()

// 停止监控
window.cacheTest.stop()
```

### 配置调整

```typescript
import { roomListStabilizer } from '@/utils/roomListStabilizer'

// 调整缓存配置
roomListStabilizer.updateConfig({
  roomListCacheDuration: 60000, // 增加到1分钟
  maxRoomFetchPerMinute: 2,     // 减少到每分钟2次
  messageCacheDuration: 120000  // 增加到2分钟
})
```

## 性能监控

### 关键指标

1. **缓存命中率**：应该 > 70%
2. **请求频率**：房间请求 < 3次/分钟，消息请求 < 10次/分钟
3. **响应时间**：缓存命中 < 10ms，实际请求 < 2000ms
4. **内存使用**：缓存条目 < 100个房间，< 1000个消息

### 监控命令

```javascript
// 开始实时监控
window.cacheTest.start()

// 查看详细报告
console.log(window.cacheTest.report())

// 显示实时统计
window.cacheTest.stats()
```

## 故障排除

### 常见问题

1. **房间列表仍然频繁更新**
   ```javascript
   // 检查缓存状态
   window.cacheTest.stats()
   
   // 强制刷新缓存
   window.cacheTest.cleanup()
   ```

2. **消息加载缓慢**
   ```javascript
   // 检查消息缓存
   const report = window.cacheTest.report()
   console.log(report.currentStats.messageCache)
   ```

3. **内存使用过高**
   ```javascript
   // 清理缓存
   window.cacheTest.cleanup()
   
   // 调整缓存大小
   roomListStabilizer.updateConfig({
     maxCachedRooms: 50,
     maxCachedMessages: 500
   })
   ```

### 调试模式

在开发环境中，可以启用详细日志：

```javascript
// 启用缓存调试
localStorage.setItem('cache-debug', 'true')

// 启用协调器调试
localStorage.setItem('coordinator-debug', 'true')
```

## 预期效果

### 性能改进

1. **减少网络请求**：缓存命中率 > 70%
2. **降低CPU使用**：减少重复计算和DOM更新
3. **提升响应速度**：缓存响应 < 10ms
4. **稳定房间列表**：避免频繁变化

### 用户体验

1. **消除卡顿**：房间切换更流畅
2. **稳定界面**：房间数量不再频繁变化
3. **快速加载**：消息加载更快
4. **降低流量**：减少重复数据传输

## 配置建议

### 生产环境
```typescript
{
  roomListCacheDuration: 60000,    // 1分钟
  messageCacheDuration: 120000,    // 2分钟
  maxRoomFetchPerMinute: 2,        // 每分钟2次
  maxMessageFetchPerMinute: 8,     // 每分钟8次
  maxCachedRooms: 100,
  maxCachedMessages: 1000
}
```

### 开发环境
```typescript
{
  roomListCacheDuration: 30000,    // 30秒
  messageCacheDuration: 60000,     // 1分钟
  maxRoomFetchPerMinute: 5,        // 每分钟5次
  maxMessageFetchPerMinute: 15,    // 每分钟15次
  maxCachedRooms: 50,
  maxCachedMessages: 500
}
```

## 总结

这套缓存优化方案通过以下方式解决了卡顿和房间列表不稳定的问题：

1. **智能缓存**：避免重复请求
2. **频率控制**：防止过度请求
3. **降级策略**：网络问题时保持可用性
4. **性能监控**：实时了解缓存效果
5. **灵活配置**：根据需要调整参数

预期可以将房间获取请求减少70%以上，消息获取请求减少60%以上，显著改善用户体验。