-- Recreate beneficiaries_public view to expose framing columns
DROP VIEW IF EXISTS public.beneficiaries_public;

CREATE VIEW public.beneficiaries_public WITH (security_invoker = true) AS
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
  avatar_scale,
  avatar_offset_x,
  avatar_offset_y,
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

GRANT SELECT ON public.beneficiaries_public TO anon, authenticated;

-- Recreate RPC to include framing columns
DROP FUNCTION IF EXISTS public.get_empathy_beneficiaries(uuid, integer, jsonb);

CREATE OR REPLACE FUNCTION public.get_empathy_beneficiaries(p_situation_id uuid, p_limit integer DEFAULT 4, p_donor_location jsonb DEFAULT NULL::jsonb)
 RETURNS TABLE(id uuid, alias_first_name text, approx_age integer, region text, short_story text, emotional_sentence text, avatar_gender text, avatar_age_range text, avatar_hair_type text, avatar_skin_tone text, avatar_url text, urgency_level integer, rotation_score numeric, emotional_score numeric, children_count integer, beneficiary_category text, profile_type text, diet_tags text[], culture_tags text[], proximity_score integer, proximity_label text, avatar_scale numeric, avatar_offset_x numeric, avatar_offset_y numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_cause_id uuid;
  v_donor_postal text;
  v_donor_dept text;
  v_donor_region text;
  v_donor_country text;
BEGIN
  IF p_donor_location IS NOT NULL THEN
    v_donor_postal := p_donor_location->>'postal_prefix';
    v_donor_dept := p_donor_location->>'department_code';
    v_donor_region := p_donor_location->>'region_code';
    v_donor_country := p_donor_location->>'country_code';
  END IF;

  PERFORM public.compute_rotation_scores(p_situation_id);

  SELECT s.cause_id INTO v_cause_id
  FROM public.situations s WHERE s.id = p_situation_id;

  RETURN QUERY
  WITH base_pool AS (
    SELECT b.id, b.alias_first_name, b.approx_age, b.region, b.short_story, b.emotional_sentence,
      b.avatar_gender, b.avatar_age_range, b.avatar_hair_type, b.avatar_skin_tone, b.avatar_url,
      b.urgency_level, b.rotation_score, b.emotional_score,
      b.children_count, b.beneficiary_category, b.profile_type,
      b.diet_tags, b.culture_tags,
      b.situation_id,
      b.is_active,
      b.postal_prefix,
      b.department_code,
      b.region_code,
      b.country_code,
      b.avatar_scale,
      b.avatar_offset_x,
      b.avatar_offset_y,
      CASE 
        WHEN p_donor_location IS NULL THEN 0
        WHEN b.postal_prefix IS NOT NULL AND b.postal_prefix = v_donor_postal THEN 100
        WHEN b.department_code IS NOT NULL AND b.department_code = v_donor_dept THEN 90
        WHEN b.region_code IS NOT NULL AND b.region_code = v_donor_region THEN 70
        WHEN b.country_code IS NOT NULL AND b.country_code = v_donor_country THEN 40
        ELSE 10
      END as prox_score
    FROM public.beneficiaries b
    WHERE b.is_active = true
  ),
  exact AS (
    SELECT bp.*, 1 AS priority
    FROM base_pool bp
    WHERE bp.situation_id = p_situation_id
    ORDER BY bp.prox_score DESC, bp.rotation_score DESC, bp.emotional_score DESC
    LIMIT p_limit
  ),
  same_cause AS (
    SELECT bp.*, 2 AS priority
    FROM base_pool bp
    JOIN public.situations s ON s.id = bp.situation_id
    WHERE s.cause_id = v_cause_id
      AND bp.situation_id <> p_situation_id
      AND bp.id NOT IN (SELECT e.id FROM exact e)
    ORDER BY bp.prox_score DESC, bp.rotation_score DESC, bp.emotional_score DESC
    LIMIT p_limit
  ),
  any_fallback AS (
    SELECT bp.*, 3 AS priority
    FROM base_pool bp
    WHERE bp.id NOT IN (SELECT e.id FROM exact e)
      AND bp.id NOT IN (SELECT sc.id FROM same_cause sc)
    ORDER BY bp.prox_score DESC, bp.rotation_score DESC, bp.emotional_score DESC
    LIMIT p_limit
  ),
  combined AS (
    SELECT * FROM exact
    UNION ALL
    SELECT * FROM same_cause
    UNION ALL
    SELECT * FROM any_fallback
  )
  SELECT c.id, c.alias_first_name, c.approx_age, c.region, c.short_story, c.emotional_sentence,
    c.avatar_gender, c.avatar_age_range, c.avatar_hair_type, c.avatar_skin_tone, c.avatar_url,
    c.urgency_level, c.rotation_score, c.emotional_score,
    c.children_count, c.beneficiary_category, c.profile_type,
    c.diet_tags, c.culture_tags,
    c.prox_score,
    CASE 
      WHEN c.prox_score >= 100 THEN 'Proche de chez vous'
      WHEN c.prox_score >= 90 THEN 'Dans votre département'
      WHEN c.prox_score >= 70 THEN 'Dans votre région'
      WHEN c.prox_score >= 40 THEN 'Dans votre pays'
      ELSE NULL
    END as proximity_label,
    c.avatar_scale,
    c.avatar_offset_x,
    c.avatar_offset_y
  FROM combined c
  ORDER BY c.priority, c.prox_score DESC, c.rotation_score DESC, c.emotional_score DESC
  LIMIT p_limit;
END;
$function$;