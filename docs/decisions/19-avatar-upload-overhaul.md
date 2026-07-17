# Avatar upload overhaul

- **Epic:** #19 (avatar upload overhaul)
- **Closes:** #21 (2MB upload limit), #20 (missing avatar cropping)
- **Status:** Accepted
- **Date:** 2026-07-17

## Context

Two child issues under Epic #19 pointed at the same upload path: #21 (users hitting
a hard 2MB rejection) and #20 (no way to crop before upload). They were handled as one
change because a fix for either forces decisions about the other — how big a file we
keep is inseparable from what we do to it before storing it.

This entry records *why* the pipeline is shaped the way it is. It does not restate what
the code does; read the source for that.

## Decisions and rejected alternatives

### Compress client-side rather than raise the 2MB limit (#21)

The obvious reading of #21 is "the limit is too low, raise it." Rejected. Storing and
serving multi-megabyte avatars is wasteful for a mobile PWA where the image renders as a
small circle. The limit lives in two places — an app-side check *and* the Supabase
bucket — so raising it would mean changing both layers and keeping them in sync forever.
Instead we crop/resize on the client to ~512² JPEG, which lands every upload far under
the ceiling. The 2MB cap becomes a safety net rather than a wall, and neither layer
needed its number changed.

### JPEG output, not WebP

WebP is smaller and is already in the bucket's allowed-MIME whitelist, so it looks like
the better encode target. Rejected anyway. `canvas.toBlob('image/webp')` is unreliable
on iOS Safari/WebKit: it can silently fall back to PNG, which is large and could blow the
size budget the compression step exists to protect. JPEG encodes predictably everywhere.
This is the non-obvious call — we chose the larger-format-on-paper option because its
behaviour is guaranteed on our primary device.

### Hand-rolled canvas crop, not a crop library (#20)

We evaluated react-easy-crop, react-image-crop, and react-avatar-editor and did not use
any of them, for four reasons:

1. The repo is deliberately lean — no UI libraries beyond lucide and Tailwind — and every
   dependency is bundle weight shipped to a mobile PWA.
2. Most crop libraries return only crop *coordinates*, so we would still hand-roll the
   canvas draw and `toBlob` compression that #21 requires. The library removes the easy
   half of the problem, not the half we actually needed.
3. Touch-gesture behaviour inside an iOS home-screen PWA webview has to be re-verified
   on-device regardless of who wrote the gesture code, so a library buys us less
   confidence here than it would in a normal browser tab.

**Reserved fallback (not used):** react-easy-crop was kept in reserve *only* if
hand-rolled pinch-zoom proved too fiddly on real devices. On-device testing did not
require it, so it was not added. Recorded here so a future reader knows the door was left
open deliberately, not overlooked.

### Kept the Supabase bucket at 2MB — and documented it

The bucket limit was not raised. It is now a safety net behind client compression rather
than the primary gate. Previously this limit existed only in the Supabase dashboard and
was invisible to the repo. We captured it as an idempotent migration
(`supabase/migrations/20260717000000_avatars_bucket_config.sql`) so the constraint is
version-controlled and reproducible, even though the bucket itself is dashboard-managed.

### Fixed 1:1 square crop, not free aspect ratio

Avatars render as circles. A non-square crop gets awkwardly clipped by the circular mask,
so free aspect ratio would add UI and state complexity for a result the user can't
benefit from. The crop frame is locked to 1:1.

### 512×512 output, not 256×256

256² would be smaller still, but 512² gives retina/high-DPI headroom while the JPEG stays
tiny. The extra pixels cost little once compressed and avoid a visibly soft avatar on
dense displays.

## Implementation deviations worth recording

### How the "no full-resolution canvas" memory invariant was satisfied

The constraint was "never allocate a full-resolution canvas" (a large source photo can
exhaust memory in a webview). We read this specifically as *no full-res canvas*, not *no
full-res image*: during cropping the picture is shown as an `<img>` positioned with CSS
transforms, so the browser handles the large bitmap. Only at crop-confirm do we
`createImageBitmap`, downscale, and encode into a single 512×512 canvas. No full-resolution
canvas is ever allocated. Noting the reading here because the constraint could also have
been satisfied more expensively, and this choice is not self-evident from the code.

### Dropped a dead filename path segment

The stored avatar filename previously carried a sanitized-name segment and an extension
variable that was computed but never used (dead code). Switching to a type-derived
extension both fixed naming for the re-encoded blob and made the old name segment
pointless, so it was removed. This is a deliberate simplification riding along with the
fix, not an accidental change to how avatars are named — flagged so it isn't mistaken for
a regression later.
