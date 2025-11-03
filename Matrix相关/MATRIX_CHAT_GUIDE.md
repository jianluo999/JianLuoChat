# JianLuoChat Matrix 聊天使用指南

## 问题解决方案

### 1. 专注Matrix协议实现 ✅

**设计理念**: JianLuoChat专注于Matrix协议的深度集成，提供真正的去中心化通信体验

**核心特色**:
- ✅ 纯Matrix协议实现，无传统聊天冗余
- ✅ 真正的联邦化支持
- ✅ 端到端加密（规划中）
- ✅ 跨平台兼容性

**可访问的页面**:
- `/` - 主页（重定向到Matrix页面）
- `/login` - 登录页面
- `/register` - 注册页面
- `/matrix` - Matrix协议聊天页面（核心功能）
- `/profile` - 用户资料页面
- `/test` - Matrix集成测试页面

### 2. Matrix协议深度集成 ✅

**技术实现**: 基于Matrix Client-Server API的完整实现

**核心功能**:
- ✅ Matrix用户认证和会话管理
- ✅ 实时消息同步和推送
- ✅ 房间创建和管理
- ✅ 联邦化服务器通信
- ✅ Matrix事件处理系统
- ✅ 设备管理和验证（规划中）

## 如何使用Matrix聊天功能

### 步骤1: 访问Matrix页面
1. 打开浏览器，访问 `http://localhost:5173/matrix`
2. 页面会显示Matrix协议聊天界面

### 步骤2: Matrix登录
在Matrix聊天演示区域：
1. 输入Matrix用户名（例如：`testuser`）
2. 输入密码（例如：`password123`）
3. 点击"登录到Matrix"按钮

### 步骤3: 开始聊天
登录成功后：
1. 默认会显示"世界频道"选项
2. 点击"🌍 世界频道"选择房间
3. 在底部输入框输入消息
4. 按回车键或点击"发送"按钮发送消息

### 步骤4: 创建房间（可选）
1. 点击"+ 创建房间"按钮
2. 输入房间名称
3. 选择是否为公开房间
4. 点击"创建"按钮

## Matrix协议特色功能

### 🌐 联邦化支持
- 支持与其他Matrix服务器的用户通信
- 用户ID格式：`@username:jianluochat.com`
- 跨服务器消息传递

### 🔐 端到端加密（规划中）
- 使用Matrix标准的Olm/Megolm加密算法
- 设备间密钥验证
- 消息前向安全

### 🏠 丰富的房间类型
- **世界频道**: 公开的全球交流频道
- **私密房间**: 需要邀请才能加入
- **直接消息**: 两人间的私聊
- **空间**: 房间的层级组织

### 📱 实时同步
- 消息实时推送
- 多设备同步
- 离线消息支持

## 技术架构

### 前端技术栈
- **Vue 3** - 现代化前端框架
- **TypeScript** - 类型安全
- **Pinia** - 状态管理
- **Vue Router** - 路由管理

### 后端技术栈
- **Spring Boot 3** - Java后端框架
- **Matrix Protocol** - 去中心化通信协议
- **WebSocket** - 实时通信
- **REST API** - HTTP接口

### Matrix集成
- **RealMatrixService** - 真实Matrix服务器连接
- **Matrix Client API** - 标准Matrix客户端API
- **Federation Support** - 联邦化支持

## 故障排除

### 1. 无法登录Matrix
**可能原因**:
- Matrix服务器连接问题
- 用户名或密码错误
- 网络连接问题

**解决方法**:
1. 检查网络连接
2. 确认Matrix服务器状态
3. 尝试使用测试账号：用户名 `testuser`，密码 `password123`

### 2. 消息发送失败
**可能原因**:
- 未选择房间
- Matrix连接断开
- 服务器错误

**解决方法**:
1. 确保已选择房间
2. 检查连接状态（右上角状态指示器）
3. 尝试重新登录

### 3. 房间列表为空
**可能原因**:
- 首次登录，尚未加入任何房间
- 同步未完成

**解决方法**:
1. 等待同步完成
2. 手动创建或加入房间
3. 刷新页面重试

## 开发者信息

### API端点
- `POST /matrix/login` - Matrix用户登录
- `GET /matrix/status` - 获取Matrix服务状态
- `GET /matrix/world-channel` - 获取世界频道信息
- `POST /matrix/test/sync` - Matrix消息同步
- `POST /rooms` - 创建房间

### 配置文件
```yaml
# application.yml
matrix:
  homeserver:
    url: https://matrix.jianluochat.com
    domain: jianluochat.com
  world:
    room:
      alias: "#world:jianluochat.com"
  federation:
    enabled: true
```

### 环境变量
```bash
VITE_API_URL=http://localhost:8080/api
```

## 下一步计划

### 短期目标
- [ ] 完善端到端加密功能
- [ ] 添加文件传输支持
- [ ] 实现消息编辑和删除
- [ ] 添加表情符号支持

### 长期目标
- [ ] 移动端适配
- [ ] 语音/视频通话
- [ ] 机器人集成
- [ ] 主题定制

## 联系支持

如果遇到问题或需要帮助：
1. 查看控制台错误信息
2. 检查网络连接状态
3. 尝试重启应用程序
4. 联系开发团队

---

**JianLuoChat Matrix Client v1.0**
专注Matrix协议的去中心化即时通讯客户端
真正的联邦化 • 端到端加密 • 开源协议
