"""
Lance BootyBot Pro - Version professionnelle avec debug avancé
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from ui.multi_device_gui_pro import main


if __name__ == '__main__':
    print("=" * 70)
    print("🎮 BootyBot PRO - Interface Professionnelle")
    print("=" * 70)
    print()
    
    try:
        # Optionnel: support d'un flag CLI minimal
        # Exemple: python run_pro.py --no-console-mirror
        mirror = True
        if '--no-console-mirror' in sys.argv:
            mirror = False
        main()
    except KeyboardInterrupt:
        print("\n\nArrêt de l'application...")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

