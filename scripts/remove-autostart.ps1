$startupDir = [Environment]::GetFolderPath('Startup')
$shortcutPath = Join-Path $startupDir "SrihariPortfolio.lnk"

if (Test-Path $shortcutPath) {
    Remove-Item -Path $shortcutPath -Force
    Write-Host "[SUCCESS] Windows Startup shortcut removed successfully." -ForegroundColor Green
    Write-Host "          $shortcutPath" -ForegroundColor Cyan
} else {
    Write-Host "[INFO] No existing startup shortcut was found in:" -ForegroundColor Yellow
    Write-Host "       $shortcutPath" -ForegroundColor Cyan
}
