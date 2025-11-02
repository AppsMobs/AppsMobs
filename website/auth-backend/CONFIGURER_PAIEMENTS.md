# 💳 Configuration Stripe & PayPal

## 📋 Résumé

La page Shop a été entièrement refaite avec :
- ✅ Design moderne et professionnel
- ✅ Sélection de durée (1, 3, 6, 12 mois) avec réductions automatiques
- ✅ Intégration Stripe pour paiements par carte
- ✅ Intégration PayPal pour paiements PayPal
- ✅ Backend sécurisé avec vérification des paiements

## 🔑 Étapes de Configuration

### 1. Créer les comptes de paiement

#### Stripe
1. Allez sur https://stripe.com et créez un compte
2. Dans le Dashboard → **Developers** → **API keys**
3. Récupérez :
   - **Publishable key** (commence par `pk_test_...`)
   - **Secret key** (commence par `sk_test_...`)

#### PayPal
1. Allez sur https://developer.paypal.com
2. Créez un compte développeur
3. Créez une application
4. Récupérez :
   - **Client ID**
   - **Client Secret**

### 2. Configurer les variables d'environnement

#### Backend (`website/auth-backend/.env`)

Ajoutez :

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete_ici

# PayPal
PAYPAL_CLIENT_ID=votre_client_id_paypal
PAYPAL_CLIENT_SECRET=votre_client_secret_paypal
PAYPAL_MODE=sandbox  # ou 'live' pour la production
```

#### Frontend (`website/.env`)

Ajoutez :

```env
# Stripe (clé publique uniquement)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique_ici

# PayPal (Client ID uniquement)
VITE_PAYPAL_CLIENT_ID=votre_client_id_paypal
```

### 3. Mettre à jour la table `licenses` dans Supabase

Ajoutez ces colonnes à la table `licenses` si elles n'existent pas :

```sql
ALTER TABLE licenses 
ADD COLUMN IF NOT EXISTS payment_id TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Créer un index pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_licenses_payment_id ON licenses(payment_id);
```

Pour ajouter ces colonnes :
1. Allez dans Supabase Dashboard → SQL Editor
2. Exécutez la commande SQL ci-dessus

### 4. Redémarrer les serveurs

```bash
# Backend
cd website/auth-backend
npm run dev

# Frontend (dans un autre terminal)
cd website
npm run dev
```

## 🧪 Tester les paiements

### Mode Test (Sandbox)

#### Stripe
- Utilisez la carte de test : `4242 4242 4242 4242`
- Date d'expiration : n'importe quelle date future
- CVC : n'importe quel code à 3 chiffres

#### PayPal
- Utilisez un compte PayPal sandbox depuis https://developer.paypal.com
- Ou connectez-vous avec le bouton PayPal directement

### Flow de paiement

1. **Utilisateur sélectionne un plan** → Choix de la durée (1, 3, 6, 12 mois)
2. **Clic sur "Select Plan"** → Plan sélectionné
3. **Choix du mode de paiement** → Stripe ou PayPal
4. **Pour Stripe** → Redirection vers Stripe Checkout, puis retour automatique
5. **Pour PayPal** → Bouton PayPal intégré, paiement sur place
6. **Après paiement** → Licence créée automatiquement + Email envoyé

## 🔐 Sécurité

✅ **Jamais de clés secrètes côté frontend** - Seules les clés publiques sont utilisées  
✅ **Vérification serveur** - Chaque paiement est vérifié côté backend  
✅ **Protection contre les doublons** - Un `payment_id` ne peut créer qu'une seule licence  
✅ **Authentification requise** - Seuls les utilisateurs connectés peuvent acheter  

## 📝 Notes importantes

- Les prix sont calculés automatiquement avec les réductions selon la durée
- Les réductions : 5% (3 mois), 10% (6 mois), 20% (12 mois)
- Les licences sont créées uniquement après confirmation du paiement
- Un email est automatiquement envoyé avec la clé de licence

## ⚠️ Dépannage

### Erreur "Stripe n'est pas configuré"
→ Vérifiez que `STRIPE_SECRET_KEY` est bien dans `website/auth-backend/.env`

### Erreur "PayPal n'est pas configuré"
→ Vérifiez que `PAYPAL_CLIENT_ID` et `PAYPAL_CLIENT_SECRET` sont bien dans `website/auth-backend/.env`

### Les boutons de paiement ne s'affichent pas
→ Vérifiez que les clés publiques sont dans `website/.env` avec le préfixe `VITE_`

### Erreur de colonne `payment_id` manquante
→ Exécutez la commande SQL ci-dessus pour ajouter les colonnes à la table `licenses`

## 🚀 Passage en production

1. Remplacez les clés de test par les clés de production
2. Changez `PAYPAL_MODE=sandbox` en `PAYPAL_MODE=live`
3. Testez avec de petits montants avant de vendre en production
4. Configurez les webhooks Stripe/PayPal pour une sécurité maximale

