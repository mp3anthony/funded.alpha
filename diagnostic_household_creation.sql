-- 1. List all columns in households
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'households';

-- 2. List all columns in household_members
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'household_members';

-- 3. Show all active RLS policies on households and household_members
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('households', 'household_members');

-- 4. Test is_household_member() function directly (if it exists)
-- Replace '00000000-0000-0000-0000-000000000000' with a real household UUID and user UUID for an actual test
-- SELECT is_household_member('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000');

-- 5. Attempt a test INSERT as authenticated user (Diagnostic bypass)
-- Note: Replace with real user UUID to test properly.
/*
BEGIN;
  -- Set local role to simulate authenticated user
  SET LOCAL role authenticated;
  SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000000", "role": "authenticated"}';
  
  -- Attempt Insert
  INSERT INTO households (name, join_code, code_expires_at, user_id)
  VALUES ('Diagnostic Test', 'TEST01', NOW() + INTERVAL '1 day', '00000000-0000-0000-0000-000000000000')
  RETURNING *;
ROLLBACK;
*/
