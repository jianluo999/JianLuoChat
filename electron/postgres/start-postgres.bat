@echo off
chcp 65001 >nul
echo 正在启动嵌入式PostgreSQL数据库...

:: 检查PostgreSQL是否已经在运行
tasklist /FI "IMAGENAME eq postgres.exe" 2>NUL | find /I /N "postgres.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo PostgreSQL已经在运行
    exit /b 0
)

:: 设置PostgreSQL数据目录
set PGDATA=%~dp0\data
set PGPORT=5432

:: 检查数据目录是否存在
if not exist "%PGDATA%" (
    echo 初始化PostgreSQL数据库...
    initdb.exe -D "%PGDATA%" -U postgres --auth=trust --encoding=UTF8 --locale=Chinese
    if errorlevel 1 (
        echo PostgreSQL初始化失败
        pause
        exit /b 1
    )
)

:: 启动PostgreSQL
echo 启动PostgreSQL服务...
postgres.exe -D "%PGDATA%" -p %PGPORT% -k "%~dp0\run" > "%~dp0\postgres.log" 2>&1 &

:: 等待PostgreSQL启动
timeout /t 3 /nobreak >nul

:: 检查PostgreSQL是否成功启动
tasklist /FI "IMAGENAME eq postgres.exe" 2>NUL | find /I /N "postgres.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo PostgreSQL启动成功
) else (
    echo PostgreSQL启动失败，请检查日志文件
    type "%~dp0\postgres.log"
    pause
    exit /b 1
)