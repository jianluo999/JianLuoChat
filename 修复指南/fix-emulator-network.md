# 修复模拟器网络问题

## 问题分析
应用启动成功，但网络连接有问题：
- HTTP 404错误
- 网络连接不稳定
- 健康检查失败

## 解决方案

### 1. 检查模拟器网络设置
在模拟器中：
- 设置 > 网络和互联网 > Wi-Fi
- 确保已连接到网络

### 2. 配置Matrix服务器
应用可能在尝试连接默认的Matrix服务器。你需要：
- 在应用中配置正确的Matrix服务器地址
- 或者使用公共Matrix服务器如 matrix.org

### 3. 检查网络安全配置
确保Android网络安全配置允许HTTP连接：
- 文件：frontend/android/app/src/main/res/xml/network_security_config.xml
- 已配置允许localhost和常见域名

### 4. 测试网络连接
在模拟器中：
- 打开浏览器访问 https://matrix.org
- 确认网络连接正常

### 5. 后端服务器
如果应用需要连接本地后端：
- 确保Spring Boot后端正在运行
- 使用10.0.2.2:8080代替localhost:8080（模拟器网络映射）

## 下一步
1. 在应用中配置Matrix服务器
2. 测试登录功能
3. 检查是否需要启动本地后端服务