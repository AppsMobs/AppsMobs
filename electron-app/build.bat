@echo off
chcp 65001 >nul
color 0A
echo.
echo ========================================
echo    Build AppsMobs - Installateur
echo ========================================
echo.

REM Vérifier que nous sommes dans le bon dossier
if not exist "package.json" (
    echo [ERREUR] Fichier package.json introuvable!
    echo    Assurez-vous d'être dans le dossier electron-app/
    echo.
    pause
    exit /b 1
)

REM Vérifier que npm est installé
where npm >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] npm n'est pas installé ou n'est pas dans le PATH
    echo    Installez Node.js depuis https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Définir la variable d'environnement pour éviter winCodeSign
set CSC_IDENTITY_AUTO_DISCOVERY=false

echo Sélectionnez le type de build:
echo.
echo   1. Installateur NSIS (Setup.exe)
echo   2. Version Portable (.exe)
echo   3. Les deux formats (Setup + Portable)
echo   4. Préparer le build uniquement (compiler Python, créer ICO)
echo   5. Quitter
echo.

set /p choice="Votre choix (1-5): "

if "%choice%"=="1" goto :build_nsis
if "%choice%"=="2" goto :build_portable
if "%choice%"=="3" goto :build_both
if "%choice%"=="4" goto :prepare_only
if "%choice%"=="5" goto :exit

echo.
echo [ERREUR] Choix invalide!
pause
goto :end

:build_nsis
echo.
echo ========================================
echo    Building Installateur NSIS...
echo ========================================
echo.
echo [INFO] Le build va:
echo    - Compiler le code Python en bytecode
echo    - Convertir l'icône PNG en ICO
echo    - Créer l'installateur NSIS
echo.
echo [INFO] Temps estimé: 2-5 minutes
echo.
call npm run build:win:nsis
if errorlevel 1 (
    echo.
    echo [ERREUR] Le build a échoué!
    echo    Vérifiez les erreurs ci-dessus
    pause
    exit /b 1
)
goto :success

:build_portable
echo.
echo ========================================
echo    Building Version Portable...
echo ========================================
echo.
echo [INFO] Le build va:
echo    - Compiler le code Python en bytecode
echo    - Convertir l'icône PNG en ICO
echo    - Créer la version portable
echo.
echo [INFO] Temps estimé: 2-5 minutes
echo.
call npm run build:win:portable
if errorlevel 1 (
    echo.
    echo [ERREUR] Le build a échoué!
    echo    Vérifiez les erreurs ci-dessus
    pause
    exit /b 1
)
goto :success

:build_both
echo.
echo ========================================
echo    Building les deux formats...
echo ========================================
echo.
echo [INFO] Le build va:
echo    - Compiler le code Python en bytecode
echo    - Convertir l'icône PNG en ICO
echo    - Créer l'installateur NSIS
echo    - Créer la version portable
echo.
echo [INFO] Temps estimé: 3-7 minutes
echo.
call npm run build:win
if errorlevel 1 (
    echo.
    echo [ERREUR] Le build a échoué!
    echo    Vérifiez les erreurs ci-dessus
    pause
    exit /b 1
)
goto :success

:prepare_only
echo.
echo ========================================
echo    Préparation du build...
echo ========================================
echo.
echo [INFO] Cette étape va:
echo    - Compiler le code Python en bytecode (.pyc)
echo    - Convertir l'icône PNG en ICO
echo    - Vérifier que tout est prêt
echo.
call npm run prepare-build
if errorlevel 1 (
    echo.
    echo [ERREUR] La préparation a échoué!
    echo    Vérifiez les erreurs ci-dessus
    pause
    exit /b 1
)
echo.
echo [SUCCES] Préparation terminée!
echo    Vous pouvez maintenant lancer le build
echo.
pause
goto :end

:success
echo.
echo ========================================
echo    BUILD TERMINE AVEC SUCCES!
echo ========================================
echo.
echo [SUCCES] Fichiers créés dans: dist\
echo.

REM Afficher les fichiers créés
if "%choice%"=="1" (
    echo    - AppsMobs-Setup-1.1.10-x64.exe (Installateur)
    echo.
    echo [INFO] Pour tester: Double-cliquez sur le fichier Setup.exe
    echo        Emplacement: dist\AppsMobs-Setup-1.1.10-x64.exe
)
if "%choice%"=="2" (
    echo    - AppsMobs-Portable-1.1.10-x64.exe (Portable)
    echo.
    echo [INFO] Pour tester: Double-cliquez sur le fichier Portable.exe
    echo        Emplacement: dist\AppsMobs-Portable-1.1.10-x64.exe
)
if "%choice%"=="3" (
    echo    - AppsMobs-Setup-1.1.10-x64.exe (Installateur)
    echo    - AppsMobs-Portable-1.1.10-x64.exe (Portable)
    echo.
    echo [INFO] Pour tester: Double-cliquez sur le fichier Setup.exe ou Portable.exe
    echo        Emplacement: dist\
)

echo.
echo ========================================
echo    FICHIERS DISPONIBLES POUR TEST
echo ========================================
echo.
echo    Ouvrez le dossier: dist\
echo    Double-cliquez sur le fichier .exe pour tester
echo.
goto :end

:exit
exit /b 0

:end
pause
