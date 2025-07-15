@echo off
echo ========================================
echo JianLuoChat Matrix Protocol Client
echo ========================================
echo.

echo Checking environment...

:: Check Java
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Java not found! Please install Java 17 or later.
    echo Download from: https://adoptium.net/
    pause
    exit /b 1
)
echo [OK] Java found

:: Check Maven
mvn -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Maven not found! Please install Maven.
    echo Download from: https://maven.apache.org/download.cgi
    pause
    exit /b 1
)
echo [OK] Maven found

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found! Please install Node.js.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js found

echo.
echo Starting JianLuoChat...
echo.

:: Start backend
echo [1/2] Starting backend server...
cd backend
start "JianLuoChat Backend" cmd /k "mvn spring-boot:run"
cd ..

:: Wait a bit for backend to start
timeout /t 5 /nobreak >nul

:: Start frontend
echo [2/2] Starting frontend development server...
cd frontend
start "JianLuoChat Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ========================================
echo JianLuoChat is starting up!
echo ========================================
echo.
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:5173
echo Test:     http://localhost:5173/test
echo.
echo Matrix Features:
echo - Federation Support
echo - End-to-End Encryption  
echo - Real-time Sync
echo - Spaces and Rooms
echo - Device Verification
echo.
echo Press any key to open the application...
pause >nul

:: Open browser
start http://localhost:5173

echo.
echo Application opened in browser!
echo Press any key to exit...
pause >nul
