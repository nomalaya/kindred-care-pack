
-- Table: impact_units — maps products to impact types/values
CREATE TABLE public.impact_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  impact_type text NOT NULL,
  impact_value numeric NOT NULL DEFAULT 1
);

ALTER TABLE public.impact_units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Impact units publicly readable"
  ON public.impact_units FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage impact units"
  ON public.impact_units FOR ALL
  TO public
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Table: impact_profiles — defines 3 impact types per situation
CREATE TABLE public.impact_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  situation_id uuid NOT NULL REFERENCES public.situations(id) ON DELETE CASCADE,
  impact_type_1 text NOT NULL,
  impact_type_2 text NOT NULL,
  impact_type_3 text NOT NULL,
  UNIQUE(situation_id)
);

ALTER TABLE public.impact_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Impact profiles publicly readable"
  ON public.impact_profiles FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage impact profiles"
  ON public.impact_profiles FOR ALL
  TO public
  USING (has_role(auth.uid(), 'admin'::app_role));
