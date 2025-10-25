# Matrix消息功能增强实现计划

## 当前状态分析

### 已实现功能 ✅
- 基本消息发送/接收
- 消息回复功能（UI层面）
- 消息历史分页加载
- 文件上传和发送
- 表情符号输入

### 缺失的核心Matrix功能 ❌

#### 1. 消息编辑/删除
- [ ] 消息编辑 (m.replace事件)
- [ ] 消息删除/撤回 (m.room.redaction事件)
- [ ] 编辑历史查看
- [ ] 删除权限控制

#### 2. 消息回复/引用
- [x] UI层面回复预览 ✅
- [ ] Matrix协议层面回复 (m.relates_to)
- [ ] 回复消息跳转
- [ ] 引用消息显示

#### 3. 消息反应（emoji）
- [ ] 添加反应 (m.reaction事件)
- [ ] 移除反应
- [ ] 反应统计显示
- [ ] 反应用户列表

#### 4. 消息搜索
- [ ] 房间内消息搜索
- [ ] 全局消息搜索
- [ ] 搜索结果高亮
- [ ] 搜索历史

## 实现方案

### 1. 消息编辑功能

#### 前端组件增强
```typescript
// 在MatrixMessageItem.vue中添加编辑功能
interface MessageEditState {
  isEditing: boolean
  editContent: string
  originalContent: string
}
```

#### Matrix协议实现
- 使用 `m.replace` 事件类型
- 通过 `m.relates_to` 字段关联原消息
- 保存编辑历史记录

### 2. 消息删除功能

#### 删除类型
- **软删除**: 使用 `m.room.redaction` 事件
- **硬删除**: 仅限管理员权限

#### 权限控制
- 用户只能删除自己的消息
- 管理员可删除任何消息
- 时间限制（如24小时内可删除）

### 3. 消息反应系统

#### 反应数据结构
```typescript
interface MessageReaction {
  key: string // emoji
  count: number
  users: string[] // 用户ID列表
  hasReacted: boolean // 当前用户是否已反应
}
```

#### Matrix事件处理
- 监听 `m.reaction` 事件
- 聚合相同反应
- 实时更新反应状态

### 4. 消息搜索功能

#### 搜索范围
- 当前房间搜索
- 全局搜索（所有房间）
- 按时间范围搜索
- 按消息类型搜索

#### 搜索优化
- 本地缓存搜索
- 服务器端搜索API
- 搜索结果分页
- 搜索关键词高亮

## 技术实现细节

### 1. Matrix SDK集成

#### 消息编辑
```typescript
// 发送编辑消息
await matrixClient.sendEvent(roomId, 'm.room.message', {
  msgtype: 'm.text',
  body: '* ' + newContent, // 编辑后的内容
  format: 'org.matrix.custom.html',
  formatted_body: '* ' + newFormattedContent,
  'm.new_content': {
    msgtype: 'm.text',
    body: newContent,
    format: 'org.matrix.custom.html',
    formatted_body: newFormattedContent
  },
  'm.relates_to': {
    rel_type: 'm.replace',
    event_id: originalEventId
  }
})
```

#### 消息删除
```typescript
// 撤回消息
await matrixClient.redactEvent(roomId, eventId, reason)
```

#### 消息反应
```typescript
// 添加反应
await matrixClient.sendEvent(roomId, 'm.reaction', {
  'm.relates_to': {
    rel_type: 'm.annotation',
    event_id: targetEventId,
    key: emoji
  }
})
```

### 2. 前端UI组件

#### 消息操作菜单
- 长按/右键显示操作菜单
- 编辑、删除、回复、反应选项
- 权限控制显示

#### 编辑状态UI
- 内联编辑模式
- 编辑历史标识
- 取消/保存按钮

#### 反应显示
- 消息下方反应栏
- 反应数量统计
- 点击查看反应用户

### 3. 数据存储优化

#### 本地缓存
- 消息编辑历史
- 反应状态缓存
- 搜索索引构建

#### 状态管理
- Pinia store中添加消息操作状态
- 实时同步消息变更
- 乐观更新UI

## 实施时间表

### 第1周：消息编辑/删除
- [ ] 实现消息编辑UI组件
- [ ] 集成Matrix编辑API
- [ ] 实现消息删除功能
- [ ] 添加权限控制

### 第2周：消息反应系统
- [ ] 实现反应UI组件
- [ ] 集成Matrix反应API
- [ ] 反应状态管理
- [ ] 反应统计显示

### 第3周：消息搜索功能
- [ ] 实现搜索UI界面
- [ ] 本地消息搜索
- [ ] 服务器搜索集成
- [ ] 搜索结果优化

### 第4周：功能完善和测试
- [ ] 功能集成测试
- [ ] 性能优化
- [ ] 用户体验优化
- [ ] 文档完善

## 实现状态 ✅

### 已完成功能

#### 1. 消息编辑/删除 ✅
- ✅ 消息编辑 (m.replace事件)
- ✅ 消息删除/撤回 (m.room.redaction事件)
- ✅ 编辑状态显示
- ✅ 删除权限控制

#### 2. 消息回复/引用 ✅
- ✅ UI层面回复预览
- ✅ Matrix协议层面回复 (m.relates_to)
- ✅ 回复消息显示
- ✅ 引用消息格式化

#### 3. 消息反应（emoji） ✅
- ✅ 添加反应 (m.reaction事件)
- ✅ 移除反应
- ✅ 反应统计显示
- ✅ 反应状态管理

#### 4. 消息搜索 ✅
- ✅ 房间内消息搜索
- ✅ 全局消息搜索
- ✅ 搜索结果高亮
- ✅ 本地搜索备用方案

#### 5. 消息分页 ✅
- ✅ 历史消息分页加载
- ✅ 智能自动加载
- ✅ 滚动位置保持
- ✅ 加载状态指示

#### 6. 输入状态 ✅
- ✅ 输入状态通知
- ✅ 输入状态显示
- ✅ 多用户输入状态

### 新增组件

1. **MatrixMessageItem.vue** - 增强的消息项组件
   - 支持编辑、删除、回复、反应
   - 上下文菜单操作
   - 消息状态显示

2. **MatrixMessageAreaEnhanced.vue** - 增强的消息区域
   - 集成所有消息功能
   - 智能滚动管理
   - 工具栏和状态指示

3. **MessageSearchDialog.vue** - 消息搜索对话框
   - 实时搜索
   - 结果高亮
   - 跳转功能

4. **MessageFeaturesTestPage.vue** - 功能测试页面
   - 完整功能演示
   - 性能测试
   - 协议兼容性检查

### Matrix协议支持

- ✅ `m.room.message` - 基础消息
- ✅ `m.replace` - 消息编辑
- ✅ `m.room.redaction` - 消息删除
- ✅ `m.reaction` - 消息反应
- ✅ `m.in_reply_to` - 消息回复
- ✅ `m.typing` - 输入状态

### 访问方式

1. 直接访问: `/message-features-test`
2. 从主页导航: "📝 消息功能测试"
3. 集成到聊天页面使用增强组件

## 预期成果 ✅

已实现：

1. **完整的消息生命周期管理**
   - ✅ 发送 → 编辑 → 删除
   - ✅ 消息状态实时同步

2. **丰富的消息交互功能**
   - ✅ 回复、引用、反应
   - ✅ 与其他Matrix客户端完全兼容

3. **强大的消息搜索能力**
   - ✅ 快速定位历史消息
   - ✅ 多维度搜索过滤

4. **优秀的用户体验**
   - ✅ 直观的操作界面
   - ✅ 流畅的交互动画
   - ✅ 完善的错误处理

JianLuoChat的消息功能现已达到主流Matrix客户端的水平，提供完整的Matrix协议支持。所有核心消息功能均已实现并可通过测试页面验证。