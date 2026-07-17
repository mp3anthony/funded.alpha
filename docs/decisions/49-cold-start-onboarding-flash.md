# 49 — Cold-start onboarding flash

**Issue:** [#49](https://github.com/mp3anthony/funded.alpha/issues/49)
**Type:** Bug fix (patch)

## Context

On cold start of the installed PWA, users saw a wrong-screen sequence — loading
wheel → a flash of the onboarding "create or join" screen → a second loading
wheel → the home screen. The onboarding screen should never appear for an
already-onboarded user.

The mechanism was a one-render timing gap, not a data problem: `AppProvider` is
deliberately mounted with no server-prefetched session, so on every load
`isAuthLoading` starts `true`, `isOnboarded` starts `false`, and `isDataLoading`
starts `false`. When `getSession()` resolved with a session, `isDataLoading` was
still `false` for one render (it only flipped to `true` later, inside
`loadData`). During that single render the AppShell gate `mounted && !authLoading
&& session && !onboarded` read as true, so `<Onboarding />` rendered.

## Decision

Set `isDataLoading = true` in the same state batch as the session resolving (in
the `getSession`/`onAuthStateChange` handlers), and add `!isDataLoading` to the
Onboarding gate. The onboarding screen now cannot render until `loadData` has
actually determined whether a household exists.

## Why reuse `isDataLoading` rather than add a new flag

The obvious alternative was a dedicated `onboardingChecked` boolean, set true
only in `loadData`'s `finally`. We rejected it as the primary approach because
`isDataLoading` *already* carries exactly the meaning we need — "we have a
session and are still figuring out its data." A second flag would duplicate that
meaning and require its own reset-on-signout handling, adding state surface for
no behavioral gain. Reusing the existing flag keeps the fix to the two points
where the gap actually opens. The new flag was held in reserve only for a
stuck-wheel edge case that did not materialise (every `loadData` exit path,
including the early guard and `finally`, already resets `isDataLoading`).

## Deviation found in review: don't flash the wheel on background refreshes

The plan was to set `isDataLoading = true` whenever a session resolves, in both
the `getSession` and `onAuthStateChange` handlers. Code review caught that an
*unconditional* set in `onAuthStateChange` would regress: that listener also
fires `TOKEN_REFRESHED` (roughly hourly, and on tab refocus) and `USER_UPDATED`,
and because `loadData` re-runs on every session change, forcing `isDataLoading`
true on those events would flash the full-screen loading wheel over a working
app. Today those refreshes are silent because `loadData` only shows the wheel on
the first load (its `!dbHouseholdId && !isOnboarded` guard).

Fix: the listener sets `isDataLoading` only for `INITIAL_SESSION` and
`SIGNED_IN` — the "session just established" events — matching the convention
already used in `src/app/auth/callback/page.tsx`. The `getSession` handler stays
unconditional because it runs only once at mount, which is the cold-start case
by definition and can never be a background refresh.

## Alternatives rejected

- **Server-side session prefetch** (so the first render already knows the user
  is authenticated). Rejected outright: it reintroduces `cookies()` in the root
  layout, which is the exact cause of the navigation slowness fixed in #47. The
  fix had to stay purely client-side.
- **Debounce/delay the onboarding render.** Rejected: masks the timing bug with
  an arbitrary delay that could itself flash on slower devices, rather than
  removing the gap.

## Scope note

Purely client-side React state timing — no CSS, layout, viewport, or native-API
surface — so this was assessed platform-agnostic and tested iPhone-only.
