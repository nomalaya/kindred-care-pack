DROP VIEW IF EXISTS public.beneficiaries_public;

CREATE VIEW public.beneficiaries_public WITH (security_invoker = true) AS
SELECT
  id, alias_first_name, approx_age, region, short_story, emotional_sentence,
  avatar_gender, avatar_age_range, avatar_hair_type, avatar_skin_tone, avatar_url,
  urgency_level, rotation_score, emotional_score,
  total_donations_received, last_donation_date, profile_views,
  situation_id, is_active, profile_type, diet_tags, culture_tags,
  children_count, beneficiary_category
FROM public.beneficiaries
WHERE is_active = true;