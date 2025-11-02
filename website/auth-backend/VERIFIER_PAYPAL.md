# ✅ Vérification PayPal - Backend

## 🔍 Problème : "PayPal n'est pas configuré"

Cette erreur signifie que le serveur backend ne trouve pas les clés PayPal dans les variables d'environnement.

## 🔧 Solution

### 1. Vérifier que les clés sont dans `.env`

Assurez-vous que votre fichier `website/auth-backend/.env` contient :

```env
PAYPAL_CLIENT_ID=AVJqJrkT5GPFkVLc6EODakfD4-BR-xzcXqrDY2uan-6FJ9om4fSh2xQbSy8-C86N3-DbnyebHFkrtVV7
PAYPAL_CLIENT_SECRET=EKAXVQz2bBMsWhTJIN87VGGDplvgP2UhN_pZHtH7gNpa1CbtxvMhu3K_KCCPrxHeVP11OuqCkz-9iMhz
PAYPAL_MODE=sandbox
```

### 2. **IMPORTANT : Redémarrer le serveur backend**

Les variables d'environnement sont chargées au démarrage du serveur. Si vous avez ajouté/modifié les clés dans `.env`, vous **DEVEZ redémarrer le serveur** :

```bash
# Arrêtez le serveur (Ctrl+C dans le terminal où il tourne)

# Puis redémarrez-le :
cd website/auth-backend
npm run dev
```

### 3. Vérifier dans les logs

Au démarrage, vous devriez voir dans les logs du serveur que PayPal est configuré (ou pas d'erreur).

### 4. Tester à nouveau

Après redémarrage, essayez à nouveau de payer avec PayPal sur la page `/shop`.

## ⚠️ Erreurs courantes

- ❌ **Oubli de redémarrer** → Le serveur n'a pas chargé les nouvelles variables
- ❌ **Fautes de frappe** → Vérifiez qu'il n'y a pas d'espaces avant/après le `=`
- ❌ **Guillemets inutiles** → Ne mettez PAS de guillemets autour des valeurs
- ❌ **Lignes commentées** → Assurez-vous que les lignes ne commencent pas par `#`

## ✅ Format correct

```env
# ❌ MAUVAIS
PAYPAL_CLIENT_ID = "AVJqJrkT5..."
PAYPAL_CLIENT_ID="AVJqJrkT5..."

# ✅ BON
PAYPAL_CLIENT_ID=AVJqJrkT5GPFkVLc6EODakfD4-BR-xzcXqrDY2uan-6FJ9om4fSh2xQbSy8-C86N3-DbnyebHFkrtVV7
```

## 🔍 Debug

Pour vérifier que les variables sont bien chargées, vous pouvez ajouter temporairement dans `server.js` :

```javascript
console.log('PayPal Config:', {
  clientId: process.env.PAYPAL_CLIENT_ID ? '✅ Configuré' : '❌ Manquant',
  clientSecret: process.env.PAYPAL_CLIENT_SECRET ? '✅ Configuré' : '❌ Manquant',
  mode: process.env.PAYPAL_MODE || 'sandbox'
});
```

---

**En résumé : Redémarrez toujours le serveur backend après avoir modifié le fichier `.env` !**

