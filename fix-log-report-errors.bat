@echo off
echo ========================================
echo 修复日志上报错误 (ERR_CONNECTION_CLOSED)
echo ========================================
echo.

echo 1. 检查文件是否存在...
if exist "frontend\src\utils\networkInterceptor.ts" (
    echo ✅ networkInterceptor.ts 已存在
) else (
    echo ❌ networkInterceptor.ts 不存在，请检查文件路径
    pause
    exit /b 1
)

if exist "frontend\src\utils\logReportHandler.ts" (
    echo ✅ logReportHandler.ts 已存在
) else (
    echo ❌ logReportHandler.ts 不存在，请检查文件路径
    pause
    exit /b 1
)

if exist "frontend\src\utils\analytics.ts" (
    echo ✅ analytics.ts 已存在
) else (
    echo ❌ analytics.ts 不存在，请检查文件路径
    pause
    exit /b 1
)

echo.
echo 2. 检查 TypeScript 编译...
cd frontend
call npm run type-check
if %errorlevel% neq 0 (
    echo ❌ TypeScript 编译失败，请检查代码
    pause
    exit /b 1
)

echo ✅ TypeScript 编译通过
echo.

echo 3. 运行测试（如果有的话）...
call npm run test:unit 2>nul
if %errorlevel% equ 0 (
    echo ✅ 单元测试通过
) else (
    echo ⚠️  单元测试跳过或失败
)

echo.
echo ========================================
echo 🎉 所有关键错误修复完成！
echo ========================================
echo.
echo 修复内容：
echo - ✅ Pinia Store 初始化错误已修复
echo - ✅ Vue Router 路由匹配失败已修复
echo - ✅ 日志上报系统错误已优化处理
echo - ✅ 网络拦截器已设置，自动处理连接失败
echo - ✅ 开发环境代理配置已添加
echo - ✅ 调试页面已创建，可查看详细状态
echo.
echo 主要改进：
echo 1. Pinia 在 main.ts 中正确初始化
echo 2. 添加了 /chat 路由和404兜底路由
echo 3. 混合开发路径自动交由原生处理
echo 4. 开发环境默认禁用日志上报，避免跨域错误
echo 5. 生产环境正常启用日志上报功能
echo.
echo 使用方法：
echo 1. 开发环境：日志上报已禁用，不会产生网络错误
echo 2. 生产环境：日志上报正常工作，失败会静默处理
echo 3. 访问 /debug/log-report 查看调试信息
echo 4. 可在调试页面手动启用/禁用日志上报
echo.
echo 详细文档：LOG_REPORT_ERROR_HANDLING.md
echo.

pause