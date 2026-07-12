# Handoff Note

## Manual Testing Steps
1. Navigate to the login/signup page (`/login`).
2. Rapidly submit the "Sign Up" form with multiple different test email addresses.
3. Observe that after the second attempt, the subsequent attempts trigger a 429 rate limit.
4. Verify that the UI presents the custom warning: `"You've reached the testing rate limit (2 emails per hour). Please wait an hour before trying again."` rather than the default "An error occurred".

### Cross-Platform Testing Checklist

#### Apple iPhone 17 (iOS/WebKit)
- [ ] Verify the input fields remain accessible and don't zoom awkwardly.
- [ ] Ensure the new custom error banner renders correctly without breaking the layout or overlapping buttons.
- [ ] Ensure the native iOS keyboard correctly dismisses when interacting with the custom error banner.

#### Samsung S25 FE (Android/Chromium)
- [ ] Ensure the custom error banner contrasts appropriately with the background (especially in dark mode).
- [ ] Validate that the layout handles the viewport correctly when the Android soft keyboard appears alongside the error banner.

## Linter Check Command
```bash
npm run lint
```
