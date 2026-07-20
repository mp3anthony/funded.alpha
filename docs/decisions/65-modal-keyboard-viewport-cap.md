# Modal height cap: visual viewport, not `dvh`

Tall modal forms (Add/Edit Bill, Add/Edit Goal) were clipped at both the status
bar and the keyboard on iOS, with the scrollable body never engaging.

## Why this was not a regression from the editorial overhaul

Worth recording because the timing was misleading. The `max-height: 85dvh` cap
landed on 2026-07-05 in `3f9ceb7`, well before the editorial work; commit
`8746963` only changed the `border-radius` on that same rule. The overhaul made
the fault *visible* rather than causing it — it converted the tallest forms in
the app onto the shared shell, and those are the only ones long enough to exceed
the keyboard-shrunk viewport. Anyone bisecting from the bug report alone would
land on the overhaul and be wrong.

The deeper reason it went unnoticed for two weeks: the backdrop was *already*
correct. `useVisualViewportVars` and the `--visual-viewport-height` plumbing all
worked. Only the card's own cap was measured against the wrong box, so the bug
required a form tall enough to hit its cap before anything looked wrong.

## Alternatives rejected

**Shrink the cap (`85dvh` → `50dvh`).** Guesses at a keyboard height that varies
by device, locale, and whether the autofill/predictive bar is showing. It also
penalises the no-keyboard case, where a modal that could use the full screen
would be needlessly letterboxed.

**Scroll the focused input into view on `focus`.** Treats the symptom. The card
would still overflow the backdrop, so the header and footer — including Save —
stay off-screen; only the caret would be rescued. It also fights iOS's own
scroll-into-view behaviour, which is a known source of jitter.

**Make the backdrop `align-items: flex-start` so overflow only spills downward.**
Fixes the top clipping but not the bottom, and gives up the centred-card look
the `1d` template is built around.

**Give `Dialog` a keyboard-aware inline `max-height` in JS.** Duplicates in
React what the CSS custom property already expresses, and adds a second source
of truth that can drift from the backdrop's own sizing.

## Why `max-h-full`

The chosen fix removes a measurement rather than adding one. The backdrop is
already sized to the visual viewport, so capping the card at 100% of its parent
inherits keyboard-awareness for free, on every device, with no JS and no
device-specific constants. `dvh` cannot do this by definition: it tracks the
layout viewport, which iOS deliberately leaves unchanged when the keyboard
opens so that `position: fixed` page furniture doesn't jump.

This is a trap that invites re-breaking — `max-h-full` reads as a weaker,
sloppier cap than `max-h-[92dvh]` and looks like a tidy-up target. Both the
`Dialog` header comment and the `globals.css` rule carry a note explaining the
dependency, because the correctness of `100%` here is entirely a property of the
parent and is invisible at the call site.

## Second cause, found on retest: safe-area insets

The height fix alone left the card's top edge behind the status bar — visible
even with no keyboard, which is what gave the second cause away. Two faults had
been sharing one symptom, and the first fix removed the louder half.

`viewportFit: 'cover'` (`layout.tsx`) runs the viewport under the status bar and
home indicator. `AppShell` compensates throughout — header, scroll container,
bottom nav all carry `env(safe-area-inset-*)`. But modal backdrops **portal to
`document.body`** to dodge the iOS `position: fixed`-inside-`overflow: hidden`
bug (AGENTS.md invariant #2), which puts them outside `AppShell` entirely, so
they inherit none of it. The backdrop's flat `padding: 16px` therefore measured
from the physical screen edge and parked the centred card under the status bar.

This is the standing cost of that portal: **anything portalled to `body` must
handle its own safe areas.** Worth checking first whenever a portalled surface
looks slightly too high or too low.

The insets go on the **base** rule, not the mobile media query, so notched
tablets and landscape (where left/right insets are non-zero) are covered too.
The media query no longer declares `padding` at all — a flat shorthand there
would silently reset all four insets, so a comment marks the omission as
deliberate.

## Scope

No other modal declares its own height cap, so `Dialog` plus the one
`globals.css` rule covers every modal in the app. Android/Chromium implements
`visualViewport` with the same semantics and needs no separate handling; it went
untested this round by agreement, not because it was thought unaffected.
