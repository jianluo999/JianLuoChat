@echo off
chcp 65001 >nul
echo ========================================
echo    Matrix聊天客户端 - EXE构建工具
echo ========================================
echo.

echo [1/5] 检查Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到Node.js，请先安装Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js环境正常

echo.
echo [2/5] 安装前端依赖...
cd frontend
call npm install
if errorlevel 1 (
    echo ❌ 前端依赖安装失败
    pause
    exit /b 1
)
echo ✅ 前端依赖安装完成

echo.
echo [3/5] 构建前端项目...
call npm run build
if errorlevel 1 (
    echo ❌ 前端构建失败
    pause
    exit /b 1
)
echo ✅ 前端构建完成

cd ..

echo.
echo [4/5] 安装Electron依赖...
cd electron
call npm install
if errorlevel 1 (
    echo ❌ Electron依赖安装失败
    pause
    exit /b 1
)
echo ✅ Electron依赖安装完成

echo.
echo [5/5] 构建EXE文件...
call npm run build:win
if errorlevel 1 (
    echo ❌ EXE构建失败
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ EXE构建完成！
echo ========================================
echo.
echo 构建文件位置: electron\dist\
echo 安装包: Matrix聊天客户端 Setup.exe
echo 便携版: Matrix聊天客户端.exe
echo.
echo 你可以直接运行这些文件，无需安装任何开发环境！
echo.
pause