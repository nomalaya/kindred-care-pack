ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS labels text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS cultural_origin_tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS territory_usage text[] DEFAULT '{metropole}',
  ADD COLUMN IF NOT EXISTS climate_tags text[] DEFAULT '{tempere}',
  ADD COLUMN IF NOT EXISTS usage_context text DEFAULT 'quotidien';