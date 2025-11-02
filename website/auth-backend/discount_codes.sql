-- Table for discount codes in Supabase
CREATE TABLE IF NOT EXISTS public.discount_codes (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_percent INTEGER NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),
  max_uses INTEGER DEFAULT NULL, -- NULL = unlimited
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ DEFAULT NULL, -- NULL = never expires
  created_by TEXT, -- email of admin who created it
  created_at TIMESTAMPTZ DEFAULT NOW(),
  description TEXT
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON public.discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_valid ON public.discount_codes(valid_from, valid_until) WHERE valid_until IS NULL OR valid_until > NOW();

-- Table to track code usage per user
CREATE TABLE IF NOT EXISTS public.discount_code_usage (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL REFERENCES public.discount_codes(code) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW(),
  order_id TEXT -- Link to purchase if applicable
);

CREATE INDEX IF NOT EXISTS idx_discount_code_usage_code ON public.discount_code_usage(code);
CREATE INDEX IF NOT EXISTS idx_discount_code_usage_email ON public.discount_code_usage(user_email);

COMMENT ON TABLE public.discount_codes IS 'Discount codes for purchases';
COMMENT ON COLUMN public.discount_codes.discount_percent IS 'Discount percentage (0-100)';
COMMENT ON COLUMN public.discount_codes.max_uses IS 'Maximum number of uses (NULL = unlimited)';
COMMENT ON COLUMN public.discount_codes.current_uses IS 'Current number of times code has been used';

