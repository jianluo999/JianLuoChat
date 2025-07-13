# JianluoChat - 基于 Spring Boot 3 + Vue 3 + Matrix 协议的即时通讯系统

## 项目简介

JianluoChat 是一个现代化的即时通讯应用，采用 Spring Boot 3 + Vue 3 技术栈，集成 Matrix 协议实现去中心化通信。项目支持实时消息、文件传输、群聊、表情包等功能。

## 技术栈

### 后端技术
- **Spring Boot 3.2+** - 现代化 Java 框架
- **Spring Security 6** - 安全认证与授权
- **Spring WebSocket** - 实时通信支持
- **Spring Data JPA** - 数据持久化
- **PostgreSQL** - 主数据库
- **Redis** - 缓存和会话存储
- **Matrix Java SDK** - Matrix 协议支持
- **JWT** - 无状态认证

### 前端技术
- **Vue 3** - 渐进式前端框架
- **TypeScript** - 类型安全
- **Vite** - 快速构建工具
- **Pinia** - 状态管理
- **Vue Router 4** - 路由管理
- **Element Plus** - UI 组件库
- **Socket.io** - WebSocket 客户端

### 通信协议
- **Matrix Protocol** - 去中心化即时通讯协议
- **WebSocket** - 实时双向通信
- **RESTful API** - HTTP 接口

## 项目结构

```
jianluochat/
├── backend/                    # Spring Boot 后端
│   ├── src/main/java/
│   │   └── com/jianluochat/
│   │       ├── config/         # 配置类
│   │       ├── controller/     # 控制器
│   │       ├── entity/         # 实体类
│   │       ├── repository/     # 数据访问层
│   │       ├── service/        # 业务逻辑层
│   │       ├── security/       # 安全相关
│   │       ├── websocket/      # WebSocket 处理
│   │       └── matrix/         # Matrix 协议集成
│   └── src/main/resources/
│       ├── application.yml     # 应用配置
│       └── data.sql           # 初始化数据
├── frontend/                   # Vue 3 前端
│   ├── src/
│   │   ├── components/        # 组件
│   │   ├── views/            # 页面视图
│   │   ├── stores/           # Pinia 状态管理
│   │   ├── services/         # API 服务
│   │   └── router/           # 路由配置
│   ├── .env                  # 环境变量
│   └── package.json          # 依赖配置
└── docker-compose.yml        # Docker 编排
```

## 核心功能

### 已实现功能
- ✅ 用户注册/登录系统
- ✅ JWT 认证与授权
- ✅ 实时消息收发
- ✅ 群聊和私聊
- ✅ 消息状态跟踪（已发送/已送达/已读）
- ✅ 在线状态管理
- ✅ 输入状态指示器
- ✅ 表情包支持
- ✅ 文件上传功能
- ✅ Matrix 协议集成
- ✅ WebSocket 实时通信
- ✅ 响应式 UI 设计

### 待实现功能
- ⏳ 消息加密
- ⏳ 消息搜索
- ⏳ 推送通知
- ⏳ 语音/视频通话
- ⏳ 消息撤回
- ⏳ 群组管理
- ⏳ 主题切换

## 快速开始

### 环境要求
- Java 17+
- Node.js 18+
- PostgreSQL 12+
- Redis 6+

### 1. 启动数据库服务

```bash
# 使用 Docker Compose 启动数据库
docker-compose up postgres redis -d
```

### 2. 启动后端服务

```bash
cd backend
./mvnw spring-boot:run
```

后端服务将在 http://localhost:8080 启动

### 3. 启动前端服务

```bash
cd frontend
npm install
npm run dev
```

前端服务将在 http://localhost:5173 启动

### 4. 访问应用

打开浏览器访问 http://localhost:5173，注册新用户或使用测试账号登录。

## API 文档

### 认证接口
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/users/me` - 获取当前用户信息

### 聊天接口
- `GET /api/rooms` - 获取房间列表
- `POST /api/rooms` - 创建房间
- `GET /api/rooms/{id}/messages` - 获取消息历史
- `POST /api/rooms/{id}/messages` - 发送消息

### Matrix 接口
- `POST /api/matrix/login` - Matrix 登录
- `POST /api/matrix/rooms` - 创建 Matrix 房间
- `GET /api/matrix/sync/status` - 获取同步状态

## WebSocket 事件

### 客户端发送
- `CHAT_MESSAGE` - 发送聊天消息
- `TYPING` - 输入状态指示
- `PING` - 心跳检测

### 服务端推送
- `NEW_MESSAGE` - 新消息通知
- `TYPING_INDICATOR` - 输入状态更新
- `PRESENCE_UPDATE` - 用户状态更新
- `ROOM_INVITATION` - 房间邀请

## 配置说明

### 后端配置 (application.yml)
```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/jianluochat
    username: jianluochat
    password: jianluochat123
  
  data:
    redis:
      host: localhost
      port: 6379

jwt:
  secret: your-secret-key
  expiration: 86400000

matrix:
  homeserver:
    url: https://matrix.org
```

### 前端配置 (.env)
```env
VITE_API_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080/ws
```

## 部署

### Docker 部署
```bash
# 构建并启动所有服务
docker-compose up --build

# 后台运行
docker-compose up -d
```

### 生产环境部署
1. 修改配置文件中的数据库连接信息
2. 设置安全的 JWT 密钥
3. 配置 HTTPS 和 WSS
4. 设置反向代理 (Nginx)

## 开发指南

### 添加新功能
1. 后端：在相应的 controller、service、entity 中添加代码
2. 前端：在 stores、services、components 中实现
3. 更新 API 文档和类型定义

### 代码规范
- 后端：遵循 Spring Boot 最佳实践
- 前端：使用 TypeScript 和 Vue 3 Composition API
- 提交前运行测试和代码检查

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 联系方式

如有问题，请提交 Issue 或联系开发团队。
