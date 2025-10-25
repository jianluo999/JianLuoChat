# 日志上报错误处理系统

## 问题描述

在开发过程中，经常遇到埋点日志上报失败的错误，如：
```
GET https://nlog.daxuesoutijiang.com/log/... net::ERR_CONNECTION_CLOSED
```

这类错误通常由以下原因引起：
- 日志服务器无响应或主动断开连接
- 本地开发环境无法访问外网日志服务器
- 网络连接不稳定
- 用户在页面关闭/切换时触发上报，但网络已中断

## 解决方案

我们实现了一个完整的日志上报错误处理系统，包含以下组件：

### 1. 网络拦截器 (`networkInterceptor.ts`)

自动拦截所有网络请求，对日志上报相关的请求失败进行静默处理：

```typescript
import { setupNetworkInterceptor } from './utils/networkInterceptor'

// 在应用启动时设置
setupNetworkInterceptor()
```

支持的日志服务器模式：
- `nlog.daxuesoutijiang.com` - 埋点日志上报服务器
- `apm-volcano.zuoyebang.com` - APM监控服务器
- 包含 `/log/` 路径的请求
- 包含 `$PageHide`, `$PageShow` 等埋点事件的请求

### 2. 日志上报处理器 (`logReportHandler.ts`)

专门处理日志上报失败的情况：

```typescript
import { logReportHandler, safeLogReport } from './utils/logReportHandler'

// 创建安全的日志上报函数
const safeReport = safeLogReport(async () => {
  await fetch('/log/pageHide', {
    method: 'POST',
    body: JSON.stringify({ event: 'pageHide' })
  })
}, 'page-hide-report')

// 调用时不会抛出错误
safeReport()

// 查看失败统计
const stats = logReportHandler.getFailureStats()
console.log('失败统计:', stats)
```

### 3. 安全的分析工具 (`analytics.ts`)

提供开箱即用的埋点上报功能：

```typescript
import { analytics } from './utils/analytics'

// 页面浏览
analytics.pageView('首页')

// 用户行为
analytics.track('button_click', { button: 'login' })

// 错误上报
analytics.trackError(new Error('Something went wrong'))

// 性能指标
analytics.trackPerformance({ loadTime: 1200 })
```

### 4. 调试页面 (`LogReportDebugPage.vue`)

提供可视化的调试界面：

- 查看失败统计（总失败次数、最近失败次数）
- 查看常见错误类型
- 监控网络状态和日志服务器状态
- 测试日志上报功能
- 实时日志查看

访问路径：`/debug/log-report`

## 特性

### ✅ 静默处理
- 日志上报失败不会影响用户体验
- 不会在控制台显示错误信息（仅debug模式下显示）
- 不会阻塞其他功能

### ✅ 智能重试
- 自动检测网络连接状态
- 在网络恢复时尝试重新连接日志服务器
- 避免频繁重试造成性能问题

### ✅ 统计分析
- 记录失败次数和错误类型
- 提供详细的失败统计信息
- 支持按时间范围查看失败情况

### ✅ 开发友好
- 提供调试页面查看状态
- 支持测试和模拟错误
- 清晰的日志输出

## 使用方法

### 1. 初始化（在main.ts中）

```typescript
import { setupNetworkInterceptor } from './utils/networkInterceptor'
import { analytics } from './utils/analytics'

// 设置网络拦截器
setupNetworkInterceptor()

// 设置用户ID（可选）
analytics.setUserId('user123')
```

### 2. 在组件中使用

```vue
<script setup>
import { analytics } from '@/utils/analytics'
import { onMounted } from 'vue'

onMounted(() => {
  // 页面加载完成
  analytics.pageView('用户设置页')
})

function handleButtonClick() {
  // 用户行为追踪
  analytics.track('settings_save', {
    section: 'profile',
    changes: ['name', 'email']
  })
}
</script>
```

### 3. 错误处理

```typescript
try {
  // 一些可能失败的操作
  await riskyOperation()
} catch (error) {
  // 上报错误，但不影响用户体验
  analytics.trackError(error, 'risky-operation')
  
  // 继续处理用户界面
  showErrorMessage('操作失败，请重试')
}
```

## 配置选项

### 网络拦截器配置

可以通过修改 `networkInterceptor.ts` 中的 `isAPMUrl` 函数来添加更多需要静默处理的URL模式：

```typescript
function isAPMUrl(url: string): boolean {
  const apmPatterns = [
    'nlog.daxuesoutijiang.com',
    'your-analytics-domain.com',  // 添加你的分析域名
    '/api/analytics/',            // 添加特定路径
    // ... 更多模式
  ]
  return apmPatterns.some(pattern => url.includes(pattern))
}
```

### 日志处理器配置

```typescript
// 最大失败记录数（默认50）
logReportHandler.maxFailedReports = 100

// 手动清理旧记录
logReportHandler.cleanup()

// 清除所有记录
logReportHandler.clearAll()
```

## 监控和调试

### 1. 查看统计信息

```typescript
const stats = logReportHandler.getFailureStats()
console.log('总失败次数:', stats.totalFailed)
console.log('最近失败次数:', stats.recentFailed)
console.log('常见错误:', stats.commonErrors)
```

### 2. 使用调试页面

在开发环境中访问调试页面：
- 实时查看失败统计
- 测试日志上报功能
- 模拟网络错误
- 查看实时日志

### 3. 控制台调试

在浏览器控制台中：
```javascript
// 查看分析工具统计
analytics.getReportStats()

// 手动触发测试
analytics.track('debug_test', { source: 'console' })
```

## 最佳实践

1. **在应用启动时设置网络拦截器**
2. **使用analytics工具而不是直接调用fetch**
3. **定期检查调试页面了解日志上报状态**
4. **在生产环境中监控失败率**
5. **根据错误统计优化网络配置**

## 注意事项

- 该系统主要针对非关键的日志上报请求
- 关键业务请求仍会正常抛出错误
- 在生产环境中建议定期清理失败记录
- 调试页面仅在开发环境中使用

## 总结

通过这个日志上报错误处理系统，我们可以：
- ✅ 彻底解决 `ERR_CONNECTION_CLOSED` 等日志上报错误
- ✅ 提升用户体验，避免无关错误影响功能
- ✅ 保持开发调试的便利性
- ✅ 提供完整的监控和统计功能

这样就能确保埋点日志上报失败不会影响用户的正常使用体验。