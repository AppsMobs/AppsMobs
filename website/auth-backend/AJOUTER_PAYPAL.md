# ✅ Configuration PayPal - Identifiants fournis

## 🔑 Vos identifiants PayPal

**Clé API (Client ID) :**
```
AVJqJrkT5GPFkVLc6EODakfD4-BR-xzcXqrDY2uan-6FJ9om4fSh2xQbSy8-C86N3-DbnyebHFkrtVV7
```

**Clé secrète :**
```
EKAXVQz2bBMsWhTJIN87VGGDplvgP2UhN_pZHtH7gNpa1CbtxvMhu3K_KCCPrxHeVP11OuqCkz-9iMhz
```

## 📝 Instructions - Méthode rapide (RECOMMANDÉ)

### ✅ Option 1 : Scripts automatiques

**Backend :**
1. Ouvrez un terminal PowerShell dans `website/auth-backend/`
2. Exécutez :
   ```powershell
   .\AJOUTER_PAYPAL.ps1
   ```

**Frontend :**
1. Ouvrez un terminal PowerShell dans `website/`
2. Exécutez :
   ```powershell
   .\AJOUTER_PAYPAL_FRONTEND.ps1
   ```

---

## 📝 Instructions - Méthode manuelle

### Backend (`website/auth-backend/.env`)

Ajoutez ces lignes à votre fichier `.env` :

```env
# PayPal
PAYPAL_CLIENT_ID=AVJqJrkT5GPFkVLc6EODakfD4-BR-xzcXqrDY2uan-6FJ9om4fSh2xQbSy8-C86N3-DbnyebHFkrtVV7
PAYPAL_CLIENT_SECRET=EKAXVQz2bBMsWhTJIN87VGGDplvgP2UhN_pZHtH7gNpa1CbtxvMhu3K_KCCPrxHeVP11OuqCkz-9iMhz
PAYPAL_MODE=sandbox
```

### Frontend (`website/.env`)

Ajoutez cette ligne à votre fichier `.env` :

```env
# PayPal (Client ID uniquement - JAMAIS la clé secrète !)
VITE_PAYPAL_CLIENT_ID=AVJqJrkT5GPFkVLc6EODakfD4-BR-xzcXqrDY2uan-6FJ9om4fSh2xQbSy8-C86N3-DbnyebHFkrtVV7
```

## ⚠️ Important

- ✅ **Backend** : Utilise la **Clé API** (Client ID) ET la **Clé secrète**
- ✅ **Frontend** : Utilise UNIQUEMENT la **Clé API** (Client ID) - JAMAIS la clé secrète
- ✅ **PAYPAL_MODE** : `sandbox` pour les tests, `live` pour la production

## 🚀 Après configuration

1. Redémarrez le serveur backend :
   ```bash
   cd website/auth-backend
   npm run dev
   ```

2. Redémarrez le serveur frontend :
   ```bash
   cd website
   npm run dev
   ```

3. Testez sur la page `/shop` - le bouton PayPal devrait maintenant fonctionner !

## 🧪 Tester PayPal

1. Allez sur `/shop`
2. Sélectionnez un plan
3. Choisissez PayPal
4. Utilisez un compte PayPal sandbox ou connectez-vous avec votre compte PayPal

---

✅ **Les clés PayPal ont été configurées !**

