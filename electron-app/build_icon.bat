@echo off
REM Script pour convertir Logo.png en Logo.ico pour Windows
REM Nécessite ImageMagick ou Python avec Pillow

echo ====================================
echo   CONVERSION LOGO PNG -> ICO
echo ====================================
echo.

REM Vérifier si Python est disponible
python --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: Python non trouve
    echo.
    echo Option 1: Installer Python
    echo Option 2: Installer ImageMagick et utiliser:
    echo   magick convert assets\icons\Logo.png -define icon:auto-resize=256,128,64,48,32,16 assets\icons\Logo.ico
    pause
    exit /b 1
)

echo Conversion avec Python/Pillow...
echo Vérification et redimensionnement pour 256x256 minimum...

python -c "from PIL import Image; img = Image.open('../assets/icons/Logo.png'); width, height = img.size; print(f'Taille originale: {width}x{height}'); ratio = max(256/width, 256/height) if width < 256 or height < 256 else 1; new_width = int(width * ratio); new_height = int(height * ratio); img = img.resize((new_width, new_height), Image.Resampling.LANCZOS) if ratio > 1 else img; print(f'Taille finale: {img.size[0]}x{img.size[1]}'); img.save('../assets/icons/Logo.ico', format='ICO', sizes=[(256,256), (128,128), (64,64), (48,48), (32,32), (16,16)]); print('✅ Logo.ico créé avec succès')" 2>nul

if errorlevel 1 (
    echo Installation de Pillow...
    pip install Pillow
    python -c "from PIL import Image; img = Image.open('../assets/icons/Logo.png'); width, height = img.size; print(f'Taille originale: {width}x{height}'); ratio = max(256/width, 256/height) if width < 256 or height < 256 else 1; new_width = int(width * ratio); new_height = int(height * ratio); img = img.resize((new_width, new_height), Image.Resampling.LANCZOS) if ratio > 1 else img; print(f'Taille finale: {img.size[0]}x{img.size[1]}'); img.save('../assets/icons/Logo.ico', format='ICO', sizes=[(256,256), (128,128), (64,64), (48,48), (32,32), (16,16)]); print('✅ Logo.ico créé avec succès')"
)

if exist ..\assets\icons\Logo.ico (
    echo.
    echo SUCCES: Logo.ico cree dans assets\icons\
) else (
    echo.
    echo ERREUR: Conversion echouee
    echo.
    echo Solution alternative: Utiliser un outil en ligne pour convertir PNG en ICO
    echo et placer le fichier dans assets\icons\Logo.ico
)

pause

