# Bills page: editorial (1b) conversion — de-boxed rows, chip avatar, hairline filters

- **Part of:** Epic #65 (app-wide editorial design overhaul) — Bills-only preview drop
- **Related:** #67 (modal 1d conversion, sequenced after this), #52 (theme audit)
- **Supersedes (visually):** #54 (BillCard avatar density), #53 (Bills filter styling)
- **Status:** Accepted
- **Date:** 2026-07-19

## Context

Third page converted to the editorial system after Settings and Dashboard. The epic's target
for Bills is "weekly total, filter row, grouped hairline bill rows." Behaviour, data, filters,
category ordering, minimise state, and every modal are unchanged — this is presentation only.
The work reuses the primitives already shipped in Phase A (the editorial section-header idiom
and the hairline-row idiom the Dashboard's `UpcomingBillsCard` established), rather than
introducing anything Bills-specific.

## Decisions and why

### 1. Assignee avatar: 56px card avatar → 28px row chip (supersedes #54)

Decision doc #54 deliberately set a dense 56px (`h-14 w-14`) square assignee avatar on the
boxed `BillCard`. The editorial system replaces the box with a flat hairline row, and a 56px
avatar in a hairline row reads as heavy and inconsistent with the avatar-less Dashboard rows.

Anthony was given the explicit choice between **shrinking to a ~28px chip** and **dropping the
avatar entirely** to match Dashboard. He chose to keep it as a chip: on Bills specifically, the
"who owns this bill" cue earns its place, which the Dashboard's summary rows don't need. So #54's
*density* decision is intentionally reversed here while its *intent* (assignee-at-a-glance) is
preserved at row scale. This is not a regression of #54 — it's the same goal re-expressed for the
new layout.

### 2. Filter controls: boxed selects → hairline underline (supersedes #53's surface styling)

The three filter selects and the search field were full `rounded-xl` bordered boxes. The
editorial system's whole premise is removing bordered surfaces, so they became bottom-hairline
(`border-b border-border`, transparent background) controls. **Nothing functional changed** —
same four controls, same options, same filtering. #53's *floating/position* work is untouched;
only the box styling is superseded.

### 3. Dropped the redundant "Bills List" heading

The old layout had a small "Bills List" heading above the groups. With each category now
carrying an editorial section-header (Syne title + lime fade-rule), a parent "Bills List" label
is visual noise and would stack a second lime rule against the category rules. It was removed and
the page-level "Edit Order" action kept as a slim right-aligned control. The weekly-total figure
already serves as the page anchor, so nothing is lost.

## Alternatives considered and rejected

- **Force the shared `SectionHeader` component onto category headers.** `SectionHeader` is a
  non-interactive `div`; category headers must be a toggle button with a chevron. Rather than
  wrap/fork the component, the category header inlines the same editorial idiom (Syne + lime
  rule + mono count) exactly as `UpcomingBillsCard` already does for its collapsible header —
  keeping one proven pattern instead of two divergent ones.
- **Convert Bills + Payday + Goals in one drop.** Rejected in favour of Bills-only so Anthony can
  test each page on the preview before the next lands (his stated "check one, then continue"
  rhythm).

## Not done here (deliberately)

- Modal/sheet `1d` conversion (AddBillSheet, BillDetailSheet, EditCategoryOrderModal) — those
  belong to #67 and are sequenced after all main-page conversions. The Bills page still opens the
  existing modals unchanged.
