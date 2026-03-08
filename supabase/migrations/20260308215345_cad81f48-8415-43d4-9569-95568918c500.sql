
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS persona_type text,
  ADD COLUMN IF NOT EXISTS age integer,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS donation_frequency text,
  ADD COLUMN IF NOT EXISTS avg_donation_amount numeric,
  ADD COLUMN IF NOT EXISTS tax_deduction_sensitive boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS social_media_active boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS csp_category text,
  ADD COLUMN IF NOT EXISTS motivation_tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferred_causes text[] DEFAULT '{}';
