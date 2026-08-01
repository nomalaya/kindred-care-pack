CREATE OR REPLACE FUNCTION public.get_homepage_hero_beneficiaries(p_count integer DEFAULT 3)
RETURNS TABLE(
  id uuid,
  situation_id uuid,
  situation_title text,
  cause_id uuid,
  cause_title text,
  alias_first_name text,
  region text,
  avatar_preview_url text,
  avatar_url text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH pool AS (
    SELECT DISTINCT ON (s.cause_id)
      b.id, b.situation_id, s.title AS situation_title,
      s.cause_id, c.title AS cause_title,
      b.alias_first_name, b.region,
      b.avatar_preview_url, b.avatar_url
    FROM public.beneficiaries b
    JOIN public.situations s ON s.id = b.situation_id
    JOIN public.causes c ON c.id = s.cause_id
    WHERE b.is_active = true
      AND COALESCE(b.avatar_url, b.avatar_preview_url) IS NOT NULL
    ORDER BY s.cause_id, random()
  )
  SELECT p.id, p.situation_id, p.situation_title, p.cause_id, p.cause_title,
         p.alias_first_name, p.region, p.avatar_preview_url, p.avatar_url
  FROM pool p
  ORDER BY random()
  LIMIT GREATEST(COALESCE(p_count, 3), 1);
$$;

GRANT EXECUTE ON FUNCTION public.get_homepage_hero_beneficiaries(integer) TO anon, authenticated;