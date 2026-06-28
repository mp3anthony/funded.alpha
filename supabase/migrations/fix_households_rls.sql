-- Ensure join_code columns exist
ALTER TABLE households 
  ADD COLUMN IF NOT EXISTS join_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS code_expires_at TIMESTAMPTZ;

-- Enable RLS on households
ALTER TABLE households ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to CREATE households
DROP POLICY IF EXISTS "Users can create households" ON households;
CREATE POLICY "Users can create households"
ON households FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to READ their own households (including initial creator select)
DROP POLICY IF EXISTS "Users can view own households" ON households;
DROP POLICY IF EXISTS "Users can select households they are in" ON households;
CREATE POLICY "Users can view own households"
ON households FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM household_members hm 
    WHERE hm.user_id = auth.uid() 
    AND hm.household_id = households.id
  )
);

-- Allow authenticated users to UPDATE their own households
DROP POLICY IF EXISTS "Users can update own households" ON households;
DROP POLICY IF EXISTS "Users can manage households they own" ON households;
CREATE POLICY "Users can update own households"
ON households FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM household_members hm 
    WHERE hm.user_id = auth.uid() 
    AND hm.household_id = households.id
  )
)
WITH CHECK (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM household_members hm 
    WHERE hm.user_id = auth.uid() 
    AND hm.household_id = households.id
  )
);

NOTIFY pgrst, 'reload schema';
