@echo off
chcp 65001 >nul
echo 开始完整集成测试...

:: 测试PostgreSQL
echo 测试PostgreSQL集成...
if exist "postgres\start-postgres.bat" (
    call postgres\start-postgres.bat
    timeout /t 3 /nobreak >nul
    echo PostgreSQL测试完成
) else (
    echo PostgreSQL启动脚本不存在
)

:: 测试Redis
echo 测试Redis集成...
if exist "redis-full\start-redis.bat" (
    call redis-full\start-redis.bat
    timeout /t 3 /nobreak >nul
    echo Redis测试完成
) else (
    echo Redis启动脚本不存在
)

:: 等待所有服务启动
echo 等待所有服务启动...
timeout /t 5 /nobreak >nul

:: 检查进程状态
echo 检查服务进程状态...
tasklist /FI "IMAGENAME eq postgres.exe" | find /I /N "postgres.exe"
tasklist /FI "IMAGENAME eq redis-server.exe" | find /I /N "redis-server.exe"

echo 完整集成测试完成
pause