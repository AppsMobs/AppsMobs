# 🔧 Ajouter les colonnes Reset Password à Supabase

## ⚠️ Action Requise

Pour que le système de réinitialisation de mot de passe fonctionne, vous devez ajouter deux colonnes à la table `users` dans Supabase.

## 📋 Étapes

### 1. Ouvrir Supabase SQL Editor

1. Allez sur votre projet Supabase : https://app.supabase.com
2. Cliquez sur **SQL Editor** dans le menu de gauche
3. Cliquez sur **New query**

### 2. Exécuter le script SQL

Copiez et collez ce script dans l'éditeur SQL :

```sql
-- Ajouter les colonnes reset_token et reset_token_expires à la table users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS reset_token TEXT,
ADD COLUMN IF NOT EXISTS reset_token_expires BIGINT;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token)
WHERE reset_token IS NOT NULL;
```

### 3. Exécuter le script

Cliquez sur **Run** (ou appuyez sur `Ctrl+Enter` / `Cmd+Enter`)

### 4. Vérifier

Vous devriez voir un message de succès. Les colonnes sont maintenant ajoutées !

## ✅ Vérification

Pour vérifier que les colonnes ont été ajoutées :

1. Allez dans **Table Editor** → **users**
2. Vous devriez voir les colonnes :
   - `reset_token` (TEXT, nullable)
   - `reset_token_expires` (BIGINT, nullable)

## 🎯 C'est fait !

Le système de réinitialisation de mot de passe est maintenant fonctionnel.

## 📝 Notes

- `reset_token` : Stocke le token unique pour réinitialiser le mot de passe
- `reset_token_expires` : Timestamp en millisecondes indiquant quand le token expire (1 heure après génération)
- Le token est supprimé après utilisation réussie
- Le token expire automatiquement après 1 heure

