-- New attribute columns on beneficiaries
ALTER TABLE public.beneficiaries
  ADD COLUMN IF NOT EXISTS avatar_tired_level integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avatar_emotional_brightness integer DEFAULT 3,
  ADD COLUMN IF NOT EXISTS avatar_beard text,
  ADD COLUMN IF NOT EXISTS avatar_moustache text,
  ADD COLUMN IF NOT EXISTS avatar_bald_level integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avatar_hair_recession text,
  ADD COLUMN IF NOT EXISTS avatar_head_covering text DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS avatar_cultural_style_override text,
  ADD COLUMN IF NOT EXISTS avatar_resilience_level integer DEFAULT 3,
  ADD COLUMN IF NOT EXISTS avatar_fatigue_level integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avatar_dignity_level integer DEFAULT 5,
  ADD COLUMN IF NOT EXISTS avatar_workflow_status text DEFAULT 'draft';

-- Constrain workflow status to known values via trigger (safer than CHECK)
CREATE OR REPLACE FUNCTION public.validate_avatar_workflow_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.avatar_workflow_status IS NOT NULL
     AND NEW.avatar_workflow_status NOT IN ('draft','generated','approved','locked') THEN
    RAISE EXCEPTION 'invalid avatar_workflow_status: %', NEW.avatar_workflow_status;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_avatar_workflow_status ON public.beneficiaries;
CREATE TRIGGER trg_validate_avatar_workflow_status
BEFORE INSERT OR UPDATE ON public.beneficiaries
FOR EACH ROW EXECUTE FUNCTION public.validate_avatar_workflow_status();

-- Archive table for each generated avatar version
CREATE TABLE IF NOT EXISTS public.avatar_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id uuid NOT NULL,
  image_url text NOT NULL,
  model_used text,
  qa_score numeric,
  qa_report jsonb,
  seed bigint,
  prompt text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_avatar_versions_beneficiary_created
  ON public.avatar_versions (beneficiary_id, created_at DESC);

ALTER TABLE public.avatar_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage avatar versions" ON public.avatar_versions;
CREATE POLICY "Admins can manage avatar versions"
ON public.avatar_versions
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));