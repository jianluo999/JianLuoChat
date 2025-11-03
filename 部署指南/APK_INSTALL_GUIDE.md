# 🎉 JianluoChat APK 安装指南

## APK已成功生成！

你的JianluoChat Android应用已经成功打包！

### 📱 APK文件位置
```
frontend/android/app/build/outputs/apk/debug/app-debug.apk
```

### 🔧 安装步骤

#### 方法1：直接安装（推荐）
1. **将APK文件传输到Android设备**
   - 通过USB数据线
   - 通过微信/QQ发送给自己
   - 通过云盘下载

2. **在Android设备上启用未知来源安装**
   - 设置 > 安全 > 未知来源（允许安装未知来源的应用）
   - 或者：设置 > 应用和通知 > 特殊应用访问 > 安装未知应用

3. **安装APK**
   - 点击APK文件
   - 按照提示完成安装

#### 方法2：通过ADB安装
```bash
# 确保设备已连接并启用USB调试
adb install frontend/android/app/build/outputs/apk/debug/app-debug.apk
```

### 📋 应用信息
- **应用名称**: JianluoChat
- **包名**: com.jianluochat.app
- **版本**: 1.0 (调试版)
- **最低Android版本**: 6.0 (API 23)
- **目标Android版本**: 14 (API 34)

### 🔒 权限说明
应用会请求以下权限：
- **网络访问** - 用于Matrix服务器通信
- **存储访问** - 用于文件传输和缓存

### 🚀 生成发布版APK

如果需要发布版APK（用于正式发布）：

1. **在Android Studio中**：
   - Build > Generate Signed Bundle / APK
   - 选择APK
   - 创建或选择密钥库
   - 选择release构建类型

2. **或使用命令行**：
   ```bash
   cd frontend/android
   ./gradlew assembleRelease
   ```

### 🛠️ 故障排除

#### 安装失败
- 确保设备允许安装未知来源应用
- 检查设备存储空间是否充足
- 尝试卸载旧版本后重新安装

#### 应用无法启动
- 检查设备Android版本（需要6.0+）
- 确保网络连接正常
- 重启设备后重试

### 📝 版本信息
- **Capacitor版本**: 6.1.2（稳定版）
- **Android Gradle Plugin**: 8.2.2
- **Gradle版本**: 8.2
- **编译SDK版本**: 34

### 🎯 下一步

1. **测试应用功能**
   - 登录Matrix服务器
   - 发送消息
   - 加入房间

2. **如果需要优化**
   - 添加应用图标
   - 自定义启动画面
   - 优化性能

3. **发布到应用商店**
   - 生成签名的发布版APK
   - 准备应用描述和截图
   - 提交到Google Play或其他应用商店

---

**恭喜！** 你的Matrix聊天应用现在可以在Android设备上运行了！🎉