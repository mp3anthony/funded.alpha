-- Add per-household timezone so the daily reminder cron can compute "today"
-- in each household's local zone (default: Australia/Sydney).
ALTER TABLE households ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'Australia/Sydney';

-- Add a dedupe key to notifications so the client and server reminder
-- generators never create the same reminder twice, and dismissed (kept)
-- notifications are respected instead of being resurfaced.
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS dedupe_key TEXT;

-- Enforce one notification per (user, dedupe_key). NOT partial: PostgREST/
-- supabase-js upsert with onConflict 'user_id,dedupe_key' cannot pass a WHERE
-- predicate, so a partial index would not be inferable for ON CONFLICT. A full
-- unique index is inferable, and Postgres treats NULLs as distinct by default,
-- so legacy rows with a NULL dedupe_key remain unaffected (multiple allowed).
CREATE UNIQUE INDEX IF NOT EXISTS notifications_user_dedupe_uidx
  ON notifications (user_id, dedupe_key);

NOTIFY pgrst, 'reload schema';
