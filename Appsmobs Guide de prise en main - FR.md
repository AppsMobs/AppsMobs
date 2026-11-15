# AppsMobs — Guide de prise en main

> Mis à jour le 14 novembre 2026. La version complète, avec captures de l'appli et vidéos, est sur le site : **https://appsmobs.com/fr/docs**

Ce guide t'amène de l'installation à ton premier script automatique. Compte environ 30 minutes la première fois.

**Sommaire**

1. [AppsMobs en bref](#1-appsmobs-en-bref)
2. [Installer AppsMobs](#2-installer-appsmobs)
3. [Se connecter et activer sa licence](#3-se-connecter-et-activer-sa-licence)
4. [Brancher un téléphone ou un émulateur](#4-brancher-un-téléphone-ou-un-émulateur)
5. [Le tour de l'interface](#5-le-tour-de-linterface)
6. [Ton premier script](#6-ton-premier-script)
7. [Créer sans coder : les blocs](#7-créer-sans-coder--les-blocs)
8. [Faire écrire tes scripts par une IA](#8-faire-écrire-tes-scripts-par-une-ia)
9. [Vision IA](#9-vision-ia)
10. [Planifier des scripts](#10-planifier-des-scripts)
11. [Offres et licence](#11-offres-et-licence)
12. [Ça ne marche pas ?](#12-ça-ne-marche-pas-)

---

## 1. AppsMobs en bref

AppsMobs est une application **Windows** qui pilote des téléphones Android et des émulateurs depuis ton PC : tu vois leur écran, tu les commandes, et tu leur fais exécuter des scripts.

- **Des appareils** : téléphones branchés en USB ou en Wi-Fi, et émulateurs (LDPlayer est détecté tout seul ; BlueStacks, MEmu, Nox… marchent aussi).
- **Des scripts** : de petits programmes qui touchent, balaient, cherchent une image ou un texte à l'écran. Tu les écris en Python, avec des blocs, ou tu les fais rédiger par ton IA (Claude, Grok, ChatGPT…).
- **Tout tourne sur ton PC.** ADB et scrcpy sont fournis : tu n'installes rien d'autre.

> AppsMobs envoie de vrais touchers et de vraies captures, rien de plus. Il ne rend pas un compte ou un appareil « invisible ». Ce que tu automatises reste ta responsabilité.

---

## 2. Installer AppsMobs

**Il te faut** : Windows 10 ou 11 en 64 bits (pas de macOS ni de Linux), une connexion Internet, et ton e-mail + ta clé de licence reçus à l'achat.

1. Télécharge l'installeur sur **https://appsmobs.com/fr/download** (ou dans les [Releases GitHub](https://github.com/AppsMobs/AppsMobs/releases)). Le fichier s'appelle `AppsMobs-Setup-<version>-x64.exe`. Une version portable existe aussi ; si tu débutes, prends l'installeur.
2. Double-clique sur le fichier.
3. Windows affiche sans doute un écran bleu **« Windows a protégé votre ordinateur »** : l'installeur n'a pas encore de signature de code. Clique sur **Informations complémentaires**, puis **Exécuter quand même**.
4. Suis l'assistant (garde le dossier proposé). Un raccourci est créé sur le Bureau et dans le menu Démarrer.
5. Lance AppsMobs : après environ 3 secondes, la fenêtre de connexion apparaît.

**Où sont tes fichiers** : dans `Documents\AppsMobs`.

| Dossier | Contenu |
|---|---|
| `Scripts` | tes scripts (`.py`) et leurs images |
| `Screenshots` | les captures d'écran |
| `VisionProjects` | tes projets de Vision IA |
| `debug` | les journaux complets |

**Mises à jour** : au démarrage, l'appli regarde s'il existe une nouvelle version et te la propose. Rien n'est téléchargé sans ta confirmation. Tu peux aussi vérifier à la main dans **Paramètres**.

---

## 3. Se connecter et activer sa licence

1. Dans la fenêtre de connexion, saisis ton **Email** et ta **Clé de licence** (copie-colle la clé, sans espace avant ni après).
2. Coche **Se souvenir de moi** : les prochains lancements t'ouvrent l'appli directement.
3. Clique sur **Se connecter**. La fenêtre principale s'ouvre sur le **Tableau de bord** ; la pastille en haut à droite montre ta formule et les jours restants.

Déjà dans l'appli ? **Paramètres** → onglet **Licence** → **Activer** (ou **Vérifier Licence** juste après un renouvellement).

> Ta clé est personnelle : ne la montre pas dans une capture ou un message public.

**Sans licence valide**, l'appli passe en **lecture seule** : tu peux regarder, mais lancer, arrêter ou supprimer un script est bloqué. Rien n'est effacé : tu renouvelles, tout reprend. Hors ligne, une licence déjà enregistrée sur le PC continue de fonctionner.

---

## 4. Brancher un téléphone ou un émulateur

C'est l'étape où l'on bloque le plus : prends ton temps. Il te faut un **câble USB qui transmet des données** (pas un câble de charge seule).

### En USB (téléphone)

1. **Débloque les Options pour les développeurs** : tape **7 fois** sur « Numéro de build ».
   - Samsung : Paramètres → À propos du téléphone → Informations sur le logiciel → Numéro de build
   - Xiaomi / Redmi / POCO : Paramètres → À propos du téléphone → Version MIUI (ou HyperOS)
   - Google Pixel : Paramètres → À propos du téléphone → Numéro de build
   - Autres : cherche « numéro de build » avec la loupe des Paramètres

   Le message « Vous êtes maintenant développeur ! » s'affiche.
2. **Active le Débogage USB** dans les Options pour les développeurs.
   - **Xiaomi / Redmi / POCO** : active aussi **Débogage USB (paramètres de sécurité)**, sinon le téléphone refuse les touchers venus du PC.
3. **Branche** le téléphone directement au PC (évite les hubs), écran déverrouillé. Si on te demande « Utiliser l'USB pour », choisis **Transfert de fichiers**.
4. Sur le téléphone, accepte **Autoriser le débogage USB ?** en cochant **Toujours autoriser depuis cet ordinateur**.
5. Dans AppsMobs, ouvre le **Tableau de bord** (bouton d'actualisation de la carte **Appareils** si besoin). Ton téléphone doit apparaître avec un voyant vert **Libre**.

### En Wi-Fi

Le PC et le téléphone doivent être sur le **même réseau Wi-Fi**. Au Tableau de bord, clique sur l'**icône Wi-Fi** à côté du bouton d'actualisation de la carte **Appareils**.

- **Android 11 et plus** : sur le téléphone, Options pour les développeurs → **Débogage sans fil** → **Associer l'appareil avec un code d'association**. Dans AppsMobs, le téléphone apparaît dans **Téléphones en attente d'un code** : tape le code à 6 chiffres et clique sur **Associer**. Tu ne le fais qu'une fois ; ensuite AppsMobs le reconnecte tout seul.
- **Android 10 et moins** : branche-le une première fois en USB, puis clique sur **Passer en Wi-Fi** et débranche. Ce mode ne survit pas à un redémarrage du téléphone.

> Le câble reste le plus stable pour les longues sessions ou l'écran en direct sur plusieurs téléphones.

### Émulateur LDPlayer

Démarre ton instance, vérifie que la connexion ADB locale est activée dans ses réglages, puis ouvre le Tableau de bord : l'émulateur apparaît sous un nom du type `emulator-5554`, étiqueté **Émulateur**. Rien à saisir.

---

## 5. Le tour de l'interface

La barre latérale de gauche est rangée en deux groupes.

**Espace de travail**

- **Tableau de bord** : appareils connectés et libres, scripts en cours, plantages des dernières 24 h. Tu peux y lancer un script en le glissant sur un appareil.
- **Contrôle** : choisis un ou plusieurs appareils, vois leur écran en direct, touche, balaie, tape du texte, règle le Wi-Fi ou le volume, lance un script sur plusieurs appareils à la fois.
- **Automatisation** : la planification des scripts. Cette section s'active dans **Paramètres** (**Activer l'automatisation**).

**Créer**

- **Playground** : l'éditeur de scripts, en mode **Code** ou **Blocs**.
- **Vision IA** : entraîne un modèle qui reconnaît des objets ou des écrans (incluse dès l'offre Gratuit avec les modèles fournis ; entraîner ses propres modèles dès Joueur).
- **Console** : les journaux de l'appli, du planificateur et de chaque script, avec filtres et export.

En bas : **Paramètres** (langue, qualité de l'écran en direct, dossiers, licence, mises à jour) et **Profil** (ton compte, ta licence, ton code de parrainage, la liaison Discord).

---

## 6. Ton premier script

1. Ouvre **Playground**, puis **Ou partir d'une page blanche**. Vérifie que le mode **Code** est actif.
2. Recopie :

   ```python
   log("Début du script")
   press_home()
   wait(2)
   log("Retour à l'accueil fait")
   ```

   Aucun `import` : les fonctions sont déjà disponibles. `wait()` compte en **secondes**.
3. Clique sur **Lancer sur** et coche ton appareil.
4. Clique sur **Lancer** (<kbd>F5</kbd>). Le panneau **Sortie** affiche tes messages ; **Arrêter** = <kbd>Maj</kbd>+<kbd>F5</kbd>.
5. Enregistre avec <kbd>Ctrl</kbd>+<kbd>S</kbd> dans `Documents\AppsMobs\Scripts`.

### Toucher un bouton grâce à une image

1. Affiche le bouton sur le téléphone, puis dans le Playground : **⋯** → **Capture de l'appareil** (<kbd>F9</kbd>). Accepte d'ouvrir la capture dans Paint.
2. Dans Paint : **Sélectionner** autour du bouton seul, **Rogner**, puis **Enregistrer sous** → PNG, dans le dossier du script, sous le nom `bouton.png`.
3. Remplace le script par :

   ```python
   log("Je cherche le bouton")
   if tap_image("bouton.png", timeout=15):
       log("Bouton touché")
   else:
       log("Bouton introuvable au bout de 15 secondes")
   ```

Si le bouton porte un texte lisible par Android, pas besoin d'image : `wait_text("Paramètres", timeout=15)` puis `tap_text("Paramètres")`.

### Les bonnes habitudes

- Attends une condition (`wait_image`, `wait_text`) plutôt qu'un délai fixe.
- Teste toujours le résultat : `if tap_image(...)`. Un échec ne stoppe pas le script tout seul.
- Varie les pauses avec `random_wait(1, 2)`.
- Les images sont cherchées dans le dossier du script, puis dans `Scripts\img`.
- Un garde-fou bloque le code dangereux (par exemple `import os`) : la fenêtre « Pour votre sécurité, ce script ne peut pas être exécuté » l'indique.

Toutes les fonctions : **https://appsmobs.com/fr/docs/functions** (et dans l'appli : **⋯** → **Référence des fonctions**).

---

## 7. Créer sans coder : les blocs

Dans le Playground, passe en mode **Blocs** : tu assembles des blocs (boucle, **Trouver & Cliquer**, attente, message…) et AppsMobs écrit le Python à ta place, visible en direct. Tu choisis l'appareil et tu lances comme pour un script en code.

| Bloc | Python généré |
|---|---|
| Clic simple | `tap(540, 960)` |
| Swipe vers le haut | `swipe_up()` |
| Bouton Retour | `press_back()` |
| Taper du texte | `type_text('Votre texte ici')` |
| Trouver & Cliquer | `tap_image("button.png", 0.85)` |
| Attendre texte | `wait_text('Texte', timeout=30)` |

Détail : **https://appsmobs.com/fr/docs/block-editor**

---

## 8. Faire écrire tes scripts par une IA

AppsMobs n'a **pas d'assistant intégré** et ne demande **jamais de clé API**. À la place, le **pack AppsMobs** (gratuit) explique l'appli et toutes les fonctions, avec leur signature exacte, à l'IA que tu utilises déjà.

1. **Récupère le pack** : dans le Playground, sur un script vide, la carte **L'écrire avec Claude ou Grok** le copie dans le presse-papiers. Il est aussi sur la [page du pack](https://appsmobs.com/fr/docs/ai-pack), avec un **Skill Claude** prêt à importer.
2. **Donne-le à ton IA** : colle-le en premier message (Grok, ChatGPT, Gemini) ou importe le Skill dans Claude.
3. **Décris ton script** en mots simples : « Touche le bouton vert, attends 5 secondes, puis balaie vers le haut ».
4. **Colle le script** dans le Playground, relis-le, et teste-le sur un appareil.

---

## 9. Vision IA

*Incluse dès l'offre Gratuit avec les modèles fournis ; entraîner ses propres modèles dès l'offre Joueur.* Apprends au bot à trouver des objets ou à reconnaître l'écran, sans dépendre des coordonnées ni de la résolution.

| Type de projet | La question | Dans un script |
|---|---|---|
| **Trouver des objets** | « Où est le bouton *Jouer* ? » | `smart_detect`, `smart_click` |
| **Reconnaître l'écran** | « Suis-je au menu, en combat, sur une pub ? » | `detect_screen`, `wait_screen` |

Le parcours tient en 4 étapes dans la page **Vision IA** : **capturer** des écrans variés, **annoter** (des assistants IA t'aident à aller plus vite), **entraîner** en un clic, **tester** en direct puis corriger.

```python
coffres = smart_detect(["coffre"], model="Mon jeu", conf=0.5)
smart_click(["bouton_jouer"], model="Mon jeu")

if wait_screen("combat", model="Mes écrans", timeout=10):
    log("En combat")
```

Sans carte graphique, l'entraînement tourne sur le processeur (quelques minutes pour un petit projet). Avec une carte **NVIDIA**, l'appli propose de l'activer (téléchargement unique d'environ 2,5 Go) : 5 à 20 fois plus rapide.

Détail : **https://appsmobs.com/fr/docs/vision-ai**

---

## 10. Planifier des scripts

*À partir de l'offre Joueur.* Active **Automatisation** dans les Paramètres, puis **Nouvelle tâche** : choisis **quel script**, **quand** (toutes les 30 minutes, chaque jour à 8 h…) et **sur quels appareils** (n'importe lequel de libre, avec rotation possible, ou des appareils précis).

À savoir :

- Les tâches ne tournent que **pendant qu'AppsMobs est ouvert** (réduit, ça marche). Les passages manqués pendant la veille du PC ne sont pas rattrapés.
- Sur plusieurs appareils, le script est lancé **l'un après l'autre**.
- Un script lancé par une tâche est coupé au bout de **5 minutes**. Pour plus long, lance-le à la main.

Détail : **https://appsmobs.com/fr/docs/scheduling-and-pools**

---

## 11. Offres et licence

| | Gratuit | Joueur | Pro | Ferme | Entreprise |
|---|---|---|---|---|---|
| Prix | 0 € | 9 € / mois ou 90 € / an | 24 € / mois ou 240 € / an | 49 € / mois ou 490 € / an | sur devis |
| Appareils en même temps | 1 | 3 | 10 | 30 | illimité (30+) |
| PC | 1 | 1 | 1 | 3 | selon contrat |
| Vision IA avec les modèles fournis | ✓ | ✓ | ✓ | ✓ | ✓ |
| Entraîner ses propres modèles | — | ✓ | ✓ | ✓ | ✓ |
| Planificateur | — | ✓ | ✓ | ✓ | ✓ |
| Pools d'appareils | — | — | ✓ | ✓ | ✓ |
| Support | communauté | e-mail 48 h | prioritaire 48 h | prioritaire 24 h | dédié |

- Dans toutes les offres : scripts et exécutions illimités, éditeur en blocs, **aucun filigrane**.
- L'offre **Gratuit** est limitée à **1 heure d'exécution de scripts par jour** (remise à zéro à minuit). Les offres payantes se prennent pour **1 mois** ou **12 mois** (12 mois = 2 mois offerts).
- **Essai gratuit de 7 jours** sur Pro : rien n'est prélevé avant le 8e jour, annulable à tout moment.
- Paiement par PayPal, carte ou crypto, avec une facture pour chaque paiement. Prix actuels : **https://appsmobs.com/fr/pricing**
- Une licence = **un PC** (sauf Ferme : **3 PC**). Le nombre de ta formule (1, 3, 10 ou 30) est le nombre de téléphones pilotés en même temps. Pour changer de PC, écris au support.
- Changer d'offre : tes jours restants sont convertis à valeur égale.

---

## 12. Ça ne marche pas ?

| Symptôme | Solution |
|---|---|
| Aucun appareil n'apparaît | Change de câble (il doit transférer des fichiers), vérifie le Débogage USB, choisis **Transfert de fichiers**, puis actualise |
| « Device non autorisé » | Rebranche et accepte la fenêtre du téléphone avec **Toujours autoriser** |
| Pas de fenêtre d'autorisation | Déverrouille le téléphone ; sinon **Révoquer les autorisations de débogage USB** et rebranche |
| Windows ne reconnaît pas le téléphone | Installe le pilote USB de la marque (Gestionnaire de périphériques, triangle jaune) |
| Xiaomi : les touchers ne passent pas | Active **Débogage USB (paramètres de sécurité)** |
| `image introuvable : bouton.png` | Mets l'image dans le dossier du script ou dans `Scripts\img`, vérifie le nom et le `.png` |
| L'image n'est pas trouvée | Recoupe au plus près du bouton, ou baisse la confiance : `tap_image("bouton.png", conf=0.7)` |
| `NameError: name 'clic' is not defined` | Les noms des fonctions sont en anglais : `tap`, `tap_image`, `wait` |
| « Erreur d'authentification » | Recopie e-mail et clé sans espace parasite |
| Boutons de script bloqués | Licence expirée (lecture seule) : renouvelle puis **Vérifier Licence** |
| **Automatisation** absente de la barre | **Paramètres** → **Activer l'automatisation** |

Tous les messages d'erreur connus : **https://appsmobs.com/fr/docs/troubleshooting**

---

## Pour aller plus loin

- [Le Tableau de bord](https://appsmobs.com/fr/docs/dashboard) · [Piloter un appareil](https://appsmobs.com/fr/docs/control)
- [Écrire un script en Python](https://appsmobs.com/fr/docs/python-scripts) · [Référence des fonctions](https://appsmobs.com/fr/docs/functions)
- [Console et journaux](https://appsmobs.com/fr/docs/console) · [Paramètres](https://appsmobs.com/fr/docs/settings)
- [Licence, offres et compte](https://appsmobs.com/fr/docs/licence-and-billing)

Bloqué ? Le **Discord d'AppsMobs** est le moyen le plus rapide d'avoir une réponse.
