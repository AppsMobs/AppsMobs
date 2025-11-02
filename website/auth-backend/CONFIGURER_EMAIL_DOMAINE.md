# 📧 Configurer l'Email depuis support@appsmobs.com

## 🎯 Objectif
Envoyer les emails depuis `support@appsmobs.com` au lieu de votre email Gmail personnel.

## ✅ Solutions Gratuites

### Option 1 : Resend (RECOMMANDÉ - Gratuit et Simple) ⭐

**Avantages** :
- ✅ Gratuit jusqu'à 100 emails/jour
- ✅ Très simple à configurer
- ✅ API moderne
- ✅ Vous pouvez utiliser votre domaine `appsmobs.com`
- ✅ Excellent délivrabilité

**Configuration** :

1. **Créer un compte** sur https://resend.com
2. **Ajouter votre domaine** `appsmobs.com` (ou utilisez leur domaine de test)
3. **Obtenir votre API key**
4. **Installer le package** :
   ```bash
   cd website/auth-backend
   npm install resend
   ```
5. **Modifier `server.js`** pour utiliser Resend au lieu de Nodemailer
6. **Ajouter dans `.env`** :
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxx
   EMAIL_FROM=support@appsmobs.com
   ```

---

### Option 2 : SendGrid (Fiable - Gratuit)

**Avantages** :
- ✅ Gratuit jusqu'à 100 emails/jour
- ✅ Très fiable
- ✅ Permet d'utiliser votre domaine

**Configuration** :

1. **Créer un compte** sur https://sendgrid.com
2. **Vérifier votre domaine** `appsmobs.com`
3. **Obtenir votre API key**
4. **Ajouter dans `.env`** :
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=votre_api_key_sendgrid
   EMAIL_FROM=support@appsmobs.com
   ```

---

### Option 3 : Utiliser Gmail avec un alias (Temporaire)

Si vous n'avez pas encore configuré votre domaine, vous pouvez temporairement :
- Utiliser Gmail SMTP
- Mais afficher `support@appsmobs.com` comme expéditeur (attention : certains clients email verront quand même l'adresse réelle)

**Modification simple** dans `server.js` :
```javascript
from: `"AppsMobs Support" <support@appsmobs.com>`,  // Nom affiché
// Mais utilise toujours SMTP Gmail en arrière-plan
```

⚠️ **Limite** : L'email réel sera visible dans les en-têtes techniques.

---

## 🚀 Implémentation Recommandée : Resend

Je peux modifier le code pour utiliser **Resend** (le plus simple et moderne). 

**Voulez-vous que je :**
1. ✅ Installe et configure Resend dans votre code ?
2. ✅ Vous guide pour créer un compte Resend ?
3. ✅ Configure `support@appsmobs.com` comme expéditeur ?

---

## 📋 Étapes pour Resend

### 1. Créer un compte Resend
- Allez sur https://resend.com/signup
- Créez un compte gratuit

### 2. Obtenir une API Key
- Dashboard → API Keys → Create API Key
- Copiez la clé (commence par `re_`)

### 3. Configurer le domaine (optionnel)
- Vous pouvez utiliser leur domaine de test temporairement
- Ou vérifier votre domaine `appsmobs.com` pour utiliser `support@appsmobs.com`

### 4. Je modifie le code
- Je remplace Nodemailer par Resend
- Je configure `support@appsmobs.com` comme expéditeur

---

## 🤔 Quelle option préférez-vous ?

**Recommandation** : **Resend** car :
- ✅ Très simple
- ✅ Gratuit
- ✅ Moderne et rapide
- ✅ Bonne délivrabilité

Dites-moi si vous voulez que je configure Resend maintenant ! 🚀

