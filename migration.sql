-- Migration to replace Pro/Premium system with Membership model

-- 1. Add membership_status to users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS membership_status TEXT DEFAULT 'free';

-- 2. Drop the premium column from courses as access is now governed by membership
ALTER TABLE public.courses 
DROP COLUMN IF EXISTS premium;

-- 3. Drop the RPC that handled atomic course purchases, as enrollments are now free but access-gated
DROP FUNCTION IF EXISTS public.purchase_course(BIGINT, BIGINT, DECIMAL);

-- 4. Clean up mock transactions if they exist (optional, but good for cleanup)
-- DROP TABLE IF EXISTS public.transactions;

-- 5. Add gestures to the mock courses so the frontend can pull curriculum dynamically instead of using hardcoded arrays
UPDATE public.courses
SET gestures = '["A", "B", "C", "D", "E"]'::jsonb
WHERE title LIKE '%Alphabet%';

UPDATE public.courses
SET gestures = '["A", "B", "V", "W", "X"]'::jsonb
WHERE title LIKE '%Speed%';

UPDATE public.courses
SET gestures = '["A", "E", "I", "O", "U"]'::jsonb
WHERE title LIKE '%Daily Life%';

UPDATE public.courses
SET gestures = '["F", "G", "H", "P", "Q"]'::jsonb
WHERE title LIKE '%Healthcare%';
