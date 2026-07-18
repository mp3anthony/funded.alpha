# Bills filter controls: floating, green-outlined, uniform focus

- **Closes:** #53 (Bills: floating filter controls with green outlines + search font fix)
- **Related:** #52 (app-wide theme audit) — see "Theme-safety" below
- **Status:** Accepted
- **Date:** 2026-07-18

## Context

The `/bills` filter row (search input + the select controls) was wrapped in a grey
`bg-surface-raised` card that read as "unconsidered" — a plain box with no relationship to
the app's identity. Separately, the search input rendered in a monospace font that clashed
with the page's sans typeface. The goal for #53 was to drop the card so the controls float
directly on the page, give them a soft green accent that ties them to the app's primary
colour, and fix the font.

The diff itself is five class-string changes and is self-evident from the source. This
entry records the decisions behind those strings — the choices that would otherwise look
arbitrary — not the class names.

## Decisions and why

### Soft green via the `border-primary/30` opacity modifier, not the `primary-mid` token

The obvious move is to reach for the existing `primary-mid` semantic token for the green.
Rejected. `primary-mid` is a *fill* token (roughly 22–25% alpha), designed to sit behind
content as a background tint. A border is a 1px line, not a filled area, so it needs more
opacity than a fill to register visually — the same alpha that reads fine as a background
wash disappears as a hairline against the off-white light theme. Using a fill token to
colour a border is also a semantic mismatch: it couples the border to a value that exists
for a different purpose and could drift. Applying an explicit opacity modifier to the
`primary` token instead keeps the intent honest (a semi-transparent primary border) and
tunable.

30% was chosen over 25% for the same light-theme reason: at 25% the outline was still too
faint to read cleanly on the pale background. 30% is the point where the green is present
but stays soft rather than becoming a hard, boxy outline.

### All four controls unified to a border-deepens-on-focus model; the search ring was dropped

Previously the controls behaved inconsistently on focus: the search input used
`focus:ring-1 focus:ring-primary/50` (an outer ring) while the selects used
`focus:border-primary` (the border itself darkening). #53 asked for uniform behaviour, so
all four now share the border-deepens model and the search's ring was removed.

The border approach was chosen as the single model — rather than adding rings to the
selects — for two reasons. First, a focus ring sits *outside* the box, and on native
`<select>` elements with a custom chevron overlay it can clip or collide with that overlay
inconsistently across iOS/WebKit and Android/Chromium. The border lives on the element's
own edge and has no such interaction. Second, the border model was already working on the
selects, so unifying toward it is the lighter, lower-risk direction and produces one
consistent focus motion across the row. Anthony explicitly approved "border approach for
all."

### `px-1` added to the now-bare wrapper

Removing the card also removed its `p-3` padding. Without compensation the filter group
would sit ~4px wider than its sibling blocks — the Total Bar and the Bills List header —
which align to `px-1`. The added `px-1` exists purely to preserve that vertical edge
alignment down the page; it is not a style choice about the controls themselves.

## Alternatives considered and rejected

- **Keep the card but restyle it.** Rejected — the issue's intent is floating controls with
  no wrapper, not a nicer box.
- **Use the `primary-mid` token for the green.** Rejected — too faint as a 1px border in the
  light theme, and a semantic mismatch (a fill token used for a border).
- **Use `/25` opacity.** Rejected — still too faint against the off-white light theme; 30%
  is the readable-but-soft threshold.
- **Unify by adding focus rings to the selects.** Rejected — rings can clip against the
  native-select chevron overlay across iOS/Android and read heavier; unifying toward the
  already-working border model is lighter and safer.

## Theme-safety (relevant to #52)

The new outlines are expressed through the `primary` theme token, which auto-adapts between
light and dark. These controls are therefore theme-safe by construction: nothing here is a
hard-coded colour that could break in dark mode. #52's app-wide theme audit should not need
to re-audit this filter row — it is already token-driven.

## Implementation notes

Pure styling change, five class-string edits, no logic touched. No deviations from plan.
No new domain terms, so `docs/GLOSSARY.md` was not modified.
