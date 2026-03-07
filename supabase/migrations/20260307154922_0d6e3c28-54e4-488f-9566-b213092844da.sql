CREATE TABLE IF NOT EXISTS public.matching_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  situation_id uuid REFERENCES public.situations(id) ON DELETE CASCADE NOT NULL,
  rule_name text NOT NULL,
  priority_boost integer DEFAULT 0,
  required_categories text[] DEFAULT '{}',
  excluded_tags text[] DEFAULT '{}',
  min_tier integer DEFAULT 1,
  max_tier integer DEFAULT 4,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.matching_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage matching rules" ON public.matching_rules FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Matching rules publicly readable" ON public.matching_rules FOR SELECT USING (true);