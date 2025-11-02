# 📝 Instructions pour créer le fichier .env

## ✅ Option 1 : Script automatique (RECOMMANDÉ)

Double-cliquez sur **`CREER_ENV.bat`** dans le dossier `website/auth-backend/`

Cela créera automatiquement le fichier `.env` avec vos paramètres SMTP déjà configurés.

---

## ✅ Option 2 : Création manuelle

1. Allez dans le dossier `website/auth-backend/`

2. Copiez le fichier `.env.example` et renommez-le en `.env`

3. Ouvrez `.env` avec un éditeur de texte et complétez :
   - `JWT_SECRET` : Générez-en un avec cette commande :
     ```powershell
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - `SUPABASE_ANON_KEY` : Depuis Supabase Dashboard → Settings → API
   - `SUPABASE_SERVICE_KEY` : Depuis Supabase Dashboard → Settings → API

---

## 📧 Configuration SMTP (DÉJÀ CONFIGURÉE !)

Vos paramètres sont déjà dans le fichier :
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=safelevage@gmail.com
SMTP_PASS=ngbd levj cybc sgbn
```

**C'est correct** ✅ - Vous pouvez maintenant recevoir les emails !

---

## ✅ Après avoir créé .env

1. **Redémarrez le serveur backend** (arrêtez-le et relancez `DEMARRER_BACKEND.bat`)
2. **Vérifiez** que le serveur affiche : `📧 Mode email: Actif`
3. **Testez** en créant un nouveau compte

---

## 🎯 Résumé

- ✅ SMTP configuré avec `safelevage@gmail.com`
- ✅ Mot de passe d'application : `ngbd levj cybc sgbn`
- ⚠️ Il manque : `JWT_SECRET`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`

Une fois que vous avez complété ces 3 valeurs, tout fonctionnera ! 🚀

