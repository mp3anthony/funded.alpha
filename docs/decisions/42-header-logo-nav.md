# Header logo navigates to dashboard

- **Closes:** #42 (header logo navigates to dashboard from any page)
- **Status:** Accepted
- **Date:** 2026-07-17

## Context

The "funded" wordmark in the top-left of every in-app page was static. Making it a
shortcut back to the dashboard is a small change, but *where* the click behaviour lives
was the real decision.

This entry records why the link sits where it does. It does not restate what the code
does; read the source for that.

## Decisions and rejected alternatives

### Wrap the logo in `PageHeader`, not inside `Logo` itself

The instinct is to make `Logo.tsx` clickable, since it *is* the logo. Rejected. `Logo` is
a shared presentational component reused on unauthenticated screens — login,
auth-callback, password-reset, and onboarding. Baking a `href="/"` into `Logo` would make
the login-screen wordmark try to jump into a protected route, which is wrong and would
force per-usage conditionals to suppress it. Instead the link lives in `PageHeader` — the
component that only renders inside the authenticated app shell — so exactly the pages that
should route home do, and `Logo` stays a dumb, reuse-safe visual.

### A real `<Link>`, not a `<div onClick={router.push}>`

Both navigate. `<Link>` was chosen because it is keyboard- and screen-reader-accessible by
default, supports open-in-new-tab / middle-click, and prefetches the dashboard route. The
`onClick` handler approach would have re-implemented a subset of that by hand, worse.

### Enlarged tap target without shifting layout

The link uses padding to grow the touch area with a matching negative margin
(`-m-2 p-2`) so the hit box is comfortable on a phone while the logo stays pixel-aligned
where it already sat. This avoids nudging the header layout purely to gain tappable area.

## Implementation deviations worth recording

None. `Logo.tsx` was deliberately left untouched (see first decision above); the change is
confined to `PageHeader.tsx`.
