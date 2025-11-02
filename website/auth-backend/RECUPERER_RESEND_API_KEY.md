# 🔑 Comment récupérer votre clé API Resend

## 📍 Option 1 : Retrouver votre clé existante

### Étape 1 : Accéder à Resend
1. Allez sur [https://resend.com](https://resend.com)
2. Connectez-vous à votre compte

### Étape 2 : Accéder aux API Keys
1. Dans le dashboard, cliquez sur **"API Keys"** dans le menu de gauche
2. Vous verrez la liste de vos clés API

### Étape 3 : Voir la clé
1. Trouvez la clé que vous utilisez (ou la plus récente)
2. Cliquez sur **"View"** ou l'icône 👁️ pour révéler la clé
3. **Copiez la clé** complète (commence par `re_...`)

---

## 📍 Option 2 : Créer une nouvelle clé API

Si vous ne trouvez pas votre clé ou souhaitez en créer une nouvelle :

### Étape 1 : Créer une nouvelle clé
1. Allez sur [https://resend.com/api-keys](https://resend.com/api-keys)
2. Cliquez sur **"Create API Key"** ou **"Add API Key"**
3. Donnez un nom à votre clé (ex: "AppsMobs Production")
4. Cliquez sur **"Create"**

### Étape 2 : Copier la clé
⚠️ **IMPORTANT :** Vous ne pourrez voir la clé qu'**une seule fois** lors de la création !
1. **Copiez immédiatement** la clé (commence par `re_...`)
2. **Collez-la dans votre `.env`** immédiatement

### Étape 3 : Ajouter dans `.env`
Ajoutez dans `website/auth-backend/.env` :
```env
RESEND_API_KEY=re_votre_nouvelle_cle_ici
```

---

## 🔒 Si vous avez perdu votre clé

Si vous ne pouvez plus accéder à votre clé :

1. **Révoguer l'ancienne clé** (dans Resend > API Keys > Revoke)
2. **Créer une nouvelle clé** (voir Option 2 ci-dessus)
3. **Mettre à jour votre `.env`** avec la nouvelle clé

---

## ✅ Vérifier que la clé fonctionne

Après avoir ajouté la clé dans `.env`, redémarrez votre serveur backend :
```bash
cd website/auth-backend
npm run dev
```

Vous devriez voir :
- ✅ `RESEND_API_KEY chargé` dans les logs
- ❌ Ou une erreur si la clé est invalide

---

## 📝 Exemple de format

Votre clé API Resend ressemble à ceci :
```
re_CHFVekMv_4Mo6rE4rv3dYbhThaJQVY69F
```

Elle commence toujours par `re_` suivi de caractères alphanumériques.

---

## ⚠️ Sécurité

- ✅ Ne partagez JAMAIS votre clé API
- ✅ Ne commitez JAMAIS votre `.env` dans Git
- ✅ Ajoutez `.env` dans `.gitignore`
- ✅ Utilisez des clés différentes pour développement et production

