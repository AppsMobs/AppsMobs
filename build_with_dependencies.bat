@echo off
REM ==============================================================
REM  Script de build qui s'assure que toutes les dépendances
REM  sont incluses dans l'exe pour distribution
REM ==============================================================

cd /d "%~dp0"

echo ============================================================
echo   Build BootyBot avec toutes les dependances incluses
echo ============================================================
echo.

REM 1) S'assurer que le venv existe avec toutes les dépendances
if not exist .venv (
  echo [ERREUR] Le venv .venv n'existe pas.
  echo Lancez d'abord INSTALLER_3_9_SIMPLE.bat pour installer les dependances.
  pause
  exit /b 1
)

echo [1/4] Verification des dependances dans le venv...
.venv\Scripts\python.exe -c "import scrcpy; import av; import adbutils; import cv2; import numpy; print('Toutes les dependances sont presentes')"
if errorlevel 1 (
  echo [ERREUR] Des dependances manquent dans le venv.
  echo Relancez INSTALLER_3_9_SIMPLE.bat pour installer les dependances.
  pause
  exit /b 1
)

REM 2) Activer le venv et installer PyInstaller si besoin
echo [2/4] Verification de PyInstaller...
.venv\Scripts\python.exe -m pip show pyinstaller >nul 2>&1
if errorlevel 1 (
  echo Installation de PyInstaller...
  .venv\Scripts\python.exe -m pip install pyinstaller
)

REM 3) Build avec PyInstaller depuis le venv
echo [3/4] Build de l'executable avec PyInstaller...
echo.
echo NOTE: Toutes les dependances Python seront incluses dans l'exe.
echo       L'utilisateur final n'aura RIEN a installer.
echo.

.venv\Scripts\python.exe -m PyInstaller ^
  --clean ^
  --onefile ^
  --windowed ^
  --noconsole ^
  --name=BootyBot ^
  --add-data="README.md;." ^
  --add-data="LICENSE.md;." ^
  --add-data="INSTRUCTIONS_CLIENT.txt;." ^
  --hidden-import=cv2 ^
  --hidden-import=numpy ^
  --hidden-import=scrcpy ^
  --hidden-import=scrcpy.core ^
  --hidden-import=scrcpy.const ^
  --hidden-import=scrcpy.control ^
  --hidden-import=adbutils ^
  --hidden-import=adbutils.adb ^
  --hidden-import=av ^
  --hidden-import=av.codec ^
  --hidden-import=av.container ^
  --hidden-import=av.format ^
  --hidden-import=av.frame ^
  --hidden-import=av.stream ^
  --hidden-import=pytesseract ^
  --hidden-import=PIL ^
  --hidden-import=PIL.Image ^
  --hidden-import=core ^
  --hidden-import=core.android_functions ^
  --hidden-import=core.scrcpy_launcher ^
  --collect-submodules=scrcpy ^
  --collect-submodules=adbutils ^
  --collect-submodules=av ^
  --collect-submodules=core ^
  --exclude-module=matplotlib ^
  --exclude-module=tkinter.test ^
  run_app.py

if errorlevel 1 (
  echo.
  echo [ERREUR] Le build a echoue. Verifiez les erreurs ci-dessus.
  pause
  exit /b 1
)

REM 4) Verification
echo.
echo [4/4] Build termine!
echo.
echo [OK] Executable cree: dist\BootyBot.exe
echo.
echo [INFO] L'executable contient TOUTES les dependances Python.
echo        L'utilisateur final n'a besoin de RIEN installer.
echo        (sauf ADB et scrcpy executable si non bundles)
echo.
pause


