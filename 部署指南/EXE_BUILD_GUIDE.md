# Matrix聊天客户端 - EXE构建指南

## 📋 概述

本指南将帮助你将Matrix聊天客户端构建为Windows EXE可执行文件，让不懂代码的用户也能轻松使用。

## 🎯 构建目标

- **安装版EXE**：用户可以安装到系统中，创建桌面快捷方式
- **便携版EXE**：无需安装，双击即可运行
- **用户友好**：普通用户无需安装开发环境

## 🛠️ 构建步骤

### 第一步：环境准备

1. **确保Node.js已安装**
   ```bash
   node --version
   npm --version
   ```

2. **以管理员身份运行命令提示符**
   - 右键点击"命令提示符"或"PowerShell"
   - 选择"以管理员身份运行"
   - 这是为了解决Windows符号链接权限问题

### 第二步：构建前端项目

```bash
# 进入前端目录
cd frontend

# 安装依赖（如果还没安装）
npm install

# 构建前端项目
npm run build-only
```

### 第三步：构建Electron应用

```bash
# 进入electron目录
cd ../electron

# 安装依赖（如果还没安装）
npm install

# 构建Windows EXE文件
npm run build:win
```

### 第四步：处理可能的问题

#### 权限问题
如果遇到符号链接权限错误：
- 确保以管理员身份运行命令提示符
- 或者启用Windows开发者模式

#### 网络问题
如果下载失败，可以设置环境变量：
```bash
set ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES=true
set CSC_IDENTITY_AUTO_DISCOVERY=false
npm run build:win
```

## 📦 构建结果

构建成功后，在 `electron/dist/` 目录下会生成以下文件：

### 🎯 主要文件

1. **`Matrix聊天客户端 Setup 1.0.0.exe`**
   - **类型**：安装程序
   - **大小**：约100-200MB
   - **用途**：用户双击运行，会安装到系统中
   - **特点**：
     - 在开始菜单创建快捷方式
     - 在桌面创建快捷方式
     - 支持卸载
     - 适合正式分发给用户

2. **`Matrix聊天客户端 1.0.0.exe`**
   - **类型**：便携版应用
   - **大小**：约100-200MB
   - **用途**：可以直接双击运行，无需安装
   - **特点**：
     - 绿色软件，无需安装
     - 适合测试或临时使用
     - 可以放在U盘中携带

### 📁 其他文件

- **`win-unpacked/`**：未打包的应用程序文件夹
- **`builder-effective-config.yaml`**：构建配置文件
- **`Matrix聊天客户端 Setup 1.0.0.exe.blockmap`**：安装程序的块映射文件

## 🚀 使用方法

### 对于开发者
- 运行 `Matrix聊天客户端 1.0.0.exe` 进行测试
- 将exe文件分享给用户

### 对于最终用户
1. **使用安装版**：
   - 双击 `Matrix聊天客户端 Setup 1.0.0.exe`
   - 按照安装向导完成安装
   - 从开始菜单或桌面快捷方式启动

2. **使用便携版**：
   - 直接双击 `Matrix聊天客户端 1.0.0.exe`
   - 应用程序立即启动，无需安装

## ⚙️ 配置说明

### Electron Builder配置

项目使用以下关键配置（在 `electron/package.json` 中）：

```json
{
  "build": {
    "appId": "com.matrix.desktop.client",
    "productName": "Matrix聊天客户端",
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64"]
        },
        {
          "target": "portable", 
          "arch": ["x64"]
        }
      ],
      "sign": null
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
```

### 关键特性
- **跳过代码签名**：`"sign": null`（避免权限问题）
- **支持自定义安装路径**：`"allowToChangeInstallationDirectory": true`
- **创建桌面快捷方式**：`"createDesktopShortcut": true`
- **创建开始菜单快捷方式**：`"createStartMenuShortcut": true`

## 🔧 故障排除

### 常见问题

1. **权限错误**
   ```
   ERROR: Cannot create symbolic link : 客户端没有所需的特权
   ```
   **解决方案**：以管理员身份运行命令提示符

2. **网络下载失败**
   ```
   Get "https://github.com/...": connection was forcibly closed
   ```
   **解决方案**：检查网络连接或代理设置

3. **TypeScript编译错误**
   **解决方案**：使用 `npm run build-only` 跳过类型检查

### 快速修复命令

```bash
# 清理并重新构建
cd electron
npm run clean
npm install
npm run build:win
```

## 📋 系统要求

### 开发环境
- Windows 10/11
- Node.js 16+
- npm 8+
- 管理员权限

### 运行环境（最终用户）
- Windows 10/11 (x64)
- 无需其他依赖

## 🎉 总结

通过以上步骤，你已经成功将Matrix聊天客户端构建为Windows EXE文件。现在：

- ✅ 不懂代码的用户可以直接使用
- ✅ 无需安装开发环境
- ✅ 支持安装版和便携版两种形式
- ✅ 用户体验友好

你可以将生成的EXE文件分发给任何Windows用户，他们只需双击即可使用你的Matrix聊天客户端！