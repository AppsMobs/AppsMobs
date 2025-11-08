# 🚀 Créer le Dépôt GitHub pour AppsMobs

## ⚠️ Problème détecté

Le dépôt `AppsMobs/Appsmobs` n'existe pas encore sur GitHub. Vous devez le créer avant de pouvoir publier des releases.

## 📋 Étapes pour créer le dépôt

### Option 1 : Créer une Organisation "AppsMobs" (Recommandé)

1. **Aller sur GitHub** : [github.com](https://github.com)
2. **Créer une organisation** :
   - Cliquez sur votre avatar (en haut à droite)
   - Cliquez sur "Settings"
   - Dans le menu de gauche, cliquez sur "Organizations"
   - Cliquez sur "New organization"
   - Choisissez "Free" (gratuit)
   - Nom : `AppsMobs`
   - Email : votre email
   - Créer l'organisation

3. **Créer le dépôt dans l'organisation** :
   - Dans l'organisation `AppsMobs`, cliquez sur "New repository"
   - **Repository name** : `AppsMobs` (avec M majuscule)
   - **Description** : `Professional Android automation tool for Windows`
   - **Visibility** : **Public** ✅ (nécessaire pour les releases publiques)
   - **NE PAS** cocher "Initialize with README" (vous avez déjà un README)
   - Cliquez sur "Create repository"

### Option 2 : Utiliser votre compte personnel

Si vous préférez utiliser votre compte GitHub personnel :

1. **Aller sur GitHub** : [github.com](https://github.com)
2. **Créer un nouveau dépôt** :
   - Cliquez sur le "+" en haut à droite → "New repository"
   - **Repository name** : `AppsMobs` (avec M majuscule)
   - **Owner** : Votre nom d'utilisateur (pas "AppsMobs")
   - **Description** : `Professional Android automation tool for Windows`
   - **Visibility** : **Public** ✅
   - **NE PAS** cocher "Initialize with README"
   - Cliquez sur "Create repository"

3. **Mettre à jour la configuration** :
   - Si vous utilisez votre compte personnel, modifiez `electron-app/package.json` :
   ```json
   "publish": [
     {
       "provider": "github",
       "owner": "VOTRE_USERNAME",  // ← Votre nom d'utilisateur GitHub
       "repo": "Appsmobs"
     }
   ]
   ```

## 🔧 Après avoir créé le dépôt

### 1. Connecter votre dépôt local

```powershell
# Vérifier si un remote existe déjà
git remote -v

# Si aucun remote, ajouter le vôtre
git remote add origin https://github.com/AppsMobs/AppsMobs.git
# OU si vous utilisez votre compte personnel :
# git remote add origin https://github.com/VOTRE_USERNAME/AppsMobs.git

# Pousser le code (première fois)
git push -u origin master
```

### 2. Vérifier la configuration dans `package.json`

**Fichier : `electron-app/package.json`**

Vérifiez que la section `publish` correspond à votre dépôt :

```json
"publish": [
  {
    "provider": "github",
    "owner": "AppsMobs",  // ← Votre organisation OU votre username
    "repo": "AppsMobs"     // ← Nom exact du dépôt (avec M majuscule)
  }
]
```

### 3. Tester l'accès

Allez sur : `https://github.com/AppsMobs/AppsMobs` (ou votre URL)

Vous devriez voir votre dépôt (vide ou avec votre code si vous avez pushé).

## 📝 Checklist

- [ ] Organisation ou compte GitHub prêt
- [ ] Dépôt créé avec le nom `AppsMobs` (avec M majuscule)
- [ ] Dépôt en **Public** (pour les releases publiques)
- [ ] Configuration `package.json` mise à jour avec le bon `owner`
- [ ] Remote Git configuré
- [ ] Code poussé sur GitHub (optionnel, mais recommandé)

## 🚀 Prochaines étapes

Une fois le dépôt créé :

1. **Publier votre première release** (voir `GITHUB_RELEASE_GUIDE.md`)
2. **Mettre à jour le site web** (voir `WEBSITE_UPDATE_GUIDE.md`)

## ⚠️ Important

- Le dépôt **DOIT être Public** pour que les releases soient accessibles publiquement
- Le nom du dépôt doit correspondre exactement à `repo` dans `package.json`
- L'`owner` doit être soit votre organisation, soit votre username GitHub

