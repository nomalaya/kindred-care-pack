ALTER TABLE public.beneficiaries
  ADD COLUMN IF NOT EXISTS avatar_eye_y numeric,
  ADD COLUMN IF NOT EXISTS avatar_face_center_x numeric;