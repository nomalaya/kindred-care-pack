
-- P0-A: Tighten cause_relevance so baskets differ meaningfully per cause
-- Strategy: Remove cause tags from products whose category is irrelevant to that cause

-- 1. Remove 'child_family' from products that are NOT relevant for families with children
-- Keep: alimentaire, boissons, bébé, enfant, hygiène, vêtements, bien-être
-- Remove from: autonomie, santé (adult-specific), entretien (less relevant)
UPDATE products SET cause_relevance = array_remove(cause_relevance, 'child_family')
WHERE category IN ('autonomie', 'santé') AND 'child_family' = ANY(cause_relevance);

-- 2. Remove 'women_recovery' from baby/child-specific products
UPDATE products SET cause_relevance = array_remove(cause_relevance, 'women_recovery')
WHERE category IN ('bébé', 'enfant') AND 'women_recovery' = ANY(cause_relevance);

-- 3. Remove 'student' from baby, child, elderly-specific categories
UPDATE products SET cause_relevance = array_remove(cause_relevance, 'student')
WHERE category IN ('bébé', 'enfant', 'santé') AND 'student' = ANY(cause_relevance);

-- Also remove student from vêtements (students need autonomie items, not clothing packs)
UPDATE products SET cause_relevance = array_remove(cause_relevance, 'student')
WHERE category = 'vêtements' AND 'student' = ANY(cause_relevance);

-- 4. Remove 'elderly' from baby, child, autonomie (job-seeking items)
UPDATE products SET cause_relevance = array_remove(cause_relevance, 'elderly')
WHERE category IN ('bébé', 'enfant', 'autonomie') AND 'elderly' = ANY(cause_relevance);

-- 5. Remove 'working_poor' from baby, child-specific items
UPDATE products SET cause_relevance = array_remove(cause_relevance, 'working_poor')
WHERE category IN ('bébé', 'enfant') AND 'working_poor' = ANY(cause_relevance);

-- 6. Remove 'health_disability' from baby, child, autonomie
UPDATE products SET cause_relevance = array_remove(cause_relevance, 'health_disability')
WHERE category IN ('bébé', 'enfant', 'autonomie') AND 'health_disability' = ANY(cause_relevance);

-- 7. Ensure baby products are ONLY in child_family
UPDATE products SET cause_relevance = ARRAY['child_family']
WHERE category = 'bébé';

-- 8. Ensure enfant products are ONLY in child_family and student
UPDATE products SET cause_relevance = ARRAY['child_family']
WHERE category = 'enfant';

-- 9. Add student to autonomie products (job seeking / school supplies are relevant)
UPDATE products SET cause_relevance = array_append(cause_relevance, 'student')
WHERE category = 'autonomie' AND NOT ('student' = ANY(cause_relevance));

-- 10. Add working_poor to autonomie products
UPDATE products SET cause_relevance = array_append(cause_relevance, 'working_poor')
WHERE category = 'autonomie' AND NOT ('working_poor' = ANY(cause_relevance));

-- 11. Ensure bien-être is primarily for women_recovery and health_disability
UPDATE products SET cause_relevance = ARRAY['women_recovery', 'health_disability', 'elderly']
WHERE category = 'bien-être';
