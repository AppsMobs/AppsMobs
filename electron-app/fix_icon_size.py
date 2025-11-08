"""
Script pour redimensionner l'icône ICO à 256x256 minimum
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
        Path(__file__).parent.parent / 'assets' / 'icons' / 'Logo.png',
    ]
    
    icon_path = None
    source_path = None
    
    # Chercher d'abord le .ico
    for path in icon_paths:
        if path.exists() and path.suffix == '.ico':
            icon_path = path
            break
    
    # Si pas de .ico, chercher le .png
    if not icon_path:
        for path in icon_paths:
            if path.exists() and path.suffix == '.png':
                source_path = path
                break
    
    if not icon_path and not source_path:
        print("[ERREUR] Logo.ico ou Logo.png introuvable")
        sys.exit(1)
    
    # Si on a un .ico, on l'ouvre. Sinon on ouvre le .png
    if icon_path:
        img = Image.open(icon_path)
        print(f"Ouverture de: {icon_path}")
    else:
        img = Image.open(source_path)
        print(f"Ouverture de: {source_path}")
    
    width, height = img.size
    print(f"Taille originale: {width}x{height} pixels")
    
    # Calculer le ratio pour avoir au moins 256x256 dans les DEUX dimensions
    # Si l'image est rectangulaire, on la redimensionne pour que les deux dimensions soient >= 256
    if width < 256 or height < 256:
        # Calculer le ratio pour avoir au moins 256 dans la plus petite dimension
        ratio = max(256 / width, 256 / height)
        new_width = max(256, int(width * ratio))
        new_height = max(256, int(height * ratio))
        
        # Redimensionner avec LANCZOS pour une meilleure qualité
        img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        print(f"Redimensionnement: {width}x{height} -> {new_width}x{new_height}")
    else:
        # Si l'image est déjà >= 256x256 mais rectangulaire, on peut la rendre carrée
        # pour une meilleure compatibilité avec electron-builder
        if width != height:
            # Rendre carré en prenant la plus grande dimension
            size = max(width, height)
            img = img.resize((size, size), Image.Resampling.LANCZOS)
            print(f"Redimensionnement carre: {width}x{height} -> {size}x{size}")
        else:
            print(f"Taille deja valide: {width}x{height}")
    
    # Sauvegarder dans assets/icons/Logo.ico
    output_path = Path(__file__).parent.parent / 'assets' / 'icons' / 'Logo.ico'
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Créer l'icône avec toutes les tailles requises
    img.save(output_path, format='ICO', sizes=[(256,256), (128,128), (64,64), (48,48), (32,32), (16,16)])
    
    print(f"[OK] Icone creee: {output_path}")
    print(f"[OK] Taille finale: {img.size[0]}x{img.size[1]} pixels")
    
    # Vérifier
    verify_img = Image.open(output_path)
    final_width, final_height = verify_img.size
    print(f"Verification: {final_width}x{final_height} pixels")
    
    if final_width >= 256 and final_height >= 256:
        print(f"[OK] Verification: Icone valide pour electron-builder (minimum 256x256)")
        sys.exit(0)
    else:
        print(f"[ERREUR] Verification echouee: {final_width}x{final_height} (minimum 256x256 requis)")
        sys.exit(1)
        
except ImportError:
    print("[ERREUR] Pillow non installe")
    print("   Installez avec: pip install Pillow")
    sys.exit(1)
except Exception as e:
    print(f"[ERREUR] {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

