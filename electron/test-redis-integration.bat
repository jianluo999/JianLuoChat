@echo off
chcp 65001 >nul
echo 测试Redis集成...

:: 检查Redis是否安装
if not exist "redis-full\bin\redis-server.exe" (
    echo Redis未安装，正在下载...
    call redis-full\download-redis.bat
)

:: 启动Redis
echo 启动Redis服务器...
start "" "redis-full\start-redis.bat"

:: 等待Redis启动
timeout /t 3 /nobreak >nul

:: 测试Redis连接
echo 测试Redis连接...
redis-full\bin\redis-cli.exe ping

if errorlevel 1 (
    echo Redis连接测试失败
    exit /b 1
) else (
    echo Redis连接测试成功
)

:: 关闭Redis
echo 关闭Redis服务器...
redis-full\bin\redis-cli.exe shutdown

echo Redis集成测试完成