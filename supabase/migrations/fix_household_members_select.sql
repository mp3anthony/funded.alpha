-- Allow users to read their own household membership
DROP POLICY IF EXISTS "Users can view own household via membership" ON household_members;
CREATE POLICY "Users can view own household via membership"
ON household_members FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Ensure households table allows reads for members
DROP POLICY IF EXISTS "Members can view their household" ON households;
CREATE POLICY "Members can view their household"
ON households FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM household_members hm
    WHERE hm.user_id = auth.uid()
    AND hm.household_id = households.id
  )
);

NOTIFY pgrst, 'reload schema';
