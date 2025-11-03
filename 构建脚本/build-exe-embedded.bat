@echo off
chcp 65001 >nul
echo ========================================
echo    Matrix聊天客户端 - 嵌入式EXE构建工具
echo ========================================
echo.
echo 此版本包含嵌入式PostgreSQL数据库，实现开箱即用！

echo.
echo [1/6] 检查Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到Node.js，请先安装Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js环境正常

echo.
echo [2/6] 安装前端依赖...
cd frontend
call npm install
if errorlevel 1 (
    echo ❌ 前端依赖安装失败
    pause
    exit /b 1
)
echo ✅ 前端依赖安装完成

echo.
echo [3/6] 构建前端项目...
call npm run build
if errorlevel 1 (
    echo ❌ 前端构建失败
    pause
    exit /b 1
)
echo ✅ 前端构建完成

cd ..

echo.
echo [4/6] 安装Electron依赖...
cd electron
call npm install
if errorlevel 1 (
    echo ❌ Electron依赖安装失败
    pause
    exit /b 1
)
echo ✅ Electron依赖安装完成

echo.
echo [5/6] 准备嵌入式数据库和缓存服务...
if not exist "postgres-full" (
    echo ❌ 错误: 未找到嵌入式PostgreSQL数据库
    echo 请确保 electron/postgres-full 目录存在且包含完整PostgreSQL安装
    pause
    exit /b 1
) else (
    echo ✅ 嵌入式PostgreSQL数据库已准备
)

if not exist "redis-full" (
    echo ❌ 错误: 未找到嵌入式Redis服务器
    echo 请确保 electron/redis-full 目录存在且包含完整Redis安装
    pause
    exit /b 1
) else (
    echo ✅ 嵌入式Redis服务器已准备
)

echo ✅ 嵌入式数据库和缓存服务准备完成

echo.
echo [6/6] 构建EXE文件...
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
echo 🎉 重要更新:
echo   - 此版本包含嵌入式PostgreSQL数据库
echo   - 此版本包含嵌入式Redis缓存服务器
echo   - 启动应用时会自动初始化数据库和缓存
echo   - 无需用户手动安装任何数据库环境
echo   - 真正实现开箱即用！
echo.
echo 💡 使用说明:
echo   1. 首次运行会自动初始化PostgreSQL数据库和Redis缓存
echo   2. 后续启动会自动连接嵌入式数据库和缓存服务
echo   3. PostgreSQL数据文件存储在应用目录下的 postgres-full/data/
echo   4. Redis数据文件存储在应用目录下的 redis-full/data/
echo   5. 关闭应用时数据库和缓存服务会自动停止
echo.
echo 📦 打包内容:
echo   - PostgreSQL 15.4 完整安装 (约300MB)
echo   - Redis 5.0.14 完整安装 (约5MB)
echo   - 自动启动和管理脚本
echo   - 预配置的数据库实例
echo.
pause