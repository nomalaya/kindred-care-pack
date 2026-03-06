CREATE OR REPLACE FUNCTION public.get_donation_stats(p_beneficiary_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'today_count', (SELECT count(*) FROM donations WHERE created_at >= CURRENT_DATE),
    'week_count', (SELECT count(*) FROM donations WHERE created_at >= date_trunc('week', now())),
    'total_count', (SELECT count(*) FROM donations),
    'avg_amount', COALESCE(
      (SELECT round(avg(amount)::numeric, 0) FROM donations WHERE beneficiary_id = p_beneficiary_id),
      55
    )
  ) INTO result;
  RETURN result;
END;
$$;