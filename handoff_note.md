# Handoff Note

This task removes the days-adjuster controls from the Notification Settings tab, leaving only the primary toggle switches.

## Manual Testing Steps
1. Open the application.
2. Click the notification bell icon to open the **Notification Center**.
3. Go to the **Settings** tab.
4. Verify that:
   - There are no days-counter controls (no `- days +` UI components) below the **Manual Bill Reminders** and **Auto-Pay Reminders** toggles.
   - Enabling or disabling each switch works successfully.

## Linter-Check Command
To verify linting, run:
```bash
npm run lint
```

---

## Cross-Platform Verification Checklists

### Apple iPhone 17 (iOS/WebKit)
- [ ] Open the notification center settings tab in Safari / WebKit view.
- [ ] Verify there are no days-adjuster layout artifacts or residual styling quirks in the list.
- [ ] Check native browser touch interaction on the toggle switches to ensure correct sizing and spacing.

### Samsung S25 FE (Android/Chromium)
- [ ] Open the notification center settings tab in Chrome / Chromium view.
- [ ] Verify responsiveness of the settings layout.
- [ ] Check touch-target sizing on toggles to ensure they are comfortable for thumb/finger taps.
