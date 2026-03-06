
-- Drop and recreate the view with new columns
DROP VIEW IF EXISTS public.beneficiaries_public;

CREATE VIEW public.beneficiaries_public
WITH (security_invoker = true) AS
SELECT
  id, alias_first_name, approx_age, region, short_story, emotional_sentence,
  avatar_gender, avatar_age_range, avatar_hair_type, avatar_skin_tone,
  culture_tags, diet_tags, situation_id, is_active, avatar_url,
  urgency_level, total_donations_received, last_donation_date,
  rotation_score, emotional_score, profile_views
FROM public.beneficiaries
WHERE is_active = true;

-- Function: compute rotation scores
CREATE OR REPLACE FUNCTION public.compute_rotation_scores(p_situation_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.beneficiaries
  SET rotation_score = 
    (COALESCE(urgency_level, 0) + 1) *
    EXTRACT(EPOCH FROM (now() - COALESCE(last_donation_date, '2020-01-01'::timestamptz))) /
    (COALESCE(total_donations_received, 0) + 1)
  WHERE situation_id = p_situation_id AND is_active = true;
END;
$$;

-- Function: get ranked beneficiaries
CREATE OR REPLACE FUNCTION public.get_ranked_beneficiaries(p_situation_id UUID, p_limit INTEGER DEFAULT 4)
RETURNS TABLE(
  id UUID,
  alias_first_name TEXT,
  approx_age INTEGER,
  region TEXT,
  short_story TEXT,
  emotional_sentence TEXT,
  avatar_gender TEXT,
  avatar_age_range TEXT,
  avatar_hair_type TEXT,
  avatar_skin_tone TEXT,
  avatar_url TEXT,
  urgency_level INTEGER,
  rotation_score NUMERIC,
  emotional_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.compute_rotation_scores(p_situation_id);
  RETURN QUERY
  SELECT b.id, b.alias_first_name, b.approx_age, b.region, b.short_story, b.emotional_sentence,
    b.avatar_gender, b.avatar_age_range, b.avatar_hair_type, b.avatar_skin_tone, b.avatar_url,
    b.urgency_level, b.rotation_score, b.emotional_score
  FROM public.beneficiaries b
  WHERE b.situation_id = p_situation_id AND b.is_active = true
  ORDER BY b.rotation_score DESC, b.emotional_score DESC
  LIMIT p_limit;
END;
$$;

-- Trigger function
CREATE OR REPLACE FUNCTION public.update_beneficiary_on_donation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.beneficiaries
  SET total_donations_received = COALESCE(total_donations_received, 0) + 1,
      last_donation_date = now()
  WHERE id = NEW.beneficiary_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_donation_insert ON public.donations;
CREATE TRIGGER on_donation_insert
  AFTER INSERT ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_beneficiary_on_donation();

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Service role can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars');
