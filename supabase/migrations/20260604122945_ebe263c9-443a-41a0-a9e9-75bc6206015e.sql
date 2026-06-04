ALTER TABLE public.beneficiaries
  ADD COLUMN IF NOT EXISTS avatar_generated_traits jsonb,
  ADD COLUMN IF NOT EXISTS avatar_source_url text;

COMMENT ON COLUMN public.beneficiaries.avatar_generated_traits IS 'Snapshot des attributs avatar_* effectivement utilisés lors de la dernière génération. Sert au mode édition pour calculer le diff vs les valeurs courantes.';
COMMENT ON COLUMN public.beneficiaries.avatar_source_url IS 'URL de l''image source à passer à Gemini en mode édition (= dernier avatar_url validé). Permet de préserver pose/cadrage/fond entre éditions successives.';