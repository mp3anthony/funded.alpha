# 63 — Goal delete silently fails and reappears after refresh

## Context
A goal deleted on the iPhone PWA vanished from the screen but returned on refresh. Editing
the same goal worked, so the failure was specific to delete, not to write permission in general.

## Investigation — what it was NOT (recorded so we don't re-chase these)
The symptom looked like a permissions or data regression from the previous day's work, but each
candidate was ruled out with evidence:

- **Row-Level Security:** the `funds` "manage in their households" policy (`cmd = ALL`) permits
  delete for household members. Verified per-goal by evaluating the policy's USING expression for
  every account — all four goals return `true` for the signed-in member account.
- **Foreign keys:** nothing in the schema references `funds.id`, so no `ON DELETE RESTRICT` can
  block the delete. (`funds` is only ever a child of `households`/`household_members`/`users`.)
- **Triggers / restrictive policies:** none exist on `funds`.
- **Service worker:** `public/sw.js` ignores all non-GET requests and all `supabase.co` calls, so
  it never touches the delete.
- **Yesterday's category migration (#60):** plain `UPDATE category` statements — no structural or
  RLS change.
- **Multiple Supabase accounts:** a red herring. The signed-in device uses a proper member account
  (`anthonypaull.nz@outlook.com`); the non-member accounts were irrelevant to the reported bug.
  Noted separately below as a latent hazard, not this bug's cause.

## Root cause
`deleteGoal()` swallowed errors (console-only, invisible on a phone) and updated local state
optimistically. Combined with a bare `.delete()` (no `.select()`), a delete affecting **zero rows**
returned no error and was indistinguishable from success — so the UI removed the goal locally while
the database kept it, producing the vanish-then-return.

## Decision
Adopt the pattern the **bill** delete already used, and harden it further:
1. `.delete().eq(...).select()` so Postgres returns the rows it actually removed.
2. Throw when an error occurs **or** zero rows come back — never treat a silent no-op as success.
3. Callers wrap the call in try/catch, surface the real message, and close the sheet only on success.

## Alternatives considered and rejected
- **A dedicated toast/snackbar system.** Rejected: the app has no toast infrastructure, and a toast
  is a `position: fixed` element — directly in the path of this repo's iOS WebKit fixed-element
  invariant. Native `alert()` matches the existing `confirm()` convention already used for the
  delete prompt, keeps the change platform-agnostic, and needs no new UI surface.
- **Only fixing `deleteGoal`.** Rejected in favour of aligning `deletePaySchedule` and `deleteBill`
  to the same contract, since the same silent-no-op class of bug applies to all three (the user's
  request explicitly covered goals, payday schedules, and bills).
- **Server-side (RPC) delete to bypass client RLS.** Rejected as unnecessary and heavier: RLS already
  permits the delete for members, so the correct fix is honest error handling, not a privilege
  workaround that would mask future permission problems.

## Latent hazard noted (not fixed here)
The account `slmg.anthony@gmail.com` (and `onenz.anthony@gmail.com`) are **not** members of the
household holding the data. If any device signs into a non-member account, the app shows no goals
and every write silently fails. With this change such writes now surface an error instead of failing
silently, but the underlying account/membership cleanup is a separate follow-up.
