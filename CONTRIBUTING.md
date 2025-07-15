# Contributing to JianLuoChat / 贡献指南

Thank you for your interest in contributing to JianLuoChat! / 感谢您对简络聊项目的贡献兴趣！

## English

### 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/jianluochat.git
   cd jianluochat
   ```
3. **Create a branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### 🛠️ Development Setup

#### Prerequisites
- Node.js 18+
- Java 17+
- PostgreSQL 13+
- Redis 6+

#### Setup Steps
1. **Backend Setup**:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### 📝 Code Style

#### Frontend (Vue 3 + TypeScript)
- Use TypeScript for all new code
- Follow Vue 3 Composition API patterns
- Use Pinia for state management
- Maintain the retro-futuristic design theme

#### Backend (Spring Boot + Java)
- Follow Spring Boot best practices
- Use proper REST API conventions
- Implement proper error handling
- Write unit tests for new features

### 🎨 Design Guidelines

- **Retro-Futuristic Theme**: Maintain the green terminal aesthetic
- **Bilingual Support**: All UI text should support both Chinese and English
- **Matrix Protocol First**: Prioritize Matrix protocol compatibility
- **Accessibility**: Ensure features are accessible to all users

### 🐛 Bug Reports

When reporting bugs, please include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Browser/OS information

### ✨ Feature Requests

For new features:
- Describe the feature clearly
- Explain the use case
- Consider Matrix protocol compatibility
- Discuss UI/UX implications

### 📋 Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Ensure all tests pass**
4. **Follow commit message conventions**:
   ```
   feat: add public room pagination
   fix: resolve login state persistence issue
   docs: update README with new screenshots
   ```
5. **Request review** from maintainers

### 🔍 Code Review

All submissions require code review. We use GitHub pull requests for this purpose.

---

## 中文

### 🚀 开始贡献

1. **Fork 仓库** 到您的 GitHub 账户
2. **克隆到本地**:
   ```bash
   git clone https://github.com/yourusername/jianluochat.git
   cd jianluochat
   ```
3. **创建功能分支**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### 🛠️ 开发环境设置

#### 环境要求
- Node.js 18+
- Java 17+
- PostgreSQL 13+
- Redis 6+

#### 设置步骤
1. **后端设置**:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

2. **前端设置**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### 📝 代码规范

#### 前端 (Vue 3 + TypeScript)
- 所有新代码使用 TypeScript
- 遵循 Vue 3 Composition API 模式
- 使用 Pinia 进行状态管理
- 保持复古未来主义设计主题

#### 后端 (Spring Boot + Java)
- 遵循 Spring Boot 最佳实践
- 使用合适的 REST API 约定
- 实现适当的错误处理
- 为新功能编写单元测试

### 🎨 设计指南

- **复古未来主义主题**: 保持绿色终端美学
- **双语支持**: 所有UI文本应支持中英文
- **Matrix协议优先**: 优先考虑Matrix协议兼容性
- **可访问性**: 确保功能对所有用户都可访问

### 🐛 错误报告

报告错误时，请包含:
- 重现步骤
- 预期行为
- 实际行为
- 截图（如适用）
- 浏览器/操作系统信息

### ✨ 功能请求

对于新功能:
- 清楚描述功能
- 解释使用场景
- 考虑Matrix协议兼容性
- 讨论UI/UX影响

### 📋 Pull Request 流程

1. **更新文档**（如需要）
2. **为新功能添加测试**
3. **确保所有测试通过**
4. **遵循提交消息约定**:
   ```
   feat: 添加公共房间分页功能
   fix: 解决登录状态持久化问题
   docs: 更新README截图
   ```
5. **请求维护者审查**

### 🔍 代码审查

所有提交都需要代码审查。我们使用GitHub pull requests进行此过程。

---

## 📞 Contact / 联系方式

- GitHub Issues: [Report bugs or request features](https://github.com/yourusername/jianluochat/issues)
- Discussions: [Join community discussions](https://github.com/yourusername/jianluochat/discussions)

Thank you for contributing! / 感谢您的贡献！
