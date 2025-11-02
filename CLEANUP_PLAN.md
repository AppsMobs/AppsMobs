# Plan de Nettoyage pour Production

## 📋 Fichiers à Supprimer

### 1. Fichiers de Documentation Interne (à déplacer dans `/docs-internal` ou supprimer)
- Tous les fichiers `*_GUIDE.md`, `*_INSTRUCTIONS*.md`, `*_SETUP*.md`
- Documentation technique : `ANALYSE*.md`, `ARCHITECTURE*.md`, `PLAN*.md`
- Guides de développement : `ETAPE*.md`, `PROCÉDURE*.md`, `SOLUTION*.md`

### 2. Scripts de Développement (.bat, .ps1)
- `DEMARRER*.bat`, `START*.bat`, `RESET*.bat`, `INSTALL*.bat`
- Scripts PowerShell de configuration

### 3. Fichiers Temporaires
- `*.log`, `combined.log`, `error.log`
- `screenshots/` (garder seulement quelques exemples si nécessaire)
- `*.tmp`, `*.bak`, `*.cache`
- `*.whl` (fichiers wheel Python)

### 4. Fichiers de Test
- `test_*.py`, `test_*.js`
- Fichiers SQL de test

### 5. Fichiers de Configuration Sensibles
- `.env`, `config.json` (garder seulement `.env.example`)

## 📁 Structure Proposée pour GitHub

```
BootyBot/
├── README.md                    # README principal (à créer/améliorer)
├── LICENSE.md                   # Licence
├── .gitignore                   # Amélioré
├── requirements.txt             # Dépendances Python
├── setup.py                     # Installation
│
├── core/                        # Code source principal
│   ├── __init__.py
│   ├── android_functions.py
│   ├── auth.py
│   ├── license.py
│   ├── multi_device_manager.py
│   └── scrcpy_launcher.py
│
├── ui/                          # Interface utilisateur
│   ├── main_gui.py
│   └── multi_device_gui.py
│
├── scripts/                     # Scripts Python d'exemple
│   └── ...
│
├── installer/                   # Scripts d'installation
│   └── AppsMobs.nsi
│
├── assets/                      # Ressources
│   └── icons/
│
├── website/                     # Site web (freemium)
│   ├── README.md
│   ├── package.json
│   └── ...
│
└── docs/                        # Documentation utilisateur (optionnel)
    └── ...
```

## ✅ Actions Immédiates

1. ✅ Améliorer `.gitignore` (FAIT)
2. ⏳ Supprimer les fichiers listés ci-dessus
3. ⏳ Créer un README.md professionnel
4. ⏳ Organiser la structure
5. ⏳ Préparer les fichiers de build

