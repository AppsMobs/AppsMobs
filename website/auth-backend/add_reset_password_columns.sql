-- Script SQL pour ajouter les colonnes reset_token et reset_token_expires à la table users
-- À exécuter dans Supabase SQL Editor

-- Ajouter les colonnes si elles n'existent pas déjà
ALTER TABLE users
ADD COLUMN IF NOT EXISTS reset_token TEXT,
ADD COLUMN IF NOT EXISTS reset_token_expires BIGINT;

-- Créer un index pour améliorer les performances de recherche par reset_token
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token)
WHERE reset_token IS NOT NULL;

-- Commentaire
COMMENT ON COLUMN users.reset_token IS 'Token pour réinitialisation de mot de passe';
COMMENT ON COLUMN users.reset_token_expires IS 'Timestamp d expiration du token de reset (milliseconds)';

