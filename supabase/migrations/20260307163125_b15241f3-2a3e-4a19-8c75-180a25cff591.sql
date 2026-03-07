
CREATE OR REPLACE FUNCTION public.get_empathy_beneficiaries(
  p_situation_id uuid,
  p_limit integer DEFAULT 4
)
RETURNS TABLE(
  id uuid,
  alias_first_name text,
  approx_age integer,
  region text,
  short_story text,
  emotional_sentence text,
  avatar_gender text,
  avatar_age_range text,
  avatar_hair_type text,
  avatar_skin_tone text,
  avatar_url text,
  urgency_level integer,
  rotation_score numeric,
  emotional_score numeric,
  children_count integer,
  beneficiary_category text,
  profile_type text,
  diet_tags text[],
  culture_tags text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_cause_id uuid;
  v_count integer;
BEGIN
  -- Compute rotation scores for the target situation
  PERFORM public.compute_rotation_scores(p_situation_id);

  -- Get cause_id for fallback
  SELECT s.cause_id INTO v_cause_id
  FROM public.situations s WHERE s.id = p_situation_id;

  -- Build result using waterfall: exact match → same cause → any active
  RETURN QUERY
  WITH exact AS (
    SELECT b.id, b.alias_first_name, b.approx_age, b.region, b.short_story, b.emotional_sentence,
      b.avatar_gender, b.avatar_age_range, b.avatar_hair_type, b.avatar_skin_tone, b.avatar_url,
      b.urgency_level, b.rotation_score, b.emotional_score,
      b.children_count, b.beneficiary_category, b.profile_type,
      b.diet_tags, b.culture_tags,
      1 AS priority
    FROM public.beneficiaries b
    WHERE b.situation_id = p_situation_id AND b.is_active = true
    ORDER BY b.rotation_score DESC, b.emotional_score DESC
    LIMIT p_limit
  ),
  same_cause AS (
    SELECT b.id, b.alias_first_name, b.approx_age, b.region, b.short_story, b.emotional_sentence,
      b.avatar_gender, b.avatar_age_range, b.avatar_hair_type, b.avatar_skin_tone, b.avatar_url,
      b.urgency_level, b.rotation_score, b.emotional_score,
      b.children_count, b.beneficiary_category, b.profile_type,
      b.diet_tags, b.culture_tags,
      2 AS priority
    FROM public.beneficiaries b
    JOIN public.situations s ON s.id = b.situation_id
    WHERE s.cause_id = v_cause_id
      AND b.situation_id <> p_situation_id
      AND b.is_active = true
      AND b.id NOT IN (SELECT e.id FROM exact e)
    ORDER BY b.rotation_score DESC, b.emotional_score DESC
    LIMIT p_limit
  ),
  any_fallback AS (
    SELECT b.id, b.alias_first_name, b.approx_age, b.region, b.short_story, b.emotional_sentence,
      b.avatar_gender, b.avatar_age_range, b.avatar_hair_type, b.avatar_skin_tone, b.avatar_url,
      b.urgency_level, b.rotation_score, b.emotional_score,
      b.children_count, b.beneficiary_category, b.profile_type,
      b.diet_tags, b.culture_tags,
      3 AS priority
    FROM public.beneficiaries b
    WHERE b.is_active = true
      AND b.id NOT IN (SELECT e.id FROM exact e)
      AND b.id NOT IN (SELECT sc.id FROM same_cause sc)
    ORDER BY b.rotation_score DESC, b.emotional_score DESC
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
    c.diet_tags, c.culture_tags
  FROM combined c
  ORDER BY c.priority, c.rotation_score DESC, c.emotional_score DESC
  LIMIT p_limit;
END;
$$;
