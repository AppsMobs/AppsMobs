@echo off
REM Script pour contourner le problème winCodeSign avec liens symboliques macOS
REM Ce script extrait manuellement l'archive en ignorant les erreurs de liens symboliques

echo ========================================
echo    Fix winCodeSign - Extraction manuelle
echo ========================================
echo.

set CACHE_DIR=%LOCALAPPDATA%\electron-builder\Cache\winCodeSign
set EXTRACT_DIR=%CACHE_DIR%\winCodeSign-2.6.0

echo Nettoyage du cache...
if exist "%EXTRACT_DIR%" (
    rmdir /s /q "%EXTRACT_DIR%" 2>nul
)

echo.
echo Extraction avec ignore des erreurs de liens symboliques...
echo.

REM Utiliser 7zip avec option pour ignorer les erreurs
set SCRIPT_DIR=%~dp0
set SEVENZIP=%SCRIPT_DIR%node_modules\7zip-bin\win\x64\7za.exe

if not exist "%SEVENZIP%" (
    echo [ERREUR] 7za.exe introuvable: %SEVENZIP%
    echo.
    echo Solution alternative: Lancer PowerShell en tant qu'administrateur
    echo   et executer: extract_winCodeSign.ps1
    pause
    exit /b 1
)

REM Extraire en ignorant les erreurs (code de sortie 2 = erreurs de liens symboliques non critiques)
"%SEVENZIP%" x -bd -y "%CACHE_DIR%\*.7z" -o"%EXTRACT_DIR%" 2>nul

if errorlevel 3 (
    echo [ERREUR] Extraction echouee
    pause
    exit /b 1
) else (
    echo [OK] Extraction terminee (erreurs de liens symboliques ignorees)
    echo.
    echo Le build devrait maintenant fonctionner
)

pause

