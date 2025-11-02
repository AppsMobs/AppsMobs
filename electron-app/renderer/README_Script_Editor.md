# AppsMobs Pro – Guide de l’Éditeur de Scripts (débutant)

Ce document résume les blocs disponibles dans le Playground (éditeur intégré) et les fonctions Core qu’ils insèrent. Chaque section contient une description et un exemple minimal.

Notes
- Vous n’avez pas besoin de passer `android_client` dans vos appels: il est injecté automatiquement.
- Les chemins d’images relatifs (ex. "btn.png") pointent vers `scripts/img/btn.png`.
- Exemple de contexte minimal:
```python
def my_script(android_client, serial):
    ...
```

---

## Clics / Entrées

### click(x, y)
Clique à la position `(x, y)`.
```python
click(540, 960)
```

### doubleclick(x, y)
Double‑clic (utile pour ouvrir, valider).
```python
doubleclick(540, 960)
```

### write(text)
Tape du texte.
```python
write("Bonjour AppsMobs")
```

### back() / home()
Boutons système Retour / Accueil.
```python
back()
home()
```

### enter()
Valider (alias moderne de `entre`).
```python
enter()
```

### switch_app()
Ouvrir le sélecteur d’applications (alias moderne de `switch`).
```python
switch_app()
```

---

## Swipes

### swipe_up() / swipe_down() / swipe_left() / swipe_right()
Glisses simples (haut, bas, gauche, droite).
```python
swipe_up()
```

### swipe(x1, y1, x2, y2, duration=500)
Swipe personnalisé.
```python
swipe(200, 800, 200, 500, 600)
```

### swipe_up / swipe_down / swipe_left / swipe_right
Swipes directs au centre de l’écran (coordonnées fixes pratiques).
```python
swipe_up(android_client)
swipe_right(android_client)
```

---

## Vision / Images

### find(image_path, confidence=0.8, region=None)
Cherche 1 fois; retourne `(x, y)` ou `None`.
```python
pos = find("btn.png", 0.85)
if pos:
    x, y = pos
```

### find_image_and_click(image, confidence)
Cherche 1 fois puis clique si trouvé.
```python
find_image_and_click("btn.png", 0.85)
```

### find_loop(image, confidence, region=None)
Boucle jusqu’à trouver; retourne `(x, y)`.
```python
pos = find_loop("btn.png", 0.85)
```

### find_and_click_loop(image, confidence, region=None)
Boucle jusqu’à trouver puis clique.
```python
find_and_click_loop("btn.png", 0.9)
```

### find_and_click_loop_with_sound(image, confidence, region=None)
Idem avec alerte sonore périodique.
```python
find_and_click_loop_with_sound("ok.png", 0.9, max_attempts=30)
```

### find_image_bool(image, confidence, region=None)
Retourne `True/False` en 1 passe.
```python
if find_image_bool("ok.png", 0.9):
    print("OK visible")
```

### find_images_list([images], confidence, region=None)
Retourne la première image trouvée parmi une liste.
```python
pos = find_images_list(["ok.png", "valider.png", "confirm.png"], 0.9)
```

### Cliquer toutes les occurrences (avec find_all)
Parcourt toutes les positions retournées par `find_all` et clique.
```python
for x, y in find_all("star.png", 0.96):
    click(x, y)
```

### wait_for_image(image, confidence=0.8, timeout=30, region=None)
Attend l’apparition (ou timeout), retourne `(x, y)`.
```python
pos = wait_for_image("loaded.png", 0.9, timeout=30)
```

### click_until_image_appears(click_positions, target_image, max_clicks=10, confidence=0.8)
Clique une série de positions jusqu’à ce que la cible apparaisse (ou atteint `max_clicks`).
```python
click_until_image_appears(
    [(540,960), (560,980)],
    "ok.png",
    max_clicks=10,
    confidence=0.85
)
```

---

## Réseau / Système

### toggle_airplane_mode()
Active puis désactive le mode avion.
```python
toggle_airplane_mode()
```

### clear_cache(package_name)
Vide le cache d’une application.
```python
clear_cache("com.android.chrome")
```

### restart_app(package_name)
Redémarre une application.
```python
restart_app("com.example.app")
```

### screenshot(filename)
Sauvegarde la dernière frame.
```python
screenshot("cap.png")
```

---

## Utilitaires

### wait(seconds)
Pause (insertion via bloc "Attendre").
```python
wait(1.0)
```

### random_delay(min_seconds, max_seconds)
Attente aléatoire.
```python
random_delay(0.7, 1.8)
```

### long_press(android_client, x, y, duration_ms)
Appui long.
```python
long_press(android_client, 540, 960, 1200)
```

### long_press_image(android_client, image, duration_ms=1000, confidence=0.8)
Appui long sur l’image si elle est visible.
```python
long_press_image(android_client, "pin.png", 800, 0.9)
```

---

## Bonnes pratiques
- Utilisez des noms d’images explicites: `ok.png`, `valider.png`, etc.
- Privilégiez `wait_for_image` (avec timeout) pour éviter les boucles infinies.
- Pour une action robuste: `find_and_click_loop` (ou la version avec son) sur les écrans dynamiques.
- Combinez `random_delay` et variations de coordonnées pour des scripts plus “humains”.
