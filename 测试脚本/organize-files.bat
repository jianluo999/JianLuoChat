@echo off
chcp 65001 >nul
echo 正在整理文件结构，请稍候...

:: 创建目录
if not exist "开发文档" mkdir "开发文档"
if not exist "部署指南" mkdir "部署指南"
if not exist "构建脚本" mkdir "构建脚本"
if not exist "修复指南" mkdir "修复指南"
if not exist "Matrix相关" mkdir "Matrix相关"
if not exist "测试脚本" mkdir "测试脚本"
if not exist "优化文档" mkdir "优化文档"

echo 移动开发文档...
move /Y CONTRIBUTING.md "开发文档\" >nul 2>&1
move /Y README.md "开发文档\" >nul 2>&1
move /Y LICENSE "开发文档\" >nul 2>&1
move /Y package.json "开发文档\" >nul 2>&1
move /Y package-lock.json "开发文档\" >nul 2>&1
move /Y vite.config.ts "开发文档\" >nul 2>&1
move /Y capacitor.config.json "开发文档\" >nul 2>&1

echo 移动部署指南...
move /Y ANDROID_BUILD_GUIDE.md "部署指南\" >nul 2>&1
move /Y APK_INSTALL_GUIDE.md "部署指南\" >nul 2>&1
move /Y DEPLOYMENT.md "部署指南\" >nul 2>&1
move /Y EMBEDDED_DEPLOYMENT_GUIDE.md "部署指南\" >nul 2>&1
move /Y EXE_BUILD_GUIDE.md "部署指南\" >nul 2>&1
move /Y RELEASE_BUILD_GUIDE.md "部署指南\" >nul 2>&1
move /Y COMPLETE_EXE_SOLUTION.md "部署指南\" >nul 2>&1
move /Y 20250808_JianluoChat_Android_APK打包文档.md "部署指南\" >nul 2>&1

echo 移动构建脚本...
move /Y build-android.bat "构建脚本\" >nul 2>&1
move /Y build-exe-embedded.bat "构建脚本\" >nul 2>&1
move /Y build-exe.bat "构建脚本\" >nul 2>&1
move /Y build-release-apk.bat "构建脚本\" >nul 2>&1
move /Y quick-start.bat "构建脚本\" >nul 2>&1
move /Y start-project.bat "构建脚本\" >nul 2>&1
move /Y download-gradle.bat "构建脚本\" >nul 2>&1
move /Y generate-keystore.bat "构建脚本\" >nul 2>&1
move /Y install-matrix-v39.bat "构建脚本\" >nul 2>&1
move /Y install-to-emulator.bat "构建脚本\" >nul 2>&1

echo 移动修复指南...
move /Y CRITICAL_ERRORS_FIXED.md "修复指南\" >nul 2>&1
move /Y FIX_GUIDE.md "修复指南\" >nul 2>&1
move /Y URGENT_FIX_GUIDE.md "修复指南\" >nul 2>&1
move /Y QUICK_FIX_GUIDE.md "修复指南\" >nul 2>&1
move /Y QUICK_FIX_TESTING_GUIDE.md "修复指南\" >nul 2>&1
move /Y performance-fix.md "修复指南\" >nul 2>&1
move /Y fix-device-id-encryption-mismatch.js "修复指南\" >nul 2>&1
move /Y fix-device-id-mismatch.js "修复指南\" >nul 2>&1
move /Y fix-emulator-network.md "修复指南\" >nul 2>&1
move /Y fix-emulator.bat "修复指南\" >nul 2>&1
move /Y fix-encryption-device-mismatch.html "修复指南\" >nul 2>&1
move /Y fix-encryption-error.bat "修复指南\" >nul 2>&1
move /Y fix-encryption-now.bat "修复指南\" >nul 2>&1
move /Y fix-encryption-support.js "修复指南\" >nul 2>&1
move /Y fix-log-report-errors.bat "修复指南\" >nul 2>&1
move /Y fix-login-redirect-issue.js "修复指南\" >nul 2>&1
move /Y fix-matrix-url-issue.js "修复指南\" >nul 2>&1
move /Y fix-vue-composition-api.js "修复指南\" >nul 2>&1
move /Y fix-wechat-interface.js "修复指南\" >nul 2>&1
move /Y network-connection-fix.js "修复指南\" >nul 2>&1
move /Y reset-matrix-client.js "修复指南\" >nul 2>&1
move /Y immediate-device-id-fix.js "修复指南\" >nul 2>&1
move /Y immediate-encryption-fix.js "修复指南\" >nul 2>&1
move /Y immediate-fix-steps.bat "修复指南\" >nul 2>&1

echo 移动Matrix相关文档...
move /Y MATRIX_CHAT_GUIDE.md "Matrix相关\" >nul 2>&1
move /Y MATRIX_COORDINATION_STRATEGY.md "Matrix相关\" >nul 2>&1
move /Y MATRIX_DIVISION_COORDINATION.md "Matrix相关\" >nul 2>&1
move /Y MATRIX_LOGIN_FIX_SUMMARY.md "Matrix相关\" >nul 2>&1
move /Y MATRIX_MESSAGE_FEATURES_IMPLEMENTATION.md "Matrix相关\" >nul 2>&1
move /Y MATRIX_MIGRATION_GUIDE.md "Matrix相关\" >nul 2>&1
move /Y MATRIX_MIGRATION_STRATEGY.md "Matrix相关\" >nul 2>&1
move /Y MATRIX_MINIMAL_OPTIMIZATION.md "Matrix相关\" >nul 2>&1
move /Y MATRIX_NON_DESTRUCTIVE_OPTIMIZATION.md "Matrix相关\" >nul 2>&1
move /Y MATRIX_OPTIMIZATION_PLAN.md "Matrix相关\" >nul 2>&1
move /Y MATRIX_PERFORMANCE_GUIDE.md "Matrix相关\" >nul 2>&1
move /Y MATRIX_PROTOCOL_ENHANCEMENT_PLAN.md "Matrix相关\" >nul 2>&1
move /Y MATRIX_REDESIGN.md "Matrix相关\" >nul 2>&1
move /Y MATRIX_REDUNDANCY_ANALYSIS_REPORT.md "Matrix相关\" >nul 2>&1
move /Y MATRIX_REDUNDANCY_OPTIMIZATION_GUIDE.md "Matrix相关\" >nul 2>&1
move /Y MATRIX_SMART_LOGIN_GUIDE.md "Matrix相关\" >nul 2>&1
move /Y MATRIX_STORE_COORDINATION_SUMMARY.md "Matrix相关\" >nul 2>&1
move /Y MATRIX_SYNC_OPTIMIZATION_PLAN.md "Matrix相关\" >nul 2>&1
move /Y MATRIX_TESTING_GUIDE.md "Matrix相关\" >nul 2>&1
move /Y MATRIX_URL_FIX_SUMMARY.md "Matrix相关\" >nul 2>&1
move /Y MATRIX_V39_ADVANCED_FEATURES.md "Matrix相关\" >nul 2>&1
move /Y MATRIX_V39_INTEGRATION_GUIDE.md "Matrix相关\" >nul 2>&1
move /Y MATRIX_V39_MAIN_FEATURES.md "Matrix相关\" >nul 2>&1
move /Y MATRIX_V39_MIGRATION_GUIDE.md "Matrix相关\" >nul 2>&1
move /Y matrix-encryption-fix.patch.ts "Matrix相关\" >nul 2>&1
move /Y Matrix客户端综述.md "Matrix相关\" >nul 2>&1
move /Y MESSAGE_DISPLAY_FIXES.md "Matrix相关\" >nul 2>&1
move /Y ROOM_LIST_PERFORMANCE_OPTIMIZATION.md "Matrix相关\" >nul 2>&1
move /Y ROOM_LIST_UPDATE_FIX.md "Matrix相关\" >nul 2>&1
move /Y THREAD_FEATURE_SUMMARY.md "Matrix相关\" >nul 2>&1
move /Y THREAD_IMPLEMENTATION_GUIDE.md "Matrix相关\" >nul 2>&1
move /Y VOIP_FEATURE_SUMMARY.md "Matrix相关\" >nul 2>&1
move /Y VOIP_IMPLEMENTATION_GUIDE.md "Matrix相关\" >nul 2>&1
move /Y VOIP_TESTING_GUIDE.md "Matrix相关\" >nul 2>&1
move /Y WECHAT_LAYOUT_IMPROVEMENTS.md "Matrix相关\" >nul 2>&1

echo 移动测试脚本...
move /Y test-cache-optimization.js "测试脚本\" >nul 2>&1
move /Y test-e2ee-security.js "测试脚本\" >nul 2>&1
move /Y test-embedded-integration.bat "测试脚本\" >nul 2>&1
move /Y test-encryption-fix.js "测试脚本\" >nul 2>&1
move /Y test-matrix-login.js "测试脚本\" >nul 2>&1
move /Y test-network-fix.md "测试脚本\" >nul 2>&1
move /Y test-redundant-login.js "测试脚本\" >nul 2>&1
move /Y test-room-joining.js "测试脚本\" >nul 2>&1
move /Y test-smart-logout.js "测试脚本\" >nul 2>&1
move /Y test-complete-integration.bat "测试脚本\" >nul 2>&1
move /Y test-full-integration.bat "测试脚本\" >nul 2>&1
move /Y test-redis-integration.bat "测试脚本\" >nul 2>&1

echo 移动优化文档...
move /Y CACHE_OPTIMIZATION_GUIDE.md "优化文档\" >nul 2>&1
move /Y CACHE_OPTIMIZATION_SUMMARY.md "优化文档\" >nul 2>&1
move /Y OPTIMIZATION_QUICK_REFERENCE.md "优化文档\" >nul 2>&1
move /Y QUICK_PERFORMANCE_FIX.md "优化文档\" >nul 2>&1
move /Y quick-performance-fix.js "优化文档\" >nul 2>&1
move /Y THOROUGH_COORDINATION_STRATEGY.md "优化文档\" >nul 2>&1

echo 文件整理完成！
echo.
echo 当前目录结构：
echo.
dir /b /ad
echo.
echo 各目录文件数量：
echo.
echo 开发文档: & dir "开发文档" /b /a-d | find /c /v ""
echo 部署指南: & dir "部署指南" /b /a-d | find /c /v ""
echo 构建脚本: & dir "构建脚本" /b /a-d | find /c /v ""
echo 修复指南: & dir "修复指南" /b /a-d | find /c /v ""
echo Matrix相关: & dir "Matrix相关" /b /a-d | find /c /v ""
echo 测试脚本: & dir "测试脚本" /b /a-d | find /c /v ""
echo 优化文档: & dir "优化文档" /b /a-d | find /c /v ""
echo.
pause