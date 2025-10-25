@echo off
echo 🚀 JianluoChat 性能和网络问题修复
echo.

echo 1. 重新构建前端项目...
cd frontend
call npm run build-only
if %errorlevel% neq 0 (
    echo ❌ 前端构建失败！
    pause
    exit /b 1
)

echo.
echo 2. 同步到Android平台...
call npx cap sync android
if %errorlevel% neq 0 (
    echo ❌ 同步失败！
    pause
    exit /b 1
)

echo.
echo 3. 清理并重新构建APK...
cd android
call ./gradlew clean
call ./gradlew assembleDebug
if %errorlevel% neq 0 (
    echo ❌ APK构建失败！
    pause
    exit /b 1
)

echo.
echo ✅ 修复完成！
echo.
echo 📱 新APK位置: frontend\android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo 🔧 修复内容:
echo - 禁用IPv6，强制使用IPv4
echo - 启用硬件加速
echo - 优化网络安全配置
echo - 减少Matrix同步消息数量
echo.
echo 📊 预期改善:
echo - 网络连接更稳定
echo - FPS性能提升
echo - 减少长任务阻塞
echo.
pause