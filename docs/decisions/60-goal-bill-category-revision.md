# Category vocabulary revised by SQL migration, not by mapping around stale strings

- **Closes:** #60 (Goals: revise category list + Bills Debt/Finance rename + data migration)
- **Status:** Accepted
- **Date:** 2026-07-18

## Context

The Savings Goals category vocabulary was replaced with a new 8-set — `Home & Living`,
`Debt & Finance`, `Vacation & Travel`, `Savings`, `Emergency`, `Short-Term`, `Education`,
`Other` — and the Bills page's `Debt/Finance` category was renamed to `Debt & Finance` to
match. Two of the goal changes are **merges**: the old `Vacation` and `Transport` collapse
into `Vacation & Travel`, and `Debt Payoff` and `Interest Free Payment` collapse into
`Debt & Finance`. Existing goal and bill rows already in the database were rewritten to the
new labels by a one-time SQL migration; browser-stored category-order keys were sanitized
in-client.

The renamed-label and revised-picker parts of this diff are self-evident. What this entry
records is the reasoning the code can't show: **why a SQL migration rather than a mapping
layer**, why three dead style branches were deleted rather than updated, why no DB
constraint was added, and the sequencing decisions forced by a single shared database.

## Alternatives considered and rejected

### Migration mechanism — one-time SQL `UPDATE`, chosen over read-time mapping and a client-side remap

The core decision. Three ways to reconcile old stored strings with the new vocabulary were
on the table:

- **Read-time mapping** (translate old → new label every time a row loads). Rejected: it
  leaves the stale strings in the database *forever*. The mapping code can never be deleted,
  and — worse — new writes still store whatever the current UI sends, so the database drifts
  into a permanent split-brain of old and new values that every future reader has to keep
  translating.
- **Client-side one-off remap** (rewrite rows the first time someone opens the app).
  Rejected as unreliable: it only runs when a user actually opens the app, it races with the
  page's own load and reorder logic, and it needs its own write-back and error handling for
  a job the database can do atomically.
- **One-time SQL `UPDATE` migration** — chosen. It is the repo's **established pattern**
  (it mirrors the earlier fortnightly-frequency migration), it is atomic and idempotent, it
  rewrites every row exactly once regardless of who opens the app or when, and — the decisive
  property — the mapping logic **disappears** after it runs. There is no translation layer
  left behind to maintain.

### Deleted the dead per-sheet style branches instead of updating them

`AddGoalSheet` and `EditGoalSheet` each carried a local if/else chain that computed
`bgLight` / `barColor` / `accentText` / `icon` from the category. Those computed fields are
**never persisted and never read back** — `mapFundFromDb` re-derives styling from
`getFundStyle(category)` on every load, making `getFundStyle` the single source of truth.
The branches were therefore already no-ops.

Updating them to the new 8 categories was the tempting minimal move, but it would have
recreated an 8-way style map in **three** places that must be kept in lockstep and
inevitably drifts. Deleting them removes the drift surface entirely and leaves one place
that decides goal styling. This is a deliberate deletion, not an omission.

### No DB CHECK constraint or enum on `category` — deferred, not bundled

A constraint (or Postgres enum) locking `category` to the valid set would stop future
free-text drift at the source. It was **consciously left out**:

- It expands scope sharply — every insert path would have to guarantee an exact-match value,
  or writes start failing in production.
- It is harder to evolve: adding a 9th category later would need its own migration to drop
  and re-add the constraint/enum.
- Categories have **deliberately been free-text** in this project.

Logged here as a genuine **future hardening option**, explicitly not part of this change.

### No reverse migration — snapshot is the rollback

Because the two merges rewrite distinct old values into one new value, the original per-row
category **cannot be recovered** from the data after the `UPDATE` runs (a row now reading
`Debt & Finance` could have been either `Debt Payoff` or `Interest Free Payment`). A reverse
migration was therefore **not written**, because it could not be correct. The real rollback
mechanism is a **point-in-time database snapshot taken immediately before running the
migration**. Recorded so a future reader doesn't go looking for a down-migration that was
intentionally never created.

## Shared-database sequencing (migrate-before-merge)

There is **one Supabase project** — preview and production share it — so running the SQL
mutates live data for **both** environments at once. This ruled out the usual "migrate on
merge" flow and forced an explicit ordering decision.

Chosen sequence: push the branch → run the migration behind an explicit lead go-ahead gate
(only after a snapshot is confirmed) → test the preview deployment against the
already-migrated data → merge. The cost of this ordering is a short, **non-destructive
interim window**: production is still running the old code but now sees migrated goals, so
those goals render in the grey default style (old code doesn't recognise the new labels)
until the merge lands.

That interim was accepted deliberately. The alternative — running the migration and merging
back-to-back to shrink the grey window — would have meant validating the new styling
*after* it was already live in production instead of on preview first. Validating styling on
preview against real migrated data was judged the more important safety property than
minimising a cosmetic, non-destructive grey window.

## Style and label decisions (lead's calls)

- **Default new-goal category is now `Savings`.** The old default, `Emergency Fund`, no
  longer exists verbatim, so the default *had* to change. `Savings` was chosen as a neutral
  starting point that also surfaces one of the new categories to the user.
- **`Debt & Finance` inherits rose + `CreditCard`** — the "debt" reading of the merged
  category. This freed the `PiggyBank` icon, which was reassigned to the new `Savings`
  category.

## Deviation hit during implementation

Removing the four style fields from the goal sheets' `goalData` object broke the
`addFund(fund: Fund)` type: the `Fund` interface requires `bgLight` / `barColor` /
`accentText` / `icon`, which the sheets no longer supply. Rather than reinstate dead fields
just to satisfy the type, `addFund`'s parameter was **relaxed to
`Omit<Fund, "bgLight" | "barColor" | "accentText" | "icon">`** (both the interface and the
function signature).

This is safe: `addFund` never reads those four fields — it sends only name, category,
amounts, deadline, and status to the database, and styling is re-derived on read via
`getFundStyle`. `AddGoalSheet` is the only external caller. Recorded as a deviation because
it wasn't an enumerated plan step and it changes a **shared context type**, so a future
reader touching `AppContext` sees why the signature intentionally omits those fields.

## Scope boundary — untouched by design

The `INITIAL_FUNDS` mock/seed constants in `AppContext` use ad-hoc demo category strings
(`"Travel"`, `"Safety Net"`, `"Transport"`) that never matched **even the old** scheme.
They were **left untouched**: they are demo seed data, never persisted, and correcting them
would be scope creep with no user-facing effect.

## Glossary

Assessed and not modified. The new category names (`Home & Living`, `Debt & Finance`,
`Vacation & Travel`, etc.) are self-explanatory UI labels, not load-bearing domain
vocabulary — `docs/GLOSSARY.md` scopes itself to project-specific terms and explicitly
excludes generic labels, so nothing here meets that bar.
