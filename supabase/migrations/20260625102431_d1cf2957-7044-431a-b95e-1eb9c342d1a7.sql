UPDATE public.beneficiaries
SET avatar_generated_traits = jsonb_set(avatar_generated_traits, '{avatar_body_type}', '"average"'::jsonb)
WHERE id='de8c19bc-8643-4af8-8bc0-31a57f79cd61';