@echo off
chcp 65001 >nul
echo 正在启动嵌入式Redis服务器...

:: 检查Redis是否已经在运行
tasklist /FI "IMAGENAME eq redis-server.exe" 2>NUL | find /I /N "redis-server.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo Redis已经在运行
    exit /b 0
)

:: 设置Redis配置文件路径
set REDIS_CONF=%~dp0\conf\redis.conf
set REDIS_DATA=%~dp0\data

:: 检查配置文件是否存在
if not exist "%REDIS_CONF%" (
    echo Redis配置文件不存在，正在创建默认配置...
    mkdir conf
    echo port 6379 > %REDIS_CONF%
    echo bind 127.0.0.1 >> %REDIS_CONF%
    echo timeout 0 >> %REDIS_CONF%
    echo tcp-keepalive 300 >> %REDIS_CONF%
    echo loglevel notice >> %REDIS_CONF%
    echo logfile "" >> %REDIS_CONF%
    echo databases 16 >> %REDIS_CONF%
    echo save 900 1 >> %REDIS_CONF%
    echo save 300 10 >> %REDIS_CONF%
    echo save 60 10000 >> %REDIS_CONF%
    echo stop-writes-on-bgsave-error yes >> %REDIS_CONF%
    echo rdbcompression yes >> %REDIS_CONF%
    echo rdbchecksum yes >> %REDIS_CONF%
    echo dbfilename dump.rdb >> %REDIS_CONF%
    echo dir %REDIS_DATA% >> %REDIS_CONF%
    echo maxmemory 256mb >> %REDIS_CONF%
    echo maxmemory-policy allkeys-lru >> %REDIS_CONF%
)

:: 创建数据目录
if not exist "%REDIS_DATA%" (
    mkdir "%REDIS_DATA%"
)

:: 检查Redis可执行文件是否存在
if not exist "%~dp0\bin\redis-server.exe" (
    echo Redis服务器可执行文件不存在
    echo 请先运行 download-redis.bat 下载Redis
    pause
    exit /b 1
)

:: 启动Redis
echo 启动Redis服务器...
start "" "%~dp0\bin\redis-server.exe" "%REDIS_CONF%" --loglevel notice

:: 等待Redis启动
timeout /t 2 /nobreak >nul

:: 检查Redis是否成功启动
tasklist /FI "IMAGENAME eq redis-server.exe" 2>NUL | find /I /N "redis-server.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo Redis启动成功
) else (
    echo Redis启动失败
    echo 请检查配置文件和端口占用情况
    pause
    exit /b 1
)