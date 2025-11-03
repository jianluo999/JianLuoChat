@echo off
echo 创建新的Android模拟器...
echo.

echo 1. 在Android Studio中：
echo    - 点击 Tools > AVD Manager
echo    - 点击 "Create Virtual Device"
echo    - 选择 Phone > Pixel 7
echo    - 选择 API Level 32 (Android 12L)
echo    - 点击 Next > Finish

echo.
echo 2. 启动新模拟器后：
echo    - 直接拖拽APK文件到模拟器屏幕
echo    - 不需要处理ADB授权问题

echo.
echo APK文件位置：
echo frontend\android\app\build\outputs\apk\debug\app-debug.apk

pause