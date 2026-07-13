# Handoff Note

The UI error handling for Web Push Notifications is complete and the `push_subscriptions` table RLS has been configured manually by you. 

## Linter Check Command
To run code analysis locally to ensure no TypeScript regressions exist, execute the following from the root directory:
```bash
npm run lint
```
*(Note: I have already executed this in your environment to verify the new error handling code.)*

## Manual Testing Steps

Now that the UI handles errors visibly and you've set the RLS policies in Supabase, you should rerun the manual test cases to verify the database populates correctly.

### Apple iPhone 17 (iOS/WebKit)
iOS requires Web Push to only function for PWAs added to the home screen.
- [ ] Add the app to your Home Screen from Safari.
- [ ] Launch the app from the Home Screen (this runs it in standalone mode).
- [ ] Navigate to the Notification Center > Settings tab.
- [ ] Ensure the "Enable Push Notifications" soft prompt banner appears.
- [ ] Tap "Enable Notifications", and accept the iOS system-level prompt.
- **[NEW]** Verify that the banner successfully hides (which indicates the API successfully saved your subscription to Supabase without errors).
- [ ] Wait for a bill notification (or trigger one) and ensure the iOS lockscreen/notification center receives the push.
- [ ] Tap the notification and verify it focuses/opens the app to the relevant context.

### Samsung S25 FE (Android/Chromium)
Android allows push in both the browser and standalone mode.
- [ ] Open the app and open the Notification Center > Settings tab.
- [ ] Ensure the "Enable Push Notifications" soft prompt banner appears.
- [ ] Tap "Enable Notifications", and accept the Chrome/Android system-level prompt.
- **[NEW]** Verify that the banner successfully hides. If the VAPID keys are missing locally or the DB rejects the insert, the button will now visibly change to "Retry" and show a red error string.
- [ ] Wait for a bill notification (or trigger one) and ensure the Android notification shade receives the push.
- [ ] Close the app entirely. Trigger a notification and verify the Android OS still receives the push (background push).
- [ ] Tap the notification and verify it focuses/opens the app to the relevant context.

### Security / Setup Checklist
- [ ] Confirm no private keys are exposed in `.env.local` or client bundles (VAPID private key should only be in Vercel settings).
- [ ] **[NEW]** Go to your Supabase Dashboard > Table Editor > `push_subscriptions` and confirm the row was successfully populated after you click "Enable Notifications" from your test devices.
