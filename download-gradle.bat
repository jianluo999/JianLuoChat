@echo off
echo 正在手动下载Gradle 8.7...
echo.

echo 方法1: 使用PowerShell下载
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://services.gradle.org/distributions/gradle-8.7-all.zip' -OutFile '%USERPROFILE%\.gradle\wrapper\dists\gradle-8.7-all.zip' -TimeoutSec 300}"

if %errorlevel% equ 0 (
    echo Gradle下载成功！
) else (
    echo 下载失败，请尝试以下方法：
    echo.
    echo 方法2: 手动下载
    echo 1. 打开浏览器访问: https://services.gradle.org/distributions/gradle-8.7-all.zip
    echo 2. 下载完成后，将文件放到: %USERPROFILE%\.gradle\wrapper\dists\gradle-8.7\
    echo 3. 重新打开Android Studio项目
    echo.
    echo 方法3: 使用镜像源
    echo 编辑 frontend/android/gradle/wrapper/gradle-wrapper.properties
    echo 将distributionUrl改为: https://mirrors.cloud.tencent.com/gradle/gradle-8.7-all.zip
)

pause