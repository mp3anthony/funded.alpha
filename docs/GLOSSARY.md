# Glossary

Domain terms specific to this project. Generic web/framework vocabulary is out of scope.

**This file is the front door to the documentation.** Read it FIRST to find which doc is
relevant, before opening anything else. Every entry names a term and points at the doc that
covers it, so looking a term up tells you where to go — a doc no entry points at is
effectively invisible. When a decision-log entry or ADR is written, its terms are added here.

## Assignee chip

The small avatar on a bill row showing who owns that bill — image if the user has one, initial
otherwise. It began as a 56px square avatar on the boxed card and was deliberately reduced to a
28px row chip when the editorial system replaced the box; the "assignee at a glance" intent was
kept while the density decision was reversed. See `docs/decisions/54-bills-card-avatar-density.md`
(original) and `docs/decisions/65-bills-editorial-conversion.md` (the reversal).

## Avatar crop pipeline

The client-side sequence a user's chosen photo goes through before it becomes a stored
avatar: interactive 1:1 crop/zoom in the browser, then a downscale-and-encode step that
produces a 512×512 JPEG. It exists so uploads are small by construction rather than
policed by a size limit. See `docs/decisions/19-avatar-upload-overhaul.md`.

## Avatars bucket safety net

The 2MB `file_size_limit` on the Supabase `avatars` storage bucket. After the crop
pipeline landed, this limit no longer rejects normal uploads (they arrive well under it);
it only guards against an unexpectedly large or uncompressed file slipping through. Its
value is version-controlled in
`supabase/migrations/20260717000000_avatars_bucket_config.sql` even though the bucket is
dashboard-managed. See `docs/decisions/19-avatar-upload-overhaul.md`.

## Category collapse

The per-category chevron that folds a group of rows away — the sole visibility control on
Bills, Goals and Payday. It is a **pattern, not a shared component**: each page rolls its own
inline version, and unifying them was deliberately kept out of scope. Do not go looking for a
`<Collapsible>` module; it does not exist. See `docs/decisions/38-bills-single-minimize.md`
(where the competing page-level density toggle was removed and this became the only control),
`docs/decisions/40-goals-category-grouping-filter-minimize.md` and
`docs/decisions/25-recent-pay-history-filter-minimize.md` (both of which had to correct issue
text that assumed a shared component existed).

## Category vocabulary

The eight Savings Goals categories — Home & Living, Debt & Finance, Vacation & Travel, Savings,
Emergency, Short-Term, Education, Other — and the matching `Debt & Finance` label on Bills. Old
labels were rewritten in place by a one-time SQL migration rather than translated at read time,
so no stale strings survive in the database. Two of the changes are merges, not renames. See
`docs/decisions/60-goal-bill-category-revision.md`.

## Delete row-count check

The rule that a delete must confirm how many rows it actually removed (via `.select()`) and
surface failures to the user, rather than assuming success and updating local state
optimistically. A bare `.delete()` affecting zero rows returns no error and is otherwise
indistinguishable from a successful one. See `docs/decisions/63-delete-silent-failure.md`.

## Dialog shell

`src/components/ui/Dialog.tsx` (`<Dialog>` + `<DialogButton>`) — the single shared shell every
popup in the app now uses. It portals to `document.body`, carries the `modal-backdrop` class the
scroll-lock observer depends on, and handles Escape and backdrop close. Roughly 18 hand-rolled
modals were migrated onto it. See `docs/decisions/67-modal-kit-editorial.md`.

## Dialog subheader slot

An optional non-scrolling region in the Dialog shell, rendered between the header and the scroll
body. It exists so pinned UI (such as NotificationCenter's Inbox/Settings tabs) can sit above the
scrolling content without being a `sticky` element inside it. See
`docs/decisions/68-notification-modal-subheader-slot.md`.

## Editorial design system

The app-wide visual language introduced by Epic #65: squared cards (2px radius), a lime
gradient top-edge, Syne section headers over a lime fade-rule, mono captions and lime-mono
amounts. Rolled out in phases — pages, then the modal kit, then onboarding. Behaviour and data
were unchanged throughout; it is presentation only. See
`docs/decisions/65-bills-editorial-conversion.md` (pages),
`docs/decisions/67-modal-kit-editorial.md` (modals) and
`docs/decisions/67-onboarding-editorial.md` (onboarding).

## Floating filter controls

The Bills filter row rendered directly on the page with soft green outlines, rather than inside a
grey raised card. The green comes from an opacity modifier on the `primary` token, not from the
`primary-mid` token — `primary-mid` is a *fill* token and is too faint to register as a hairline
border. See `docs/decisions/53-bills-floating-filter-controls.md`.

## Footerless modal

A modal with no footer row — currently only NotificationCenter and Onboarding. Worth naming
because a rule in `globals.css` keys off the modal card's `:last-child`: in a normal modal that
is the footer, but in a footerless one it lands on the scroll body instead and forces its
top padding. Every layout bug of this shape has been footerless-only. See
`docs/decisions/68-notification-modal-subheader-slot.md`.

## Goal category order

The user's chosen ordering of goal categories, persisted in the `goalCategoryOrder` localStorage
key. Distinct from collapse (open/closed) state, which is deliberately ephemeral and not
persisted. See `docs/decisions/40-goals-category-grouping-filter-minimize.md`.

## Hairline row

The flat, de-boxed list row idiom of the editorial system — rows separated by hairline rules
instead of each sitting in its own card. Established by the Dashboard's `UpcomingBillsCard` and
reused rather than reinvented per page. See `docs/decisions/65-bills-editorial-conversion.md`.

## Joint Fund default

Onboarding pre-selects Joint Fund as the payment mode. This lives **only** in Onboarding's local
state — the `is_joint_fund: false` fallback on the database insert was deliberately left alone,
because the mode the user lands on is persisted separately when they advance past that step. See
`docs/decisions/67-onboarding-editorial.md`.

## Onboarding gate

The condition that decides whether the onboarding "create or join" screen renders. It must
include `!isDataLoading`, because a session can resolve one render before the app knows whether a
household exists — and in that gap an already-onboarded user would briefly see onboarding. See
`docs/decisions/49-cold-start-onboarding-flash.md`.

## PageHeader

The header component that renders only inside the authenticated app shell. The "funded" wordmark
links to the dashboard from here, deliberately *not* from `Logo` itself — `Logo` is also used on
login, auth-callback, password-reset and onboarding, where a link into a protected route would be
wrong. See `docs/decisions/42-header-logo-nav.md`.

## Profile deep-link

The `?modal=profile` URL flag that tells the settings page to open the Profile modal on arrival.
A URL flag rather than shared state, because the avatar dropdown and the settings page have no
common parent; it must be read reactively, since tapping it while already on `/settings` is a
soft navigation that does not remount. See `docs/decisions/43-avatar-name-profile-button.md`.

## Recent Pay History

The section on `/payday` listing past pays, with a contributor filter and a collapse that mirrors
the Bills inline pattern. See `docs/decisions/25-recent-pay-history-filter-minimize.md`.

## Service worker cache version

The hardcoded cache name in `public/sw.js` (e.g. `funded-pwa-cache-v3`). The service worker's
`activate` handler only clears old caches when this string changes, so leaving it unbumped across
deploys lets installed PWAs serve a stale copy of the app indefinitely. This has caused
production-only slowness that a reinstall "fixed". See
`docs/decisions/pwa-stale-cache-nav-slowness.md` — the underlying bug is recorded there as **not
yet fixed**.

## Sheet portalling

Rendering a sheet or modal into `document.body` rather than inline. Required because AppShell's
wrapper is `overflow-hidden` and its `main` reserves bottom padding for the fixed nav; anything
rendered inside it gets clipped. Every sheet in the app portals out for this reason. See
`docs/decisions/27-android-goal-card-portal.md`.

## Static RSC navigation

The requirement that route RSC payloads prerender statically and serve from the edge cache. A
single `cookies()` call in the root layout forces the *entire* app to render dynamically under
`cacheComponents`, which turns every navigation into a serverless function call and, with link
prefetching, generates enough load to be edge-shed. See `docs/decisions/47-fast-nav-static-rsc.md`.

## Visual viewport height

The `--visual-viewport-height` CSS variable, maintained by `useVisualViewportVars`. Modal height
caps must be measured against this rather than `dvh`, because `dvh` does not shrink when the iOS
keyboard opens — a tall form capped in `dvh` is clipped at both the status bar and the keyboard.
See `docs/decisions/65-modal-keyboard-viewport-cap.md`.

## Upcoming Pays card

The single unified card on `/payday` showing one row per contributor, replacing an earlier
2-column grid of per-contributor cards that truncated on a phone. Sorted client-side by
`YYYY-MM-DD` string compare, deliberately not by adding `.order()` to the shared query. See
`docs/decisions/26-consolidated-upcoming-pay-cards.md`.
