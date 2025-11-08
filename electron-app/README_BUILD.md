# 🚀 Build et Distribution - AppsMobs

## 📦 Créer l'Installateur Windows

### Méthode Rapide (Windows)

1. **Double-cliquez sur `build.bat`**
2. Choisissez le type de build (1, 2 ou 3)
3. Attendez la fin du build
4. Trouvez votre .exe dans le dossier `dist/`

### Méthode Manuelle

#### Installateur avec Setup
```bash
npm run build:win:nsis
```

**Résultat :** `dist/AppsMobs-Setup-1.1.10-x64.exe`

#### Version Portable
```bash
npm run build:win:portable
```

**Résultat :** `dist/AppsMobs-Portable-1.1.10-x64.exe`

#### Les Deux Formats
```bash
npm run build:win
```

## 📋 Prérequis

- ✅ Node.js installé
- ✅ Dépendances installées (`npm install`)
- ✅ Icône disponible (`../assets/icons/Logo.png`)

## 🎯 Caractéristiques

### Installateur NSIS
- ✅ Assistant d'installation professionnel
- ✅ Choix du dossier d'installation
- ✅ Raccourci Bureau et Menu Démarrer
- ✅ Désinstallation propre
- ✅ Icône personnalisée

### Version Portable
- ✅ Aucune installation nécessaire
- ✅ Fonctionne depuis n'importe où
- ✅ Idéale pour clés USB

## 📁 Structure des Fichiers

```
dist/
├── AppsMobs-Setup-1.1.10-x64.exe      (Installateur)
├── AppsMobs-Portable-1.1.10-x64.exe  (Portable)
└── builder-debug.yml                  (Logs)
```

## ⚙️ Configuration

Tout est configuré dans `package.json` sous la section `"build"` :

- **Version** : `1.1.10`
- **App ID** : `com.appsmobs.pro`
- **Nom** : `AppsMobs`
- **Architecture** : `x64` (64-bit Windows)

## 🔧 Personnalisation

### Changer la Version
Éditez `package.json` :
```json
"version": "1.2.0"
```

### Changer l'Icône
Remplacez `../assets/icons/Logo.png` par votre icône (PNG, 256x256 minimum)

## ⏱️ Temps de Build

- **Premier build** : 5-10 minutes (télécharge NSIS)
- **Builds suivants** : 2-5 minutes

## 📊 Taille Approximative

- **Installateur** : ~150-200 MB
- **Portable** : ~150-200 MB

## ⚠️ Notes Importantes

1. **Premier Build** : Le premier build télécharge automatiquement les outils nécessaires (NSIS)
2. **Antivirus** : Les exécutables non signés peuvent être signalés (faux positif normal)
3. **Icône** : Assurez-vous que l'icône existe avant de builder
4. **Dépendances** : Toutes les dépendances doivent être installées (`npm install`)

## 🐛 Dépannage

### Erreur : "Cannot find module"
```bash
npm install
```

### Erreur : "Icon not found"
Vérifiez que `../assets/icons/Logo.png` existe

### Build échoue
- Vérifiez les logs dans `dist/builder-debug.yml`
- Assurez-vous que Node.js est à jour
- Vérifiez l'espace disque disponible

## 📤 Distribution

Une fois le build terminé, vous pouvez distribuer :

- ✅ **Setup.exe** : Pour installation standard
- ✅ **Portable.exe** : Pour version portable
- ✅ Les deux : Pour donner le choix aux utilisateurs

## 🔐 Signer l'Application (Optionnel)

Pour signer avec un certificat (évite les warnings antivirus) :

```json
"win": {
  "certificateFile": "cert.pfx",
  "certificatePassword": "motdepasse"
}
```

---

**Version actuelle :** 1.1.10
**Dernière mise à jour :** $(date)

