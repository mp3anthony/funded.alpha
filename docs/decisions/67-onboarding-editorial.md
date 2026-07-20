# Onboarding (turn 4): login + Onboarding restyled to the squared editorial system

- **Part of:** Epic #65 (app-wide editorial design overhaul) — onboarding phase (Phase D), issue #67
- **Related:** #67 modal kit (the `<Dialog>` shell + `DialogSection` this reuses), #52 (theme-token audit — advanced here), #49 (cold-start onboarding flash — same component)
- **Status:** Accepted
- **Date:** 2026-07-19

## Context

Phase D is the final phase of the #65 overhaul: a pure visual restyle of the two onboarding
surfaces — `src/app/login/page.tsx` (sign-up / sign-in) and `src/components/Onboarding.tsx` (the
5-step create-household wizard) — onto the squared editorial system Phase C locked in (2px radius,
lime top-edge, Syne section headers over a lime fade-rule, mono captions, lime-mono amounts). Every
handler, the Supabase auth flow, validation, deep-link, and step sequence is unchanged. Only one
behaviour changes (the payment-mode default, below), by explicit agreement.

## Decisions and why

### 1. Payment-mode default flipped to Joint Fund — local state ONLY, not the DB fallback

The mockup shows Joint Fund pre-selected. Anthony agreed to make this the real onboarding default.
It was implemented by flipping **only** Onboarding's local `useState(false)` → `useState(true)`
(`paymentMode`, step 2). The DB insert fallback `is_joint_fund: false` at
`AppContext.tsx createHousehold` was deliberately **left untouched**: the existing
`updateHouseholdPaymentMode(paymentMode)` call already persists whatever the user lands on when they
advance past step 2, so the chosen mode is written regardless. Touching the DB fallback too would
have been a second, redundant behaviour change on a code path (join flow, non-onboarding creates)
that this phase has no mandate over. Net effect: a user who clicks straight through now gets Joint
Fund instead of Direct Pay. Flagged in the test checklist.

### 2. Payment mode rendered inline, NOT via the shared `PaymentModeToggle`

Step 2 previously delegated to `PaymentModeToggle` (a `<select>` dropdown). That component is
**also used in Settings**, so restyling it here would have silently changed Settings too — out of
scope. Instead the two options are rendered inline in Onboarding as two selectable hairline rows
(Direct Pay / Joint Fund) with a lime selected-state. `PaymentModeToggle` is now unused by
Onboarding but left in place untouched for Settings. This is duplication of two option labels, and
it was accepted on purpose to keep the Settings blast radius at zero.

### 3. Login CTA switched from indigo (`secondary`) to lime (`primary`)

The sign-in / sign-up button was indigo. Every other converted primary action in the overhaul is
lime. Anthony chose lime for consistency (asked explicitly — indigo was the alternative). This is
the login page's only colour-semantics change; the auth logic behind it is identical.

### 4. Step-1 boxed cards → hairline path rows

The old create-vs-join choice was two filled `bg-white/5` cards. `bg-white/5` is a fixed white
wash that reads wrong in light theme, so beyond matching the mockup's "hairline rows, no boxed
cards" this also removes a non-token colour (advances #52). The rows now use `divide-y`/`border-y`
hairlines with a squared icon chip and a trailing arrow.

### 5. Gradient-circle step headers → `DialogSection`

Steps 3–4 (and the step-2/5 headers) used big `bg-gradient-to-br` icon circles with an
`text-2xl font-extrabold` title — a different visual language from the shipped editorial pages,
which head each section with a Syne label over a lime fade-rule. Those circles were replaced with
the `DialogSection` helper (exported from `Dialog.tsx`) so onboarding matches the pages and modals.
The decorative gradient icons are dropped, not restyled — they have no editorial equivalent.

### 6. Step-5 lime-glow check uses `shadow-primary`, not a literal rgba glow

The success check needed a "lime glow". `JoinHouseholdSheet` achieves its glow with a literal
`rgba(200,255,0,.2)` box-shadow (kept there as a documented decorative exception). Here the glow is
built from tokens instead — `bg-primary/15 border-primary/40 shadow-lg shadow-primary/25` — so it
tracks the theme and introduces no new hardcoded hex. Preferred over copying the rgba pattern.

### 7. Step-5 stats summary row built from already-entered values

Anthony asked for a Payday $ / First Bill $ / Mode summary on the success step. It reads straight
from the `payAmount` / `billAmount` / `paymentMode` state already collected — **no new data, no new
fetch**. Empty amounts coerce to `0.00` (both fields are required to reach step 5, so in practice
they're always populated; the `|| 0` guard just avoids `NaN` if reached otherwise).

## Alternatives considered and rejected

- **6-digit cell inputs for the join code** (as the literal mockup draws). Rejected for the same
  reason Phase C did: a single formatted `ABC-123` input is more robust for paste/focus. Moot here
  anyway — the join step reuses the already-converted `JoinHouseholdSheet`, which owns that input.
- **Squaring the `isCreating` loading overlay's `bg-black/85` scrim to a token.** Left as-is: it's a
  full-screen modal scrim (like every backdrop in the app), not editorial surface colour.
- **Editing `PaymentModeToggle` to a squared segmented control and reusing it** in both places.
  Rejected — see decision 2; it would drag Settings into this phase.

## Not done here (deliberately)

- **Settings' payment-mode UI** is untouched — `PaymentModeToggle` still renders there exactly as
  before.
- **The DB `is_joint_fund` fallback** stays `false` (see decision 1).
- **`supabase.ts` and all auth logic** — not touched; implicit-flow session handling is unchanged.
