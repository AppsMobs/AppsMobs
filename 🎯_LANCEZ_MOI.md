# 🎯 LANCER L'APPLICATION - GUIDE ULTRA SIMPLE

## 🚀 Pour DÉVELOPPER (vous maintenant)

### Étape 1: Installer
```bash
pip install -r requirements.txt
```

### Étape 2: Lancer
```bash
python run_app.py
```

✅ **C'EST TOUT !** L'application se lance.

---

## 🔨 Pour CRÉER L'EXE (pour donner au client)

### Étape 1: Installer PyInstaller
```bash
pip install pyinstaller
```

### Étape 2: Créer l'exe
```bash
python build_final.bat
```

✅ **L'EXE sera dans:** `dist/BootyBot/BootyBot.exe`

---

## 📦 Pour DONNER au CLIENT

Donnez UN SEUL fichier ZIP contenant:

```
📦 BootyBot-v1.0.zip
├── BootyBot.exe           (de dist/BootyBot/)
└── INSTRUCTIONS_CLIENT.txt
```

Le client n'a **PAS besoin de Python** !

Il doit juste installer:
1. ADB (Android Debug Bridge)
2. scrcpy

Ces instructions sont dans `INSTRUCTIONS_CLIENT.txt`

---

## 📂 Quels fichiers regarder ?

### ✅ FICHIERS IMPORTANTS (lisez ceux-là):
- `🎯_LANCEZ_MOI.md` ← **VOUS ÊTES ICI**
- `COMMENCER_ICI.md` ← Version courte
- `GUIDE_SIMPLE.md` ← Explication complète

### ❌ FICHIERS À IGNORER (pour l'instant):
- Tous les autres .md (documentation)
- Les scripts de build (sauf build_final.bat)
- BootyBot.spec, build_exe.py, etc.

---

## 🎯 RÉSUMÉ EN 3 LIGNES

```bash
# POUR DÉVELOPPER:
python run_app.py

# POUR CRÉER L'EXE:
python build_final.bat

# POUR LE CLIENT:
Donnez BootyBot.exe + INSTRUCTIONS_CLIENT.txt
```

**C'est vraiment tout !** 🎉

