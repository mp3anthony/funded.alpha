# Bill cards: square assignee avatar (with image + green border) + compact layout

- **Closes:** #54 (Bills cards: square assignee avatar + reduce card negative space)
- **Related:** #53 (Bills floating filter controls) — sibling BillCard/Bills-surface polish
- **Status:** Accepted
- **Date:** 2026-07-18

## Context

Two BillCard refinements were logged as one issue because both are visual polish on the
same surface (`src/components/BillCard.tsx`). Part A brings the per-card assignee chip into
line with the rest of the app's avatar treatment; Part B tightens the card's density so
more bills fit on screen.

The layout that shipped is denser than the plan first agreed. Implementation happened in two
rounds: a first "moderate tighten" pass, then — after Anthony tested the Vercel preview and
sent annotated screenshots — a second pass that restructured the card into a compact 3-row
layout and reversed two of the original issue's stated decisions. This entry records those
choices and reversals, since the diff alone won't explain why the final state contradicts
the issue text.

## Decisions and why

### Part A: reuse the app's existing avatar pattern, then adopt its green border too

`AvatarDropdown.tsx` already had the correct behaviour (rounded-square, `avatar_url` →
`<img object-cover>`, else initial). The card chip adopted the same shape and
image-with-initial-fallback.

**Reversal 1 — the "neutral chip, no green border" decision was dropped.** The issue was
explicit that the chip should stay a small *neutral* indicator with no green border or
gradient, so it wouldn't compete with the card. In the preview Anthony judged the opposite:
the neutral chip read as disconnected from the rest of the app, and he asked for the profile
avatar's green border. So the chip now uses `border-2 border-primary` (matching
`AvatarDropdown`). The gradient fill was *not* copied — only the border — so the image still
reads as itself, just framed. This is a deliberate override of the issue text on sight, not
an oversight.

Separately, the corner radius was reduced from `rounded-xl` to `rounded-lg`. At the chip's
28px size a `rounded-xl` (12px) radius is so close to half the width that it renders as a
circle; `rounded-lg` (8px) is the point where it reads clearly as a rounded square.

### Part B: shipped as a compact 3-row layout, not the "moderate tighten" first agreed

Three density options were offered at Plan Agreement; Anthony first chose the conservative
"moderate tighten" (keep the 3-row vertical card, just less air). That was built and
deployed to preview.

**Reversal 2 — the preview showed there was much more dead space to reclaim,** and Anthony's
annotated screenshots (a PS edit blocking out the empty band in red) asked to collapse it.
The final layout relocates elements rather than just shrinking them:

- **Amount** moves up onto the **top row**, right-aligned beside the name (its own middle row
  is gone).
- **AUTO/MANUAL badge** moves **down** from the top-right to the **bottom row**, centre.
- **"Tap for more ›"** moves out of its own full-width footer band and becomes an inline item
  at the **bottom-right** of that same row.
- **Assignee avatar** sits on its own right-aligned line between the two text rows, where
  Anthony placed it.

Net: four stacked bands → three tight rows, removing both the standalone amount row and the
footer band. This is effectively the "compact 2-row" option that was rejected at Plan
Agreement — the rejection held only until the preview made the wasted space visible.

### Notes removed from the card entirely

Previously the card rendered `bill.notes` under the due date. Anthony asked for notes to
appear **only** in the tap-for-more detail sheet, keeping the list itself clean. Safe to
remove: `BillDetailSheet.tsx` already renders `bill.notes` in its own section, so nothing is
lost — the card simply stops duplicating it.

## Alternatives considered and rejected

- **Give the card avatar the profile avatar's full treatment** (green border *and* gradient
  fill). Rejected — the gradient would fight the uploaded image; only the border was taken.
- **Keep the chip neutral with no green border** (the issue's original instruction). Reversed
  on preview — read as disconnected from the app; see Reversal 1.
- **Stop at "moderate tighten."** Reversed on preview — left an obvious empty band; see
  Reversal 2.
- **List-row (single horizontal line) layout.** Still not taken — the amount stays a
  prominent top-right anchor rather than shrinking into a table cell.
- **Keep notes on the card.** Rejected at Anthony's request — detail sheet already shows
  them; the list stays scannable without them.

## Implementation notes

Single-file presentational change; no logic, data, or state touched. The `<img>` uses the
same `object-cover` guard as `AvatarDropdown`, so an assignee with no `avatar_url` still
falls back to the initial. The due-date span carries `min-w-0 truncate` so a long formatted
date shrinks gracefully rather than shoving the badge and tap affordance off the row. No new
domain terms, so `docs/GLOSSARY.md` was not modified.
