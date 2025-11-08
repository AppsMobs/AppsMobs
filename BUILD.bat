@echo off
chcp 65001 >nul 2>&1
echo ========================================
echo 🔨 BUILD APPSMOBS - EXECUTABLE
echo ========================================
echo.

REM Vérifier Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python n'est pas installé ou pas dans le PATH
    pause
    exit /b 1
)

REM Vérifier PyInstaller
python -c "import PyInstaller" >nul 2>&1
if errorlevel 1 (
    echo 📦 Installation de PyInstaller...
    pip install pyinstaller
    if errorlevel 1 (
        echo ❌ Erreur lors de l'installation de PyInstaller
        pause
        exit /b 1
    )
)

echo ✅ Prérequis vérifiés
echo.

REM Lancer le build
echo 🚀 Lancement du build...
echo.
python build_versioned_exe.py --auto

if errorlevel 1 (
    echo.
    echo ❌ Erreur lors du build
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ BUILD TERMINÉ !
echo ========================================
echo.
echo 📁 Exécutable créé dans: dist\
echo 📦 Copie dans: releases\
echo.
pause




