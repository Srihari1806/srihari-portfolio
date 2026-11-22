@echo off
title Srihari Portfolio - Auto Start
cd /d "%~dp0"

echo ========================================================
echo        SRIHARI'S PORTFOLIO - AUTO START
echo ========================================================
echo.

:: 1. Verify Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not found on your system!
    echo Please download and install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: 2. Verify dependencies
if not exist "node_modules\" (
    echo [INFO] node_modules not detected. Installing dependencies...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to install npm dependencies.
        pause
        exit /b 1
    )
    echo [INFO] Dependencies installed successfully.
    echo.
)

:: 3. Launch browser automatically once server starts
echo [INFO] Launching default browser to http://localhost:3000...
start "" powershell -NoProfile -Command "Start-Sleep -Seconds 3; Start-Process 'http://localhost:3000'"

:: 4. Start Portfolio server
echo [INFO] Starting Portfolio server on port 3000...
echo [TIP] Press Ctrl+C in this window anytime to stop the server.
echo ========================================================
echo.
node server.js
