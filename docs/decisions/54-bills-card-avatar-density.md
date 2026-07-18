# Bill cards: square assignee avatar (with image) + reduced negative space

- **Closes:** #54 (Bills cards: square assignee avatar + reduce card negative space)
- **Related:** #53 (Bills floating filter controls) — sibling BillCard/Bills-surface polish
- **Status:** Accepted
- **Date:** 2026-07-18

## Context

Two BillCard refinements were logged as one issue because both are visual polish on the
same surface (`src/components/BillCard.tsx`). Part A brings the per-card assignee chip into
line with the rest of the app's avatar treatment; Part B tightens the card's density so
more bills fit on screen. The diff (16 insertions / 7 deletions, class strings plus one
`<img>` fallback) is self-evident from the source. This entry records the choices behind it
— chiefly the density direction that was chosen and the two that were rejected.

## Decisions and why

### Part A: reuse the app's existing avatar pattern rather than invent a chip

`AvatarDropdown.tsx` already had the correct behaviour (`rounded-xl overflow-hidden`,
`avatar_url` → `<img object-cover>`, else initial). The card chip only needed to adopt the
same shape and image-with-initial-fallback. Deliberately **not** copied: the profile
avatar's green border + gradient fill. The card's assignee is a quiet indicator, not a
focal point — giving it the profile avatar's treatment would make it compete with the
card's own name/amount. So it keeps its existing small neutral styling (`bg-surface-elevated`,
`border-border`) and only the shape and image rendering changed.

### Part B: "moderate tighten" chosen over denser 2-row and 1-row layouts

The issue asked for 2–3 density options at Plan Agreement. Three were presented:

1. **Moderate tighten** (chosen) — keep the familiar 3-row vertical card; reduce padding,
   gaps, and amount size, and slim the footer.
2. **Compact 2-row** — name + badge + amount on one line, DUE + assignee below.
3. **List-row** — a single horizontal table-like row.

Anthony chose option 1. The reasoning worth recording: options 2 and 3 buy more density but
change what a bill card *is* — the amount stops being the billboard anchor and the card
starts reading as a data table row. Option 1 gets a meaningful density win (~30% shorter)
purely by removing dead space, while every element keeps its current role and position, so
the change is low-risk and doesn't force a mental-model shift for the user. The denser
options remain on the table if a future pass wants them, but were explicitly **not** built.

### The "tap for more" affordance was kept, just de-emphasised

The footer's top divider + `text-[10px] text-primary/70` label was the single largest block
of dead space, and the issue named it as the biggest lever. It was tempting to delete the
footer outright. Rejected — the issue is explicit that the affordance must stay. So the
divider was dropped (it was the space cost, not the affordance) and the label shrank to
`text-[9px] text-muted/60` with a `›` chevron. The chevron carries the "there's more"
signal that the removed border used to imply, so discoverability survives the slim-down.

## Alternatives considered and rejected

- **Give the card avatar the profile avatar's full treatment** (green border + gradient).
  Rejected — it would make a secondary indicator compete with the card's primary content.
- **Compact 2-row / List-row density** (options 2 and 3). Rejected at Plan Agreement —
  bigger density gain but changes the card's identity and the amount's role; higher risk for
  this polish pass. Held in reserve, not implemented.
- **Delete the "tap for more" footer entirely.** Rejected — the issue requires the affordance
  to remain; only its dead space (the divider) was removed.

## Implementation notes

Single-file presentational change; no logic, data, or state touched. The `<img>` uses the
same `object-cover` guard as `AvatarDropdown`, so an assignee with no `avatar_url` still
falls back to the initial exactly as before. No deviations from the agreed plan. No new
domain terms, so `docs/GLOSSARY.md` was not modified.
