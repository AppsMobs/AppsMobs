@echo off
REM Script de build qui évite le problème winCodeSign
REM Définit CSC_IDENTITY_AUTO_DISCOVERY=false pour empêcher le téléchargement de winCodeSign

echo ========================================
echo    Build AppsMobs - Safe (sans winCodeSign)
echo ========================================
echo.

REM Définir la variable d'environnement pour éviter winCodeSign
set CSC_IDENTITY_AUTO_DISCOVERY=false

echo [INFO] CSC_IDENTITY_AUTO_DISCOVERY=false defini
echo [INFO] Cela empeche electron-builder de telecharger winCodeSign
echo.

REM Lancer la préparation puis le build
call npm run prepare-build
if errorlevel 1 (
    echo [ERREUR] La preparation a echoue
    pause
    exit /b 1
)

echo.
echo [INFO] Lancement du build...
echo.

REM Lancer electron-builder avec la variable définie
call electron-builder --win

if errorlevel 1 (
    echo.
    echo [ERREUR] Le build a echoue
    pause
    exit /b 1
)

echo.
echo ========================================
echo    BUILD TERMINE AVEC SUCCES!
echo ========================================
echo.
echo [SUCCES] Fichiers crees dans: dist\
echo.

pause

