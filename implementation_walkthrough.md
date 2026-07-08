# Technical Walkthrough: Removing Days Counter from Notification Settings

## Why
The days counter controls (incremental `+` and `-` buttons with day displays) on each toggle item in the Notification Settings tab were removed to simplify the user interface, reduce visual clutter, and streamline the layout.

## How
1. **Modified component:** [NotificationCenter.tsx](file:///d:/Documents/QuantumShift/Code/funded/funded%20rebuild/funded-nextjs/src/components/NotificationCenter.tsx)
   - Removed the unused `handleUpdateDays` helper function that updated the numerical settings for `manual_bill_reminder_days` and `auto_pay_reminder_days`.
   - Removed the conditional rendering blocks for both `manual_bill_reminders` and `auto_pay_reminders` that rendered the days adjusters (the `+`/`-` buttons and `<span />` element).
