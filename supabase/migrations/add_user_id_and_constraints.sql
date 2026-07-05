-- Add user_id column to household_members table
ALTER TABLE household_members ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Sync existing household_members user_id by email
UPDATE household_members m
SET user_id = u.id
FROM auth.users u
WHERE LOWER(m.email) = LOWER(u.email) AND m.user_id IS NULL;

-- Add UNIQUE constraint on (household_id, user_id)
ALTER TABLE household_members DROP CONSTRAINT IF EXISTS household_members_household_id_user_id_key;
ALTER TABLE household_members ADD CONSTRAINT household_members_household_id_user_id_key UNIQUE (household_id, user_id);

-- Add index on households.join_code for fast lookup
CREATE INDEX IF NOT EXISTS idx_households_join_code ON households(join_code);

-- Update RLS Policies to allow members read/write access

-- 1. Households policies
DROP POLICY IF EXISTS "Users can manage their own households" ON households;
DROP POLICY IF EXISTS "Users can select households they are in" ON households;
DROP POLICY IF EXISTS "Users can manage households they own" ON households;

CREATE POLICY "Users can select households they are in" ON households
  FOR SELECT TO authenticated USING (
    user_id = auth.uid() OR 
    id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage households they own" ON households
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 2. Bills policies
DROP POLICY IF EXISTS "Users can manage bills in their households" ON bills;

CREATE POLICY "Users can manage bills in their households" ON bills
  FOR ALL TO authenticated USING (
    household_id IN (SELECT id FROM households WHERE user_id = auth.uid()) OR
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  ) WITH CHECK (
    household_id IN (SELECT id FROM households WHERE user_id = auth.uid()) OR
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

-- 3. Funds policies
DROP POLICY IF EXISTS "Users can manage funds in their households" ON funds;
DROP POLICY IF EXISTS "Allow inserts for authenticated users" ON funds;

CREATE POLICY "Users can manage funds in their households" ON funds
  FOR ALL TO authenticated USING (
    household_id IN (SELECT id FROM households WHERE user_id = auth.uid()) OR
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  ) WITH CHECK (
    household_id IN (SELECT id FROM households WHERE user_id = auth.uid()) OR
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

-- 4. Paydays policies
DROP POLICY IF EXISTS "Users can manage paydays in their households" ON paydays;

CREATE POLICY "Users can manage paydays in their households" ON paydays
  FOR ALL TO authenticated USING (
    household_id IN (SELECT id FROM households WHERE user_id = auth.uid()) OR
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  ) WITH CHECK (
    household_id IN (SELECT id FROM households WHERE user_id = auth.uid()) OR
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

-- 5. Household Members policies
DROP POLICY IF EXISTS "Users can manage members in their households" ON household_members;

CREATE POLICY "Users can manage members in their households" ON household_members
  FOR ALL TO authenticated USING (
    household_id IN (SELECT id FROM households WHERE user_id = auth.uid()) OR
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  ) WITH CHECK (
    household_id IN (SELECT id FROM households WHERE user_id = auth.uid()) OR
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );
