@echo off
echo 正在构建JianluoChat发布版APK...
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
echo 3. 检查Android项目配置...
cd android
if not exist gradlew (
    echo Gradle wrapper 不存在，正在下载...
    call download-gradle.bat
)

echo.
echo 4. 配置发布版构建...
echo 请在Android Studio中完成以下步骤：
echo.
echo 步骤 1: 打开Android Studio
echo    npx cap open android
echo.
echo 步骤 2: 在Android Studio中：
echo    Build > Generate Signed Bundle / APK...
echo    选择 "APK"
echo    点击 "Next"
echo.
echo 步骤 3: 创建签名密钥库
echo    选择 "Create new..."
echo    填写以下信息：
echo    - Keystore path: frontend\android\release-key.jks
echo    - Password: your-keystore-password
echo    - Alias: jianluochat-release
echo    - Certificate password: your-alias-password
echo    - Validity: 25 years
echo    - Organization: Your Organization
echo.
echo 步骤 4: 选择构建类型
echo    - Build Type: release
echo    - V1 (Jar Signature): 勾选
echo    - V2 (Full APK Signature): 勾选
echo    点击 "Finish"
echo.
echo 步骤 5: 等待构建完成
echo    APK将生成在:
echo    frontend\android\app\build\outputs\apk\release\
echo.
echo 构建脚本准备就绪！
echo.
pause