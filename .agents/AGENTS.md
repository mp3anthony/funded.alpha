## Next.js 14+ Mobile Layout & Viewport Invariants

When working on layouts, metadata, or fixed UI elements in this repository, you MUST adhere to the following rules:

1. **Next.js Viewport API:** NEVER use manual `<meta name="viewport">` or `<meta name="theme-color">` tags in the `<head>` or root `layout.tsx`. You MUST use the official `export const viewport: Viewport = { ... }` API. Next.js aggressively overwrites manual meta tags during client-side navigation, which will destroy `viewport-fit=cover` and break `env(safe-area-inset-bottom)` calculation.
2. **Fixed Elements and Overflow:** NEVER nest `position: fixed` elements (like nav bars, modals, or fab buttons) inside containers that have `overflow: hidden` or `overflow-x: hidden`. Due to an iOS WebKit bug, Safari treats these as `position: absolute` relative to the overflow container, causing layout shifts during flex reflows. Fixed elements MUST be rendered as high up in the DOM tree as possible, completely outside of any `overflow: hidden` wrappers.
