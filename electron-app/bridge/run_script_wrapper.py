"""
Wrapper pour exécuter run_script.py depuis le bytecode compilé (.pyc)
Ce fichier sera toujours visible, mais le code source réel reste protégé.
"""
import sys
import os
import importlib.util
from pathlib import Path

def main():
    """Charge et exécute le bytecode compilé de run_script"""
    # Chercher le .pyc dans __pycache__
    bridge_dir = Path(__file__).parent
    pycache_dir = bridge_dir / '__pycache__'
    
    # Trouver le fichier .pyc compilé
    pyc_file = None
    if pycache_dir.exists():
        for file in pycache_dir.glob('run_script.cpython-*.pyc'):
            pyc_file = file
            break
    
    if pyc_file and pyc_file.exists():
        # Charger le bytecode directement
        spec = importlib.util.spec_from_file_location("run_script", str(pyc_file))
        if spec and spec.loader:
            module = importlib.util.module_from_spec(spec)
            sys.modules['run_script'] = module
            spec.loader.exec_module(module)
            
            # Appeler main() si elle existe
            if hasattr(module, 'main'):
                module.main()
            else:
                print("Erreur: fonction main() non trouvée dans run_script.pyc")
                sys.exit(1)
        else:
            print("Erreur: impossible de charger run_script.pyc")
            sys.exit(1)
    else:
        # Fallback: essayer d'importer depuis le .py (développement uniquement)
        py_file = bridge_dir / 'run_script.py'
        if py_file.exists():
            spec = importlib.util.spec_from_file_location("run_script", str(py_file))
            if spec and spec.loader:
                module = importlib.util.module_from_spec(spec)
                sys.modules['run_script'] = module
                spec.loader.exec_module(module)
                if hasattr(module, 'main'):
                    module.main()
                else:
                    print("Erreur: fonction main() non trouvée")
                    sys.exit(1)
            else:
                print("Erreur: impossible de charger run_script.py")
                sys.exit(1)
        else:
            print("Erreur: run_script.pyc et run_script.py introuvables")
            print(f"   Cherché dans: {bridge_dir}")
            sys.exit(1)

if __name__ == '__main__':
    main()

