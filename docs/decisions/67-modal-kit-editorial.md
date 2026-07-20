# Modal kit (1d): all ~18 sheets/modals onto one squared editorial `<Dialog>` shell

- **Part of:** Epic #65 (app-wide editorial design overhaul) — modal phase, issue #67
- **Related:** #65 (page conversions this follows), #52 (theme-token audit — advanced here), Phase D (onboarding, consumes the converted JoinHouseholdSheet)
- **Status:** Accepted
- **Date:** 2026-07-19

## Context

Phase C migrates every popup in the app onto the single shared shell `src/components/ui/Dialog.tsx`
(`<Dialog>` + `<DialogButton>`), which already portalled to `document.body`, carried the
`modal-backdrop` class AppShell's scroll-lock observer depends on, and handled Escape + backdrop
close. Before this phase only `settings-client.tsx` used it; the other ~18 modals each hand-rolled
their own `fixed inset-0 modal-backdrop … rounded-2xl` backdrop, header, and footer. This is a
presentation + structural-dedup pass: every handler, deep-link, validation, and loading/success
state is unchanged.

## Decisions and why

### 1. Squared card + lime gradient top-edge folded into the shared primitive (not per-modal)

The turn-3 mockup renders every popup as a **squared card (2px radius)** with a **lime→transparent
gradient top-edge**, whereas the shipped `<Dialog>` was `rounded-2xl` with no top accent. This was
taken to Anthony as an explicit design-vs-shipped-primitive call. He **initially chose "keep
rounded, add the lime top-edge"** (to stay consistent with the already-shipped rounded
Bills/Payday/Goals pages), then **reversed to full mockup fidelity — squared** on reflection.

Because the treatment lives in the one primitive, all ~18 modals inherit it uniformly. Consequence
Anthony accepted: modals now read squarer than the still-rounded page bodies they open over; those
pages may later be squared to match, but that is out of scope here.

### 2. Lime top-edge is an inner clipped bar, NOT a CSS `border-top`

The mobile rule in `globals.css` (`.modal-backdrop > div … { border: 1px … !important }`) forces a
full border on the card at ≤767px, which would overwrite any real `border-top` gradient. So the
top-edge is a 2px absolutely-positioned inner `<div>` clipped by the card's `overflow-hidden`. It
survives the `!important` border and respects the corner radius. The same globals block was updated
(`border-radius: 24px → 2px`, and the forced full `border` dropped) so squared cards + the top-edge
render correctly on phones — this was a required edit, not optional, once squared was chosen.

### 3. Per-modal `modal-open` effects deleted — AppShell's observer already covers it

Every hand-rolled modal carried a `useEffect` that manually toggled `document.body.class
"modal-open"` and reference-counted `.modal-backdrop` nodes on cleanup. `AppShell`'s
`MutationObserver` (AppShell.tsx) already sets/clears `modal-open` from `.modal-backdrop` presence,
and `settings-client` (the pre-existing `<Dialog>` consumer) keeps no such effect. The per-modal
effects were therefore redundant and were removed; the `<Dialog>` backdrop alone drives scroll-lock.

### 4. Form submit preserved via the `form=` attribute, not refactored to onClick

Several sheets were `<form onSubmit>` with a `type="submit"` button, giving Enter-to-submit. The
`<Dialog>` renders body and footer as siblings, so the footer button can't sit inside a body
`<form>`. Rather than drop the form (and lose Enter-to-submit — a behaviour change), the body keeps
its `<form id="…">` and the footer's primary `<DialogButton type="submit" form="…">` associates
across the DOM. Behaviour is identical to before.

### 5. JoinHouseholdSheet's can't-close-while-submitting guard

`<Dialog>` always allows Escape + backdrop close. JoinHouseholdSheet must block all close paths
while `isJoining`/`isSuccess`. Preserved by passing a **no-op `onClose`** and **`hideClose`** for
the in-flight window (`inFlight = isJoining || isSuccess`), reproducing the old behaviour where the
overlay-click handler and X button were conditionally omitted. Its title/icon are made dynamic
(`Join a Household`/Sparkles → `Successfully Joined!`/Check) so the success state reads correctly
through the standard header instead of the old bespoke centered card.

### 6. Headerless celebration modals given a real header

EmailVerifiedModal and JoinHouseholdSheet were centered, title-less cards. `<Dialog>` always renders
a header, so each was given a header title (with the celebratory check/message kept in the body)
rather than rendering an empty header bar. This trades a little of the "big centered celebration"
feel for consistency with every other modal — an intentional call, not an oversight.

### 7. Theme-token fixes made in passing (advances #52)

Three hardcoded values that violate the "tokens only" invariant were fixed while their lines were
already being edited: `focus:ring-[#c8ff00]` → `ring-primary` (RemoveMemberModal ×2,
EditMemberModal), `bg-[#111]` card → `bg-surface` via the shell (EditCategoryOrderModal), and
`text-black` button text → `text-primary-fg` via `DialogButton` (EditMemberModal, JoinHouseholdSheet).
EditCategoryOrderModal also **gained** scroll-lock + Escape/backdrop close it never had, because its
old backdrop lacked the `modal-backdrop` class entirely.

## Alternatives considered and rejected

- **A bottom-sheet `<Dialog>` variant** for the four sheets that were bottom-sheets on mobile /
  right-drawers on desktop (Add/Edit Goal, AddPaySchedule, ContributionSettings, RulesSettings,
  GoalDetail). Rejected: the epic's turn-3 spec is one centered-card shell for *every* popup;
  keeping a second sheet variant would defeat the unification. They now center like the rest.
- **Squaring avatars to 2px along with fields.** Avatars were left at their existing
  `rounded-full`/`rounded-lg` (softened to a rounded square where they were `rounded-xl`), since
  the mockup's own avatars are ~8px rounded squares, not hard 2px — squaring them to match fields
  looked wrong.
- **A `DialogSection` for every in-body label.** The helper (Syne label + lime fade-rule) was added
  and used for genuine section headers (e.g. BillDetail "Paid By"/"Notes"), but small mono
  field-captions were left as-is rather than force every caption through it.

## Not done here (deliberately)

- **RuleCard** (rendered inside RulesSettingsSheet) was not squared — it's a separate component
  outside the #67 modal list; a candidate for a follow-up sweep.
- **The JoinHouseholdSheet success glow** keeps its literal `rgba(200,255,0,.2)` box-shadow — a
  decorative glow, not a layout/theme color, and there's no rgba token to swap it for.
- **Onboarding (Phase D)** — the visual restyle of login + Onboarding is the final phase; it only
  consumes the already-converted JoinHouseholdSheet here.
