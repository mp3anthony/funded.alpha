-- 1. Alter households table to add is_joint_fund
ALTER TABLE households ADD COLUMN IF NOT EXISTS is_joint_fund BOOLEAN DEFAULT FALSE NOT NULL;

-- 2. Alter bills table to add notes, assignee_id, payment_type, invoice_date, is_recurring
ALTER TABLE bills ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS assignee_id UUID REFERENCES household_members(id) ON DELETE SET NULL;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'manual' NOT NULL;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS invoice_date DATE;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT TRUE NOT NULL;

-- 3. Alter funds table to add deadline, status, member_id, owner_id
ALTER TABLE funds ADD COLUMN IF NOT EXISTS deadline DATE;
ALTER TABLE funds ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'not_started' NOT NULL;
ALTER TABLE funds ADD COLUMN IF NOT EXISTS member_id UUID REFERENCES household_members(id) ON DELETE SET NULL;
ALTER TABLE funds ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 4. Create household_contributions table if not exists
CREATE TABLE IF NOT EXISTS household_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES household_members(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  frequency TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- 5. Create contribution_rules table if not exists
CREATE TABLE IF NOT EXISTS contribution_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES household_members(id) ON DELETE CASCADE,
  threshold_amount NUMERIC(12, 2) NOT NULL,
  action_type TEXT NOT NULL,
  action_target_id UUID NOT NULL,
  amount_to_add NUMERIC(12, 2) NOT NULL,
  amount_type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- 6. Create pay_schedules table if not exists
CREATE TABLE IF NOT EXISTS pay_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES household_members(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2),
  frequency TEXT NOT NULL,
  is_fixed_amount BOOLEAN DEFAULT TRUE NOT NULL,
  next_pay_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- 7. Create pay_history table if not exists
CREATE TABLE IF NOT EXISTS pay_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES household_members(id) ON DELETE CASCADE,
  pay_schedule_id UUID REFERENCES pay_schedules(id) ON DELETE SET NULL,
  amount NUMERIC(12, 2) NOT NULL,
  pay_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  rule_id UUID REFERENCES contribution_rules(id) ON DELETE SET NULL,
  allocation_type TEXT,
  allocation_target_id UUID
);

-- 8. Create bill_splits table if not exists
CREATE TABLE IF NOT EXISTS bill_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES household_members(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  is_assignee BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- 9. Drop and recreate frequency check constraints to permit 'by-weekly' and 'bi-weekly'
ALTER TABLE pay_schedules DROP CONSTRAINT IF EXISTS pay_schedules_frequency_check;
ALTER TABLE pay_schedules ADD CONSTRAINT pay_schedules_frequency_check CHECK (frequency IN ('weekly', 'by-weekly', 'bi-weekly', 'monthly', 'yearly'));

ALTER TABLE bills DROP CONSTRAINT IF EXISTS bills_frequency_check;
ALTER TABLE bills ADD CONSTRAINT bills_frequency_check CHECK (frequency IN ('weekly', 'by-weekly', 'bi-weekly', 'monthly', 'yearly'));

ALTER TABLE household_contributions DROP CONSTRAINT IF EXISTS household_contributions_frequency_check;
ALTER TABLE household_contributions ADD CONSTRAINT household_contributions_frequency_check CHECK (frequency IN ('weekly', 'by-weekly', 'bi-weekly', 'monthly', 'yearly'));

-- Enable RLS
ALTER TABLE household_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contribution_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE pay_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE pay_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_splits ENABLE ROW LEVEL SECURITY;

-- Setup RLS Policies for household_contributions
DROP POLICY IF EXISTS "Users can manage household_contributions" ON household_contributions;
CREATE POLICY "Users can manage household_contributions" ON household_contributions
  FOR ALL TO authenticated USING (
    household_id IN (SELECT id FROM households WHERE user_id = auth.uid()) OR
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  ) WITH CHECK (
    household_id IN (SELECT id FROM households WHERE user_id = auth.uid()) OR
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

-- Setup RLS Policies for contribution_rules
DROP POLICY IF EXISTS "Users can manage contribution_rules" ON contribution_rules;
CREATE POLICY "Users can manage contribution_rules" ON contribution_rules
  FOR ALL TO authenticated USING (
    household_id IN (SELECT id FROM households WHERE user_id = auth.uid()) OR
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  ) WITH CHECK (
    household_id IN (SELECT id FROM households WHERE user_id = auth.uid()) OR
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

-- Setup RLS Policies for pay_schedules
DROP POLICY IF EXISTS "Users can manage pay_schedules" ON pay_schedules;
CREATE POLICY "Users can manage pay_schedules" ON pay_schedules
  FOR ALL TO authenticated USING (
    household_id IN (SELECT id FROM households WHERE user_id = auth.uid()) OR
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  ) WITH CHECK (
    household_id IN (SELECT id FROM households WHERE user_id = auth.uid()) OR
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

-- Setup RLS Policies for pay_history
DROP POLICY IF EXISTS "Users can manage pay_history" ON pay_history;
CREATE POLICY "Users can manage pay_history" ON pay_history
  FOR ALL TO authenticated USING (
    household_id IN (SELECT id FROM households WHERE user_id = auth.uid()) OR
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  ) WITH CHECK (
    household_id IN (SELECT id FROM households WHERE user_id = auth.uid()) OR
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

-- Setup RLS Policies for bill_splits
DROP POLICY IF EXISTS "Users can manage bill_splits" ON bill_splits;
CREATE POLICY "Users can manage bill_splits" ON bill_splits
  FOR ALL TO authenticated USING (
    bill_id IN (SELECT id FROM bills WHERE 
      household_id IN (SELECT id FROM households WHERE user_id = auth.uid()) OR 
      household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
    )
  ) WITH CHECK (
    bill_id IN (SELECT id FROM bills WHERE 
      household_id IN (SELECT id FROM households WHERE user_id = auth.uid()) OR 
      household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
    )
  );

-- Reload Schema Cache
NOTIFY pgrst, 'reload schema';
