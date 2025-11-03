# JianluoChat Android APK 构建指南

## 前提条件

1. **安装 Android Studio**
   - 下载并安装 [Android Studio](https://developer.android.com/studio)
   - 安装 Android SDK (API 级别 33 或更高)

2. **安装 Java JDK**
   - 需要 JDK 17 或更高版本
   - 可以通过 Android Studio 安装或单独安装

3. **Node.js 环境**
   - 确保已安装 Node.js 和 npm

## 快速构建步骤

### 方法一：使用构建脚本（推荐）

1. 双击运行 `build-android.bat`
2. 脚本会自动：
   - 构建前端项目
   - 同步到 Android 平台
   - 打开 Android Studio

### 方法二：手动构建

1. **构建前端项目**
   ```bash
   cd frontend
   npm run build-only
   ```

2. **同步到 Android**
   ```bash
   npx cap sync android
   ```

3. **打开 Android Studio**
   ```bash
   npx cap open android
   ```

## 在 Android Studio 中生成 APK

1. **打开项目**
   - Android Studio 会自动打开 `frontend/android` 项目

2. **等待 Gradle 同步完成**
   - 首次打开可能需要几分钟下载依赖

3. **生成 APK**
   - 点击菜单：`Build` > `Generate Signed Bundle / APK...`
   - 选择 `APK`
   - 点击 `Next`

4. **创建或选择密钥库**
   - 如果是第一次，选择 `Create new...` 创建新的密钥库
   - 填写密钥库信息（记住密码！）
   - 如果已有密钥库，选择 `Choose existing...`

5. **选择构建类型**
   - 选择 `release` 构建类型
   - 勾选 `V1 (Jar Signature)` 和 `V2 (Full APK Signature)`
   - 点击 `Finish`

6. **等待构建完成**
   - APK 将生成在：`frontend/android/app/build/outputs/apk/release/`

## 安装 APK

1. **在设备上启用开发者选项**
   - 设置 > 关于手机 > 连续点击版本号 7 次

2. **启用未知来源安装**
   - 设置 > 安全 > 未知来源（允许安装未知来源的应用）

3. **安装 APK**
   - 将 APK 文件传输到 Android 设备
   - 点击 APK 文件进行安装

## 配置说明

### 应用信息
- **应用名称**: JianluoChat
- **包名**: com.jianluochat.app
- **最低 Android 版本**: API 24 (Android 7.0)
- **目标 Android 版本**: API 34 (Android 14)

### 权限
应用会请求以下权限：
- 网络访问（用于 Matrix 通信）
- 存储访问（用于文件传输）
- 相机和麦克风（用于语音/视频通话，如果实现）

## 故障排除

### 常见问题

1. **Gradle 同步失败**
   - 检查网络连接
   - 尝试使用 VPN
   - 清理项目：`Build` > `Clean Project`

2. **构建失败**
   - 检查 Java 版本（需要 JDK 17+）
   - 更新 Android SDK
   - 检查 Gradle 版本兼容性

3. **APK 安装失败**
   - 检查设备是否启用了未知来源安装
   - 确保 APK 文件完整下载
   - 尝试卸载旧版本后重新安装

### 调试模式

如果需要调试版本的 APK：

1. 在 Android Studio 中选择 `Build` > `Build Bundle(s) / APK(s)` > `Build APK(s)`
2. 调试版本的 APK 在：`frontend/android/app/build/outputs/apk/debug/`

## 后续优化

1. **应用图标**
   - 替换 `frontend/android/app/src/main/res/` 下的图标文件

2. **启动画面**
   - 修改 `frontend/android/app/src/main/res/drawable/splash.png`

3. **应用配置**
   - 编辑 `frontend/capacitor.config.ts` 进行更多配置

4. **性能优化**
   - 启用代码混淆
   - 优化资源文件
   - 使用 App Bundle 格式

## 发布到 Google Play

1. 生成签名的 App Bundle（推荐）或 APK
2. 在 Google Play Console 创建应用
3. 上传 App Bundle/APK
4. 填写应用信息和描述
5. 提交审核

---

**注意**: 这是一个基于 Web 技术的混合应用，性能可能不如原生应用，但开发和维护成本较低。