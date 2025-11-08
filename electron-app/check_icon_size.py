"""
Script pour vérifier la taille de l'icône ICO
"""
import sys
import io
from pathlib import Path

# Forcer UTF-8 pour la sortie
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

try:
    from PIL import Image
    
    # Chemins possibles
    icon_paths = [
        Path(__file__).parent / 'Logo.ico',
        Path(__file__).parent.parent / 'assets' / 'icons' / 'Logo.ico',
    ]
    
    icon_path = None
    for path in icon_paths:
        if path.exists():
            icon_path = path
            break
    
    if not icon_path:
        print("[ERREUR] Logo.ico introuvable")
        sys.exit(1)
    
    img = Image.open(icon_path)
    width, height = img.size
    
    print(f"Taille de l'icone: {width}x{height} pixels")
    
    if width >= 256 and height >= 256:
        print(f"[OK] Icone valide (minimum 256x256 requis)")
        sys.exit(0)
    else:
        print(f"[ERREUR] Icone trop petite: {width}x{height} (minimum 256x256 requis)")
        print(f"   Redimensionnez l'image source a au moins 256x256 pixels")
        sys.exit(1)
        
except ImportError:
    print("[AVERTISSEMENT] Pillow non installe, impossible de verifier la taille")
    print("   Installez avec: pip install Pillow")
    sys.exit(0)
except Exception as e:
    print(f"[ERREUR] {e}")
    sys.exit(1)

