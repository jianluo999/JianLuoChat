# JianluoChat 发布版APK 构建指南

## 概述

本指南将帮助你生成签名的发布版APK文件，用于分发和发布到应用商店。

## 快速开始

### 方法一：使用自动化脚本（推荐）

1. **生成签名密钥库**
   ```bash
   generate-keystore.bat
   ```
   这将创建 `frontend/android/release-key.jks` 文件

2. **构建发布版APK**
   ```bash
   build-release-apk.bat
   ```
   脚本会自动完成前端构建和Android同步

3. **在Android Studio中生成APK**
   - 运行 `npx cap open android`
   - 选择 `Build > Generate Signed Bundle / APK`
   - 使用之前生成的密钥库信息

### 方法二：手动构建

1. **构建前端项目**
   ```bash
   cd frontend
   npm run build-only
   ```

2. **同步到Android平台**
   ```bash
   npx cap sync android
   ```

3. **打开Android Studio**
   ```bash
   npx cap open android
   ```

## 详细步骤

### 1. 生成签名密钥库

**重要提示**: 请记住密钥库密码，丢失后无法恢复！

```bash
generate-keystore.bat
```

**推荐配置**:
- **Keystore Path**: `frontend/android/release-key.jks`
- **Keystore Password**: `your-secure-password`
- **Alias**: `jianluochat-release`
- **Alias Password**: `your-secure-password`
- **Validity**: 25年

### 2. 在Android Studio中构建

1. **打开项目**
   - 运行 `npx cap open android`
   - Android Studio会自动打开 `frontend/android` 项目

2. **等待Gradle同步完成**
   - 首次打开可能需要几分钟下载依赖

3. **生成签名APK**
   - 点击菜单: `Build > Generate Signed Bundle / APK...`
   - 选择 `APK`
   - 点击 `Next`

4. **配置签名**
   - **Key store path**: 选择 `frontend/android/release-key.jks`
   - **Key store password**: 输入之前设置的密码
   - **Alias**: `jianluochat-release`
   - **Certificate password**: 输入别名密码
   - 点击 `Next`

5. **选择构建类型**
   - **Build Type**: `release`
   - **V1 (Jar Signature)**: 勾选
   - **V2 (Full APK Signature)**: 勾选
   - 点击 `Finish`

### 3. 构建完成

**APK文件位置**:
```
frontend/android/app/build/outputs/apk/release/
```

**文件名示例**:
```
app-release.apk
```

## 验证APK

### 1. 检查APK文件
```bash
cd frontend/android/app/build/outputs/apk/release/
dir
```

### 2. 检查APK信息
```bash
jarsigner -verify -verbose -certs app-release.apk
```

### 3. 测试安装
```bash
adb install app-release.apk
```

## 常见问题

### Q: 构建失败 - Gradle同步问题
**A**: 
1. 检查网络连接
2. 更新Android SDK
3. 清理项目: `Build > Clean Project`
4. 重新同步: `Build > Rebuild Project`

### Q: 密钥库生成失败
**A**:
1. 确保已安装JDK 17+
2. 检查Java环境变量
3. 手动运行: `keytool -genkeypair ...`

### Q: APK安装失败
**A**:
1. 检查设备是否启用开发者选项
2. 确保启用了未知来源安装
3. 卸载旧版本后重试

## 发布准备

### 1. 应用信息
- **应用名称**: JianluoChat
- **包名**: com.jianluochat.app
- **版本**: 1.0.0
- **最低Android版本**: API 24 (Android 7.0)

### 2. 必需权限
- 网络访问 (Matrix通信)
- 存储访问 (文件传输)
- 相机/麦克风 (语音/视频通话)

### 3. 发布到Google Play
1. 生成签名APK
2. 在Google Play Console创建应用
3. 上传APK
4. 填写应用信息
5. 提交审核

## 注意事项

1. **密钥库安全**: 请妥善保管密钥库文件和密码
2. **版本管理**: 每次发布前更新版本号
3. **测试**: 在真机上充分测试后再发布
4. **备份**: 定期备份密钥库文件

## 技术支持

如果遇到问题，请检查:
- [ANDROID_BUILD_GUIDE.md](ANDROID_BUILD_GUIDE.md)
- [CRITICAL_ERRORS_FIXED.md](CRITICAL_ERRORS_FIXED.md)
- [LOG_REPORT_ERROR_HANDLING.md](LOG_REPORT_ERROR_HANDLING.md)

---

**构建完成！** 你的JianluoChat应用现在已经准备好发布。