"""
Lance l'interface Multi-Appareils de BootyBot
Permet d'exécuter vos scripts sur plusieurs téléphones simultanément
"""
import sys
from pathlib import Path

# Ajouter le répertoire racine au path Python
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from ui.multi_device_gui import main


if __name__ == '__main__':
    print("=" * 60)
    print("🎮 BootyBot - Multi-Appareils & Scripts")
    print("=" * 60)
    print()
    
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nArrêt de l'application...")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

