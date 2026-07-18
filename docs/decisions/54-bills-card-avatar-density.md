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

### Round 3: two-line list-row, header-aligned type, and a large leading avatar

A third preview round aligned the card with the page's own visual language and pushed it to
a true list row:

- **Amount colour → `text-primary` (green).** The card amount now matches the "Weekly Total"
  figure at the top of the page, tying the per-bill number to the running total it feeds.
- **Title font → `font-body` (Instrument Sans), was `font-heading` (Syne).** Anthony wanted
  the bill name to read like the header's "WEEKLY TOTAL"/"Bills List" labels rather than the
  playful rounded-geometric heading face. Matching the label font makes the list feel part of
  the same surface as the header.
- **AUTO/MANUAL badge removed from the card.** It now lives only in the detail sheet
  (`BillDetailSheet` already renders it). The badge was per-bill noise on a scannable list;
  payment type is a detail, not a scanning cue.
- **Collapsed to two rows with an enlarged leading avatar.** The avatar moved from its own
  line to a ~56px (`h-14 w-14`) square pinned left, vertically centred across both text rows
  (name + amount over due date + tap-for-more). This is the list-row form the earlier rounds
  circled around — the avatar is now the row's identity anchor.
- **Avatar border thinned to `border` at the larger size.** At 28px the `border-2` green frame
  read as a subtle accent; at 56px it became a heavy green square repeated down the list.
  Dropping to a 1px border keeps the app's green-avatar identity without a column of bright
  frames. (`rounded-lg` retained — it reads clearly square at this size.)
- **Due date → numeric `DD/MM/YYYY`.** Long month names ("SEPTEMBER 07, 20…") were truncating
  on the tighter row; a numeric NZ-format date can't overflow. Built by string-splitting the
  raw `due_date` (`YYYY-MM-DD`) rather than `new Date()`, to avoid a timezone shift moving the
  day. Falls back to the existing display string if the raw field is missing.

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
- **Keep the AUTO/MANUAL badge on the card.** Rejected — payment type is detail-sheet info,
  not a per-row scanning cue; removing it helped the card reach two lines.
- **Remove the avatar entirely for the two-line card.** Rejected — assignee identity is
  worth keeping at a glance in a shared household; enlarging it as the leading anchor keeps
  that value while still hitting two lines.
- **Keep the `border-2` green frame at the larger avatar size.** Rejected — too heavy
  repeated down the list; thinned to `border`.
- **Format the numeric date with `new Date()`.** Avoided — parsing `YYYY-MM-DD` through a
  Date can shift the day across timezones; a plain string split is exact.

## Implementation notes

Single-file presentational change; no logic, data, or state touched. The `<img>` uses the
same `object-cover` guard as `AvatarDropdown`, so an assignee with no `avatar_url` still
falls back to the initial. The due-date span carries `min-w-0 truncate` so a long formatted
date shrinks gracefully rather than shoving the badge and tap affordance off the row. No new
domain terms, so `docs/GLOSSARY.md` was not modified.
