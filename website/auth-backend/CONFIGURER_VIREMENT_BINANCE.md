# 💳 Configuration Virement Bancaire & Binance

## 📋 Résumé

Deux nouvelles options de paiement ont été ajoutées :
- ✅ **Virement Bancaire** : Pour les clients qui préfèrent payer par virement
- ✅ **Binance Pay** : Pour les paiements en cryptomonnaie

## 🔧 Configuration Virement Bancaire

### 1. Créer la table `pending_payments` dans Supabase

Exécutez le script SQL dans Supabase Dashboard → SQL Editor :

```sql
-- Voir le fichier: website/auth-backend/supabase_pending_payments.sql
```

Ou copiez-collez directement depuis le fichier.

### 2. Configurer les coordonnées bancaires

Ajoutez dans `website/auth-backend/.env` :

```env
# Coordonnées bancaires (pour les emails de virement)
BANK_NAME=Nom de votre banque
BANK_ACCOUNT=1234567890
BANK_IBAN=MA64 1234 5678 9012 3456 7890 123
BANK_SWIFT=BKCHMAMMXXX
BANK_HOLDER=Votre Nom Complet
```

### 3. Fonctionnement

1. L'utilisateur sélectionne "Virement Bancaire"
2. Une référence unique est générée (ex: `APPS-1234567890-ABCD`)
3. Un email est envoyé avec :
   - Les coordonnées bancaires
   - La référence à inclure dans le virement
   - Le montant exact
4. L'utilisateur effectue le virement
5. **Vous validez manuellement** le virement via l'endpoint `/api/admin/validate-bank-transfer`
6. La licence est créée automatiquement + email envoyé

### 4. Valider un virement (ADMIN)

```bash
POST /api/admin/validate-bank-transfer
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "reference": "APPS-1234567890-ABCD"
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Virement validé et licence créée avec succès",
  "license": {
    "key": "abc123...",
    "plan": "pro",
    "expires_at": 1234567890
  }
}
```

## 🔧 Configuration Binance Pay

### Option 1 : Mode Manuel (Simple)

Pour l'instant, Binance Pay fonctionne en mode manuel :
- Une référence est générée (ex: `BINANCE-1234567890-ABCD`)
- Vous recevez les détails de la commande
- Vous créez manuellement la licence après réception du paiement

### Option 2 : Intégration API Binance (Avancé)

Pour une intégration complète avec Binance Pay API :

1. Créez un compte Binance Merchant
2. Récupérez vos clés API :
   - API Key
   - Secret Key

3. Ajoutez dans `website/auth-backend/.env` :

```env
# Binance Pay (optionnel)
BINANCE_API_KEY=votre_api_key
BINANCE_SECRET_KEY=votre_secret_key
```

4. L'intégration complète nécessite la signature HMAC selon la documentation Binance Pay

**Documentation :** https://developers.binance.com/docs/binance-pay/api-order-create

## 📊 Tableau de bord des paiements en attente

Pour voir tous les paiements en attente, vous pouvez créer une vue Supabase :

```sql
-- Vue pour les paiements en attente
CREATE OR REPLACE VIEW pending_payments_view AS
SELECT 
  pp.id,
  pp.reference,
  pp.email,
  pp.plan,
  pp.months,
  pp.amount,
  pp.payment_method,
  pp.status,
  pp.created_at,
  pp.completed_at,
  u.email_verified
FROM pending_payments pp
LEFT JOIN users u ON pp.user_id = u.id::text
WHERE pp.status = 'pending'
ORDER BY pp.created_at DESC;
```

## ✅ Checklist de Configuration

- [ ] Créer la table `pending_payments` dans Supabase
- [ ] Configurer les coordonnées bancaires dans `.env`
- [ ] Tester la création d'une commande virement bancaire
- [ ] Vérifier la réception de l'email avec les instructions
- [ ] Tester la validation d'un virement via l'endpoint admin
- [ ] (Optionnel) Configurer Binance Pay API pour l'automatisation

## 🔐 Sécurité Admin

Pour sécuriser l'endpoint de validation, ajoutez un champ `is_admin` dans la table `users` :

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
```

Puis modifiez l'endpoint `/api/admin/validate-bank-transfer` pour vérifier :

```javascript
// Vérifier que l'utilisateur est admin
const { data: user } = await supabaseClient
  .from('users')
  .select('is_admin')
  .eq('id', req.user.userId)
  .single();

if (!user || !user.is_admin) {
  return res.status(403).json({ error: 'Accès admin requis' });
}
```

## 📝 Notes

- Les paiements en attente sont stockés dans `pending_payments`
- Chaque paiement a une référence unique pour éviter les doublons
- Les licences sont créées uniquement après validation manuelle
- Les emails sont envoyés automatiquement avec les instructions

