
-- Create update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Causes table
CREATE TABLE public.causes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.causes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Causes are publicly readable" ON public.causes FOR SELECT USING (true);
CREATE POLICY "Admins can manage causes" ON public.causes FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Situations table
CREATE TABLE public.situations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cause_id UUID NOT NULL REFERENCES public.causes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  emotional_sentence TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.situations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Situations are publicly readable" ON public.situations FOR SELECT USING (true);
CREATE POLICY "Admins can manage situations" ON public.situations FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Beneficiaries table (private data)
CREATE TABLE public.beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  situation_id UUID NOT NULL REFERENCES public.situations(id) ON DELETE CASCADE,
  real_first_name TEXT,
  real_last_name TEXT,
  address TEXT,
  email TEXT,
  date_of_birth DATE,
  family_members INT,
  financial_situation TEXT,
  social_worker_notes TEXT,
  alias_first_name TEXT NOT NULL,
  approx_age INT,
  region TEXT,
  short_story TEXT,
  emotional_sentence TEXT,
  avatar_gender TEXT,
  avatar_age_range TEXT,
  avatar_hair_type TEXT,
  avatar_skin_tone TEXT,
  culture_tags TEXT[] DEFAULT '{}',
  diet_tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;

-- Public view: only safe columns
CREATE VIEW public.beneficiaries_public AS
SELECT id, situation_id, alias_first_name, approx_age, region, short_story,
  emotional_sentence, avatar_gender, avatar_age_range, avatar_hair_type,
  avatar_skin_tone, culture_tags, diet_tags, is_active
FROM public.beneficiaries WHERE is_active = true;

-- RLS: Only admins can access the full table
CREATE POLICY "Admins can manage beneficiaries" ON public.beneficiaries
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Grant public read on the view
GRANT SELECT ON public.beneficiaries_public TO anon, authenticated;

CREATE TRIGGER update_beneficiaries_updated_at BEFORE UPDATE ON public.beneficiaries
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  culture_tags TEXT[] DEFAULT '{}',
  religion_tags TEXT[] DEFAULT '{}',
  diet_tags TEXT[] DEFAULT '{}',
  emotion_tags TEXT[] DEFAULT '{}',
  stock_quantity INT DEFAULT 0,
  tier INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are publicly readable" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Beneficiary base baskets
CREATE TABLE public.beneficiary_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id UUID NOT NULL REFERENCES public.beneficiaries(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INT DEFAULT 1,
  UNIQUE(beneficiary_id, product_id)
);
ALTER TABLE public.beneficiary_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Beneficiary products publicly readable" ON public.beneficiary_products FOR SELECT USING (true);
CREATE POLICY "Admins can manage beneficiary products" ON public.beneficiary_products FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Donations table
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID NOT NULL REFERENCES auth.users(id),
  beneficiary_id UUID NOT NULL REFERENCES public.beneficiaries(id),
  amount NUMERIC(10,2) NOT NULL,
  products_sent JSONB DEFAULT '[]',
  delivery_status TEXT NOT NULL DEFAULT 'confirmed',
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Donors can view own donations" ON public.donations FOR SELECT USING (auth.uid() = donor_id);
CREATE POLICY "Donors can create donations" ON public.donations FOR INSERT WITH CHECK (auth.uid() = donor_id);
CREATE POLICY "Admins can manage all donations" ON public.donations FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON public.donations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
