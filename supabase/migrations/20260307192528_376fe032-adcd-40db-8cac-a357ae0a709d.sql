ALTER TABLE public.profiles
  ADD COLUMN country_code text,
  ADD COLUMN region_code text,
  ADD COLUMN department_code text,
  ADD COLUMN postal_prefix text,
  ADD COLUMN location_visibility boolean NOT NULL DEFAULT false;