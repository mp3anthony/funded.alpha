# Portal the goal sheets out of AppShell

- **Closes:** #27 (Create Goal card bottom edge clipped on Android)
- **Status:** Accepted
- **Date:** 2026-07-17

## Context

On `/funds` the "Create Goal" card had its bottom edge clipped on Android (Samsung
S25 FE, Chrome, installed PWA) while rendering correctly on iOS. The two goal sheets —
`AddGoalSheet` and `EditGoalSheet` — turned out to be the only sheets in the app that
rendered inline instead of being portaled to `document.body`. Rendered inline, they were
trapped inside AppShell's `overflow-hidden` wrapper and its `main` element, which reserves
`paddingBottom: calc(5rem + env(safe-area-inset-bottom))` for the fixed bottom nav. That
reserved space raises the container's lower edge and eats into the fixed card. Every other
sheet already portals out to escape exactly this.

This is the same *class* of bug as #16 / PR #31 (commit `7313eda`), which portaled the
household modals for the same reason. The goal sheets were simply never given that
treatment. The fix follows the established precedent: portal both to `document.body` with
an SSR guard, mirroring `ContributionSettingsSheet`.

This entry records *why* the fix is shaped this way and what was deliberately left alone.
It does not restate what the code does.

## Why Android and not iOS

The clipping is Android-only because of a secondary height-unit mismatch. The mobile
`.modal-backdrop` is sized in pixels via `--visual-viewport-height`, while the card's cap
is `85dvh`. On Android PWA the `dvh` reference is taller around the nav bar, so a tall goal
card overflows; on iOS the two references align and nothing spills. This is a contributing
factor, not the root cause — see the reserved fallback below.

## Decisions and rejected alternatives

### Portal out, not a CSS/height-unit fix

The obvious reading is "the `85dvh` cap disagrees with `--visual-viewport-height`, so fix
the units." Rejected. The portaled sheets share the *exact same* `85dvh` cap and do not
clip — which proves the cause is DOM location (being trapped inside the padded, overflow-
hidden container), not the unit. On top of that, `.modal-backdrop` is a shared rule; editing
it to chase this one card risks every modal in the app. Portaling the two offending
components out is the smaller, safer, precedent-backed change.

### Fix both goal sheets, not just AddGoalSheet

`EditGoalSheet` is structurally identical to `AddGoalSheet` and is opened from both `/funds`
and the dashboard. Fixing only the Add sheet would leave an identical clip waiting to be
re-reported the moment someone edited a goal. Both were portaled together.

### Portal the sheets out, not restructure AppShell

We could instead remove or rework AppShell's `overflow-hidden` and the `main`
`paddingBottom` so nothing gets clipped in the first place. Rejected as far too wide a
blast radius. That overflow-hidden wrapper plus the safe-area bottom padding is load-bearing
for the fixed bottom-nav layout and is explicitly protected by this repo's CLAUDE.md
viewport invariants (fixed elements must live outside overflow-hidden wrappers; safe-area
padding must be preserved). Moving two components out of the container respects those
invariants instead of fighting them.

## Reserved fallback (not used)

The secondary height-unit fix (reconciling `85dvh` with `--visual-viewport-height`) was
deliberately held in reserve, to be revisited *only* if on-device Android testing still
showed clipping after the portal change. Recorded here so a future reader knows this was a
conscious deferral, not an oversight — the door was left open on purpose.

## Implementation deviations worth recording

### Pre-existing edit-mode redundancy, left untouched

While portaling, Implementation observed that `AddGoalSheet` already carries duplicated
edit-mode logic that overlaps `EditGoalSheet`. This is pre-existing and was left alone as
out of scope for #27. Flagged here so the redundancy is understood as something that
predates this change, not something introduced by it.
