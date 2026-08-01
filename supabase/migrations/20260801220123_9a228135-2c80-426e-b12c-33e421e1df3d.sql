CREATE OR REPLACE FUNCTION public.get_homepage_beneficiaries(p_count integer DEFAULT 3)
RETURNS TABLE(
  id uuid,
  situation_id uuid,
  alias_first_name text,
  region text,
  emotional_sentence text,
  short_story text,
  avatar_preview_url text,
  avatar_url text
)
LANGUAGE sql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.id, b.situation_id, b.alias_first_name, b.region,
         b.emotional_sentence, b.short_story,
         b.avatar_preview_url, b.avatar_url
  FROM public.beneficiaries b
  WHERE b.is_active = true
    AND COALESCE(b.avatar_url, b.avatar_preview_url) IS NOT NULL
    AND b.short_story IS NOT NULL
    AND b.emotional_sentence IS NOT NULL
  ORDER BY random()
  LIMIT GREATEST(COALESCE(p_count, 3), 1);
$$;

GRANT EXECUTE ON FUNCTION public.get_homepage_beneficiaries(integer) TO anon, authenticated, service_role;