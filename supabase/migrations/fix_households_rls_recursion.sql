-- 1. Create a security definer function for basic access checking
CREATE OR REPLACE FUNCTION check_household_access(household_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
STABLE PARALLEL SAFE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM household_members
    WHERE household_id = household_uuid AND user_id = user_uuid
  );
END;
$$;

-- 2. Create a security definer function for owner checking (for DELETE)
CREATE OR REPLACE FUNCTION is_household_owner(household_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
STABLE PARALLEL SAFE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM household_members
    WHERE household_id = household_uuid AND user_id = user_uuid AND role = 'owner'
  );
END;
$$;

-- 3. Ensure RLS is enabled on the households table
ALTER TABLE households ENABLE ROW LEVEL SECURITY;

-- 4. Drop all existing policies on households to start fresh and eliminate recursion risks
DROP POLICY IF EXISTS "Users can view own households" ON households;
DROP POLICY IF EXISTS "Users can update own households" ON households;
DROP POLICY IF EXISTS "Users can create households" ON households;
DROP POLICY IF EXISTS "Members can view their household" ON households;
DROP POLICY IF EXISTS "Users can select households they are in" ON households;
DROP POLICY IF EXISTS "Users can manage households they own" ON households;

-- 5. Create atomic, recursion-safe policies using the security definer functions

-- SELECT: Anyone who is a member of the household can view it
CREATE POLICY "Users can select their household"
ON households FOR SELECT
TO authenticated
USING (check_household_access(id, auth.uid()));

-- INSERT: Anyone can create a household (member mapping happens immediately after in code)
CREATE POLICY "Users can create households"
ON households FOR INSERT
TO authenticated
WITH CHECK (true);

-- UPDATE: Anyone who is a member can update the household 
-- (You may want to restrict this to owners later, but sticking to requested logic for now)
CREATE POLICY "Users can update their household"
ON households FOR UPDATE
TO authenticated
USING (check_household_access(id, auth.uid()))
WITH CHECK (check_household_access(id, auth.uid()));

-- DELETE: Only owners can delete the household
CREATE POLICY "Owners can delete their household"
ON households FOR DELETE
TO authenticated
USING (is_household_owner(id, auth.uid()));

NOTIFY pgrst, 'reload schema';
