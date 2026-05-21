ALTER TABLE public.beneficiaries REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.beneficiaries;