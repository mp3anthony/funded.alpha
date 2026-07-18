# Upcoming Pays: one unified card, not a grid of per-contributor cards

- **Closes:** #26 (Consolidated Upcoming Pay Cards)
- **Parent epic:** #18 (Payday Page UI/UX Overhaul)
- **Status:** Accepted
- **Date:** 2026-07-18

## Context

The `/payday` page's "Upcoming Pays" section rendered each contributor as its own card in a
2-column grid. On a phone the cells stay narrow, so names and amounts truncate, and there is
no single glance that shows the whole household at once. #26 consolidates the section into one
unified card with a stacked row per contributor, and removes the redundant static "Next:
[date]" label so the "Ready to Log" / "in X days" countdown badge is the sole date indicator.

The diff (`src/app/payday/payday-client.tsx`, one file) is a presentational restructure and
mostly self-evident from the source. This entry records the decisions that the code can't
explain — chiefly the layouts we rejected and the sort we deliberately kept client-side.

## Decisions and why

### Sort client-side, not by adding `.order()` to the query

Schedules arrive unordered from the shared AppContext Supabase query. Rather than add an
`.order('next_pay_date')` to that query, the rows are sorted in the component
(`sortedSchedules` useMemo). Two reasons: the query is **shared by other consumers**, so
changing its ordering to serve one page's display risks a side effect elsewhere; and the sort
is trivially cheap for the realistic 1–4 contributors, so pushing it to the database buys
nothing while widening the blast radius. Keeping it in the component confined the whole change
to one file.

The comparison is a **`YYYY-MM-DD` string compare, not `Date` parsing**, and that was
deliberate — not laziness. Lexical order on a zero-padded ISO date is identical to chronological
order, so it is exact, and it stays hydration-safe: it introduces no `new Date()` /
locale/timezone dependency that could differ between the server render and the client, keeping
it independent of the SSR-stable `today` guard used for the countdown. Ties (same date) are
broken by member name so the order is stable rather than arbitrary.

### "Ready to Log" ordering is emergent, not a second grouping pass

Due and overdue schedules have the smallest `next_pay_date` values, so an ascending sort floats
them to the top on its own. We deliberately did **not** add a separate grouping layer to hoist
"ready" items — it would be redundant machinery producing an ordering the sort already
guarantees.

### Each row is a clickable `div` (`role="button"`), not a `<button>`

BillCard was borrowed as the **visual** template, but BillCard wraps its whole card in an outer
`<button>`. Our row contains inner interactive controls (a delete action and a Log-Pay action),
and a `<button>` nested inside another `<button>` is invalid HTML. So the row keeps the existing
clickable-`div` + `stopPropagation` idiom already used elsewhere, taking BillCard's look but not
its element structure. (See the rejected "reuse BillCard directly" option below.)

### "Variable" amount rendered in muted grey, not the emphasis colour

For schedules with a variable amount the row shows the word "Variable" in muted grey rather than
the primary/emphasis colour. Owner-approved: the emphasis colour is reserved for real dollar
figures, so "Variable" reads as a status word and not as a value someone might mistake for an
amount.

## Alternatives considered and rejected

- **Carousel of individual cards.** Rejected by the product owner — horizontal swiping hides
  contributors off-screen, which directly defeats the "see everyone at once" goal that motivated
  the consolidation.
- **Keep the 2-column grid but merge the outer borders into one card.** Rejected — the cells stay
  narrow, so names and amounts still truncate. It looks tidier but doesn't solve the legibility
  problem the issue is actually about.
- **Table / columnar layout (name | frequency | amount | countdown).** Rejected — rigid columns
  overflow on a ~360px phone, forcing either tiny text or horizontal scroll, against the repo's
  mobile-first viewport invariants. A stacked row flexes to the content instead.
- **Reuse `BillCard.tsx` directly.** Rejected — it is bound to the Bill / BillSplit data types
  and its own detail sheets, and its single outer `<button>` cannot legally wrap the delete and
  Log-Pay controls this row needs (see the row-element decision above). We borrowed the visual
  pattern and implemented it inline rather than bending BillCard to a different data shape.
- **Extract a shared avatar/card component.** Deliberately **not** done, even though the
  img-or-initials avatar pattern is now duplicated across `payday-client` and `BillCard`. #26 is
  a UI-consolidation issue for one section, not the place for a cross-cutting refactor; unifying
  the avatar/card pattern is a known, worthwhile follow-up kept out of scope here. (This echoes
  the same "no shared collapsible component yet" deferral recorded for #38 — the app is
  accumulating a few of these bespoke-pattern duplications on purpose, to be unified in their own
  issue rather than piecemeal.)

## Implementation notes

No material deviations from plan. Two minor cosmetic/dead bits were dropped as part of the
restructure: the old badge's `tracking-wider` letter-spacing, and a no-op
`frequency === 'fortnightly'` ternary that resolved to the same output on both branches.

Known follow-up candidate, **not actioned here**: `AlertCircle` and `User` remain imported in
`payday-client.tsx` and may be pre-existing unused imports. They were out of scope for #26 and
left untouched — flagged so a later cleanup (or an import-hygiene pass) can confirm and remove
them rather than having them disappear silently inside this change.

No new domain terms were introduced, so `docs/GLOSSARY.md` was not modified — "Upcoming Pays",
"Ready to Log", and "contributor" are existing UI labels, not new concepts.
