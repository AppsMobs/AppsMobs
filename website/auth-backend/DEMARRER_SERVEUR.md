# 🚀 Comment Démarrer le Serveur Backend

## Étapes rapides

### 1. Ouvrez un terminal dans `website/auth-backend`

### 2. Démarrez le serveur

```bash
npm run dev
```

Vous devriez voir :
```
🚀 Serveur d'authentification démarré sur le port 3001
📧 Mode email: Inactif (configurez SMTP_USER et SMTP_PASS)
🤖 reCAPTCHA: Mode développement
🔗 Supabase: https://encoikswoojgqilbdkwy.supabase.co
🎫 Licence: Intégrée
```

### 3. Laissez ce terminal ouvert

Le serveur doit rester en cours d'exécution pour que le frontend puisse y accéder.

## ⚠️ Configuration minimale requise

Le fichier `.env` a été créé avec :
- ✅ `SUPABASE_URL` 
- ✅ `SUPABASE_ANON_KEY`

**Optionnel mais recommandé :**
- `SUPABASE_SERVICE_KEY` - Pour les opérations admin (création de licences)
- `ADMIN_TOKEN` - Pour créer des licences via API
- `SMTP_USER` et `SMTP_PASS` - Pour envoyer des emails

## 🔧 Si vous n'avez pas la SERVICE_KEY

Le serveur fonctionnera avec l'ANON_KEY, mais certaines opérations (comme créer des licences directement) seront limitées. Pour obtenir la SERVICE_KEY :

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Settings → API
4. Copiez "service_role" key (c'est la clé secrète, ne la partagez pas !)
5. Ajoutez-la dans `.env` comme `SUPABASE_SERVICE_KEY=...`

## ✅ Vérification

Une fois le serveur démarré, testez depuis le site :
- Allez sur `/register`
- Essayez de vous inscrire
- Si ça fonctionne, vous verrez un message de succès

