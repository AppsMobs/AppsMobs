"""
Script de build pour créer un exécutable (.exe) versionné d'AppsMobs
Gère automatiquement les versions et crée des builds organisés
"""
import PyInstaller.__main__
import sys
import shutil
from pathlib import Path
import re
from datetime import datetime
import io

# Fix encoding pour Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Configuration
APP_NAME = "AppsMobs"
MAIN_SCRIPT = "run_app.py"
BUILD_DIR = "build"
DIST_DIR = "dist"
VERSIONS_DIR = "releases"

# Lire la version depuis setup.py
def get_version():
    """Lit la version depuis setup.py"""
    setup_file = Path("setup.py")
    if setup_file.exists():
        content = setup_file.read_text(encoding="utf-8")
        match = re.search(r'version\s*=\s*["\']([^"\']+)["\']', content)
        if match:
            return match.group(1)
    return "2.0.0"  # Version par défaut

def get_version_with_build():
    """Retourne la version avec le numéro de build (timestamp)"""
    version = get_version()
    build_number = datetime.now().strftime("%Y%m%d%H%M")
    return f"{version}.{build_number}"

def clean_build_dirs():
    """Nettoie les dossiers de build"""
    print("🧹 Nettoyage des dossiers de build...")
    for dir_path in [BUILD_DIR, DIST_DIR]:
        if Path(dir_path).exists():
            shutil.rmtree(dir_path)
            print(f"   ✅ {dir_path} nettoyé")
    Path(BUILD_DIR).mkdir(exist_ok=True)
    Path(DIST_DIR).mkdir(exist_ok=True)

def build_exe(version_label=None, include_console=False):
    """Construit l'exécutable"""
    if version_label is None:
        version_label = get_version()
    
    exe_name = f"{APP_NAME}_v{version_label}"
    
    print("=" * 70)
    print(f"🔨 BUILD : {APP_NAME} v{version_label}")
    print("=" * 70)
    print()
    
    # Vérifier que le script principal existe
    if not Path(MAIN_SCRIPT).exists():
        print(f"❌ Erreur: {MAIN_SCRIPT} introuvable!")
        print("   Le fichier doit exister pour créer l'exécutable.")
        sys.exit(1)
    
    print("📦 PyInstaller va créer un exécutable autonome...")
    print(f"📝 Nom de l'exécutable: {exe_name}.exe")
    print()
    
    # Arguments PyInstaller
    args = [
        MAIN_SCRIPT,
        f'--name={exe_name}',
        '--onefile',  # Un seul fichier .exe
        '--clean',  # Nettoyer le cache
        '--noconfirm',  # Ne pas demander confirmation
        
        # Gestion de la console - FORCER console pour éviter les problèmes
        '--console',  # Toujours avec console pour debug et éviter les boucles
        
        # Données additionnelles
        '--add-data=README.md;.',
        '--add-data=LICENSE.md;.',
        
        # Modules cachés (importés dynamiquement)
        '--hidden-import=cv2',
        '--hidden-import=cv2.cv2',
        '--hidden-import=numpy',
        # Utiliser scrcpy-client (module Python: scrcpy_client), pas 'scrcpy'
        '--hidden-import=scrcpy_client',
        '--hidden-import=adbutils',
        '--hidden-import=pytesseract',
        '--hidden-import=PIL',
        '--hidden-import=PIL.Image',
        '--hidden-import=requests',
        '--hidden-import=fastapi',
        '--hidden-import=uvicorn',
        '--hidden-import=supabase',
        '--hidden-import=psycopg2',
        '--hidden-import=PyJWT',
        
        # Collecter les sous-modules nécessaires
        '--collect-submodules=adbutils',
        '--collect-submodules=cv2',
        # Exclure explicitement le package 'scrcpy' incompatible
        '--exclude-module=scrcpy',
        '--exclude-module=scrcpy.core',
        '--exclude-module=scrcpy.client',
        
        # Exclure des modules inutiles pour réduire la taille
        '--exclude-module=matplotlib',
        '--exclude-module=tkinter.test',
        '--exclude-module=pytest',
        
        # Optimisations
        '--noupx',  # Ne pas utiliser UPX (peut causer des problèmes avec Windows Defender)
        # Note: --strip désactivé car peut causer des problèmes sur Windows
    ]
    
    # Ajouter l'icône si elle existe
    icon_path = Path("assets/icons/icon_app.ico")
    if not icon_path.exists():
        icon_path = Path("assets/icons/Logo.png")
    if icon_path.exists():
        args.append(f'--icon={icon_path}')
        print(f"   ✅ Icône trouvée: {icon_path}")
    else:
        print("   ⚠️  Aucune icône trouvée")
    
    print()
    print("🚀 Lancement du build...")
    print("-" * 70)
    
    try:
        PyInstaller.__main__.run(args)
    except Exception as e:
        print(f"\n❌ Erreur lors du build: {e}")
        sys.exit(1)
    
    print()
    print("-" * 70)
    print("✅ Build terminé!")
    
    # Vérifier que l'exécutable a été créé
    exe_path = Path(DIST_DIR) / f"{exe_name}.exe"
    if exe_path.exists():
        size_mb = exe_path.stat().st_size / (1024 * 1024)
        print(f"📁 Exécutable créé: {exe_path}")
        print(f"📊 Taille: {size_mb:.2f} MB")
        
        # Créer le dossier releases et copier l'exe
        Path(VERSIONS_DIR).mkdir(exist_ok=True)
        release_path = Path(VERSIONS_DIR) / f"{exe_name}.exe"
        shutil.copy2(exe_path, release_path)
        print(f"📦 Copie dans releases/: {release_path}")
        print()
        print("=" * 70)
        print("✅ BUILD RÉUSSI!")
        print("=" * 70)
        print()
        print("📝 PROCHAINES ÉTAPES:")
        print("   1. Tester l'exécutable dans dist/")
        print("   2. Vérifier qu'il fonctionne correctement")
        print("   3. Uploader sur appsmobs.com/download")
        print(f"   4. L'exécutable est aussi dans {VERSIONS_DIR}/")
        return True
    else:
        print(f"❌ Erreur: {exe_path} non trouvé après le build!")
        return False

def main():
    """Fonction principale"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Build AppsMobs executable')
    parser.add_argument('--version', type=str, help='Version spécifique (ex: 2.0.0)')
    parser.add_argument('--console', action='store_true', help='Inclure la console pour debug')
    parser.add_argument('--clean', action='store_true', help='Nettoyer avant de builder')
    parser.add_argument('--auto', action='store_true', help='Build automatique sans interaction')
    
    args = parser.parse_args()
    
    print("🔨 Script de Build AppsMobs - Versionné")
    print("=" * 70)
    print()
    
    # Vérifier PyInstaller
    try:
        import PyInstaller
        print(f"✅ PyInstaller installé (v{PyInstaller.__version__})")
    except ImportError:
        print("❌ PyInstaller n'est pas installé")
        print("   Installez-le avec: pip install pyinstaller")
        sys.exit(1)
    
    version_label = args.version if args.version else get_version()
    include_console = args.console
    
    if args.clean:
        clean_build_dirs()
    
    if not args.auto:
        # Mode interactif
        print()
        print("Choisissez une option:")
        print("  1. Build avec version automatique (depuis setup.py)")
        print("  2. Build avec version personnalisée")
        print("  3. Build avec console visible (pour debug)")
        print("  4. Clean build (nettoyer avant de builder)")
        print()
        
        try:
            choice = input("Votre choix (1-4, Enter=1): ").strip() or "1"
            
            if choice == "1":
                version_label = get_version()
                print(f"📌 Version détectée: {version_label}")
            elif choice == "2":
                version_input = input("Entrez la version (ex: 2.0.0): ").strip()
                if version_input:
                    version_label = version_input
            elif choice == "3":
                version_label = get_version()
                include_console = True
                print(f"📌 Version: {version_label} (avec console)")
            elif choice == "4":
                clean_build_dirs()
                version_label = get_version()
                print(f"📌 Version: {version_label}")
            
            print()
            confirm = input(f"Lancer le build pour {APP_NAME} v{version_label}? (O/n): ").strip().lower()
            if confirm and confirm != 'o' and confirm != 'oui':
                print("❌ Build annulé")
                sys.exit(0)
        except (EOFError, KeyboardInterrupt):
            print("\n❌ Build annulé")
            sys.exit(1)
    else:
        print(f"📌 Version: {version_label} (mode auto)")
        if include_console:
            print("📌 Mode console activé")
    
    print()
    success = build_exe(version_label, include_console)
    
    if not success:
        sys.exit(1)

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Build interrompu par l'utilisateur")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Erreur critique: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

