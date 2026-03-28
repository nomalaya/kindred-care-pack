
CREATE OR REPLACE FUNCTION public.get_cause_counts(p_region_code text DEFAULT NULL)
RETURNS TABLE(cause_id uuid, total_count bigint, nearby_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    s.cause_id,
    COUNT(b.id) AS total_count,
    COUNT(b.id) FILTER (WHERE p_region_code IS NOT NULL AND b.region_code = p_region_code) AS nearby_count
  FROM public.beneficiaries b
  JOIN public.situations s ON s.id = b.situation_id
  WHERE b.is_active = true
  GROUP BY s.cause_id;
$$;
