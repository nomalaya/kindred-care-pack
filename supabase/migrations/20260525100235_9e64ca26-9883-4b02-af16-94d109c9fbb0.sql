ALTER TABLE public.beneficiaries
ADD COLUMN IF NOT EXISTS avatar_forehead_mark text DEFAULT 'none';