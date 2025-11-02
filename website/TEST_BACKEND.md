# 🧪 Test de Connexion Backend

## Vérifier que le backend fonctionne

### 1. Vérifier que le backend est démarré

```bash
cd website/auth-backend
npm run dev
```

Vous devriez voir :
```
🚀 Serveur d'authentification démarré sur le port 3001
```

### 2. Tester manuellement l'API

**Avec curl ou PowerShell :**
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/register" -Method POST -ContentType "application/json" -Body '{"email":"test@test.com","password":"test12345678","firstName":"Test","lastName":"User","country":"FR","recaptchaToken":"disabled"}'
```

**Ou avec un navigateur :**
Ouvrez `http://localhost:3001/api/me` (cela devrait retourner une erreur 401, ce qui signifie que le serveur fonctionne)

### 3. Vérifier les variables d'environnement

Assurez-vous que `website/auth-backend/.env` contient :
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY` ou `SUPABASE_ANON_KEY`

### 4. Vérifier les logs du serveur

Quand vous tentez de vous inscrire, regardez les logs dans le terminal où tourne le backend pour voir les erreurs exactes.

## Erreurs courantes

- **"ECONNREFUSED"** → Le backend n'est pas démarré
- **"CORS"** → Vérifiez `FRONTEND_URL` dans `.env`
- **"Table users does not exist"** → Exécutez le script SQL pour créer la table

