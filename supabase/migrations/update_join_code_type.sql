-- Ensure households table has correct join_code and code_expires_at columns
ALTER TABLE households 
  ADD COLUMN IF NOT EXISTS join_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS code_expires_at TIMESTAMPTZ;

-- If code_expires_at is already defined as TIMESTAMP, alter it to TIMESTAMPTZ
ALTER TABLE households ALTER COLUMN code_expires_at TYPE TIMESTAMPTZ USING code_expires_at::TIMESTAMPTZ;

-- Generate a default code for existing households that don't have one
UPDATE households 
SET join_code = SUBSTRING(MD5(RANDOM()::text) FROM 1 FOR 6),
    code_expires_at = NOW() + INTERVAL '24 hours'
WHERE join_code IS NULL;

NOTIFY pgrst, 'reload schema';
