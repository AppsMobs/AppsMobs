# 💳 Configuration Stripe & PayPal

## 🎯 Objectif

Intégrer Stripe et PayPal pour permettre les paiements sécurisés lors de l'achat de licences.

## 📋 Étapes

### 1. Créer des comptes

#### Stripe
1. Allez sur https://stripe.com
2. Créez un compte
3. Récupérez vos clés API :
   - **Publishable Key** (pk_test_...) → pour le frontend
   - **Secret Key** (sk_test_...) → pour le backend

#### PayPal
1. Allez sur https://developer.paypal.com
2. Créez un compte développeur
3. Créez une application
4. Récupérez vos clés :
   - **Client ID** → pour le frontend
   - **Client Secret** → pour le backend

### 2. Configuration dans `.env`

Ajoutez dans `website/auth-backend/.env` :

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete
STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique

# PayPal
PAYPAL_CLIENT_ID=votre_client_id
PAYPAL_CLIENT_SECRET=votre_client_secret
PAYPAL_MODE=sandbox  # ou 'live' pour la production
```

Ajoutez dans `website/.env` :

```env
# Stripe (Frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique

# PayPal (Frontend)
VITE_PAYPAL_CLIENT_ID=votre_client_id
```

### 3. Endpoints Backend à créer

1. `/api/create-payment-intent` - Créer une session de paiement Stripe
2. `/api/create-paypal-order` - Créer une commande PayPal
3. `/api/verify-payment` - Vérifier et finaliser le paiement

### 4. Flow de paiement

1. **Utilisateur sélectionne un plan** → Frontend
2. **Clic sur Stripe/PayPal** → Frontend appelle backend
3. **Backend crée la session** → Retourne l'ID de session
4. **Frontend redirige vers Stripe/PayPal** → Paiement
5. **Redirection après paiement** → Backend vérifie
6. **Backend crée la licence** → Envoie email de confirmation

## 🔐 Sécurité

- ✅ Ne JAMAIS exposer les clés secrètes côté frontend
- ✅ Vérifier le paiement côté backend avant de créer la licence
- ✅ Utiliser webhooks pour confirmer les paiements

