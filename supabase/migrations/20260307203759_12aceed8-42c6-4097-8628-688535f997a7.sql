WITH ranked AS (
  SELECT id,
    ROW_NUMBER() OVER (PARTITION BY situation_id ORDER BY created_at DESC) as rn
  FROM beneficiaries
  WHERE situation_id = 'b1000000-0000-0000-0000-000000000012'
)
DELETE FROM beneficiaries WHERE id IN (
  SELECT id FROM ranked WHERE rn > 8
)