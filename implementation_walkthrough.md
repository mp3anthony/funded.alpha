# Technical Walkthrough: Square Avatars on Household Health Card

## Why
The contributor avatars on the Household Health card were styled with `rounded-full` (circle format). To keep the visual style consistent with the rest of the application's square-avatar layout (e.g., settings page and member edit modals), the avatars on the Household Health card have been updated to a square format with rounded corners (`rounded-xl`).

## How
In [HealthScoreCard.tsx](file:///d:/Documents/QuantumShift/Code/funded/funded%20rebuild/funded-nextjs/src/components/HealthScoreCard.tsx#L235), modified the avatar container wrapper's class from `rounded-full` to `rounded-xl`:

```diff
-                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-border-strong bg-surface">
+                  <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border-2 border-border-strong bg-surface">
```
This applies to both the profile images and the letter placeholders for contributors.
