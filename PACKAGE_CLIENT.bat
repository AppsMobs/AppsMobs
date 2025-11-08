@echo off
REM Script pour créer le package final à donner au client
echo ========================================
echo   CREATION DU PACKAGE CLIENT
echo ========================================
echo.

REM Vérifier que l'exe existe
if not exist "dist\BootyBot\BootyBot.exe" (
    echo ERREUR: BootyBot.exe non trouvé
    echo.
    echo Lancez d'abord: python build_final.bat
    echo.
    pause
    exit /b 1
)

echo.
echo Copie des fichiers...

REM Créer le dossier de package
if exist "Package-Client" rmdir /s /q "Package-Client"
mkdir "Package-Client"

REM Copier l'exe
copy "dist\BootyBot\BootyBot.exe" "Package-Client\"
echo   ✓ BootyBot.exe

REM Copier les instructions
copy "INSTRUCTIONS_CLIENT.txt" "Package-Client\"
echo   ✓ INSTRUCTIONS_CLIENT.txt

REM Copier scrcpy si bundlé
if exist "scrcpy.exe" (
    copy "scrcpy.exe" "Package-Client\"
    echo   ✓ scrcpy.exe
)

REM Copier ADB si présent dans un dossier adb/
if exist "adb\adb.exe" (
    echo.
    echo Copie de ADB...
    mkdir "Package-Client\adb"
    xcopy /E /I "adb" "Package-Client\adb"
    echo   ✓ ADB bundlé
)

REM Créer un ZIP si 7zip est disponible
set use7zip=0
where 7z >nul 2>&1
if %errorlevel%==0 set use7zip=1

if %use7zip%==1 (
    echo.
    echo Creation du ZIP...
    7z a -tzip "BootyBot-Package-v1.0.zip" "Package-Client\*"
    echo   ✓ ZIP cree: BootyBot-Package-v1.0.zip
) else (
    echo.
    echo ZIP non cree (7zip non installe).
    echo Compressez manuellement le dossier Package-Client
)

echo.
echo ========================================
echo   PACKAGE CREE !
echo ========================================
echo.
echo Dossier: Package-Client\
if %use7zip%==1 echo ZIP: BootyBot-Package-v1.0.zip
echo.
echo Ce package contient:
echo   - BootyBot.exe
echo   - INSTRUCTIONS_CLIENT.txt
if exist "scrcpy.exe" echo   - scrcpy.exe
if exist "adb\adb.exe" echo   - ADB (bundlée)
echo.
echo Donnez ce package ou le ZIP au client !
echo.
pause

