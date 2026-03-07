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
BEGIN
  PERFORM public.compute_rotation_scores(p_situation_id);
  RETURN QUERY
  SELECT
    b.id, b.alias_first_name, b.approx_age, b.region, b.short_story, b.emotional_sentence,
    b.avatar_gender, b.avatar_age_range, b.avatar_hair_type, b.avatar_skin_tone, b.avatar_url,
    b.urgency_level, b.rotation_score, b.emotional_score,
    b.children_count, b.beneficiary_category, b.profile_type,
    b.diet_tags, b.culture_tags
  FROM public.beneficiaries b
  WHERE b.situation_id = p_situation_id AND b.is_active = true
  ORDER BY b.rotation_score DESC, b.emotional_score DESC
  LIMIT p_limit;
END;
$$;