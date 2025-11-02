# Guide de Préparation pour Production & GitHub

## 🎯 Objectif
Préparer le projet pour :
1. ✅ Build en .exe
2. ✅ Publication sur GitHub (visible aux clients)
3. ✅ Modèle freemium (licences gratuites au début)

## 📋 Checklist de Nettoyage

### ✅ Fichiers déjà exclus dans .gitignore
- ✅ node_modules/
- ✅ *.log
- ✅ *.bat, *.ps1
- ✅ Documentation interne (*_GUIDE.md, etc.)
- ✅ Fichiers de test
- ✅ .env et config.json
- ✅ Screenshots temporaires
- ✅ Build artifacts (*.exe, dist/, build/)

### 🔧 Actions à Faire Manuellement

#### 1. Supprimer les fichiers de dev (si pas déjà fait)
```bash
# Supprimer les logs
del website\auth-backend\*.log

# Supprimer les screenshots (garder seulement quelques exemples si besoin)
# del screenshots\*.png  # À décider selon vos besoins

# Supprimer les fichiers .whl
del *.whl

# Supprimer les fichiers .bat de dev (optionnel - déjà dans .gitignore)
# Ils ne seront pas commités mais peuvent être supprimés localement
```

#### 2. Créer un dossier pour fichiers sensibles
```
docs-internal/          # Documentation technique interne (ne pas commiter)
  - ANALYSE_ARCHITECTURE.md
  - GUIDE_DEVELOPPEMENT.md
  - etc.
```

#### 3. Vérifier les fichiers importants
- ✅ README.md (professionnel - FAIT)
- ✅ LICENSE.md (présent)
- ✅ .gitignore (amélioré - FAIT)
- ✅ requirements.txt (à jour)
- ✅ setup.py (à mettre à jour)

## 🔨 Préparation pour Build EXE

### Fichiers nécessaires pour le build

1. **Core application** :
   - `core/` - Toutes les fonctions
   - `ui/` - Interface graphique
   - `scripts/` - Scripts d'exemple (optionnel)

2. **Assets** :
   - `assets/icons/` - Icônes de l'app
   - `assets/scrcpy/` - Binaires scrcpy (si inclus)

3. **Configuration** :
   - `requirements.txt` - Dépendances
   - `setup.py` - Configuration package
   - `config.json.example` - Exemple de config (sans secrets)

4. **Installer** :
   - `installer/AppsMobs.nsi` - Script NSIS

### Structure pour build

```
dist/
├── AppsMobs.exe          # Exécutable principal
├── assets/               # Ressources
├── scrcpy/              # Binaires scrcpy
└── config.json.example  # Config exemple
```

## 🌐 Préparation GitHub

### Repository Public Structure

```
appsmobs/
├── README.md              ✅ Professionnel (FAIT)
├── LICENSE.md             ✅ Présent
├── CONTRIBUTING.md        ✅ Créé
├── .gitignore             ✅ Amélioré
├── requirements.txt       ✅ À jour
├── setup.py               ⚠️ À mettre à jour
│
├── core/                  ✅ Code source
├── ui/                    ✅ Interface
├── scripts/               ✅ Exemples
├── assets/                ✅ Ressources
├── installer/             ✅ Installer
│
└── website/               ✅ Site freemium
    ├── README.md
    ├── package.json
    └── ...
```

### Informations à mettre à jour

1. **setup.py** :
   - name: "appsmobs" (au lieu de "bootybot")
   - url: votre repo GitHub
   - author_email: votre email

2. **Package.json (website)** :
   - name: "@appsmobs/website"
   - repository: votre repo

## 📝 Checklist Finale

### Avant de commit sur GitHub

- [ ] .gitignore complet ✅
- [ ] README.md professionnel ✅
- [ ] LICENSE.md présent ✅
- [ ] Pas de fichiers sensibles (.env, config.json)
- [ ] Pas de node_modules/
- [ ] Pas de logs
- [ ] Documentation interne déplacée ou supprimée
- [ ] setup.py mis à jour avec bonnes infos
- [ ] Structure du repo propre

### Test local

```bash
# Vérifier ce qui sera commité
git status

# Vérifier que les fichiers sensibles sont bien ignorés
git check-ignore .env config.json
```

## 🚀 Prochaines Étapes

1. **Nettoyer le repo** : Supprimer fichiers inutiles
2. **Mettre à jour setup.py** : Bonnes infos
3. **Créer le build exe** : Utiliser build_exe.py
4. **Tester l'installer** : Vérifier que tout fonctionne
5. **Push sur GitHub** : Repo propre et professionnel

## 💡 Notes Freemium

Pour le modèle freemium :
- ✅ Site web accessible (licences gratuites au début)
- ✅ README professionnel qui inspire confiance
- ✅ Documentation claire sur les plans
- ✅ Code source visible (mais pas nécessairement open source complet)
- ⚠️ Secrets et configs jamais commités

