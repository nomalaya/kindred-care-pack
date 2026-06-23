UPDATE public.beneficiaries
SET avatar_generated_traits = avatar_generated_traits || jsonb_build_object(
  'avatar_hair_color',  NULL,
  'avatar_expression',  NULL,
  'avatar_hair_length', NULL,
  'avatar_hair_style',  NULL,
  'avatar_hair_volume', NULL
)
WHERE id = 'de8c19bc-8643-4af8-8bc0-31a57f79cd61';