@echo off
cd /d "%~dp0"
set PORT=3001
set NEXT_DIST_DIR=.next-local
set NEXT_TELEMETRY_DISABLED=1
echo Starting Srihari Portfolio at http://localhost:3001
echo Keep this window open while using the preview.
"C:\Program Files\nodejs\node.exe" server.js
pause
