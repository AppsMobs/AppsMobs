# 🔍 Test de Connexion Backend

## Étape 1 : Vérifier que le backend répond

Ouvrez votre navigateur et allez sur :
```
http://localhost:3001/api/test
```

**Résultat attendu :**
```json
{
  "message": "Backend fonctionne !",
  "timestamp": "2025-10-31T...",
  "cors": "OK"
}
```

Si vous voyez ce message → Le backend fonctionne ✅
Si vous avez une erreur → Le backend ne répond pas ❌

---

## Étape 2 : Vérifier depuis la console du navigateur

1. Ouvrez votre site : `http://localhost:5174/register`
2. Appuyez sur **F12** pour ouvrir la console
3. Cliquez sur "S'inscrire"
4. Regardez les messages dans la console

Vous devriez voir :
```
Tentative d'inscription vers: http://localhost:3001/api/register
```

Et ensuite soit :
- ✅ `Réponse du serveur: 200 OK` → Ça fonctionne !
- ❌ `Failed to fetch` → Problème de connexion
- ❌ `CORS error` → Problème de CORS

---

## Étape 3 : Vérifier les logs du serveur backend

Dans le terminal où tourne le backend, vous devriez voir des requêtes quand vous cliquez sur "S'inscrire" :
```
POST /api/register 200 ...
```

Si vous ne voyez **RIEN** dans les logs du backend → Le frontend n'arrive pas à se connecter

---

## Solutions possibles

### Problème : "Failed to fetch"

**Causes possibles :**
1. Le backend n'est pas démarré
2. Firewall bloque la connexion
3. Mauvaise URL dans le frontend

**Solutions :**
1. Vérifiez que le backend tourne : `http://localhost:3001/api/test`
2. Vérifiez dans la console du navigateur (F12) l'URL exacte utilisée
3. Vérifiez le fichier `.env` du frontend (s'il existe) : `VITE_API_URL`

### Problème : "CORS error"

**Solution :**
Le CORS a été configuré pour accepter `localhost:5174`. 
Si ça ne fonctionne toujours pas, redémarrez le backend.

---

## Test rapide

Exécutez cette commande dans PowerShell pour tester :
```powershell
Invoke-WebRequest -Uri http://localhost:3001/api/test -Method GET
```

Si ça fonctionne → Le backend répond ✅
Si ça échoue → Le backend ne répond pas ❌

