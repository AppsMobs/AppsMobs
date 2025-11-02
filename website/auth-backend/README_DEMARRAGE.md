# 🚀 Guide de Démarrage Rapide

## Problème : "Impossible de joindre le serveur"

Si vous voyez cette erreur, le backend n'est pas démarré ou mal configuré.

## ✅ Solution en 3 étapes

### 1. Installer les dépendances

```bash
cd website/auth-backend
npm install
```

### 2. Créer le fichier `.env`

Créez un fichier `.env` dans `website/auth-backend/` avec au minimum :

```env
PORT=3001
FRONTEND_URL=http://localhost:5173

# Supabase (OBLIGATOIRE)
SUPABASE_URL=https://encoikswoojgqilbdkwy.supabase.co
SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_KEY=votre_service_key

# Licence
LICENSE_SERVER_URL=https://encoikswoojgqilbdkwy.supabase.co/functions/v1/license
ADMIN_TOKEN=votre_admin_token

# JWT
JWT_SECRET=générez_un_secret_long_ici

# SMTP (optionnel pour l'instant)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email@gmail.com
SMTP_PASS=votre_mot_de_passe_app
```

### 3. Démarrer le backend

```bash
npm run dev
```

Vous devriez voir :
```
🚀 Serveur d'authentification démarré sur le port 3001
```

## 🔍 Vérification

Ouvrez un nouveau terminal et testez :
```bash
curl http://localhost:3001/api/me
```

Ou avec PowerShell :
```powershell
Invoke-WebRequest http://localhost:3001/api/me
```

Si vous obtenez une erreur 401, c'est normal - cela signifie que le serveur fonctionne !

## ⚠️ Erreurs courantes

- **"Cannot find module"** → Exécutez `npm install`
- **"ECONNREFUSED"** → Le backend n'est pas démarré
- **Variables Supabase manquantes** → Créez le fichier `.env`

