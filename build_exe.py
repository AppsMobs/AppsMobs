"""
Script de build pour créer un exécutable autonome (.exe) d'AppsMobs
"""
import PyInstaller.__main__
import sys
import shutil
from pathlib import Path
import subprocess

# Configuration
APP_NAME = "AppsMobs"
MAIN_SCRIPT = "run_app.py"
ICON_PATH = "assets/icons/icon_app.ico"  # À créer si vous avez une icône
BUILD_DIR = "build"
DIST_DIR = "dist"

def build_without_scrcpy():
    """Build avec scrcpy en dépendance externe (utilisateur doit installer scrcpy)"""
    print("=" * 60)
    print("🔨 BUILD : AppsMobs (avec scrcpy externe)")
    print("=" * 60)
    print()
    
    print("📦 PyInstaller va créer un exécutable autonome...")
    print("⚠️  Note: L'utilisateur devra installer scrcpy séparément")
    print()
    
    PyInstaller.__main__.run([
        MAIN_SCRIPT,
        '--name=%s' % APP_NAME,
        '--onefile',
        '--windowed',
        '--noconsole',
        '--clean',
        '--add-data=README.md;.',
        '--add-data=LICENSE.md;.',
        '--hidden-import=cv2',
        '--hidden-import=numpy',
        '--hidden-import=scrcpy',
        '--hidden-import=adbutils',
        '--hidden-import=pytesseract',
        '--hidden-import=PIL',
        '--collect-submodules=scrcpy',
        '--collect-submodules=adbutils',
        '--exclude-module=matplotlib',
        '--exclude-module=tkinter.test',
    ])
    
    print()
    print("✅ Build terminé!")
    print(f"📁 Exécutable créé dans: {DIST_DIR}/{APP_NAME}.exe")
    print()
    print("📝 PROCHAINES ÉTAPES:")
    print("   1. Tester l'exécutable")
    print("   2. Créer un fichier INSTALLATION.txt avec instructions scrcpy")
    print("   3. Packager l'ensemble pour distribution")

def build_with_bundled_scrcpy(scrcpy_source_dir):
    """Build avec scrcpy bundlé dans l'application"""
    print("=" * 60)
    print("🔨 BUILD : AppsMobs (avec scrcpy bundlé)")
    print("=" * 60)
    print()
    
    print("📦 PyInstaller va créer un exécutable autonome...")
    print("✅ scrcpy sera inclus dans l'application")
    print()
    
    PyInstaller.__main__.run([
        MAIN_SCRIPT,
        '--name=%s' % APP_NAME,
        '--onefile',
        '--windowed',
        '--noconsole',
        '--clean',
        '--add-data=README.md;.',
        '--add-data=LICENSE.md;.',
        f'--add-binary=scrcpy.exe;.' if Path('scrcpy.exe').exists() else '--add-binary=scrcpy;.',
        '--hidden-import=cv2',
        '--hidden-import=numpy',
        '--hidden-import=scrcpy',
        '--hidden-import=adbutils',
        '--hidden-import=pytesseract',
        '--hidden-import=PIL',
        '--collect-submodules=scrcpy',
        '--collect-submodules=adbutils',
        '--exclude-module=matplotlib',
        '--exclude-module=tkinter.test',
    ])
    
    print()
    print("✅ Build terminé!")
    print(f"📁 Exécutable créé dans: {DIST_DIR}/{APP_NAME}.exe")
    print()
    print("📝 PROCHAINES ÉTAPES:")
    print("   1. Tester l'exécutable")
    print("   2. Créer un fichier README.txt pour l'utilisateur")
    print("   3. Packager l'ensemble pour distribution")

def create_spec_file():
    """Crée un fichier .spec personnalisé pour PyInstaller"""
    spec_content = """# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

a = Analysis(
    ['run_app.py'],
    pathex=[],
    binaries=[
        ('assets/icons/icon_app.ico', 'assets/icons'),
    ],
    datas=[
        ('README.md', '.'),
        ('LICENSE.md', '.'),
    ],
    hiddenimports=[
        'cv2',
        'numpy',
        'scrcpy',
        'adbutils',
        'pytesseract',
        'PIL',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=['matplotlib', 'tkinter.test'],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='AppsMobs',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,  # Pas de console
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon='assets/icons/icon_app.ico' if Path('assets/icons/icon_app.ico').exists() else None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='AppsMobs',
)

# Pour bundler scrcpy, ajoutez ici:
# a.binaries += [('scrcpy.exe', 'scrcpy.exe', 'BINARY')]
"""
    
    with open('AppsMobs.spec', 'w', encoding='utf-8') as f:
        f.write(spec_content)
    
    print("✅ Fichier AppsMobs.spec créé")

def main():
    print("🔨 Script de Build AppsMobs")
    print("=" * 60)
    print()
    print("Choisissez une option:")
    print("  1. Build normal (scrcpy externe requis)")
    print("  2. Build avec scrcpy bundlé")
    print("  3. Créer fichier .spec personnalisé")
    print()
    
    choice = input("Votre choix (1-3): ").strip()
    
    if choice == "1":
        build_without_scrcpy()
    elif choice == "2":
        scrcpy_path = input("Chemin vers scrcpy.exe (ou laissez vide pour auto): ").strip()
        if not scrcpy_path:
            scrcpy_path = "scrcpy.exe"
        build_with_bundled_scrcpy(scrcpy_path)
    elif choice == "3":
        create_spec_file()
    else:
        print("❌ Choix invalide")

if __name__ == '__main__':
    try:
        import PyInstaller
        main()
    except ImportError:
        print("❌ PyInstaller n'est pas installé")
        print("   Installez-le avec: pip install pyinstaller")
        sys.exit(1)

