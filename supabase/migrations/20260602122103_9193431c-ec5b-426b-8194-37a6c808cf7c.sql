ALTER TABLE public.beneficiaries
  ADD COLUMN IF NOT EXISTS avatar_scale numeric NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS avatar_offset_x numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avatar_offset_y numeric NOT NULL DEFAULT 0;

ALTER TABLE public.beneficiaries
  DROP CONSTRAINT IF EXISTS beneficiaries_avatar_framing_bounds_check;

ALTER TABLE public.beneficiaries
  ADD CONSTRAINT beneficiaries_avatar_framing_bounds_check
  CHECK (
    avatar_scale >= 1.0 AND avatar_scale <= 2.0
    AND avatar_offset_x >= -100 AND avatar_offset_x <= 100
    AND avatar_offset_y >= -100 AND avatar_offset_y <= 100
  );