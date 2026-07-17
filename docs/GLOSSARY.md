# Glossary

Domain terms specific to this project. Generic web/framework vocabulary is out of scope.

## Avatar crop pipeline

The client-side sequence a user's chosen photo goes through before it becomes a stored
avatar: interactive 1:1 crop/zoom in the browser, then a downscale-and-encode step that
produces a 512×512 JPEG. It exists so uploads are small by construction rather than
policed by a size limit. See `docs/decisions/19-avatar-upload-overhaul.md`.

## Avatars bucket safety net

The 2MB `file_size_limit` on the Supabase `avatars` storage bucket. After the crop
pipeline landed, this limit no longer rejects normal uploads (they arrive well under it);
it only guards against an unexpectedly large or uncompressed file slipping through. Its
value is version-controlled in
`supabase/migrations/20260717000000_avatars_bucket_config.sql` even though the bucket is
dashboard-managed.
