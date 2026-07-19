# Findings — Production PWA felt slow to navigate; a fresh reinstall fixed it

**Status:** Root cause identified and confirmed by test. Underlying bug NOT yet fixed —
reinstalling is a workaround. See "Recurrence risk / recommended fix" below.

**Date:** 2026-07-19

## Symptom (as reported)
On the **installed iPhone production PWA**, navigating between tabs took ~1s and showed a
loading wheel each time; the menu was occasionally unresponsive to the point of needing a
force-close. The **preview** build (also installed as a PWA) was instant for the same actions.
The problem was **iOS-only** (never on Android) and felt **recent**.

## What it was NOT (ruled out with evidence)
- **RSC / Vercel 503 load-shedding** (the *previous* nav-slowness root cause): production runtime
  logs over 3h showed **zero** 5xx/503 — only `200`/`304`. That earlier cause was already designed
  out (`src/app/layout.tsx` no longer calls `cookies()`, so routes are no longer force-dynamic).
- **A code regression:** preview and production were **byte-identical builds** (same commit, same
  Turbopack bundler, same serverless-function count per Vercel). Identical code cannot be fast in
  one and slow in the other — so the cause had to be environmental, not the app code.
- **Full-page reloads on navigation:** `BottomNav` uses Next.js `<Link>` (soft client-side
  navigation), so tab switches do not re-mount the app.
- **Multiple Supabase accounts:** unrelated (the device is signed in as a proper household member).

## Root cause (confirmed)
The **service worker served a stale cached copy of the app**. `public/sw.js` uses a hardcoded
cache name `funded-pwa-cache-v3`; its `activate` handler only deletes old caches when that version
string changes, and it has not been bumped across many deploys. So an installed PWA keeps serving
whatever it first cached — in this case an **older, pre-speed-fix bundle** — while a freshly
installed preview PWA gets the current fast code. This explains all three clues at once: recent
(the speed fix never reached the already-installed app), production-only (that's where the old PWA
was installed), and preview-fast (fresh install = current code).

**Confirming test:** deleting and reinstalling the production PWA from the home screen made
navigation instant again. That is the decisive evidence that this was cached-code state, not the
live deployment.

## Recurrence risk / recommended fix (not yet implemented)
The reinstall is only a workaround — the cache-busting bug remains, so this can recur on any future
deploy. The real fix is to make the service worker replace its cache on every new build, e.g.:
- Bump `CACHE_NAME` automatically per deploy (inject the build/commit hash instead of a hardcoded
  `v3`), so the `activate` handler purges the old cache every release; and/or
- Serve the app shell **network-first** (or stale-while-revalidate) rather than cache-first for
  navigations, so a new build is picked up without a manual reinstall.
Note the app already calls `reg.update()` on load (`layout.tsx`), but because `sw.js`'s own bytes
rarely change and the cache name is static, that update does not swap the cached app assets.

## How to diagnose quickly if it comes up again
1. Check Vercel production runtime logs for 5xx/503 — if clean, it is **not** the server.
2. Confirm preview vs production are the same commit — if so, suspect **client/device cache state**.
3. Decisive test: **reinstall the production PWA** (or clear its site data). If it goes fast, it is
   the stale service-worker cache described here → apply the cache-busting fix above.
