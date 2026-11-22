@echo off
title Stop Srihari Portfolio Server
cd /d "%~dp0"

echo ========================================================
echo        STOPPING PORTFOLIO SERVER (PORT 3000)
echo ========================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\stop-server.ps1"

echo.
echo Press any key to exit...
pause >nul
