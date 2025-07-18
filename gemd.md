# JianluoChat - 见落信チャット

**JianluoChat (见落信)** 是一个现代、强大且注重隐私的Web聊天应用。它不仅仅是一个独立的聊天平台，更是一个深度集成了 **[Matrix](https://matrix.org/) 去中心化实时通信协议** 的全功能客户端。我们的愿景是打造一个既拥有出色用户体验，又能让用户真正掌握自己数据主权的新一代通信工具。

[![Vue 3](https://img.shields.io/badge/Vue.js-3-42b883.svg)](https://vuejs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3-6db33f.svg)](https://spring.io/projects/spring-boot)
[![Matrix](https://img.shields.io/badge/Matrix-decentralized-008661.svg)](https://matrix.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ed.svg)](https://www.docker.com/)

---用的是matrix-js-sdk v37.10.0，这是一个相对较新的版本，支持Rust加密。

## 核心理念与设计哲学

在JianluoChat，我们相信通信应该是开放、安全和去中心化的。我们基于以下核心理念进行设计：

1.  **数据主权 (Data Sovereignty)**：通过集成Matrix协议，用户可以选择自己的服务器，甚至自建服务器，将通信数据掌握在自己手中，摆脱中心化平台的束缚。
2.  **联邦化宇宙 (Federated Universe)**：JianluoChat用户不仅可以和本服务器的用户通信，还可以与全球Matrix网络中任何其他服务器的用户无缝聊天，真正实现互联互通。
3.  **端到端加密 (End-to-End Encryption)**：安全是我们的最高优先级。我们计划利用Matrix的Olm/Megolm加密标准，确保只有通信双方能阅读消息内容。
4.  **现代用户体验 (Modern UX)**：我们采用现代化的技术栈（Vue 3 + Spring Boot）和简洁的UI设计，致力于提供流畅、直观、功能丰富的用户体验。

---

## 项目状态与路线图 (Project Status & Roadmap)

> 本状态分析更新于：2025年7月14日

本章节旨在明确项目当前的开发阶段与未来的发展方向。文档的其他部分可能描述了项目的最终愿景，而这里则聚焦于**已实现**与**待开发**的功能。

### 当前状态：功能完备的中心化聊天应用

项目目前已经完成了一个功能完备的、**中心化**的Web聊天应用的核心框架。您可以将其视为一个健壮的、基于WebSocket的实时通信平台。

#### 已实现的功能 ✅

*   **完整的用户认证系统**:
    *   后端通过 `AuthController.java` 提供用户注册和登录的API接口。
    *   前端通过 `LoginView.vue` 和 `RegisterView.vue` 提供对应的用户界面。
*   **核心实时聊天功能**:
    *   后端通过 `MessageController.java` 和 `WebSocket` 配置构成了实时消息处理的核心。
    *   前端通过 `ChatView.vue` 作为核心聊天界面，并包含消息输入与展示组件。
*   **基本的房间管理**:
    *   后端通过 `RoomController.java` 支持创建房间、获取房间列表和房间信息。
    *   前端通过 `RoomsView.vue` 展示和切换聊天室，并通过 `CreateRoomDialog.vue` 创建新房间。
*   **房间邀请机制**:
    *   后端通过 `InvitationController.java` 提供邀请用户加入房间的API。
*   **用户资料管理**:
    *   后端通过 `UserController.java` 允许获取和更新用户信息。
    *   前端通过 `ProfileView.vue` 提供用户查看和编辑个人资料的页面。

### 未来路线图：迈向真正的Matrix联邦

项目的最终目标是成为一个真正的Matrix客户端。以下是规划中、尚待实现的核心Matrix功能：

#### 规划中但尚未完全实现的功能 📝

*   **深度Matrix协议集成**:
    *   当前 `pom.xml` 中核心的 `matrix-client-api` 依赖被注释，表明尚未真正引入官方SDK。未来的工作将是激活并深度集成此SDK。
    *   `MatrixController.java` 需要被扩展，以处理复杂的Matrix事件和联邦逻辑。
*   **端到端加密 (E2EE)**:
    *   这是Matrix协议的核心安全���性，需要在前后端分别集成Olm/Megolm加密库，并处理复杂的密钥管理。
*   **联邦 (Federation)**:
    *   实现跨服务器通信是项目的终极目标，也是技术上最复杂的部分。这需要后端能够作为联邦的一部分与其他Matrix Homeserver进行可信的事件交换。

---

## 系统架构

JianluoChat采用前后端分离的架构，并通过Docker Compose进行容器化编排，确保了开发和部署的便捷性。

```mermaid
graph TD
    subgraph 用户端
        A[浏览器 - Vue.js App]
    end

    subgraph 服务器端 (Docker Compose)
        B[Nginx/Gateway] --> C{JianluoChat后端};
        C --> D[PostgreSQL数据库];
        C --> E[Redis缓存];
        C <--> F[Matrix Homeserver];
    end

    subgraph Matrix联邦网络
        F <--> G[其他Matrix服务器];
    end

    A -- HTTPS/REST API --> B;
    A -- WebSocket --> C;

    style A fill:#42b883,stroke:#333,stroke-width:2px
    style C fill:#6db33f,stroke:#333,stroke-width:2px
    style F fill:#008661,stroke:#333,stroke-width:2px
```

### 组件说明

*   **前端 (Frontend)**：基于 **Vue 3**、**Vite** 和 **TypeScript** 构建的单页应用（SPA）。使用 **Element Plus** 作为UI组件库，**Pinia** 进行状态管理，**Vue Router** 处���路由，并通过 **Axios** 和 **WebSocket** 与后端通信。
*   **后端 (Backend)**：基于 **Spring Boot 3** 构建的强大后端服务。
    *   **Spring Web/WebSocket**: 提供RESTful API和实时消息通道。
    *   **Spring Security**: 结合JWT实现无状态认证和授权。
    *   **Spring Data JPA**: 使用Hibernate作为ORM框架，与PostgreSQL数据库交互。
    *   **Matrix集成层**: 负责与Matrix Homeserver进行同步，处理事件流、消息收发、房间状态等。
*   **数据库 (Database)**：使用 **PostgreSQL** 持久化存储用户信息、房间信息、消息记录等核心数据。
*   **缓存 (Cache)**：使用 **Redis** 缓存会话信息、热点数据，提升系统性能。
*   **Matrix Homeserver**：可以是项目自行部署的Synapse/Dendrite，也可以连接到任何一个现有的Matrix服务器。这是实现联邦化和去中心化功能的关键。

## 核心功能

*   **用户系统**：支持用户注册、登录、个人资料管理。
*   **实时聊天**：支持一对一私聊和多人群聊，提供实时的消息收发、已读回执和输入状态提示。
*   **房间管理**：创建公开/私密房间，邀请/踢出成员，管理房间设置。
*   **Matrix联邦**：
    *   **跨域通信**：与任何Matrix用户（如`@user:matrix.org`）进行通信���
    *   **全球房间目录**：发现并加入全球Matrix网络中的公开房间。
*   **多语言支持**：内置国际化方案（`vue-i18n`），方便扩展多种语言。
*   **（规划中）端到端加密**：为所有通信提供顶级的安全保障。
*   **（规划中）空间（Spaces）**：以层级结构组织和管理相关的房间。

## 技术栈详情

### 前端

| 技术           | 描述                         |
| -------------- | ---------------------------- |
| `Vue.js 3`     | 核心渐进式JavaScript框架     |
| `Vite`         | 下一代前端构建工具           |
| `TypeScript`   | 提供静态类型检查             |
| `Pinia`        | Vue官方推荐的状态管理库      |
| `Vue Router`   | 官方路由管理器               |
| `Element Plus` | 成熟的Vue 3 UI组件库         |
| `Axios`        | 基于Promise的HTTP客户端      |
| `vue-i18n`     | 国际化插件                   |

### 后端

| 技术                | 描述                               |
| ------------------- | ---------------------------------- |
| `Spring Boot 3`     | 企业级Java应用开发框架             |
| `Java 17`           | 长期支持（LTS）的Java版本          |
| `Spring Security`   | 提供认证、授权和安全防护           |
| `JWT (jjwt)`        | 用于生成��验证JSON Web Tokens      |
| `Spring Data JPA`   | 简化数据持久化层开发               |
| `PostgreSQL`        | 功能强大的开源对象关系数据库       |
| `Redis`             | 高性能的内存数据结构存储           |
| `WebSocket`         | 实现全双工实时通信                 |
| `Maven`             | 强大的项目管理和构建工具           |

## 本地开发指南

通过 `docker-compose`，你可以一键启动项目所需的所有依赖服务。

### 1. 环境准备

*   [Git](https://git-scm.com/)
*   [JDK 17](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)
*   [Node.js 22.x](https://nodejs.org/)
*   [Docker](https://www.docker.com/) 和 [Docker Compose](https://docs.docker.com/compose/)

### 2. 克隆与配置

```bash
# 1. 克隆项目
git clone https://github.com/your-username/jilouchat.git
cd jilouchat

# 2. 复制并配置前端环境变量
cp frontend/.env.development.example frontend/.env.development
# (根据需要修改 frontend/.env.development 中的 VITE_API_BASE_URL)

# 3. 复制并配置后端配置文件
# (通常无需修改，因为docker-compose会覆盖数据库和Redis地址)
# cp backend/src/main/resources/application.yml.example backend/src/main/resources/application.yml
```

### 3. 启动项目

#### 方式一：混合模式 (推荐)

此方式使用Docker启动依赖的数据库和缓存，但在本地直接运行前后端服务，方便调试。

```bash
# 启动依赖服务 (数据库、缓存等)
docker-compose up -d postgres redis

# 启动后端 (在项目根目录运行)
cd backend
./mvnw spring-boot:run  # 或者使用 mvn spring-boot:run

# 启动前端 (在项目根目录运行)
cd ../frontend
npm install
npm run dev
```

应用将在以下地址可用：
*   **前端**: `http://localhost:5173` (或package.json中配置的其他端口)
*   **后端API**: `http://localhost:8080/api`

#### 方式二：完整Docker化运行

如果你想将整个应用（包括前后端）都在Docker中运行，请取消 `docker-compose.yml` 文件中 `backend` 和 `frontend` 服务的注释，并确保你已经为它们创建了 `Dockerfile`。

```bash
# 构建并启动所有服务
docker-compose up --build -d
```

## 贡献

我们欢迎任何形式的贡献！无论是提交Bug报告、功能建议还是代码Pull Request。

1.  Fork本仓库
2.  创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3.  提交你的修改 (`git commit -m 'Add some AmazingFeature'`)
4.  推送到分支 (`git push origin feature/AmazingFeature`)
5.  发起一个Pull Request

---
**JianluoChat - 让每一次沟通都自由、安全、无���。**


2025/7/15
评估结果
好的！现在我清楚了问题所在。让我总结一下这个项目的当前状态：

🎯 项目现状评估
✅ 已有的基础设施（完整且可用）
Spring Boot 3 后端框架 - 完整配置
Vue 3 前端 - 现代化前端架构
数据库层 - PostgreSQL + JPA + Redis
安全认证 - JWT + Spring Security
WebSocket通信 - 实时消息传输
基础实体类 - User, Room, Message等
HTTP依赖 - OkHttp + Jackson (已正确下载)
❌ 缺失的核心组件
真正的Matrix Java SDK - 当前没有可用的Matrix Java客户端库
安全相关类 - JwtUtils, UserPrincipal等缺失
Repository注入问题 - UserRepository等未正确注入
🔧 编译错误分析
主要问题: 只有2个编译错误，都是类型不匹配（Void vs boolean）
次要问题: 缺失的安全类和Repository注入
依赖状态: HTTP客户端依赖已正确下载，可以直接实现Matrix协议
🚀 解决方案
问题根源: 没有成熟可用的Matrix Java SDK，但这不是致命问题！

最佳方案:

直接实现Matrix协议 - 使用OkHttp + Jackson直接调用Matrix REST API
修复编译错误 - 只需要修复2个简单的类型错误
补充缺失类 - 创建JwtUtils, UserPrincipal等安全类
这个项目不缺Matrix SDK，而是需要我们自己实现Matrix协议客户端！这实际上更好，因为：

完全控制Matrix协议实现
不依赖第三方SDK的bug和限制
可以针对项目需求定制功能
让我立即修复这些问题，让项目编译通过