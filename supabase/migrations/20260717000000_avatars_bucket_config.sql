-- Documentation-of-record for the `avatars` storage bucket configuration.
-- The bucket itself is created/managed via the Supabase dashboard; this
-- migration captures its intended limits in-repo and enforces them
-- idempotently so the constraints are version-controlled and reproducible.
--
-- Client uploads are cropped/resized to a 512x512 JPEG before upload, so the
-- 2MB ceiling is a generous safety net rather than the expected file size.
UPDATE storage.buckets
SET
  file_size_limit = 2097152, -- 2 MiB
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE id = 'avatars';
