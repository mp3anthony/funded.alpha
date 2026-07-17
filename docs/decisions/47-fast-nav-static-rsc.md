# 47 — Fast in-app navigation: static RSC instead of per-request server rendering

## Context

Navigation between already-loaded pages lagged on mobile (300–900 ms per hop),
having got worse recently. Measurement on production (Chrome DevTools timing +
Vercel function logs) showed the delay was **entirely network/server-bound, not
client CPU** — zero long main-thread tasks on every hop. Slow hops were waiting
on `?_rsc=` page-data fetches that intermittently returned **503**; Vercel
function logs showed only `200`/`204` and zero 5xx, proving the 503s were
**Vercel edge load-shedding a prefetch burst** before any function ran.

Root cause: `layout.tsx` read `cookies()` (to pre-fetch the Supabase session)
on every request. Under `cacheComponents: true`, a single `cookies()` call in a
layout forces the **entire app to render dynamically**, so every route's RSC
payload was produced by a serverless function per navigation and never
edge-cached. Combined with ~8–10 `<Link>` prefetches per screen, this generated
a burst (~21 RSC requests to tour 4 pages twice) that exceeded plan concurrency.

## Decision

Remove the server-side session pre-fetch from the root layout so the app
prerenders statically, and trim redundant prefetching. All tab routes now build
as `○ (Static)` and their RSC payloads are served from the edge cache.

## Alternatives considered and rejected

- **Keep the server pre-fetch but cache it** (`'use cache'` / `unstable_cache`
  around the session lookup). Rejected: still fragile under `cacheComponents`,
  and the session is per-user so it can't be shared/cached at the edge anyway.
  The client already resolves the session from localStorage (implicit flow), so
  the server pre-fetch was pure duplication whose only benefit was shaving a
  brief cold-load spinner — which the user explicitly deprioritised in favour of
  navigation speed.
- **Only reduce prefetching (`prefetch={false}`) without touching the layout.**
  Rejected as insufficient: the routes would stay dynamic, so every navigation
  would still invoke a function and remain 503-prone on first visit. Prefetch
  trimming is kept only as secondary insurance.
- **Client-side optimisations** (strip console.logs, debounce the body
  `MutationObserver`, memoise the `AppContext` value). Rejected: the measurement
  showed zero long main-thread tasks, so these are off the critical path and
  would not have moved navigation time. Documented here to prevent them being
  re-attempted as a perf fix.
- **Upgrade the Vercel plan for more concurrency.** Rejected: pays to mask the
  inefficiency rather than removing it, and does not make navigation fast — only
  makes 503s rarer.

## Deviation hit during implementation

Making the app static surfaced two latent `useState(() => Date.now())` calls
(in `AppShell` and `NotificationCenter`) that read the current time *during
render*. `cacheComponents` forbids reading the current time in a client
component during static prerender unless a Suspense boundary sits above it — a
constraint that was previously masked because the layout forced everything
dynamic. Both were changed to initialise at `0`; each already had a mount/open
effect that sets the real time on the client before any snooze comparison is
shown, so there is no behavioural change. These two files were not in the
original plan; they were necessary to let the intended change build.

## Trade-off accepted

On a cold load the client now resolves the session before content appears, so
the loading spinner may show slightly longer. `AppShell`'s existing loading
state handles this. Chosen deliberately: snappy page-to-page navigation was the
reported problem and the stated priority.
