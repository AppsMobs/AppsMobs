# 📧 Configuration Resend - Exemple de code

## Code à utiliser :

```javascript
import { Resend } from 'resend';

const resend = new Resend('re_CHFVekMv_4Mo6rE4rv3dYbhThaJQVY69F');

resend.emails.send({
  from: 'support@appsmobs.com',
  to: 'safelevage@gmail.com',
  subject: 'Hello World',
  html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
});
```

## ✅ Configuration dans `.env`

Ajoutez dans votre fichier `website/auth-backend/.env` :

```env
# Resend Configuration
RESEND_API_KEY=re_CHFVekMv_4Mo6rE4rv3dYbhThaJQVY69F
EMAIL_FROM=support@appsmobs.com
```

## ⚠️ Important : Vérification du domaine

Pour utiliser `support@appsmobs.com`, vous devez :

1. **Aller sur** https://resend.com/domains
2. **Ajouter votre domaine** `appsmobs.com`
3. **Suivre les instructions** pour ajouter les enregistrements DNS
4. **Une fois vérifié**, vous pourrez envoyer depuis `support@appsmobs.com`

### Pour tester immédiatement :

Si le domaine n'est pas encore vérifié, utilisez temporairement :
- `from: 'onboarding@resend.dev'` (domaine de test fourni par Resend)

Une fois le domaine vérifié, remplacez par `support@appsmobs.com`.

