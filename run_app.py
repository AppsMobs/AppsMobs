"""
Point d'entrée principal de l'application AppsMobs
"""
import sys
import os
from pathlib import Path

# Ajouter le répertoire racine au path Python
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from ui.main_gui import main


def launch_multi_device():
    """Lance l'interface multi-appareils"""
    from ui.multi_device_gui import main as multi_main
    multi_main()


if __name__ == '__main__':
    print("=" * 50)
    print("🎮 AppsMobs - Android Automation Made Easy")
    print("=" * 50)
    print()
    
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nArrêt de l'application...")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Erreur critique: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

