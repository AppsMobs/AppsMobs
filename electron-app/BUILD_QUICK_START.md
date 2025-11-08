# 🚀 Guide Rapide - Obtenir le fichier Setup.exe

## 📦 Méthode Rapide (Recommandée)

### Option 1 : Utiliser le script batch (Windows)

1. **Double-cliquez sur `build.bat`** dans le dossier `electron-app/`

2. **Choisissez l'option 1** pour créer l'installateur NSIS (Setup.exe)

3. **Attendez la fin du build** (2-5 minutes)

4. **Le fichier Setup.exe sera dans** :
   ```
   electron-app/dist/
   ```
   Nom du fichier : `AppsMobs-Setup-1.1.10-x64.exe`

---

## 📋 Méthode Manuelle (Ligne de commande)

### Étape 1 : Aller dans le dossier electron-app

```cmd
cd electron-app
```

### Étape 2 : Lancer le build de l'installateur

```cmd
npm run build:win:nsis
```

**OU pour créer les deux formats (Setup + Portable)** :

```cmd
npm run build:win
```

### Étape 3 : Trouver le fichier Setup.exe

Le fichier sera créé dans :
```
electron-app/dist/AppsMobs-Setup-1.1.10-x64.exe
```

---

## 📁 Structure des fichiers générés

Après le build, vous aurez dans `electron-app/dist/` :

```
dist/
├── AppsMobs-Setup-1.1.10-x64.exe     ← INSTALLATEUR (fichier .setup)
├── AppsMobs-Portable-1.1.10-x64.exe  ← Version portable (si build complet)
└── win-unpacked/                      ← Dossier décompressé (pour tests)
    └── AppsMobs.exe                   ← Exécutable décompressé
```

---

## ⚡ Commande Rapide (Tout en un)

Si vous êtes déjà dans le dossier `electron-app/` :

```cmd
npm run build:win:nsis
```

Puis cherchez le fichier dans :
```
dist\AppsMobs-Setup-1.1.10-x64.exe
```

---

## ✅ Vérification

### Le fichier Setup.exe est prêt si :

- ✅ Le fichier existe dans `dist/`
- ✅ La taille est ~150-200 MB
- ✅ L'icône AppsMobs apparaît dans l'explorateur Windows
- ✅ Le nom du fichier est `AppsMobs-Setup-1.1.10-x64.exe`

---

## 🧪 Test de l'installateur

1. **Double-cliquez sur** `AppsMobs-Setup-1.1.10-x64.exe`

2. **Suivez l'assistant d'installation**

3. **Vérifiez que l'application fonctionne** après installation

---

## ⚠️ Si le build échoue

### Erreur : "Logo.ico not found"
```cmd
npm run prepare-build
```

### Erreur : "Python not found"
Installez Python ou ajoutez-le au PATH

### Erreur : "Cannot find module"
```cmd
npm install
```

### Erreur : "Build failed"
- Vérifiez les logs dans `dist/builder-debug.yml`
- Assurez-vous que toutes les dépendances sont installées
- Vérifiez l'espace disque disponible

---

## 📝 Résumé

**Pour obtenir le fichier Setup.exe :**

```cmd
cd electron-app
npm run build:win:nsis
```

**Le fichier sera dans :**
```
electron-app/dist/AppsMobs-Setup-1.1.10-x64.exe
```

**OU utilisez simplement :**
```
Double-cliquez sur build.bat → Choisissez option 1
```

---

**Temps de build :** 2-5 minutes  
**Taille du fichier :** ~150-200 MB  
**Emplacement :** `electron-app/dist/`

