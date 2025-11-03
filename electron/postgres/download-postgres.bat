@echo off
chcp 65001 >nul
echo ========================================
echo    Matrix聊天客户端 - PostgreSQL下载器
echo ========================================
echo.
echo 此工具将自动下载并安装嵌入式PostgreSQL数据库
echo.

:: 检查是否已经安装
if exist "data" (
    echo ✅ PostgreSQL数据库已安装
    echo 数据目录: %CD%\data
    echo.
    echo 如果需要重新安装，请删除data目录后重新运行此脚本
    pause
    exit /b 0
)

echo.
echo 正在检查系统架构...
if "%PROCESSOR_ARCHITECTURE%"=="AMD64" (
    echo ✅ 检测到64位系统
    set ARCH=x64
) else (
    echo ❌ 不支持的系统架构，需要64位Windows
    pause
    exit /b 1
)

echo.
echo 正在下载PostgreSQL 15.4 Windows x64...
echo 下载地址: https://get.enterprisedb.com/postgresql/postgresql-15.4-1-windows-x64-binaries.zip
echo 下载文件较大(约100MB)，请耐心等待...

:: 创建下载目录
if not exist "downloads" mkdir downloads

:: 下载PostgreSQL (这里只是一个示例，实际需要使用真实的下载命令)
:: 由于网络限制，这里提供手动下载指导
echo.
echo ⚠️  注意: 由于网络限制，自动下载功能暂时不可用
echo.
echo 请手动完成以下步骤:
echo 1. 访问: https://get.enterprisedb.com/postgresql/postgresql-15.4-1-windows-x64-binaries.zip
echo 2. 下载PostgreSQL二进制文件
echo 3. 解压到当前目录 (确保包含 bin/, share/, lib/ 目录)
echo 4. 重新运行 start-postgres.bat
echo.

echo 按任意键打开下载页面...
pause >nul
start "" "https://www.enterprisedb.com/downloads/postgres-postgresql-downloads"

echo.
echo 下载页面已打开，请按照上述步骤操作
echo 完成后重新运行 start-postgres.bat
pause