
-- Add emergency_beneficiary_id column to checkout_sessions
ALTER TABLE public.checkout_sessions ADD COLUMN emergency_beneficiary_id uuid NULL;

-- Create RPC function to find an emergency beneficiary
CREATE OR REPLACE FUNCTION public.get_emergency_beneficiary(p_exclude_id uuid, p_pack_type text)
RETURNS TABLE(id uuid, alias_first_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT b.id, b.alias_first_name
  FROM beneficiaries b
  WHERE b.is_active = true
    AND b.id <> p_exclude_id
    AND (
      p_pack_type <> 'bebe'
      OR b.children_count > 0
      OR b.beneficiary_category IN ('famille_enfants', 'jeune_enfant')
    )
  ORDER BY b.rotation_score DESC NULLS LAST
  LIMIT 1;
END;
$$;
