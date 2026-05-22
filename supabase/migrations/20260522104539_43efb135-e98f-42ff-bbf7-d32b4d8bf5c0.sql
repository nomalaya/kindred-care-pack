ALTER TABLE public.beneficiaries
  ADD COLUMN IF NOT EXISTS avatar_private_notes text;

COMMENT ON COLUMN public.beneficiaries.avatar_private_notes IS
  'Admin-only free text used by the avatar prefill engine (eye color, beard style, glasses, etc.). Never exposed publicly.';

REVOKE SELECT (avatar_private_notes) ON public.beneficiaries FROM anon;