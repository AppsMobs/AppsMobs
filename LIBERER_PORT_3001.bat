@echo off
echo ========================================
echo    LIBERATION DU PORT 3001
echo ========================================
echo.
echo Recherche des processus utilisant le port 3001...
echo.

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do (
    set PID=%%a
    echo Processus trouve sur le port 3001: PID %%a
    echo.
    echo Arret du processus...
    taskkill /PID %%a /F >nul 2>&1
    if errorlevel 1 (
        echo Erreur: Impossible d'arreter le processus. Essayez en tant qu'administrateur.
    ) else (
        echo Processus arrete avec succes!
    )
)

echo.
echo Le port 3001 devrait maintenant etre libre.
echo.
echo Vous pouvez maintenant relancer DEMARRER_BACKEND.bat
echo.
pause

