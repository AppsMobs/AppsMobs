# 🔧 Dépannage Email - Pas d'email reçu

## ✅ Vérifications rapides

### 1. Vérifier que le serveur backend est démarré

Assurez-vous que le backend tourne sur le port 3001.

### 2. Vérifier les logs du serveur

Quand vous vous inscrivez, regardez les logs du serveur backend. Vous devriez voir :

**Si ça fonctionne :**
```
✅ Email de vérification envoyé avec succès à: votre@email.com
📧 Email ID: abc123...
```

**Si ça ne fonctionne PAS :**
```
❌ Erreur envoi email Resend: {...}
📧 Détails: ...
```

### 3. Vérifier la configuration Resend

#### A. Vérifier la clé API dans `.env`

Assurez-vous que `website/auth-backend/.env` contient :
```env
RESEND_API_KEY=re_CHFVekMv_4Mo6rE4rv3dYbhThaJQVY69F
EMAIL_FROM=onboarding@resend.dev
```

**Important :** Utilisez `onboarding@resend.dev` pour les tests. C'est le domaine de test fourni par Resend qui fonctionne immédiatement.

#### B. Pour utiliser `support@appsmobs.com`

1. Allez sur https://resend.com/domains
2. Ajoutez votre domaine `appsmobs.com`
3. Suivez les instructions pour ajouter les enregistrements DNS
4. Une fois vérifié, modifiez `.env` :
   ```env
   EMAIL_FROM=support@appsmobs.com
   ```
5. Redémarrez le serveur backend

### 4. Vérifier les erreurs dans la console du serveur

Les erreurs Resend courantes :

**Erreur : "Invalid API key"**
- Solution : Vérifiez que `RESEND_API_KEY` est correct dans `.env`

**Erreur : "Domain not verified"**
- Solution : Utilisez temporairement `onboarding@resend.dev` dans `.env`

**Erreur : "Unauthorized"**
- Solution : Vérifiez que la clé API est active dans votre compte Resend

### 5. Vérifier le dossier spam

Parfois les emails arrivent dans le dossier spam. Vérifiez :
- Gmail : Dossier "Spam" ou "Indésirables"
- Outlook : Dossier "Courrier indésirable"

### 6. Tester avec une autre adresse email

Essayez avec une autre adresse email pour voir si le problème vient de l'adresse spécifique.

## 🔍 Diagnostic étape par étape

### Étape 1 : Vérifier que Resend est configuré

Au démarrage du serveur, vous devriez voir :
```
📧 Email: Resend actif - Envoi depuis: onboarding@resend.dev
   ⚠️  Utilisation du domaine de test Resend...
```

Si vous voyez "Inactif", ajoutez `RESEND_API_KEY` dans `.env`.

### Étape 2 : Vérifier que l'email est tenté d'être envoyé

Quand vous vous inscrivez, cherchez dans les logs :
```
✅ Email de vérification envoyé à votre@email.com
```

Si vous voyez une erreur, copiez le message d'erreur complet.

### Étape 3 : Vérifier dans le dashboard Resend

1. Allez sur https://resend.com/emails
2. Vous devriez voir tous les emails envoyés
3. Si un email a échoué, cliquez dessus pour voir la raison

## 🛠️ Solutions rapides

### Solution 1 : Utiliser le domaine de test (RECOMMANDÉ pour les tests)

Dans `website/auth-backend/.env` :
```env
RESEND_API_KEY=re_CHFVekMv_4Mo6rE4rv3dYbhThaJQVY69F
EMAIL_FROM=onboarding@resend.dev
```

Redémarrez le serveur backend.

### Solution 2 : Vérifier le domaine personnalisé

Si vous voulez utiliser `support@appsmobs.com` :

1. Allez sur https://resend.com/domains
2. Vérifiez que `appsmobs.com` est bien vérifié (status "Verified")
3. Si ce n'est pas vérifié, suivez les instructions pour ajouter les DNS
4. Une fois vérifié, changez `EMAIL_FROM` dans `.env`

### Solution 3 : Vérifier que l'email n'est pas bloqué

Certains emails peuvent être bloqués par des filtres anti-spam. Essayez avec :
- Un email Gmail
- Un email Outlook/Hotmail
- Un autre fournisseur

## 📋 Checklist complète

- [ ] Le serveur backend est démarré (port 3001)
- [ ] `RESEND_API_KEY` est présent dans `.env`
- [ ] `EMAIL_FROM` est configuré (utilisez `onboarding@resend.dev` pour les tests)
- [ ] Les logs du serveur montrent une tentative d'envoi
- [ ] Pas d'erreur dans les logs Resend
- [ ] Vérifié le dossier spam de votre email
- [ ] Le compte Resend est actif et la clé API est valide
- [ ] Si domaine personnalisé : le domaine est vérifié dans Resend

## 🆘 Si rien ne fonctionne

1. Copiez les logs complets du serveur backend quand vous vous inscrivez
2. Vérifiez dans https://resend.com/emails si les emails sont envoyés
3. Vérifiez dans https://resend.com/api-keys que votre clé API est active

## 💡 Conseil

Pour les tests, utilisez toujours `onboarding@resend.dev`. C'est plus simple et ça fonctionne immédiatement. Vous pourrez utiliser votre domaine personnalisé plus tard une fois qu'il sera vérifié.

