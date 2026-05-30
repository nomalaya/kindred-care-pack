-- 1) Bucket public pour les fonds d'avatar
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatar-backgrounds', 'avatar-backgrounds', true)
ON CONFLICT (id) DO NOTHING;

-- Politiques storage : lecture publique, gestion admin
CREATE POLICY "Avatar backgrounds publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatar-backgrounds');

CREATE POLICY "Admins can upload avatar backgrounds"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatar-backgrounds' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update avatar backgrounds"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatar-backgrounds' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete avatar backgrounds"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatar-backgrounds' AND has_role(auth.uid(), 'admin'::app_role));

-- 2) Table de registre des fonds disponibles
CREATE TABLE public.avatar_backgrounds (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.avatar_backgrounds TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.avatar_backgrounds TO authenticated;
GRANT ALL ON public.avatar_backgrounds TO service_role;

ALTER TABLE public.avatar_backgrounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Avatar backgrounds are publicly readable"
ON public.avatar_backgrounds FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage avatar backgrounds rows"
ON public.avatar_backgrounds FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_avatar_backgrounds_active ON public.avatar_backgrounds (is_active) WHERE is_active = true;

CREATE TRIGGER trg_avatar_backgrounds_updated_at
BEFORE UPDATE ON public.avatar_backgrounds
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();