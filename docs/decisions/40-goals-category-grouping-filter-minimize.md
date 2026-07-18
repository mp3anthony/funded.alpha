# Goals mirrors the Bills inline pattern — the "shared component" it was told to reuse never existed

- **Closes:** #40 (Goals: Category Grouping, Filter & Minimize)
- **Status:** Accepted
- **Date:** 2026-07-18

## Context

The `/funds` (Savings Goals) page gained category grouping with collapsible headers, a
category filter dropdown, and an "Edit Order" button — bringing it in line with the Bills
page. The work was done inline in a single file, `src/app/funds/funds-client.tsx`, reusing
the existing `EditCategoryOrderModal`. Category order persists in a new `goalCategoryOrder`
localStorage key; collapse (open/closed) state is ephemeral.

The presentational parts of this diff are self-evident and mirror Bills closely. What this
entry records is the reasoning the code can't show — chiefly a **false premise in the issue
text** that investigation had to correct, and four alternatives that were consciously
rejected.

## The corrected premise (read this first)

Issue #40 was written instructing us to "reuse the shared minimize/collapse component from
#38." Investigation found this is **not possible as stated, because the thing it names does
not exist**: #38 never built a shared minimize component. Its own decision log
(`38-bills-single-minimize.md`) explicitly records that Bills, the Goals cards, and Payday
each roll their **own bespoke collapse**, and that unifying them was deliberately kept out
of scope. #38 shipped a *pattern* embodied as inline markup inside `bills-client.tsx` — not
an importable, shared module.

This is the same correction #25 had to make against the same false premise (see
`25-recent-pay-history-filter-minimize.md`). Recorded again here so a future reader doesn't
go hunting for a `<Collapsible>` / minimize component that was never written — there is no
such file to import.

"Reuse," then, could only mean **mirror the Bills inline pattern** into `funds-client.tsx`,
keeping each page's collapse independent as they already are. That is what was done.

## Alternatives considered and rejected

### Extract a shared collapse/grouping component (Bills + Payday + Goals) — deferred

Bills, Payday, and now Goals all repeat the same inline chevron/grouping shape, so
extracting one component is the obvious-looking move. Rejected **for now**, as premature
abstraction. Each page has a **different card body** (BillCard vs the inline goal card vs
Payday's member rows) and a **different grid shape**; a shared component would have to
parameterise card rendering, grid classes, sort logic, and filter shape — more surface area
and more coupling than three inline copies carry today. Worse, building it mid-rollout means
touching two already-shipped pages (Bills, Payday) to retrofit them onto an unproven API,
risking regressions in shipped surfaces to remove duplication that isn't hurting anyone yet.

The extraction is a **genuine, known opportunity, explicitly deferred — not forgotten**. It
belongs in its own dedicated refactor once all three pages are stable and the shared shape
has actually proven itself across them, and would need its own issue and owner sign-off.
This is the same conscious duplication already recorded in #38 and #25.

### Persist collapse (open/closed) state — rejected

Collapse state is kept **ephemeral**, matching Bills and Payday. Persisting it would need
another localStorage key plus reconciliation logic as categories appear and disappear when
goals are added, removed, or recategorised — real complexity for a benefit nobody asked for.
Category *order* persists (it's a deliberate user arrangement worth remembering); which
groups happen to be folded right now is not.

### Share Bills' `billCategoryOrder` localStorage key — rejected

A new `goalCategoryOrder` key was added rather than reusing Bills' existing
`billCategoryOrder`. Goal categories and bill categories are **disjoint vocabularies**. A
shared key would cross-contaminate both order lists — a reorder on the Goals page would
reshuffle the Bills page and vice versa, and each page would carry order entries for
categories it never displays. Independent keys keep the two arrangements from interfering.

### Fix `EditCategoryOrderModal`'s hardcoded `bg-[#111]` — deliberately NOT fixed here

The reused `EditCategoryOrderModal` contains a theme-token violation: a hardcoded
`bg-[#111]` that renders a fixed near-black panel regardless of light/dark theme. It was
**left untouched**. That fix is owned by the separate **#52 theme audit**; correcting it
here would expand #40's scope and risk a merge conflict with #52's dedicated change. The
modal is consumed as-is.

**Sequencing consequence, stated so it isn't a surprise:** if #40 merges before #52, the
Goals reorder modal carries this theme bug until #52 lands. This is an accepted, temporary
state — not an oversight.

## Deviation from a literal Bills copy

One intentional divergence worth recording. On Bills, the category filter lives inside a
**shared 3-column filter grid** alongside the Due Date and Amounts-As filters. Goals has no
other filters, so replicating a 3-column grid for a single control would leave two empty
columns. The Category `<select>` was instead placed in its own **full-width block** in the
Savings Goals section header. **Same select markup and classes** as Bills — only the
container differs. Minor, but it's the one place the Goals implementation intentionally
departs from a literal copy of the Bills layout.

## Glossary

No new domain terms were introduced. "Category grouping," "minimize/collapse," and
"category order" are already in use from the Bills (#38) and Payday (#25) work — existing UI
patterns, not new concepts — so `docs/GLOSSARY.md` was not modified.
