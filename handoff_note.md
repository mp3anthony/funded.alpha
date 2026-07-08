# Handoff Note: Notification System Improvements

## Manual Testing Steps
1. Run the local development server (or view the already running server at `http://localhost:3000`).
2. Generate manual and auto-pay notifications (by altering due dates/status of bills in the database to be soon or passed).
3. Open the **Notifications** drawer (Inbox):
   - Verify that auto-pay notifications due today or in the past display: `"Your automatic payment should now be paid."`
   - Verify that clicking on a notification redirects to `/bills?billId=<id>`, closes the notification center, and automatically opens that bill's detail sheet.
   - Close the detail sheet; verify that the `billId` query parameter is cleared from the URL.
   - Click "Mark Paid" on a bill notification; verify that the bill is updated and the notification is immediately cleared from the list.
   - Click **Snooze** (clock icon) and choose a duration (1, 3, or 7 Days); verify that the notification is hidden from the drawer and only returns after the snooze time has passed.
   - Click the individual **Clear** (trash icon) button on any notification; verify it is deleted and does not reappear on re-load.
   - Click **Clear All** in the inbox header; verify all notifications disappear.

## Cross-Platform Testing Checklist

### Apple iPhone 17 (iOS/WebKit)
* [ ] **Layout & Styling:** Verify the Notifications drawer aligns correctly with mobile headers and doesn't clip safe areas.
* [ ] **Snooze Dropdown Stacking:** Check that clicking the clock icon correctly opens the snooze dropdown above other notification items.
* [ ] **Touch Targets:** Verify that the Checkmark (Mark Read), Clock (Snooze), and Trash (Clear) buttons are easily tappable (minimum 44x44px target sizes).
* [ ] **Safari Navigation:** Verify that clicking a notification redirects to the bills page and opens the sheet smoothly in iOS Safari.

### Samsung S25 FE (Android/Chromium)
* [ ] **Responsiveness:** Verify the drawer width fits correctly on narrow screen dimensions.
* [ ] **Browser Interactions:** Check that Chrome's default back button behavior handles modal dismissal/navigation cleanly.
* [ ] **Touch Target Sizing:** Ensure clear spacing between adjacent action items (Snooze vs. Clear).

## Linter Check Command
To run the linter and ensure the changes are free of syntax or style issues:
```bash
npm run lint
```
