
-- Add rotation, urgency, emotional score, and avatar columns to beneficiaries
ALTER TABLE public.beneficiaries
  ADD COLUMN IF NOT EXISTS total_donations_received INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_donation_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rotation_score NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS urgency_level INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS urgent_reason TEXT,
  ADD COLUMN IF NOT EXISTS urgent_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS profile_views INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS donation_clicks INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS donation_conversion_rate NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS emotional_score NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;
