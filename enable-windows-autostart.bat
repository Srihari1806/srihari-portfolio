@echo off
title Enable Srihari Portfolio Auto-Start on Boot
cd /d "%~dp0"

echo ========================================================
echo     ENABLE PORTFOLIO AUTO-START ON WINDOWS BOOT
echo ========================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\setup-autostart.ps1"

echo.
echo Press any key to exit...
pause >nul
