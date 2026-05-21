-- 1. New visual attribute columns on beneficiaries
ALTER TABLE public.beneficiaries
  ADD COLUMN IF NOT EXISTS avatar_face_shape text,
  ADD COLUMN IF NOT EXISTS avatar_eye_shape text,
  ADD COLUMN IF NOT EXISTS avatar_eye_color text,
  ADD COLUMN IF NOT EXISTS avatar_facial_features text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS avatar_hair_color text,
  ADD COLUMN IF NOT EXISTS avatar_hair_length text,
  ADD COLUMN IF NOT EXISTS avatar_hair_volume text,
  ADD COLUMN IF NOT EXISTS avatar_hair_style text,
  ADD COLUMN IF NOT EXISTS avatar_clothing_style text,
  ADD COLUMN IF NOT EXISTS avatar_clothing_color_palette text,
  ADD COLUMN IF NOT EXISTS avatar_expression text,
  ADD COLUMN IF NOT EXISTS avatar_posture text,
  ADD COLUMN IF NOT EXISTS avatar_parent_energy text,
  ADD COLUMN IF NOT EXISTS avatar_cultural_style text,
  ADD COLUMN IF NOT EXISTS avatar_preview_url text,
  ADD COLUMN IF NOT EXISTS avatar_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS avatar_prompt text,
  ADD COLUMN IF NOT EXISTS avatar_seed bigint,
  ADD COLUMN IF NOT EXISTS avatar_generated_at timestamptz,
  ADD COLUMN IF NOT EXISTS avatar_model_used text,
  ADD COLUMN IF NOT EXISTS avatar_qa_report jsonb,
  ADD COLUMN IF NOT EXISTS avatar_qa_score numeric;

-- 2. Recreate beneficiaries_public view with the new public fields
DROP VIEW IF EXISTS public.beneficiaries_public;

CREATE VIEW public.beneficiaries_public
WITH (security_invoker = true) AS
SELECT
  id,
  alias_first_name,
  approx_age,
  region,
  short_story,
  emotional_sentence,
  avatar_gender,
  avatar_age_range,
  avatar_hair_type,
  avatar_skin_tone,
  avatar_url,
  avatar_preview_url,
  avatar_status,
  urgency_level,
  rotation_score,
  emotional_score,
  profile_views,
  total_donations_received,
  last_donation_date,
  is_active,
  situation_id,
  children_count,
  beneficiary_category,
  profile_type,
  diet_tags,
  culture_tags,
  context_badge
FROM public.beneficiaries
WHERE is_active = true;