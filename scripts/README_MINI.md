# 📜 AppsMobs - Scripts

Ce dossier contient deux fichiers utiles pour démarrer rapidement:

- `prototype_test.py` : prototype très court pour vérifier que l’exécution fonctionne (clics + délai).
- `beginner_template.py` : modèle débutant à personnaliser (clics, swipes, recherche d’image).

## ✅ Principes simples
- Importez uniquement depuis `core.android_functions` (les fonctions système internes).
- Ne modifiez pas la signature `run(serial)` ni le wrapper `run_with_bridge`.
- Éditez seulement la logique dans `my_script(...)` (pour le fichier débutant) ou dans `main(...)` (prototype).

## ▶️ Exemples rapides
```python
from core.android_functions import click, random_delay

click(android_client, 540, 960)
random_delay(0.5, 1.0)
```

Recherche d’image:
```python
from core.android_functions import find, click

pos = find(android_client, 'image.png', confidence=0.85)
if pos:
    x, y = pos
    click(android_client, x, y)
```

## 🧩 Fonctions utiles (extrait)
- Clics: `click`, `doubleclick`, `long_press`
- Saisie: `write`, `entre`, `back`, `home`, `switch`
- Swipes: `upswipe`, `downswipe`, `leftswipe`, `rightswipe`, `swipe`
- Images: `find`, `find_image_and_click`, `wait_for_image`
- Utilitaires: `random_delay`, `screenshot`, `restart_app`, `clear_cache`, `toggle_airplane_mode`

Bon démarrage !
