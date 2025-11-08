@echo off
REM Script de build final pour BootyBot
echo ===================================
echo   BOOTYBOT - BUILD FINAL
echo ===================================
echo.

REM Vérifier PyInstaller
python -c "import PyInstaller" 2>nul
if errorlevel 1 (
    echo INSTALLATION DE PYINSTALLER...
    pip install pyinstaller
    echo.
)

REM Nettoyer les anciens builds
echo NETTOYAGE...
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist
echo   OK
echo.

REM Protection du code avec PyArmor (recommandé)
echo VERIFICATION PYARMOR...
python -c "import pyarmor" 2>nul
if errorlevel 1 (
    echo PyArmor non installe. Installation...
    pip install pyarmor
)
echo OBFUSCATION DU CODE...
python protect_code.py
echo.

REM Demander quelle version
echo Choisissez la version:
echo   1. Build normal (scrcpy externe requis pour le client)
echo   2. Build avec scrcpy bundlé (plus gros, plus simple)
echo.
set /p choice="Votre choix (1-2): "

if "%choice%"=="1" goto :build_normal
if "%choice%"=="2" goto :build_bundled

:build_normal
echo.
echo BUILD NORMAL (avec code protege)...
pyinstaller --clean --noconfirm BootyBot.spec
goto :end

:build_bundled
echo.
echo Vérification de scrcpy.exe...

REM Essayer d'extraire scrcpy depuis assets/scrcpy/
if not exist "scrcpy.exe" (
    echo.
    echo scrcpy.exe non trouvé. Tentative d'extraction depuis assets/scrcpy/...
    python extract_scrcpy.py
    echo.
)

if not exist "scrcpy.exe" (
    echo ERREUR: scrcpy.exe non trouvé
    echo.
    echo Deux options:
    echo   1. Placez scrcpy.exe dans ce dossier manuellement
    echo   2. Placez scrcpy-win64-vX.X.X.zip dans assets/scrcpy/
    echo.
    echo Le script va tenter de l'extraire automatiquement.
    echo.
    pause
    exit /b 1
)

echo.
echo Modification de BootyBot.spec...
REM Créer une version temporaire du .spec avec scrcpy bundlé
copy BootyBot.spec BootyBot_bundled.spec >nul

REM Ajouter scrcpy.exe au .spec
findstr /v "binaries=[" BootyBot.spec > temp.spec
echo. >> temp.spec
echo binaries=[ >> temp.spec
echo     ('scrcpy.exe', '.'),  # scrcpy bundlé >> temp.spec
echo ], >> temp.spec
findstr /v "binaries=" temp.spec > BootyBot_bundled.spec
del temp.spec

goto :build

:build
echo.
echo BUILD AVEC SCRCPY BUNDLÉ (avec code protege)...
pyinstaller --clean --noconfirm BootyBot_bundled.spec
goto :end

:end
echo.
echo ===================================
echo   BUILD TERMINÉ !
echo ===================================
echo.
echo Exécutable créé dans: dist\BootyBot\
echo.
echo PROCHAINES ÉTAPES:
echo   1. Testez l'exe: dist\BootyBot\BootyBot.exe
echo   2. Si OK, distribuez avec INSTRUCTIONS_CLIENT.txt
echo.
pause

