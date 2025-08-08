@echo off
echo 正在构建JianluoChat Android APK...
echo.

echo 1. 构建前端项目...
cd frontend
call npm run build-only
if %errorlevel% neq 0 (
    echo 前端构建失败！
    pause
    exit /b 1
)

echo.
echo 2. 同步到Android平台...
call npx cap sync android
if %errorlevel% neq 0 (
    echo 同步失败！
    pause
    exit /b 1
)

echo.
echo 3. 打开Android Studio进行最终构建...
echo 请在Android Studio中：
echo - 点击 Build ^> Generate Signed Bundle / APK
echo - 选择 APK
echo - 选择 release 构建类型
echo - 生成签名的APK
echo.

call npx cap open android

echo.
echo 构建脚本完成！
echo APK将在 frontend/android/app/build/outputs/apk/ 目录中生成
pause