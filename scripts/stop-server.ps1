$conns = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($conns) {
    $pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pidNum in $pids) {
        Write-Host "Stopping process PID $pidNum on port 3000..." -ForegroundColor Yellow
        Stop-Process -Id $pidNum -Force -ErrorAction SilentlyContinue
    }
    Write-Host "[SUCCESS] Portfolio server on port 3000 stopped." -ForegroundColor Green
} else {
    Write-Host "[INFO] No process is currently running on port 3000." -ForegroundColor Cyan
}
