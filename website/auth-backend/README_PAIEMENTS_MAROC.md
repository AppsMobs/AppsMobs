# 💳 Système de Paiement pour le Maroc

## 📋 Options Disponibles

### ✅ PayPal (Automatique)
- Paiement instantané
- Accepte cartes bancaires marocaines
- Validation automatique

### ✅ Virement Bancaire (Semi-automatique)
- Génération de référence unique
- Email avec instructions
- Validation manuelle requise
- **Aucun frais de transaction**

### ✅ Binance Pay (Crypto)
- Paiements en cryptomonnaie
- Référence unique générée
- Mode manuel (peut être automatisé)

### ❌ Stripe (Non disponible au Maroc)
- Masqué de l'interface

## 🔧 Configuration Rapide

### 1. Créer la table Supabase

Exécutez dans Supabase → SQL Editor :
```sql
-- Voir: website/auth-backend/supabase_pending_payments.sql
```

### 2. Configurer les coordonnées bancaires

Dans `website/auth-backend/.env` :
```env
BANK_NAME=Attijariwafa Bank
BANK_ACCOUNT=12345678901234567890
BANK_IBAN=MA64 0123 4567 8901 2345 6789 012
BANK_SWIFT=BCMAMAMCXXX
BANK_HOLDER=Votre Nom Complet
```

### 3. Redémarrer
```bash
cd website/auth-backend
npm run dev
```

## 📊 Flux de Virement Bancaire

```
Client → Sélectionne plan → "Virement"
  ↓
Système génère: APPS-1234567890-ABCD
  ↓
Email envoyé avec coordonnées + référence
  ↓
Client effectue virement avec référence
  ↓
Vous vérifiez dans votre banque
  ↓
Vous validez via API: /api/admin/validate-bank-transfer
  ↓
Licence créée automatiquement + Email envoyé
```

## 🔑 Valider un Virement

**Méthode 1 : Via l'API**
```bash
POST /api/admin/validate-bank-transfer
Authorization: Bearer <token>
{
  "reference": "APPS-1234567890-ABCD"
}
```

**Méthode 2 : Manuellement dans Supabase**
1. Allez dans Supabase → Table Editor → `pending_payments`
2. Trouvez la référence
3. Appelez l'endpoint API avec cette référence

## 📧 Email Automatique

L'email contient :
- ✅ Référence en grand format
- ✅ Coordonnées bancaires complètes
- ✅ Montant exact
- ✅ Instructions claires
- ✅ Design professionnel

## ✅ Checklist

- [ ] Table `pending_payments` créée dans Supabase
- [ ] Coordonnées bancaires dans `.env`
- [ ] Serveur redémarré
- [ ] Testé création commande virement
- [ ] Vérifié réception email
- [ ] Testé validation virement

## 🎯 Résultat

Vous avez maintenant **3 options de paiement** :
1. **PayPal** → Automatique, instantané
2. **Virement Bancaire** → Manuel, pas de frais
3. **Binance Pay** → Crypto, manuel

Stripe est masqué car non disponible au Maroc.

Tout est prêt ! 🎉

