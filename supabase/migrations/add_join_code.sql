-- Add join code fields to households
ALTER TABLE households ADD COLUMN IF NOT EXISTS join_code TEXT UNIQUE;
ALTER TABLE households ADD COLUMN IF NOT EXISTS code_expires_at TIMESTAMP;

-- Enable RLS on funds table
ALTER TABLE funds ENABLE ROW LEVEL SECURITY;

-- Drop insert policy if it exists and recreate it to permit inserts for authenticated users
DROP POLICY IF EXISTS "Allow inserts for authenticated users" ON funds;
CREATE POLICY "Allow inserts for authenticated users" ON funds
  FOR INSERT TO authenticated WITH CHECK (true);
