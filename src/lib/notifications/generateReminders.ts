import { diffDaysYmd } from './timezone';

export type ReminderType = 'manual_bill' | 'auto_pay' | 'lodge_payment';

export interface ReminderSettings {
  manual_bill_reminders: boolean;
  auto_pay_reminders: boolean;
  lodge_payment_reminders: boolean;
  manual_bill_reminder_days?: number | null;
  auto_pay_reminder_days?: number | null;
}

/** Minimal bill shape needed to evaluate reminders. */
export interface ReminderBill {
  id: string | number;
  name: string;
  payment_type?: string | null;
  status?: string | null;
  due_date?: string | null;
  dueDate?: string | null;
}

/** Minimal pay-history shape needed to evaluate lodge reminders. */
export interface ReminderPayHistory {
  id: string;
  member_id?: string | null;
  status?: string | null;
  pay_date?: string | null;
}

export interface ReminderInput {
  userId: string;
  householdId: string;
  /** Today's date as 'YYYY-MM-DD' in the relevant timezone. */
  todayYmd: string;
  bills: ReminderBill[];
  payHistory: ReminderPayHistory[];
  /** The current member's id as a string, or null if unknown. */
  currentMemberId: string | null;
  settings: ReminderSettings;
  /** Dedupe keys that already exist for this user (already-sent/dismissed). */
  existingKeys: Set<string>;
}

export interface ReminderRow {
  user_id: string;
  household_id: string;
  type: ReminderType;
  title: string;
  message: string;
  related_entity_id: string;
  dedupe_key: string;
}

/**
 * Pure reminder generator. No I/O, no browser or Supabase dependencies.
 * Given the current state of a user's bills / pay history and their
 * notification settings, returns the notification rows that should be
 * created (excluding any whose dedupe_key already exists).
 *
 * Thresholds and message strings mirror the original client logic exactly.
 */
export function generateReminders(input: ReminderInput): ReminderRow[] {
  const {
    userId,
    householdId,
    todayYmd,
    bills,
    payHistory,
    currentMemberId,
    settings,
    existingKeys,
  } = input;

  const rows: ReminderRow[] = [];

  const push = (row: ReminderRow) => {
    if (existingKeys.has(row.dedupe_key)) return;
    rows.push(row);
  };

  // ── Manual Bills ───────────────────────────────
  if (settings.manual_bill_reminders) {
    const threshold = settings.manual_bill_reminder_days || 3;
    for (const bill of bills) {
      if (bill.payment_type !== 'auto' && bill.status !== 'Paid') {
        const dueYmd = bill.due_date || bill.dueDate;
        if (!dueYmd) continue;
        const diffDays = diffDaysYmd(todayYmd, dueYmd);
        if (diffDays >= 0 && diffDays <= threshold) {
          const id = bill.id?.toString();
          push({
            user_id: userId,
            household_id: householdId,
            type: 'manual_bill',
            title: 'Manual Bill Due Soon',
            message: `Your bill for ${bill.name} is due in ${diffDays} days.`,
            related_entity_id: id,
            dedupe_key: `${id}-${dueYmd}-manual_bill`,
          });
        }
      }
    }
  }

  // ── Auto-Pay Bills ─────────────────────────────
  if (settings.auto_pay_reminders) {
    const threshold = settings.auto_pay_reminder_days || 1;
    for (const bill of bills) {
      if (bill.payment_type === 'auto' && bill.status !== 'Paid') {
        const dueYmd = bill.due_date || bill.dueDate;
        if (!dueYmd) continue;
        const diffDays = diffDaysYmd(todayYmd, dueYmd);
        if (diffDays <= threshold) {
          const id = bill.id?.toString();
          const message =
            diffDays <= 0
              ? `Your automatic payment should now be paid.`
              : `Your auto-paid bill ${bill.name} will be processed in ${diffDays} days.`;
          push({
            user_id: userId,
            household_id: householdId,
            type: 'auto_pay',
            title: diffDays <= 0 ? 'Auto-Pay Bill Passed' : 'Auto-Pay Upcoming',
            message,
            related_entity_id: id,
            dedupe_key: `${id}-${dueYmd}-auto_pay`,
          });
        }
      }
    }
  }

  // ── Lodge Payment ──────────────────────────────
  if (settings.lodge_payment_reminders && currentMemberId) {
    for (const hist of payHistory) {
      if (hist.status === 'pending' && hist.member_id === currentMemberId) {
        push({
          user_id: userId,
          household_id: householdId,
          type: 'lodge_payment',
          title: 'Payment Requires Confirmation',
          message: `You have an unconfirmed payment logged on ${hist.pay_date}.`,
          related_entity_id: hist.id,
          dedupe_key: `${hist.id}-lodge_payment`,
        });
      }
    }
  }

  return rows;
}
