
-- Drop the security definer view and recreate as SECURITY INVOKER
DROP VIEW IF EXISTS public.beneficiaries_public;
CREATE VIEW public.beneficiaries_public
WITH (security_invoker = true) AS
SELECT id, situation_id, alias_first_name, approx_age, region, short_story,
  emotional_sentence, avatar_gender, avatar_age_range, avatar_hair_type,
  avatar_skin_tone, culture_tags, diet_tags, is_active
FROM public.beneficiaries WHERE is_active = true;

-- We need a SELECT policy for anon/authenticated on beneficiaries for the view to work
CREATE POLICY "Public can read safe beneficiary data" ON public.beneficiaries
FOR SELECT USING (is_active = true);

GRANT SELECT ON public.beneficiaries_public TO anon, authenticated;
