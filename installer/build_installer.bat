@echo off
setlocal
cd /d "%~dp0\.."

echo === Building AppsMobs installer ===
if not exist "dist\BootyBot\BootyBot.exe" (
  echo ERROR: Expected app at dist\BootyBot\BootyBot.exe
  echo Build your app first (e.g., .\build_final.bat)
  exit /b 1
)

where makensis >nul 2>nul
if errorlevel 1 (
  echo NSIS not found. Install NSIS and ensure makensis is in PATH.
  echo Download: https://nsis.sourceforge.io/Download
  exit /b 1
)

makensis installer\AppsMobs.nsi
if errorlevel 1 (
  echo Installer build failed.
  exit /b 1
)

echo.
echo Installer created: dist\AppsMobs_Setup.exe
echo Optionally sign it:
echo   signtool sign /f "%%CODESIGN_PFX%%" /p "%%CODESIGN_PFX_PASSWORD%%" ^
echo     /tr "http://timestamp.digicert.com" /td SHA256 /fd SHA256 dist\AppsMobs_Setup.exe
echo.
endlocal

