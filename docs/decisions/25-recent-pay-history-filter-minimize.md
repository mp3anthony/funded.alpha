# Recent Pay History: mirror the Bills inline pattern, don't build the shared component #38 deferred

- **Closes:** #25 (Recent Pay History: Filter and Minimize)
- **Parent epic:** #18 (Payday Page UI/UX Overhaul) — second after #26
- **Status:** Accepted
- **Date:** 2026-07-18

## Context

The `/payday` page's "Recent Pay History" section gained a contributor filter and a
restyled minimize, and its avatars were brought in line with the app-wide leading-tile
pattern. One file changed: `src/app/payday/payday-client.tsx`.

The presentational parts of the diff are self-evident. What this entry records is the
reasoning the code can't show — chiefly a **false premise in the issue text** that
investigation had to correct before any work began, plus the data-flow decisions that
keep the filter and the collapse from fighting each other.

## The corrected premise (read this first)

Issue #25 was written instructing us to "reuse the shared minimize component from #38 and
the filter styling from #53." Investigation found this was **not possible as stated,
because the thing it names does not exist**: #38 never built a shared minimize component.
Its own decision log (`38-bills-single-minimize.md`) explicitly records that Bills, Goals,
and Payday each roll their **own bespoke collapse**, and that unifying them was deliberately
kept out of scope. Both #38's category collapse and #53's filter shipped as **inline markup
inside `bills-client.tsx`** — not as importable, shared components.

So "reuse" could only resolve to one of two things:

- **(a) Mirror the Bills inline pattern** — copy the visual/structural approach into
  `payday-client.tsx`, keeping each page's collapse independent as they already are.
- **(b) Build the shared `<Collapsible>` component that #38 chose to defer** — and adopt it
  on Payday as its first consumer.

**The owner chose (a).** Introducing the shared abstraction here would make #25 secretly
carry a cross-page refactor it wasn't scoped for, and would commit us to an API design
(polarity, per-group vs page-level state, persistence) off the back of a single page's
needs — the classic premature abstraction. Mirroring keeps the change confined to one file
and one section, matching how #26 and #38 were each kept local.

A future shared collapsible across Bills / Payday / Goals / #40 remains a genuine, known
opportunity — it is **explicitly deferred, not forgotten**, and would need its own issue and
the owner's agreement before anyone builds it. This is the same conscious duplication already
recorded in #26 and #38.

## Decisions and why

### Filter first, then limit — not limit then filter

The old pipeline took `payHistory.slice(0, 10)` and *then* grouped. The new pipeline
**filters by the selected contributor first, caps at 10, then groups.** Order matters: with
limit-then-filter, a selected member would only ever show the subset of their pays that
happened to land inside the household-wide 10 most-recent rows. An infrequent earner could
select their own name and see 0–1 pays despite having a long history — the filter would look
broken. Filtering first makes "show me this person's recent pays" mean what it says.
Owner-approved. The **"All" view keeps a fast-path identical to the old behaviour**, so the
default view does not regress in output or cost.

### When a contributor is selected, the filter becomes the *sole* visibility control

Selecting a single contributor yields exactly one group. In that state we force that group
expanded and **hide the collapse chevron/toggle entirely** — the group header renders as a
static row instead of a button. Reasoning: #38 established the principle of *one clear
visibility control per page*. A per-member collapse toggle sitting next to an active
single-member filter would be a dead, no-op control and a second competing way to hide the
same rows. Per-member collapse still works normally in "All" mode, where it earns its place.

### Effective-minimized state is *computed* at render, never written by an effect

The collapsed state is derived, not stored on filter change:
`isMinimized = selectedContributor === "All" ? !!minimizedMembers[memberId] : false`.
We deliberately did **not** write `minimizedMembers` from a `useEffect` when the filter
changes. An effect would add a render pass, risk a feedback loop, and — worst — **clobber the
user's saved collapse preferences**: expanding a group to satisfy the filter would overwrite
what they'd chosen in "All" mode, so returning to "All" would show the wrong state. The
derived computation is side-effect-free and leaves stored preferences untouched.

### Dropdown options come from the full `payHistory`, not the grouped/filtered view

The contributor menu is built from the complete unfiltered history. If options were derived
from `groupedHistory` — which is already selection-filtered — then picking a member would
shrink the menu to just that member, **stranding the user with no way back to anyone else
(or to "All")**. Sourcing options upstream of the filter keeps every contributor reachable at
all times.

### Avatars enlarged to the 56px squared tile

The section's avatars moved from a 32px circle to the **56px squared leading tile** used by
Upcoming Pays (#26) and BillCard (#54). Owner-approved, purely for app-wide visual
consistency of the leading-tile pattern.

### Payday's inverted collapse polarity was kept as-is

Payday stores `minimizedMembers` with `true = collapsed`; Bills stores `expandedCategories`
with `true = shown` — opposite polarities. We **kept Payday's existing polarity** rather than
normalising to match Bills. Since the decision was to mirror *styling*, not *share code*
(see the corrected premise), there is no shared contract forcing them to agree, and flipping
a working polarity would be churn with a real risk of inverting saved state for no benefit.

## Alternatives considered and rejected

- **Build the shared `<Collapsible>` component #38 deferred, and adopt it here (option b).**
  Rejected as premature abstraction — it would smuggle a cross-page refactor into a
  single-section issue and lock an API to one page's needs. Kept as an explicit future
  opportunity needing its own issue and owner sign-off.
- **Limit-then-filter (keep the old `slice(0, 10)` position).** Rejected — a selected member
  would only show pays that fell inside the household's 10 most-recent rows, making an
  infrequent earner's filtered view look empty or broken.
- **Keep the collapse toggle visible even when a single contributor is filtered.** Rejected —
  with one group it is a no-op, and it reintroduces exactly the "two competing visibility
  controls" confusion #38 set out to remove.
- **Drive the minimized state through a `useEffect` on filter change.** Rejected — extra
  render pass, loop risk, and it would overwrite the user's saved per-member collapse
  preferences.
- **Derive the dropdown options from the grouped/filtered history.** Rejected — the menu
  would collapse to the single selected member once chosen, leaving no path back to other
  members or "All."
- **Normalise Payday's collapse polarity to match Bills.** Rejected — we're mirroring styling,
  not sharing code, so nothing requires agreement; flipping it risks inverting stored state
  for no gain.

## Implementation notes

One deviation worth recording: a local `headerContent` JSX const was extracted to hold the
shared avatar / name / count block, because the group header now renders **two ways** — as a
`<button>` in "All" mode (collapse enabled) and as a static `<div>` when a single contributor
is filtered (collapse hidden). The const avoids duplicating that block across both variants.
Purely a DRY choice; behaviour is identical either way.

Two scope boundaries, stated so they aren't mistaken for omissions:

- **`PayHistoryCard`'s own avatar was not touched.** That avatar is gated behind
  `!hideMemberInfo`, and Payday renders the card with `hideMemberInfo={true}`, so it never
  appears in this section. App-wide avatar consistency *inside* `PayHistoryCard` is a separate
  future concern, not part of #25.
- **"Floating" filter styling (from #53) means "no grey card wrapper," not `position: fixed`.**
  It is a description of the filter sitting directly on the page without a surrounding grey
  card — not a literal fixed-position element. (Relevant given the repo's fixed-element
  viewport invariants: nothing here is fixed-positioned.)

No new domain terms were introduced, so `docs/GLOSSARY.md` was not modified — "Recent Pay
History", "contributor", and "minimize" are existing UI labels, not new concepts.
