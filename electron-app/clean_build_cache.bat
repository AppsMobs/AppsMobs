@echo off
REM Script pour nettoyer le cache electron-builder qui cause des problèmes avec winCodeSign

echo ========================================
echo    Nettoyage Cache electron-builder
echo ========================================
echo.

echo Suppression du cache winCodeSign...
if exist "%LOCALAPPDATA%\electron-builder\Cache\winCodeSign" (
    rmdir /s /q "%LOCALAPPDATA%\electron-builder\Cache\winCodeSign" 2>nul
    echo [OK] Cache winCodeSign supprime
) else (
    echo [INFO] Cache winCodeSign non trouve
)

echo.
echo [OK] Nettoyage termine!
echo.
echo Vous pouvez maintenant relancer le build
echo.
pause

