@echo off
title Disable Srihari Portfolio Auto-Start on Boot
cd /d "%~dp0"

echo ========================================================
echo     DISABLE PORTFOLIO AUTO-START ON WINDOWS BOOT
echo ========================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\remove-autostart.ps1"

echo.
echo Press any key to exit...
pause >nul
