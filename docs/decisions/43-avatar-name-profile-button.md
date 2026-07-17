# Avatar-dropdown name becomes a profile button

- **Closes:** #43 (avatar-popup name becomes a button linking to profile settings)
- **Status:** Accepted
- **Date:** 2026-07-17

## Context

The user's name sat as plain text under the avatar in the account dropdown. The ask was
to make it a real, tappable button that lands the user on their profile. The complication:
"Profile" in settings is not a page or a scroll target — it's a **modal** opened by local
component state on the settings page. So a link alone can't get there; the destination has
to be *told* to open the modal.

This entry records why the deep-link is shaped the way it is. It does not restate what the
code does.

## Decisions and rejected alternatives

### A URL flag (`?modal=profile`), not shared/global state

The dropdown and the settings page are unrelated components with no shared parent state.
To make one open a modal owned by the other, the options were: (a) lift Profile-modal
state into a global context/store, or (b) pass intent through the URL. We chose the URL
flag. It needs no new shared state, survives the full navigation cleanly, and is
inherently shareable/bookmarkable ("link straight to my profile"). Lifting modal state to
context would couple two otherwise-independent screens for a one-off navigation.

### Reactive `useSearchParams`, not a mount-only `window.location` read

A tempting shortcut is to read `window.location.search` once in a mount `useEffect`. That
is subtly broken: the avatar dropdown lives in the app shell on *every* page, including
`/settings` itself. Tapping the name while already on settings is a same-route soft
navigation, which does **not** remount `SettingsClient`, so a mount-only effect never
fires and the modal silently fails to open. Reading the param via `useSearchParams` (which
is reactive) and depending the effect on it makes the modal open whether you arrive from
another page or are already on settings. This mirrors the existing `billId` deep-link in
`BillCard.tsx`, so the codebase now has one consistent way to open a modal from the URL.

### Strip the flag after opening

Once the modal is opened the `modal` param is removed with `router.replace`. Without this,
a refresh or back-navigation would re-trigger the modal, and the reactive effect would have
no clean "already consumed" signal. Stripping it makes the flag a genuine one-shot
instruction and keeps the visible URL clean while the modal is open.

### Name-only button, not the whole avatar+name row

The whole "Signed in as / name / email" block could have been one big tap target. The user
explicitly chose the name itself as the button. A chevron affordance and an enlarged
padded hit area make it obviously tappable without swallowing the surrounding email/label
text into the control.

## Implementation deviations worth recording

None from the agreed plan. During code review a first cut used a mount-only
`window.location` read; it was replaced before finalising because it would not fire on the
same-route case described above. The shipped version follows the plan's `useSearchParams`
approach and the existing `BillCard` precedent.
