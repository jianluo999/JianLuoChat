@echo off
echo 正在生成Android签名密钥库...
echo.

setlocal

:: 设置默认值
set KEYSTORE_PATH=frontend\android\release-key.jks
set KEYSTORE_PASSWORD=android
set ALIAS=jianluochat-release
set ALIAS_PASSWORD=android
set ORGANIZATION=JianluoChat

echo 请确认以下密钥库信息（按回车键使用默认值）:
echo.
echo 当前设置:
echo   Keystore Path: %KEYSTORE_PATH%
echo   Keystore Password: %KEYSTORE_PASSWORD%
echo   Alias: %ALIAS%
echo   Alias Password: %ALIAS_PASSWORD%
echo   Organization: %ORGANIZATION%
echo.
echo 按回车键使用默认值，或输入自定义值:

set /p NEW_PASSWORD=Keystore Password [%KEYSTORE_PASSWORD%]: 
if not "%NEW_PASSWORD%"=="" set KEYSTORE_PASSWORD=%NEW_PASSWORD%

set /p NEW_ALIAS_PASSWORD=Alias Password [%ALIAS_PASSWORD%]: 
if not "%NEW_ALIAS_PASSWORD%"=="" set ALIAS_PASSWORD=%NEW_ALIAS_PASSWORD%

set /p NEW_ORG=Organization [%ORGANIZATION%]: 
if not "%NEW_ORG%"=="" set ORGANIZATION=%NEW_ORG%

echo.
echo 正在生成密钥库...
echo.

cd frontend\android

:: 检查Java是否可用
where java >nul 2>&1
if errorlevel 1 (
    echo 错误: Java 未找到，请安装JDK 17+
    pause
    exit /b 1
)

:: 生成密钥库
keytool -genkeypair -v ^
  -keystore %KEYSTORE_PATH% ^
  -alias %ALIAS% ^
  -keyalg RSA ^
  -keysize 2048 ^
  -validity 25000 ^
  -storepass %KEYSTORE_PASSWORD% ^
  -keypass %ALIAS_PASSWORD% ^
  -dname "CN=JianluoChat, OU=Development, O=%ORGANIZATION%, L=Shanghai, ST=Shanghai, C=CN"

if %errorlevel% equ 0 (
    echo.
    echo 密钥库生成成功！
    echo.
    echo 重要信息:
    echo   Keystore Path: %KEYSTORE_PATH%
    echo   Keystore Password: %KEYSTORE_PASSWORD%
    echo   Alias: %ALIAS%
    echo   Alias Password: %ALIAS_PASSWORD%
    echo.
    echo 请记住这些信息，发布时需要使用相同的密码！
    echo.
    echo 在Android Studio中构建发布版APK时，请使用这些信息。
) else (
    echo.
    echo 密钥库生成失败！
    echo 请检查Java安装和路径设置。
)

pause