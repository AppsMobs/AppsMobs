@echo off
REM ==============================================================
REM  Script pour forcer la reinstallation complete avec Python 3.9
REM  Usage: Double-cliquez sur ce fichier
REM ==============================================================

cd /d "%~dp0"

echo [INFO] Suppression du venv existant...
if exist .venv (
  echo [INFO] Suppression en cours...
  rmdir /s /q .venv 2>nul
  timeout /t 2 /nobreak >nul
  if exist .venv (
    echo [ERREUR] Impossible de supprimer .venv. Fermez toutes les applications qui l'utilisent.
    pause
    exit /b 1
  )
  echo [OK] Venv supprime.
) else (
  echo [INFO] Aucun venv existant.
)

echo.
echo [INFO] Lancement de INSTALLER_3_9.bat...
echo.
call INSTALLER_3_9.bat

pause


