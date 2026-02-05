### Guide de prise en main AppsMobs  
#### Pour nouveaux utilisateurs

> **Objectif**  
> Ce guide t’explique **tout ce qu’il faut savoir pour bien démarrer** : installation d’AppsMobs, connexion de tes appareils Android, création de tes premières automatisations et gestion de ton compte / abonnement.

---

### 🧩 Comprendre AppsMobs en 5 minutes

**AppsMobs, c’est quoi ?**

AppsMobs est une application **Windows** qui te permet de **contrôler et automatiser des appareils Android** depuis ton PC :

- **Contrôle en direct** via scrcpy (écran du téléphone sur le PC)
- **Scripts Python** prêts pour l’automatisation
- **Éditeur visuel sans code** (blocks)
- **Vision AI (YOLO)** pour détecter et cliquer sur les éléments à l’écran
- **Assistant IA** pour générer des scripts / workflows à partir d’une simple description en texte

**Vision globale de l’écosystème**

- **Application de bureau** `AppsMobs` (Electron, Windows uniquement)
- **Site web** (React + Vite) : vitrine, compte utilisateur, abonnement, dashboard en ligne

---

### 💻 Pré-requis techniques

**Sur ton PC (où tourne AppsMobs)**

- Windows **10 ou 11**, 64 bits
- Connexion Internet (recommandée pour :
  - activation de licence,
  - mises à jour,
  - fonctionnalités IA)
- Espace disque suffisant (modèles Vision AI, scripts, logs…)

**Sur tes appareils Android**

- 1 ou plusieurs appareils Android
- **Mode développeur** activé
- **Débogage USB** activé
- Câble(s) USB **data** de bonne qualité  
  *(éviter les câbles qui ne font que la charge)*

---

### 📥 Installer AppsMobs sur Windows

**Étapes d’installation**

1. Va sur la page **Releases** AppsMobs (GitHub ou site officiel).
2. Télécharge :
   - soit l’installateur `AppsMobs-Setup-x64.exe` (**recommandé**),
   - soit la version portable `AppsMobs-Portable-x64.exe`.
3. Lance le fichier téléchargé :
   - Suis l’assistant d’installation (NSIS) si tu as pris la version Setup.
   - Ou ouvre simplement le dossier si tu utilises la version Portable.
4. Démarre **AppsMobs** depuis le raccourci ou l’exécutable.

**Mises à jour automatiques**

- AppsMobs utilise **electron-updater** :
  - À chaque démarrage, l’app vérifie s’il existe une nouvelle version.
  - Si oui, elle télécharge et installe la mise à jour (selon la configuration).
- Tu n’as rien de spécial à faire : **laisser l’app se mettre à jour** est la meilleure option.

---

### 🔌 Connecter ton premier appareil Android

**Sur le téléphone**

1. Active les **Options pour les développeurs**.
2. Active le **Débogage USB**.
3. Branche le téléphone au PC avec un câble USB.
4. Sur le téléphone, accepte la demande :  
   *« Autoriser le débogage USB pour cet ordinateur ? »*

**Dans AppsMobs**

1. Ouvre **AppsMobs**.
2. Va dans la section **Devices / Connexion**.
3. AppsMobs détecte automatiquement les appareils via **ADB / scrcpy**.
4. Clique sur ton appareil : une **fenêtre de streaming** s’ouvre (écran du téléphone sur le PC).
5. Tu peux déjà :
   - **cliquer**,
   - **swiper**,
   - **taper du texte**  
   directement depuis l’interface.

**Nombre de devices selon ton plan**

| Plan     | Devices max |
|----------|------------:|
| Starter  |           1 |
| Basic    |           2 |
| Pro      |           5 |
| Ultimate |          10 |

---

### 🐍 Scripts Python – Automatisation avancée

**Ce que tu peux faire avec les scripts**

- Lancer des **séquences répétitives** :
  - collecte de récompenses,
  - navigation dans une app,
  - vérifications régulières, etc.
- Automatiser **plusieurs appareils en parallèle** avec un seul script.
- Profiter de plus de **100 fonctions** prêtes à l’emploi (touch, vision, timing…).

---

#### 📚 API AppsMobs : vue d’ensemble

Quand tu écris un script, tu utilises en réalité **l’API AppsMobs** : un ensemble de fonctions Python prêtes à l’emploi qui te donnent accès à :

- **Les actions de base** : `tap`, `swipe`, `wait`, `input_text`, `press_back`, etc.
- **La vision par image** : recherche d’images à l’écran et clic automatique.
- **Vision AI avancée (YOLO)** : détection d’objets par classe (boutons, icônes, rewards…).
- **Utilitaires** : logs, boucles, gestion d’erreurs, multi-devices, etc.

Tu n’as pas besoin d’“importer une librairie externe” : dans l’éditeur AppsMobs, ces fonctions sont déjà disponibles dans l’espace de script.  
Tu peux donc te concentrer sur **la logique métier** (quoi faire, dans quel ordre) plutôt que sur la gestion bas niveau d’ADB, de la vision, etc.

---

#### 🎯 La fonction clé `image_action(...)`

La fonction `image_action(...)` est une **API haut-niveau** pour faire des actions basées sur la détection d’image.  
Elle permet de :

- chercher **une ou plusieurs images** sur l’écran,
- gérer la **confiance** (taux de similarité),
- **boucler** jusqu’à ce que l’image soit trouvée (ou qu’on atteigne une limite),
- **cliquer automatiquement** (simple ou double clic),
- **éviter une zone** donnée,
- jouer un **son** si l’action échoue plusieurs fois.

Signature (pour rappel) :

```python
image_action(
    images=["btn.png", "btn_alt.png"],   # liste avec 1 ou plusieurs images possibles
    conf=0.85,                           # confiance (0.0 - 1.0)
    loop=True,                           # True = boucle jusqu'à succès ou max_attempts
    click_mode="single",                 # "none" | "single" | "double"
    avoid_rect=None,                     # zone à éviter: ((x1, y1), (x2, y2)) ou None
    max_attempts=None,                   # limite globale (None = infini)
    sound=False,                         # True = activer le son
    sound_file="alarm.mp3",              # fichier son optionnel
    sound_every_n_attempts=None,         # ex: 10 = joue le son toutes les 10 tentatives ratées
)
```

**Paramètres, un par un :**

- **`images`** :  
  - Liste d’images de référence à chercher à l’écran.  
  - Exemple : `["btn.png"]` ou `["btn.png", "btn_alt.png"]` si ton bouton peut avoir plusieurs variantes (couleurs, états…).
  - Dès qu’**une** des images est trouvée avec une confiance suffisante, l’action est considérée comme **un succès**.

- **`conf`** (confidence) :  
  - Niveau de confiance **entre 0.0 et 1.0**.  
  - Plus la valeur est **proche de 1.0**, plus la correspondance doit être **précise**.  
  - Exemple :
    - `0.7` = plus tolérant (accepte des correspondances plus approximatives),
    - `0.9` = plus strict (risque de rater si l’image est un peu différente).

- **`loop`** :  
  - Si `True` : la fonction **boucle** (refait des captures / recherches) jusqu’à :
    - trouver l’image,
    - ou atteindre `max_attempts` (si défini).  
  - Si `False` : une **seule tentative** est faite (pratique pour tester rapidement sans bloquer le script).

- **`click_mode`** :  
  - Contrôle ce qui se passe quand l’image est trouvée :
    - `"none"`  → ne clique pas, se contente de détecter (utile pour faire un `if` ensuite).
    - `"single"` → clic simple sur la position trouvée (le cas le plus courant).
    - `"double"` → double clic sur la position trouvée.

- **`avoid_rect`** :  
  - Permet de **définir une zone à éviter** à l’écran.  
  - Format : `((x1, y1), (x2, y2))` → deux coins du rectangle à ne pas utiliser.  
  - Utile si :
    - la même image apparaît **à plusieurs endroits**,
    - mais tu veux éviter par exemple le coin d’une pub, un overlay, etc.

- **`max_attempts`** :  
  - Limite **le nombre total de tentatives** si `loop=True`.  
  - `None` = pas de limite (attention à ne pas bloquer un script trop longtemps si l’image n’apparaît jamais).  
  - Exemple :
    - `max_attempts=20` → on fait au maximum 20 tentatives avant d’abandonner.

- **`sound`** :  
  - Si `True` : active la gestion de son en cas de problème (couplé à `sound_every_n_attempts`).  
  - Si `False` : aucun son ne sera joué.

- **`sound_file`** :  
  - Nom du **fichier son** à jouer (par exemple `"alarm.mp3"`).  
  - Utilisé seulement si `sound=True` et que `sound_every_n_attempts` est configuré.

- **`sound_every_n_attempts`** :  
  - Exemple : `10` → joue le son **toutes les 10 tentatives ratées**.  
  - Très utile pour être **alerté** si :
    - le script tourne en fond,
    - mais que l’image n’est plus trouvée (UI modifiée, bug, problème réseau…).

En résumé, `image_action(...)` est ta **brique principale** pour tout ce qui est :

- “attendre qu’un bouton apparaisse puis cliquer dessus”,
- “réessayer plusieurs fois jusqu’à voir une certaine icône”,
- “alerter si l’élément n’apparaît plus après X tentatives”.

Tu peux l’utiliser seule ou comme **brique interne** dans des fonctions plus haut niveau (`aller_au_menu_principal()`, `collecter_bonus()`, etc.).

---

#### 🧪 Exemple de mini-script : installer “AppsMobs Touch” depuis le Play Store

> **Objectif du script**  
> - Ouvrir le Play Store  
> - Cliquer sur la barre de recherche  
> - Taper “AppsMobs Touch”  
> - Cliquer sur le résultat / bouton “Installer”  
> - Utiliser des `sleep`, des `print` et de légers `random` dans les clics pour un comportement plus “humain”

```python
import time
import random

def human_sleep(min_s=0.5, max_s=1.5):
    """Pause aléatoire pour simuler un humain."""
    delay = random.uniform(min_s, max_s)
    print(f"[INFO] Pause de {delay:.2f}s")
    time.sleep(delay)

def human_tap(x, y, jitter=5):
    """Tap avec un léger décalage aléatoire autour du point (x, y)."""
    dx = random.randint(-jitter, jitter)
    dy = random.randint(-jitter, jitter)
    final_x, final_y = x + dx, y + dy
    print(f"[ACTION] Tap à ({final_x}, {final_y}) (jitter={jitter})")
    tap(final_x, final_y)
    human_sleep(0.3, 0.8)

def ouvrir_play_store():
    print("[STEP] Ouverture du Play Store…")
    # Exemple 1 : via une icône sur l'écran d'accueil (image_action)
    image_action(
        images=["icons/playstore.png"],
        conf=0.85,
        loop=True,
        click_mode="single",
        max_attempts=20
    )
    human_sleep(2.0, 3.0)  # laisser le temps à l'app de se charger

def cliquer_barre_recherche():
    print("[STEP] Clic sur la barre de recherche…")
    image_action(
        images=["playstore_search_bar.png"],
        conf=0.85,
        loop=True,
        click_mode="single",
        max_attempts=15
    )
    human_sleep(0.8, 1.5)

def taper_recherche():
    print('[STEP] Saisie du texte "AppsMobs Touch"…')
    input_text("AppsMobs Touch")
    human_sleep(0.8, 1.2)
    # Touche "Entrée" ou icône de recherche, selon ton mapping
    print("[ACTION] Validation de la recherche…")
    press_enter()  # ou image_action sur l’icône de recherche si nécessaire
    human_sleep(2.0, 3.0)

def cliquer_installer():
    print("[STEP] Recherche du bouton Installer…")
    image_action(
        images=["btn_install.png", "btn_install_fr.png"],
        conf=0.88,
        loop=True,
        click_mode="single",
        max_attempts=30,
        sound=True,
        sound_file="alarm.mp3",
        sound_every_n_attempts=10
    )
    print("[OK] Bouton Installer cliqué, installation en cours…")
    human_sleep(3.0, 5.0)

def main():
    print("=== Script AppsMobs : installation de 'AppsMobs Touch' ===")
    ouvrir_play_store()
    cliquer_barre_recherche()
    taper_recherche()
    cliquer_installer()
    print("=== Script terminé ✅ ===")

# Point d'entrée du script
main()
```

> **Remarques**  
> - Les noms d’images (`icons/playstore.png`, `playstore_search_bar.png`, `btn_install.png`, etc.) sont à adapter à **tes propres captures d’écran**.  
> - Les fonctions `tap`, `input_text`, `press_enter`, `image_action` sont fournies par **l’API AppsMobs**.  
> - Tu peux ajuster les temps de `sleep` et les valeurs de `conf` / `max_attempts` selon la vitesse de ton appareil et la stabilité de l’UI.

---

#### 🧱 Structure typique d’un script AppsMobs

Un script “propre” ressemble en général à ceci :

- **Imports & helpers** (fonctions utilitaires que tu réutilises)
- **Configuration** (durées d’attente, nombre de boucles, etc.)
- **Fonctions d’actions** (par exemple `collecter_rewards()`, `lancer_app()`)
- **Boucle principale** qui appelle ces fonctions

Idée générale :

1. **Donne des noms clairs** à tes fonctions (`aller_au_menu`, `cliquer_reward`, etc.).
2. **Évite de tout mettre dans le “main”** : découpe en petites fonctions.
3. Prévois des **“safety checks”** (par exemple vérifier qu’une image existe avant de cliquer).

---

#### 🧪 Exemples de fonctions clés

- **Touch / gestes**  
  `tap(x, y)` · `swipe(x1, y1, x2, y2)` · `long_press(x, y)`
- **Temps / attente**  
  `wait(5)` · `wait_until_image("button.png")`
- **Écran / image**  
  `screenshot()` · `image_exists("icon.png")` · `click_image("button.png")`
- **Clavier / navigation**  
  `input_text("Bonjour")` · `press_back()` · `press_home()`
- **Vision AI** (selon plan)  
  `smart_click_yolo("classe")` · `vision_ai_detect()`

---

#### 📋 Exemple de logique de script (pseudo-code)

Sans montrer le code exact, voici la logique typique d’un script de farming simple :

1. **Lancer l’app** ciblée (via un raccourci ou un tap sur l’icône).
2. **Attendre quelques secondes** que l’UI soit prête.
3. **Chercher un bouton “Collecter”** (par image ou Vision AI) et cliquer dessus.
4. **Attendre la fin de l’animation**, fermer les popups si nécessaire.
5. **Répéter** ces étapes dans une boucle (par exemple toutes les X minutes).

Tu peux ensuite :

- Ajouter un **compteur** (par exemple nombre de cycles),
- Logguer dans la console ce qui se passe à chaque étape,
- Gérer les **cas d’erreur** (image non trouvée, temps d’attente dépassé, etc.).

---

#### 📡 Scripts multi-devices

Avec AppsMobs, un script peut :

- tourner sur **un seul device**, ou
- être lancé sur **plusieurs devices** en même temps.

Bonnes pratiques :

- Toujours penser à **rendre le script “idempotent”** : il doit pouvoir être relancé sans casser l’état de l’app.
- Éviter les coordonnées trop “hardcodées” qui ne tiennent pas compte de la résolution →  
  privilégier :
  - la recherche par **image**,
  - la **Vision AI**,
  - ou des positions relatives (pour certains cas simples).

---

#### 🐞 Debug & logs

Pour comprendre ce que fait ton script :

- Utilise des **logs** (messages dans la console de l’éditeur AppsMobs) :
  - au début de chaque étape importante,
  - quand tu entres ou sors d’une boucle,
  - quand une image / détection AI échoue.
- Commence toujours par tester :
  - sur **1 seul appareil**,
  - avec des **délais plus longs** (`wait(3)` au lieu de `wait(0.5)`) le temps de valider.
- Quand tout est stable :
  - réduis les temps d’attente,
  - passe ensuite en **multi-devices** si ton plan le permet.

---

#### ✅ Ton premier script (checklist)

1. Ouvre l’**éditeur de scripts** dans AppsMobs.
2. Crée un **nouveau script Python**.
3. Ajoute :
   - une petite fonction d’action (par exemple cliquer à un endroit fixe),
   - quelques `wait()` pour voir le déroulé.
4. Ajoute 2–3 **logs** pour suivre les étapes.
5. Associe ce script à un **seul appareil** au début.
6. Clique sur **Run** pour l’exécuter et vérifie le comportement.
7. Une fois satisfait, **factorise** le script (fonctions réutilisables) et, si besoin, passe en **multi-devices**.

---

### 🧩 Éditeur “No-Code” (Blocks)

**Pour qui ?**

- Utilisateurs qui **ne veulent pas coder** en Python.
- Création rapide d’automations simples :
  - clics,
  - swipes,
  - délais,
  - conditions,
  - boucles, etc.

**Comment ça marche ?**

- Tu **glisses-déposes** des blocs :
  - actions,
  - conditions,
  - boucles, etc.
- Chaque bloc correspond à une **fonction de script** (tap, swipe, wait…).
- Tu vois la logique de ton workflow comme un **diagramme visuel**.
- Tu peux ensuite, si besoin, **exporter en script Python** pour affiner ou scaler.

---

### 👁️ Vision AI (YOLO) – Automatiser “à la vue”

> **Disponible sur certains plans (Pro, Ultimate).**

**Pourquoi c’est puissant ?**

Tu apprends à AppsMobs à **reconnaître des éléments visuels** sur l’écran (boutons, icônes, récompenses, etc.).  
Au lieu de cliquer à des coordonnées rigides, tu dis :

> *« Clique dès que tu vois CE bouton »*

C’est idéal lorsque :

- L’interface change souvent.
- Il n’existe **pas d’API** exploitable.
- Tu automatises un **jeu** ou une app très graphique.

**Fonctionnement général**

1. Tu fournis des **captures d’écran**.
2. Tu **annotes** les éléments à reconnaître (zones + noms de classes).
3. AppsMobs **entraîne un modèle YOLO**.
4. Dans tes scripts, tu appelles par exemple :  
   `smart_click_yolo("nom_de_classe")`
5. L’IA détecte la position et **AppsMobs clique automatiquement** au bon endroit.

---

### 🤖 Assistant IA (Gemini, Groq, OpenAI, Claude, DeepSeek…)

**Rôle de l’assistant IA**

Tu écris simplement ce que tu veux faire, par exemple :

> *« Ouvre l’app X, attends 5 secondes, clique sur le bouton vert, puis fais un swipe vers le haut toutes les 30 secondes. »*

L’assistant IA génère pour toi :

- soit un **script Python**,
- soit un **workflow en blocks**.

**Configuration (BYOK)**

- L’assistant fonctionne en **BYOK – Bring Your Own Key** :
  - Gemini, Groq, OpenAI, Claude, DeepSeek, etc.
- Tu entres **tes propres clés API** dans les paramètres d’AppsMobs.
- **Important** :
  - ne partage jamais tes clés,
  - ne les colle pas dans du code ou des captures d’écran publiques.

---

### ⏰ Tâches planifiées & pool de devices

**Planificateur de tâches**

Tu peux dire à AppsMobs :

- “Lance ce script **toutes les 5 minutes**”
- ou “Lance ce script **tous les jours à 03:00**”

Cas d’usage :

- Farming **automatique**
- **Tests récurrents** de stabilité
- **Surveillance** d’apps (état, notifications, etc.)

**Device pool**

- Tu définis un **pool d’appareils** disponibles.
- Tu **assignes** des tâches à ce pool.
- Le scheduler se charge de :
  - lancer les bons scripts,
  - sur les bons appareils,
  - dans le bon ordre.

---

### 🌐 Site web AppsMobs (compte, abonnement, dashboard)

**Ce que tu peux faire sur le site**

- **Créer un compte / te connecter**
- **Gérer ton abonnement** :
  - achat, renouvellement, upgrade / downgrade
- **Payer en ligne** via :
  - Stripe, PayPal, Binance (selon intégration active)
- Accéder à ton **dashboard web** :
  - voir tes licences,
  - vérifier ton statut d’abonnement,
  - consulter de la documentation
- Accéder au **support & chat IA** (si activé) :
  - FAQ,
  - support technique,
  - réponses rapides via IA.

**Pour info (côté technique)**

- Frontend : React 18 + Vite + Tailwind CSS
- Backend Auth : Node.js + Express
- Auth / DB : Supabase
- Déploiement : Vercel

---

### 💳 Tarifs & limites de plan

| Plan     | Prix mensuel (approx.) | Devices | Scripts | Vision AI   | Support             |
|----------|------------------------:|:--------|:--------|:------------|:--------------------|
| Starter  | ~ 9 €                  | 1       | Illimité| Non         | Communauté          |
| Basic    | ~ 19 €                 | 2       | Illimité| Non         | Email (~48 h)       |
| Pro      | ~ 49 €                 | 5       | Illimité| Oui         | Prioritaire (~48 h) |
| Ultimate | ~ 79 €                 | 10      | Illimité| Oui (+ RL)  | Prioritaire (~24 h) |

> **Note** : Les prix exacts, promos et packs peuvent changer.  
> Réfère-toi toujours au site officiel `https://appsmobs.com`.

---

### 🔐 Sécurité & bonnes pratiques

**Compte & authentification**

- Utilise :
  - une **vraie adresse email**,
  - un **mot de passe fort** :
    - longueur suffisante,
    - majuscules, minuscules, chiffres, caractères spéciaux.
- Ne partage **jamais** ton mot de passe.
- Déconnecte-toi des sessions sur les **PC partagés**.

**Tokens & sessions**

- Les tokens sont :
  - **validés** (format, expiration),
  - **nettoyés** automatiquement s’ils sont invalides.
- Si tu rencontres :
  - déconnexions fréquentes,
  - erreurs 401 / 403,  
  reconnecte-toi proprement.

**Paiements**

- Les paiements passent par des plateformes **sécurisées** :
  - Stripe,
  - PayPal,
  - Binance.
- Vérifie toujours :
  - que l’URL est correcte,
  - que le site est en **HTTPS**.

**Clés API IA**

- Ne partage jamais tes clés (Gemini, Groq, OpenAI, Claude, etc.).
- Ne les mets pas dans du code public ou des screenshots.
- Si tu suspectes une fuite :
  - **régénère la clé** depuis le dashboard du fournisseur.

**Mises à jour**

- Laisse AppsMobs se mettre à jour :
  - tu bénéficies des **nouvelles fonctionnalités**,
  - des **correctifs de bugs**,
  - des **améliorations de sécurité**.

---

### 🆘 Où trouver de l’aide ?

**Documentation**

- Docs officielles : `https://docs.appsmobs.com`
- Guides, FAQ, exemples d’automations : sections **Documentation** & **Support** sur le site

**Support**

- Email : `support@appsmobs.com`
- Type de support selon ton plan :
  - Communauté
  - Email standard
  - Prioritaire

**Raccourcis utiles**

- Site officiel : `https://appsmobs.com`
- Téléchargements / Releases : `https://github.com/AppsMobs/AppsMobs/releases`

---

### ✅ Résumé ultra-rapide pour démarrer

1. **Installer** AppsMobs sur Windows 10/11 (Setup ou Portable).
2. **Activer le débogage USB** sur ton Android et le connecter au PC.
3. **Ouvrir AppsMobs** et vérifier que l’appareil apparaît avec l’écran en streaming.
4. Créer un **premier script** ou un **workflow en blocks** (tap, wait, swipe).
5. Tester, puis activer **Vision AI** si ton plan le permet.
6. Gérer ton **compte** et ton **abonnement** via le site AppsMobs.
7. Laisser l’appli se **mettre à jour** et respecter les bonnes pratiques de **sécurité**.
