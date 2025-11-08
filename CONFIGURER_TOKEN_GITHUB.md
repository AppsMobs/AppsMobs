# 🔐 Configuration du Token GitHub

## Problème Actuel
- ❌ Compte actuel : `ConecioAgency`
- ❌ Repository cible : `AppsMobs/AppsMobs`
- ❌ Erreur : Permission denied (403)

## ✅ Solution : Utiliser un Personal Access Token

### Étape 1 : Créer un Token (si vous n'en avez pas)

1. Allez sur GitHub : https://github.com/settings/tokens
2. Cliquez sur **"Generate new token"** → **"Generate new token (classic)"**
3. Donnez un nom : `AppsMobs-Push`
4. Sélectionnez les scopes :
   - ✅ **repo** (Full control of private repositories)
5. Cliquez sur **"Generate token"**
6. **⚠️ COPIEZ LE TOKEN IMMÉDIATEMENT** (vous ne pourrez plus le voir après)

### Étape 2 : Configurer Git avec le Token

**Option A : Dans l'URL du remote (recommandé pour un push unique)**

```powershell
# Remplacez YOUR_TOKEN par votre token
git remote set-url origin https://YOUR_TOKEN@github.com/AppsMobs/AppsMobs.git

# Puis poussez
git push -u origin master
```

**Option B : Utiliser Git Credential Manager (recommandé pour usage permanent)**

```powershell
# Git vous demandera vos identifiants
git push -u origin master

# Quand demandé :
# Username: AppsMobs (ou votre username)
# Password: VOTRE_TOKEN (pas votre mot de passe GitHub !)
```

### Étape 3 : Vérifier

```powershell
# Vérifier que le remote est bien configuré
git remote -v

# Pousser
git push -u origin master
```

## 🔒 Sécurité

⚠️ **NE COMMITEZ JAMAIS VOTRE TOKEN DANS LE CODE !**

- Le token dans l'URL du remote est stocké localement dans `.git/config`
- Ne partagez jamais votre token
- Si le token est compromis, révoquez-le immédiatement sur GitHub

## 📝 Commandes Complètes

```powershell
# 1. Configurer le remote avec votre token
git remote set-url origin https://VOTRE_TOKEN@github.com/AppsMobs/AppsMobs.git

# 2. Vérifier
git remote -v

# 3. Pousser
git push -u origin master
```

## ✅ Après le Push

Vérifiez sur GitHub : https://github.com/AppsMobs/AppsMobs

Vous devriez voir :
- ✅ README.md
- ✅ LICENSE.md
- ✅ CONTRIBUTING.md
- ✅ Tous vos fichiers publics

