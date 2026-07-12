# Implementation Walkthrough: Auth Rate Limit Notifications

## What was done
1. Modified the error handling in `src/app/login/page.tsx` within the authentication try/catch block.
2. Implemented a check for Supabase Auth rate limit errors (`status === 429` or messages containing `"rate limit"` / `"too many requests"`).
3. Added a user-friendly error message alerting the user of the temporary lockout rather than a raw server response: `"You've reached the testing rate limit (2 emails per hour). Please wait an hour before trying again."`

## Why it was done
Supabase's default email provider enforces a strict 2-email-per-hour limit. If users attempt to sign up or recover passwords more than twice in an hour, the system returns a 429 error. Instead of surfacing an ambiguous or raw error string, we now explicitly inform the user of the limitation so they understand why they cannot proceed.

## Future Recommendations
When you are ready to scale beyond the 2-email limit, you can safely update the Supabase SMTP configuration in your dashboard to use a service like Resend. Once done, this UI check will still provide fallback protection if your overall project rate limits are breached.
