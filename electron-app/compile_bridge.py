"""
Script pour compiler les fichiers Python du bridge en bytecode (.pyc)
pour protéger le code source du client.
"""
import py_compile
import os
import shutil
from pathlib import Path

def compile_bridge():
    """Compile tous les fichiers .py du bridge en .pyc"""
    bridge_dir = Path(__file__).parent / 'bridge'
    if not bridge_dir.exists():
        print(f"❌ Dossier bridge introuvable: {bridge_dir}")
        return False
    
    print("=" * 60)
    print("🔒 COMPILATION DU BRIDGE EN BYTECODE")
    print("=" * 60)
    print()
    
    # Trouver tous les fichiers .py
    py_files = list(bridge_dir.glob('**/*.py'))
    
    if not py_files:
        print("⚠️  Aucun fichier .py trouvé dans bridge/")
        return False
    
    print(f"📁 Fichiers trouvés: {len(py_files)}")
    print()
    
    # Compiler chaque fichier
    compiled_count = 0
    for py_file in py_files:
        try:
            # Créer le répertoire __pycache__ si nécessaire
            cache_dir = py_file.parent / '__pycache__'
            cache_dir.mkdir(exist_ok=True)
            
            # Compiler en bytecode
            py_compile.compile(
                str(py_file),
                doraise=True,
                optimize=0  # Générer .pyc (pas .pyo)
            )
            
            # Le fichier .pyc est créé automatiquement dans __pycache__
            # Format: nom.cpython-XX.pyc
            compiled_count += 1
            print(f"✅ {py_file.name} -> __pycache__/{py_file.stem}.cpython-*.pyc")
            
        except py_compile.PyCompileError as e:
            print(f"❌ Erreur compilation {py_file.name}: {e}")
            return False
        except Exception as e:
            print(f"❌ Erreur {py_file.name}: {e}")
            return False
    
    print()
    print(f"✅ {compiled_count} fichier(s) compilé(s) avec succès")
    print()
    
    # En production, supprimer les fichiers .py originaux pour protéger le code
    # (garder uniquement le wrapper et les .pyc)
    if os.getenv('PRODUCTION_BUILD') == '1':
        print("🔒 Suppression des fichiers .py originaux (production)...")
        removed_count = 0
        for py_file in py_files:
            # Ne pas supprimer le wrapper
            if py_file.name == 'run_script_wrapper.py':
                continue
            try:
                py_file.unlink()
                removed_count += 1
                print(f"   ❌ Supprimé: {py_file.name}")
            except Exception as e:
                print(f"   ⚠️  Erreur suppression {py_file.name}: {e}")
        if removed_count > 0:
            print(f"   ✅ {removed_count} fichier(s) .py supprimé(s)")
    else:
        print("📝 NOTE: Les fichiers .py sont conservés (mode développement)")
        print("   Activez PRODUCTION_BUILD=1 pour supprimer les .py lors du build")
    
    print()
    return True

if __name__ == '__main__':
    success = compile_bridge()
    exit(0 if success else 1)

