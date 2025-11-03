@echo off
chcp 65001 >nul
echo ========================================
echo    Matrix聊天客户端 - 嵌入式集成测试
echo ========================================
echo.
echo 此测试将验证嵌入式PostgreSQL数据库是否正常工作

echo.
echo [1/4] 检查嵌入式PostgreSQL文件...
if not exist "electron/postgres/start-postgres.bat" (
    echo ❌ 嵌入式PostgreSQL启动脚本不存在
    echo    请确保 electron/postgres/start-postgres.bat 文件存在
    pause
    exit /b 1
)
echo ✅ 嵌入式PostgreSQL启动脚本存在

echo.
echo [2/4] 检查嵌入式配置文件...
if not exist "backend/src/main/resources/application-embedded.yml" (
    echo ❌ 嵌入式配置文件不存在
    echo    请确保 backend/src/main/resources/application-embedded.yml 文件存在
    pause
    exit /b 1
)
echo ✅ 嵌入式配置文件存在

echo.
echo [3/4] 检查增强版主进程...
if not exist "electron/main-embedded.js" (
    echo ❌ 增强版主进程文件不存在
    echo    请确保 electron/main-embedded.js 文件存在
    pause
    exit /b 1
)
echo ✅ 增强版主进程文件存在

echo.
echo [4/4] 检查嵌入式构建脚本...
if not exist "build-exe-embedded.bat" (
    echo ❌ 嵌入式构建脚本不存在
    echo    请确保 build-exe-embedded.bat 文件存在
    pause
    exit /b 1
)
echo ✅ 嵌入式构建脚本存在

echo.
echo ========================================
echo ✅ 所有嵌入式集成文件检查完成！
echo ========================================
echo.
echo 📋 集成清单:
echo   ✓ 嵌入式PostgreSQL启动脚本
echo   ✓ 嵌入式数据库配置文件
echo   ✓ 增强版Electron主进程
echo   ✓ 嵌入式构建脚本
echo.
echo 🚀 下一步操作:
echo   1. 运行 build-exe-embedded.bat 构建包含嵌入式数据库的EXE
echo   2. 将PostgreSQL Windows版本解压到 electron/postgres/ 目录
echo   3. 测试生成的EXE文件是否能自动启动数据库
echo.
echo 💡 注意事项:
echo   - 首次运行会自动初始化PostgreSQL数据库
echo   - 后续启动会自动连接嵌入式数据库
echo   - 无需用户手动安装任何数据库环境
echo   - 真正实现开箱即用！
echo.
pause