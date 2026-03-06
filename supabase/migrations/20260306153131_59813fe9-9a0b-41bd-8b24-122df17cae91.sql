
-- Add new columns to products table
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS product_code text,
  ADD COLUMN IF NOT EXISTS subcategory text,
  ADD COLUMN IF NOT EXISTS cause_relevance text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS emotional_family text,
  ADD COLUMN IF NOT EXISTS emotional_intensity integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS halal_compatible boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS kosher_compatible boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS vegetarian boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS vegan boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS contains_pork boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS contains_alcohol boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS target_groups text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS gender_specific text,
  ADD COLUMN IF NOT EXISTS season_tag text DEFAULT 'all_year',
  ADD COLUMN IF NOT EXISTS is_visible_public boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_active_product boolean DEFAULT true;

-- Create profile_mappings table
CREATE TABLE IF NOT EXISTS public.profile_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_type text NOT NULL UNIQUE,
  tier1_family text NOT NULL,
  tier2_family text NOT NULL,
  tier3_family text NOT NULL,
  tier4_family text NOT NULL,
  min_survival_items integer DEFAULT 0,
  min_dignity_items integer DEFAULT 0,
  min_childhood_items integer DEFAULT 0,
  min_autonomy_items integer DEFAULT 0,
  religious_filter text,
  cultural_weighting text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.profile_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profile mappings publicly readable" ON public.profile_mappings FOR SELECT USING (true);
CREATE POLICY "Admins can manage profile mappings" ON public.profile_mappings FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Add profile_type to beneficiaries
ALTER TABLE public.beneficiaries ADD COLUMN IF NOT EXISTS profile_type text;

-- Recreate view with correct column order + profile_type
DROP VIEW IF EXISTS public.beneficiaries_public;
CREATE VIEW public.beneficiaries_public
WITH (security_invoker = true)
AS SELECT
  id, alias_first_name, approx_age, region, short_story, emotional_sentence,
  avatar_gender, avatar_age_range, avatar_hair_type, avatar_skin_tone,
  culture_tags, diet_tags, situation_id, is_active, avatar_url,
  urgency_level, total_donations_received, last_donation_date,
  rotation_score, emotional_score, profile_views, profile_type
FROM public.beneficiaries
WHERE is_active = true;
