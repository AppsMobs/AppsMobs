-- Script SQL pour créer la table users dans Supabase
-- À exécuter dans l'éditeur SQL de votre projet Supabase

-- Table des utilisateurs pour l'authentification web
CREATE TABLE IF NOT EXISTS public.users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT,
  verification_token_expires BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON public.users(verification_token);

-- Optionnel : Ajouter des politiques RLS (Row Level Security) si nécessaire
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture de son propre profil (si RLS activé)
-- CREATE POLICY "Users can read own profile" ON public.users
--   FOR SELECT USING (auth.uid() = id::text);

-- Politique pour permettre la mise à jour de son propre profil (si RLS activé)
-- CREATE POLICY "Users can update own profile" ON public.users
--   FOR UPDATE USING (auth.uid() = id::text);

COMMENT ON TABLE public.users IS 'Table des utilisateurs pour l authentification web';
COMMENT ON COLUMN public.users.email IS 'Email de l utilisateur (unique)';
COMMENT ON COLUMN public.users.password IS 'Mot de passe hashé (bcrypt)';
COMMENT ON COLUMN public.users.email_verified IS 'Indique si l email a été vérifié';
COMMENT ON COLUMN public.users.verification_token IS 'Token pour la vérification d email';
COMMENT ON COLUMN public.users.verification_token_expires IS 'Timestamp d expiration du token de vérification';

