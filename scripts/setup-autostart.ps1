$wshShell = New-Object -ComObject WScript.Shell
$startupDir = [Environment]::GetFolderPath('Startup')
$shortcutPath = Join-Path $startupDir "SrihariPortfolio.lnk"
$projectDir = Split-Path -Parent $PSScriptRoot

$shortcut = $wshShell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = Join-Path $projectDir "autostart.bat"
$shortcut.WorkingDirectory = $projectDir
$shortcut.Description = "Auto-start Srihari Portfolio on Windows boot"
$shortcut.Save()

Write-Host "[SUCCESS] Auto-start shortcut successfully created in Windows Startup folder:" -ForegroundColor Green
Write-Host "          $shortcutPath" -ForegroundColor Cyan
Write-Host "The portfolio will now automatically launch when Windows starts." -ForegroundColor Green
