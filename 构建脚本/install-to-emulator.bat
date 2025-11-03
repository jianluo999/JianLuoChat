@echo off
echo 安装JianluoChat到Android模拟器...
echo.

echo 方法1: 拖拽安装（最简单）
echo 1. 找到文件: frontend\android\app\build\outputs\apk\debug\app-debug.apk
echo 2. 直接拖拽到模拟器屏幕上
echo 3. 等待安装完成
echo.

echo 方法2: ADB命令安装
echo 正在尝试ADB安装...
adb devices
echo.

if exist "frontend\android\app\build\outputs\apk\debug\app-debug.apk" (
    echo 找到APK文件，正在安装...
    adb install "frontend\android\app\build\outputs\apk\debug\app-debug.apk"
    if %errorlevel% equ 0 (
        echo.
        echo ✅ 安装成功！
        echo 请在模拟器的应用列表中查找 "JianluoChat"
    ) else (
        echo.
        echo ❌ ADB安装失败，请使用拖拽方法：
        echo 将 app-debug.apk 文件直接拖到模拟器屏幕上
    )
) else (
    echo ❌ 找不到APK文件，请先构建项目
)

echo.
pause