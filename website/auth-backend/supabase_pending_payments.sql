-- Table pour les paiements en attente (virement bancaire, Binance, etc.)
CREATE TABLE IF NOT EXISTS public.pending_payments (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('normal', 'pro', 'team')),
  months INTEGER NOT NULL CHECK (months >= 1 AND months <= 12),
  amount DECIMAL(10, 2) NOT NULL,
  reference TEXT UNIQUE NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('bank_transfer', 'binance', 'paypal', 'stripe')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at BIGINT NOT NULL,
  completed_at BIGINT,
  notes TEXT,
  created_at_timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_pending_payments_reference ON public.pending_payments(reference);
CREATE INDEX IF NOT EXISTS idx_pending_payments_status ON public.pending_payments(status);
CREATE INDEX IF NOT EXISTS idx_pending_payments_user_id ON public.pending_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_payments_email ON public.pending_payments(email);

COMMENT ON TABLE public.pending_payments IS 'Table pour les paiements en attente de validation';
COMMENT ON COLUMN public.pending_payments.reference IS 'Référence unique pour le paiement (ex: APPS-1234567890-ABCD)';
COMMENT ON COLUMN public.pending_payments.status IS 'Statut: pending, completed, cancelled';

