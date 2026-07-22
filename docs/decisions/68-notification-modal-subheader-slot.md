# NotificationCenter tabs: a non-scrolling `subheader` slot, not a sticky-in-scroll hack

- **Fixes:** #68 (summary row + first notification hidden under the Inbox/Settings tab bar)
- **Follows:** #67 (modal kit editorial migration onto the shared `<Dialog>`)
- **Status:** Accepted
- **Date:** 2026-07-21

## Context

Before the editorial overhaul, NotificationCenter's Inbox/Settings tab bar sat
*outside* the scrolling notification list — pinned tabs above, a list that scrolled
under them. #67 migrated the modal onto the shared `<Dialog>` and, in doing so, the
tab bar was moved *inside* the Dialog's padded scroll body as a `sticky top-0`
element, bled edge-to-edge with a `-m-5` negative margin to cancel the body padding.

That combination interacts badly with a rule in `globals.css` that keys off the
last child of a modal card
(`.modal-backdrop > div:not(.absolute) > div:last-child`). In a modal *with* a
footer, that `:last-child` is the footer. In the two footerless modals it lands on
the scroll body instead and forces its top-padding to 12px. The sticky tab bar's
`-m-5` (−20px) then over-pulls against that enforced 12px, dragging roughly 8px of
content — the summary row and the first notification — above `scrollTop: 0`, where
the pinned tab bar covers it. On iOS the overscroll bounce snapped it back out of
reach on release, so the hidden content couldn't even be dragged into view.

This is why the fault only ever showed on NotificationCenter and Onboarding: they
are the app's only two footerless modals, the only place that globals `:last-child`
rule lands on a scroll body rather than a footer.

## Decision

Give `<Dialog>` an optional **non-scrolling `subheader` slot** rendered between the
header and the scroll body, and move the tab bar into it. The `-m-5` and `sticky`
hacks are deleted. The tab bar is no longer part of the scroll flow at all, so
there is nothing for the enforced 12px padding to fight, and nothing for overscroll
to bounce. This restores the modal's pre-overhaul shape — pinned tabs, scrolling
list — through a real structural slot instead of simulating "pinned" from inside
the scroll container.

## Alternatives considered and rejected

**Match the negative margin to the enforced padding (`-m-5` → `-mt-3` or similar).**
Makes the numbers cancel today, but hard-codes a magic offset tied to a value that
lives in a globals `!important` override the component can't see. Any future tweak
to that padding silently re-breaks the modal, and the fix keeps the tabs in the
scroll flow, so the iOS overscroll bounce survives. Fixing the arithmetic without
fixing the *structure* leaves the trap armed.

**Re-scope the globals footer rule to an explicit `.modal-footer` class.** This is
the genuine root fix — the `:last-child` selector is mis-scoped; it *means* "the
footer" but *matches* "whatever is last", which is why it misfires on the two
footerless modals. Rescoping it to a real `.modal-footer` class would fix #68 as a
side effect and remove the latent hazard. It was rejected here purely on blast
radius: that rule currently lands on all 21 modal cards — the footer in 19 of them,
the body in the 2 footerless ones — so re-scoping it forces a visual re-check of 19
footer'd modals to correct behaviour on one. Disproportionate for this issue.
**Recommended as a separate housekeeping ticket:** the globals rule is mis-scoped
and remains a latent — now harmless, cosmetic-only — 12px-vs-20px top-padding
difference on the two footerless modals (NotificationCenter, Onboarding). With #68's
structural fix in place it no longer hides content, so it can wait for a deliberate
pass that re-checks all 19 footer'd modals together.

**Offset patch on the sticky bar (nudge it down by a fixed amount).** Same class of
magic-number band-aid as the margin match: brittle across padding and
font-scaling changes, keeps the overscroll bounce, and does nothing about the real
question of *why the tabs were in the scroll flow in the first place*.

## iOS/WebKit invariant checked, not implicated

AGENTS.md invariant #2 (never nest `position: fixed` inside `overflow: hidden`,
which iOS WebKit mis-treats as `absolute`) was reviewed because this is a
scroll/pin bug on a modal. It does **not** apply: the tab bar was a legitimate
`position: sticky` element inside its own scroll container, not a `fixed` element
trapped in an `overflow: hidden` wrapper. The bug was CSS-arithmetic (a negative
margin over-pulling against an enforced padding), not the WebKit fixed-positioning
quirk.
