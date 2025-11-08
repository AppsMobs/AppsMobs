@echo off
REM Script pour bundler scrcpy avec BootyBot
echo ===================================
echo BootyBot - Bundle scrcpy
echo ===================================
echo.

REM Créer le dossier bundled
if not exist "bundled" mkdir bundled
if not exist "bundled\scrcpy" mkdir bundled\scrcpy

echo.
echo Veuillez télécharger scrcpy depuis:
echo https://github.com/Genymobile/scrcpy/releases
echo.
echo Téléchargez la version Windows (scrcpy-win64-v...)
echo.
echo Extraction manuelle:
echo 1. Extrayez l'archive scrcpy
echo 2. Copiez scrcpy.exe dans ce dossier
echo 3. Appuyez sur Entrée une fois terminé
pause

REM Vérifier si scrcpy.exe existe
if exist "scrcpy.exe" (
    echo.
    echo Copie de scrcpy.exe...
    copy scrcpy.exe bundled\scrcpy\
    echo.
    echo SCONSCRY COPIÉ AVEC SUCCÈS
    echo.
    echo Vous pouvez maintenant modifier build_exe.py
    echo pour bundler scrcpy dans l'exe final.
) else (
    echo.
    echo ERREUR: scrcpy.exe non trouvé dans ce dossier
    echo.
    echo Placez scrcpy.exe dans ce dossier et relancez ce script.
)

echo.
pause

