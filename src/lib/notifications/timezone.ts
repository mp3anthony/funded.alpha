const DEFAULT_TZ = 'Australia/Sydney';

/**
 * Returns the current calendar date in the given IANA timezone as a
 * 'YYYY-MM-DD' string. Falls back to Australia/Sydney if the timezone
 * is malformed so a single bad household row cannot crash the cron.
 */
export function todayInZone(tz: string, now = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);
  } catch {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: DEFAULT_TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);
  }
}

/**
 * Whole-day difference (toYmd - fromYmd) between two 'YYYY-MM-DD' strings,
 * computed in UTC so it is unaffected by the runtime's local timezone.
 */
export function diffDaysYmd(fromYmd: string, toYmd: string): number {
  const d = (s: string) => Math.floor(Date.parse(s + 'T00:00:00Z') / 86400000);
  return d(toYmd) - d(fromYmd);
}
