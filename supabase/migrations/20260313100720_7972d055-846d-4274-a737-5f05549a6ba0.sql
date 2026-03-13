
ALTER TABLE beneficiaries ADD COLUMN context_badge text;

-- Recreate the view to include context_badge
DROP VIEW IF EXISTS beneficiaries_public;
CREATE VIEW beneficiaries_public AS
SELECT 
  id, alias_first_name, approx_age, region, short_story, emotional_sentence,
  avatar_gender, avatar_age_range, avatar_hair_type, avatar_skin_tone, avatar_url,
  urgency_level, rotation_score, emotional_score, profile_views,
  total_donations_received, last_donation_date, is_active, situation_id,
  children_count, beneficiary_category, profile_type, diet_tags, culture_tags,
  context_badge
FROM beneficiaries
WHERE is_active = true;
