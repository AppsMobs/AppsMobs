# 🚀 Comment Démarrer le Backend pour le Chat AI

## ⚠️ Problème Actuel
L'erreur `ERR_CONNECTION_REFUSED` signifie que le serveur backend n'est **pas démarré**.

## ✅ Solution : Démarrer le Serveur

### Étape 1 : Ouvrir un terminal
1. Ouvrez PowerShell ou CMD
2. Naviguez vers le dossier du projet

### Étape 2 : Aller dans le dossier auth-backend
```bash
cd website/auth-backend
```

### Étape 3 : Installer les dépendances (si pas déjà fait)
```bash
npm install
```

### Étape 4 : Démarrer le serveur
```bash
npm start
```

OU si vous avez un script dev :
```bash
npm run dev
```

### Étape 5 : Vérifier que le serveur tourne
Vous devriez voir dans la console :
```
🚀 Serveur d'authentification démarré sur le port 3001
💬 Chat AI: ✅ Mode gratuit (réponses contextuelles intelligentes)
```

## 🔍 Vérification

Une fois le serveur démarré, le chat AI devrait fonctionner automatiquement. Vous pouvez tester en envoyant :
- "salut c quoi appsmobs" (en français)
- "what is appsmobs" (en anglais)

## ⚙️ Configuration (Optionnel)

Si vous voulez changer le port, modifiez `website/auth-backend/.env` :
```env
PORT=3001
```

Et dans `website/.env` :
```env
VITE_API_URL=http://localhost:3001
```

## 📝 Note
Le serveur doit rester **ouvert** pendant que vous utilisez le site. Si vous fermez le terminal, le serveur s'arrête.

