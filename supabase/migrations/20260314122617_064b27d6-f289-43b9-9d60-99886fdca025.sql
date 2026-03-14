CREATE TABLE public.followed_beneficiaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  beneficiary_id uuid REFERENCES public.beneficiaries(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, beneficiary_id)
);

ALTER TABLE public.followed_beneficiaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own follows"
ON public.followed_beneficiaries
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own follows"
ON public.followed_beneficiaries
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own follows"
ON public.followed_beneficiaries
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);