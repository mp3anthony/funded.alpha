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

## Linter Check Command
To run the linter and ensure the changes are free of syntax or style issues:
```bash
npm run lint
```
