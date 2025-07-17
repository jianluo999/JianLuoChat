# JianLuoChat / 简络聊

<div align="center">

![JianLuoChat Logo](docs/images/logo.png) <!-- 📸 需要截图：应用logo -->

**A Modern Matrix Protocol Client with Retro-Futuristic Design**
**基于Matrix协议的现代化即时通讯客户端，采用复古未来主义设计**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D.svg)](https://vuejs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F.svg)](https://spring.io/projects/spring-boot)
[![Matrix Protocol](https://img.shields.io/badge/Matrix-Protocol-000000.svg)](https://matrix.org/)

[English](#english) | [中文](#中文)

</div>

---

## English

### 🌟 Overview

JianLuoChat is a modern Matrix protocol client that combines the power of decentralized communication with a unique retro-futuristic design aesthetic. Built with Vue 3 and Spring Boot, it offers a seamless chat experience while maintaining full compatibility with the Matrix ecosystem.

### ✨ Key Features

- **🔐 True Matrix Protocol Integration**: Full Matrix client implementation with E2EE support
- **🌍 Federation Support**: Connect to any Matrix homeserver (matrix.org, kde.org, etc.)
- **🤝 Element Interoperability**: Full compatibility with Element and other Matrix clients
- **💬 Cross-Client Messaging**: Send and receive messages with Element users seamlessly
- **🏠 Shared Room Access**: Join and participate in rooms created by Element users
- **🎨 Retro-Futuristic UI**: Unique green terminal-style interface design
- **🌐 Bilingual Support**: Chinese-English interface with localization
- **🏠 Public Room Explorer**: Discover and join public rooms across the Matrix network
- **📱 Cross-Platform**: Web-based client accessible from any device
- **🔄 Real-time Sync**: Live message synchronization across devices
- **💾 Persistent Login**: Login state persists across browser sessions
- **🚀 Modern Tech Stack**: Vue 3 + Spring Boot 3 + PostgreSQL + Redis

### 📸 Screenshots

#### Login Interface
![Login Screen](docs/images/login-screen.png) <!-- 📸 需要截图：Matrix登录界面，显示绿色终端风格 -->

#### Main Chat Interface
![Main Interface](docs/images/main-interface.png) <!-- 📸 需要截图：主聊天界面，显示房间列表、消息区域、复古绿色主题 -->

#### Public Rooms Explorer
![Public Rooms](docs/images/public-rooms.png) <!-- 📸 需要截图：公共房间探索器，显示分页功能和房间卡片 -->

#### Element Interoperability Demo
![Element Interop](docs/images/element-interop.png) <!-- 📸 需要截图：JianLuoChat与Element客户端互通演示，显示同一房间中两个客户端的消息交互 -->

#### Room List and Navigation
![Room List](docs/images/room-list.png) <!-- 📸 需要截图：左侧房间列表和导航栏 -->

### 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │  Matrix Network │
│   (Vue 3)       │◄──►│  (Spring Boot)  │◄──►│   (Federation)  │
│                 │    │                 │    │                 │
│ • Matrix Client │    │ • Matrix SDK    │    │ • Homeservers   │
│ • Retro UI      │    │ • REST API      │    │ • Public Rooms  │
│ • Real-time     │    │ • WebSocket     │    │ • E2E Encryption│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🚀 Quick Start

#### Option 1: Docker (Recommended)

**Prerequisites**
- Docker & Docker Compose

**Installation**
1. **Clone the repository**
```bash
git clone https://github.com/jianluo999/JianLuoChat.git
cd JianLuoChat
```

2. **Start with Docker**
```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Wait for databases to be ready (about 10 seconds)
# Then start the application manually for development
```

3. **Start the application**
```bash
# Windows users
start-project.bat

# Or manually:
# Backend
cd backend && mvn spring-boot:run

# Frontend (in another terminal)
cd frontend && npm install && npm run dev
```

4. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- Test Page: http://localhost:5173/test

#### Option 2: Manual Setup

**Prerequisites**
- Node.js 18+
- Java 17+
- PostgreSQL 13+
- Redis 6+

**Installation**
1. **Clone the repository**
```bash
git clone https://github.com/jianluo999/JianLuoChat.git
cd JianLuoChat
```

2. **Setup Database**
```bash
# Install and start PostgreSQL and Redis
# Create database 'jianluochat'
```

3. **Setup Backend**
```bash
cd backend
# Configure database in src/main/resources/application.yml
./mvnw spring-boot:run
```

4. **Setup Frontend**
```bash
cd frontend
npm install
npm run dev
```

### 🔧 Configuration

#### Docker Configuration (Recommended)
The project includes a `docker-compose.yml` file with pre-configured services:

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: jianluochat
      POSTGRES_USER: jianluochat
      POSTGRES_PASSWORD: jianluochat123
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

#### Database Configuration
```yaml
# backend/src/main/resources/application.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/jianluochat
    username: jianluochat
    password: jianluochat123
```

#### Matrix Configuration
```yaml
# Matrix homeserver settings
matrix:
  homeserver: https://matrix.org
  client-name: JianLuoChat
```

### 🎯 Design Philosophy

JianLuoChat embraces a **retro-futuristic aesthetic** inspired by classic terminal interfaces and cyberpunk culture:

- **Green Terminal Theme**: Monospace fonts, green-on-black color scheme
- **Matrix Protocol First**: Built as a true Matrix client, not just another chat app
- **Element Compatibility**: Full interoperability with Element and other Matrix clients
- **Minimalist Functionality**: Focus on core communication features
- **Cultural Bridge**: Bilingual design connecting Eastern and Western users

### 🤝 Element Interoperability

JianLuoChat is designed to work seamlessly with Element and other Matrix clients:

- **✅ Shared Rooms**: Join rooms created by Element users
- **✅ Real-time Messaging**: Send and receive messages with Element users instantly
- **✅ User Discovery**: Find and communicate with users from any Matrix client
- **✅ Federation Support**: Connect across different Matrix homeservers
- **✅ Protocol Compliance**: Full Matrix Client-Server API implementation
- **🚧 E2E Encryption**: End-to-end encryption compatibility (in development)
- **🚧 File Sharing**: File transfer with Element users (in development)
- **🚧 Voice/Video**: WebRTC calls with Element users (planned)

### 🛠️ Development

#### Tech Stack
- **Frontend**: Vue 3, TypeScript, Vite, Pinia, matrix-js-sdk
- **Backend**: Spring Boot 3, Java 17, PostgreSQL, Redis
- **Matrix**: matrix-js-sdk, Matrix Client-Server API
- **UI**: Custom CSS with retro terminal styling

### 📋 Changelog

#### v1.2.0 (2025-01-17) - Fast Login & UI Optimization
**🚀 Performance Improvements**
- **Fast Login**: Reduced login time from 10-30 seconds to almost instant redirect
- **Async Initialization**: Matrix client starts in background without blocking UI
- **Route Optimization**: Simplified routing structure for faster page transitions

**🎨 UI Enhancements**
- **WeChat-style Chat Bubbles**: Adopted WeChat's classic green (#95ec69) and white color scheme
- **Message Input Optimization**: Clean WeChat-style design
- **Logout Button Repositioning**: Moved to bottom-left corner following WeChat design patterns
- **Overall Layout Optimization**: Maintained WeChat's classic layout structure

**🔧 Technical Fixes**
- **Message Retrieval API**: Fixed roomMessagesAPI calls using correct Matrix client methods
- **Room List Optimization**: Prioritized Matrix client for room fetching with API fallback
- **Message Sending Improvements**: Used Matrix client's sendTextMessage method
- **Debug Features**: Fixed client status checking methods

**📱 User Experience**
- **Instant Response**: Users see chat interface immediately after login
- **Background Loading**: Room lists and messages load asynchronously in background
- **Smooth Interactions**: Significantly improved overall application responsiveness

#### Project Structure
```
jianluochat/
├── frontend/           # Vue 3 frontend application
│   ├── src/
│   │   ├── components/ # Vue components
│   │   │   ├── MatrixRealLogin.vue      # Matrix login component
│   │   │   ├── PublicRoomsExplorer.vue  # Room discovery
│   │   │   ├── MatrixMessageArea.vue    # Chat interface
│   │   │   └── MatrixRoomList.vue       # Room navigation
│   │   ├── stores/     # Pinia stores
│   │   │   ├── matrix.ts               # Matrix client state
│   │   │   └── auth.ts                 # Authentication
│   │   ├── views/      # Page views
│   │   │   └── MatrixChatView.vue      # Main chat view
│   │   └── services/   # API services
├── backend/            # Spring Boot backend
│   ├── src/main/java/
│   │   └── com/jianluochat/
│   │       ├── controller/
│   │       ├── service/
│   │       │   └── RealMatrixService.java # Matrix integration
│   │       └── model/
└── docs/              # Documentation and screenshots
```

### 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 中文

### 🌟 项目概述

简络聊是一个现代化的Matrix协议客户端，将去中心化通讯的强大功能与独特的复古未来主义设计美学相结合。基于Vue 3和Spring Boot构建，在保持与Matrix生态系统完全兼容的同时，提供无缝的聊天体验。

### ✨ 核心特性

- **🔐 真正的Matrix协议集成**：完整的Matrix客户端实现，支持端到端加密
- **🌍 联邦支持**：连接到任何Matrix家庭服务器（matrix.org, kde.org等）
- **🤝 Element互通性**：与Element及其他Matrix客户端完全兼容
- **💬 跨客户端消息**：与Element用户无缝收发消息
- **🏠 共享房间访问**：加入并参与Element用户创建的房间
- **🎨 复古未来主义界面**：独特的绿色终端风格界面设计
- **🌐 双语支持**：中英文界面，支持本地化
- **🏠 公共房间探索器**：发现并加入Matrix网络中的公共房间
- **📱 跨平台**：基于Web的客户端，可从任何设备访问
- **🔄 实时同步**：跨设备实时消息同步
- **💾 持久登录**：登录状态在浏览器会话间保持
- **🚀 现代技术栈**：Vue 3 + Spring Boot 3 + PostgreSQL + Redis

### 🎯 设计理念

简络聊采用受经典终端界面和赛博朋克文化启发的**复古未来主义美学**：

- **绿色终端主题**：等宽字体，绿黑配色方案
- **Matrix协议优先**：构建为真正的Matrix客户端，而非普通聊天应用
- **Element兼容性**：与Element及其他Matrix客户端完全互通
- **极简功能**：专注于核心通讯功能
- **文化桥梁**：双语设计，连接东西方用户

### 🤝 Element互通性

简络聊设计为与Element和其他Matrix客户端无缝协作：

- **✅ 共享房间**：加入Element用户创建的房间
- **✅ 实时消息**：与Element用户即时收发消息
- **✅ 用户发现**：查找并与任何Matrix客户端的用户通信
- **✅ 联邦支持**：跨不同Matrix家庭服务器连接
- **✅ 协议合规**：完整的Matrix Client-Server API实现
- **🚧 端到端加密**：端到端加密兼容性（开发中）
- **🚧 文件共享**：与Element用户文件传输（开发中）
- **🚧 语音/视频**：与Element用户WebRTC通话（计划中）

### 🚀 快速开始

#### 方式一：Docker（推荐）

**环境要求**
- Docker & Docker Compose

**安装步骤**
1. **克隆仓库**
```bash
git clone https://github.com/jianluo999/JianLuoChat.git
cd JianLuoChat
```

2. **使用Docker启动**
```bash
# 启动PostgreSQL和Redis
docker-compose up -d postgres redis

# 等待数据库就绪（约10秒）
# 然后手动启动应用进行开发
```

3. **启动应用**
```bash
# Windows用户
start-project.bat

# 或手动启动：
# 后端
cd backend && mvn spring-boot:run

# 前端（另开终端）
cd frontend && npm install && npm run dev
```

4. **访问应用**
- 前端：http://localhost:5173
- 后端API：http://localhost:8080
- 测试页面：http://localhost:5173/test

#### 方式二：手动安装

**环境要求**
- Node.js 18+
- Java 17+
- PostgreSQL 13+
- Redis 6+

**安装步骤**
1. **克隆仓库**
```bash
git clone https://github.com/jianluo999/JianLuoChat.git
cd JianLuoChat
```

2. **设置数据库**
```bash
# 安装并启动PostgreSQL和Redis
# 创建数据库'jianluochat'
```

3. **设置后端**
```bash
cd backend
# 在 src/main/resources/application.yml 中配置数据库
./mvnw spring-boot:run
```

4. **设置前端**
```bash
cd frontend
npm install
npm run dev
```

### 🛠️ 开发指南

#### 技术栈
- **前端**：Vue 3, TypeScript, Vite, Pinia, matrix-js-sdk
- **后端**：Spring Boot 3, Java 17, PostgreSQL, Redis
- **Matrix**：matrix-js-sdk, Matrix Client-Server API
- **界面**：自定义CSS，复古终端样式

#### 核心功能实现状态

**✅ 已完成功能**
- Matrix协议真实登录集成
- Element客户端互通性验证
- 公共房间探索器（支持分页）
- 跨客户端实时消息收发
- 登录状态持久化
- 复古终端UI设计
- 中英双语界面
- 房间列表和导航
- 消息历史记录
- **🚀 快速登录优化**（v1.2.0新增）
- **� 微信风格界面**（v1.2.0新增）
- **🔧 API调用修复**（v1.2.0新增）

**�🚧 开发中功能**
- 端到端加密支持（Element兼容）
- 文件传输功能（跨客户端）
- 语音/视频通话（WebRTC）
- 推送通知

### 📋 更新日志

#### v1.2.0 (2025-01-17) - 快速登录与界面优化
**🚀 性能优化**
- **快速登录**: 登录时间从10-30秒缩短到几乎瞬间跳转
- **异步初始化**: Matrix客户端在后台异步启动，不阻塞界面
- **路由优化**: 简化路由结构，提升页面切换速度

**🎨 界面改进**
- **微信风格聊天气泡**: 采用微信经典的绿色(#95ec69)和白色配色
- **消息输入框优化**: 简洁的微信风格设计
- **登出按钮重新定位**: 移至左下角，符合微信设计习惯
- **整体布局优化**: 保持微信的经典布局结构

**🔧 技术修复**
- **消息获取API**: 修复roomMessagesAPI调用，使用正确的Matrix客户端方法
- **房间列表优化**: 优先使用Matrix客户端获取房间，添加API fallback
- **消息发送改进**: 使用Matrix客户端的sendTextMessage方法
- **调试功能**: 修复客户端状态检查方法

**📱 用户体验**
- **即时响应**: 用户登录后立即看到聊天界面
- **后台加载**: 房间列表和消息在后台异步加载
- **流畅交互**: 大幅提升整体应用响应速度

### 🤝 贡献指南

我们欢迎贡献！请查看我们的[贡献指南](CONTRIBUTING.md)了解详情。

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 📄 开源协议

本项目采用MIT协议 - 查看[LICENSE](LICENSE)文件了解详情。

---

<div align="center">

**Made with ❤️ for the Matrix community**

[Report Bug](https://github.com/yourusername/jianluochat/issues) • [Request Feature](https://github.com/yourusername/jianluochat/issues) • [Documentation](https://github.com/yourusername/jianluochat/wiki)

</div>
