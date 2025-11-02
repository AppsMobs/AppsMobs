# 📧 Configuration Email - BootyBot

## ❌ Problème : Vous n'avez pas reçu d'email

Cela signifie que la configuration SMTP n'est pas active. Le serveur affiche probablement :
```
📧 Mode email: Inactif (configurez SMTP_USER et SMTP_PASS)
```

## ✅ Solution : Configurer Gmail SMTP

### Option 1 : Gmail (Recommandé pour développement)

#### Étape 1 : Activer l'authentification à 2 facteurs
1. Allez sur https://myaccount.google.com/security
2. Activez l'**authentification à 2 facteurs** sur votre compte Gmail

#### Étape 2 : Créer un mot de passe d'application
1. Allez sur https://myaccount.google.com/apppasswords
2. Sélectionnez **"Application"** → **"Mail"**
3. Sélectionnez **"Autre"** → tapez "BootyBot"
4. Cliquez sur **"Générer"**
5. **Copiez le mot de passe** (16 caractères) - vous ne le verrez qu'une fois !

#### Étape 3 : Configurer dans `.env`
Ouvrez `website/auth-backend/.env` et ajoutez :

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
```

**Important** :
- `SMTP_USER` = votre adresse Gmail complète
- `SMTP_PASS` = le mot de passe d'application généré (16 caractères, pas votre mot de passe Gmail normal)

#### Étape 4 : Redémarrer le serveur
1. Arrêtez le serveur backend (Ctrl+C)
2. Relancez `DEMARRER_BACKEND.bat`
3. Vous devriez voir : `📧 Mode email: Actif`

### Option 2 : Autres services SMTP

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=votre_email@outlook.com
SMTP_PASS=votre_mot_de_passe
```

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=votre_api_key_sendgrid
```

## 🧪 Tester l'envoi d'email

Après avoir configuré SMTP :

1. **Redémarrez le serveur backend**
2. **Essayez de créer un nouveau compte** depuis le site
3. **Vérifiez votre boîte email** (et le dossier spam)

## ⚠️ Problèmes courants

### "Authentication failed"
- ❌ Vous utilisez votre mot de passe Gmail normal
- ✅ Utilisez un **mot de passe d'application**

### "Connection timeout"
- Vérifiez votre connexion internet
- Vérifiez que le port 587 n'est pas bloqué par un firewall

### L'email arrive dans le spam
- C'est normal pour les emails automatiques
- Ajoutez `noreply@bootybot.com` (ou votre SMTP_USER) dans vos contacts

## 📝 Exemple complet de `.env`

```env
# Port
PORT=3001

# Frontend
FRONTEND_URL=http://localhost:5174

# Supabase
SUPABASE_URL=https://encoikswoojgqilbdkwy.supabase.co
SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_KEY=votre_service_key

# JWT
JWT_SECRET=votre_jwt_secret_long

# SMTP (pour les emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email@gmail.com
SMTP_PASS=votre_mot_de_passe_application_16_caracteres
```

## ✅ Vérification

Après configuration, le serveur doit afficher :
```
🚀 Serveur d'authentification démarré sur le port 3001
📧 Mode email: Actif ✅
🤖 reCAPTCHA: Actif
🔗 Supabase: https://encoikswoojgqilbdkwy.supabase.co
🎫 Licence: Intégrée
```

Si vous voyez "Mode email: Inactif", c'est que SMTP_USER ou SMTP_PASS n'est pas configuré correctement.

