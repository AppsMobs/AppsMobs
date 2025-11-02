-- Insert the launch discount code APPSBLACKFRIDAY25
-- 70% discount for the first 100 customers

INSERT INTO public.discount_codes (
  code,
  discount_percent,
  max_uses,
  current_uses,
  valid_from,
  valid_until,
  description,
  created_by
)
VALUES (
  'APPSBLACKFRIDAY25',
  70,
  100,
  0,
  NOW(),
  NULL, -- No expiration date
  'Launch promotion: 70% off for the first 100 customers',
  'system'
)
ON CONFLICT (code) 
DO UPDATE SET
  discount_percent = EXCLUDED.discount_percent,
  max_uses = EXCLUDED.max_uses,
  description = EXCLUDED.description;

-- Verify the code was created
SELECT * FROM public.discount_codes WHERE code = 'APPSBLACKFRIDAY25';

