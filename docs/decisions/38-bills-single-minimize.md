# One minimize control on Bills, not two

- **Closes:** #38 (Bills page has two overlapping minimize controls)
- **Parent epic:** #17 (Bills Page UI/UX Overhaul) — this is the last of its four children
- **Status:** Accepted
- **Date:** 2026-07-18

## Context

`/bills` shipped with two independent ways to shrink the page: a per-category chevron
collapse (`expandedCategories` / `toggleCategory`) and a page-level "Minimize All /
Expand All" density toggle that swapped every card into a compact rendering path. Two
overlapping controls governing the same visible surface made the page's state confusing —
a card could be "collapsed" under a folded category *and* "compact" at the same time, with
no single source of truth for what the user was actually looking at.

#38 removes the density toggle and the entire compact-card path, leaving per-category
collapse as the sole visibility control. This entry records *why* the density toggle was
the one that went, and what was deliberately left for later. It does not restate the diff.

## Why remove the density toggle rather than the category collapse

The two controls are not equals. Category collapse is the more capable mechanism:

- it operates **per group**, so the user can fold what they don't care about and keep the
  rest in full detail — the density toggle was all-or-nothing;
- its state **persists** via the billId-seeding effects and it integrates with Edit Order;
- compact cards **hid information** the full card shows — due date, assignee, and the
  payment badge.

Keeping compact and dropping category collapse would therefore have been a downgrade: a
weaker, lossier control replacing a stronger one. Once that asymmetry is named, the removal
direction is forced.

This also closes out the epic's premise cleanly. #38 relates to the category-taxonomy work
(#22, since closed keeping the existing taxonomy): the reasoning is that once categories
are clean and meaningful, per-category collapse alone is enough to manage screen space —
which is precisely what made the redundant density toggle safe to delete rather than
merely relabel.

## Alternatives considered and rejected

- **Keep both mechanisms and just relabel them.** Rejected. The issue's whole premise is
  that two overlapping minimize controls muddy the page's state; renaming buttons preserves
  the duplication and fixes nothing.
- **Keep compact cards, drop category collapse instead.** Rejected for the capability
  asymmetry above — it swaps the stronger control for the weaker, information-hiding one.
- **Leave `isCompact` on `BillCard` as a dead-but-defaulted prop and remove only the page
  toggle.** Rejected. That leaves a misleading public interface (a prop that looks
  supported but is never exercised) and dead ternary branches inside the card. `BillCard`
  has exactly one caller, so full removal is safe and honest — nothing external depends on
  the compact contract.

## Cross-cutting observation, deliberately deferred

There is currently **no shared minimize/collapse component** in the app: Bills, the Goals
cards, and Payday each roll their own bespoke collapse pattern. #38 does **not** attempt to
unify them — a "shared collapsible" refactor is a known, worthwhile opportunity but was
kept explicitly out of scope here. Recorded so the next person understands the continued
duplication across those three surfaces is a conscious deferral, not an oversight, and a
natural candidate for its own issue.

## Implementation notes

Removal-only change (~18 lines net). No meaningful deviations. The only extra touch beyond
deleting the toggle and the compact path was updating two stale code comments that still
referenced the "compact view." No imports were dropped — `useState` / React are still
needed by the surviving category-collapse state.
