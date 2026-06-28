import { type Bill, type Fund, type PayHistory, type PaySchedule, type BillSplit } from "@/context/AppContext";
import { type HouseholdContribution } from "@/types";

/**
 * Parses a date string robustly, handling both "YYYY-MM-DD" and natural date formats like "June 30, 2026".
 */
export function parseBillDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  
  // If YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(dateStr + "T00:00:00");
  }
  
  let parsed = new Date(dateStr + "T00:00:00");
  if (isNaN(parsed.getTime())) {
    parsed = new Date(dateStr);
  }
  
  if (isNaN(parsed.getTime())) {
    return new Date();
  }
  
  return parsed;
}

/**
 * Calculates a financial health score (0-100) based on:
 * - Bills management (40% weight)
 * - Goals/contributions progress (30% weight)
 * - Budget coverage (30% weight)
 */
export function calculateHealthScore(
  bills: Bill[],
  goals: Fund[],
  _payHistory: PayHistory[],
  householdContributions: HouseholdContribution[],
  paySchedules: PaySchedule[],
  isJointFund: boolean,
  billSplits: BillSplit[]
): number {
  // 1. Bills Management (40% weight)
  // - If no bills are overdue: 100%
  // - For each overdue bill: deduct 20 points (max deduction 100)
  // - If all bills are due in the future: 100%
  let billsScore = 100;
  const overdueBills = bills.filter((b) => b.status === "Overdue");
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const allInFuture = bills.length > 0 && bills.every((b) => {
    const dStr = b.dueDate || b.due_date || "";
    if (!dStr) return false;
    return parseBillDate(dStr).getTime() > now.getTime();
  });

  if (allInFuture) {
    billsScore = 100;
  } else if (overdueBills.length > 0) {
    billsScore = Math.max(0, 100 - overdueBills.length * 20);
  } else {
    billsScore = 100;
  }

  // 2. Goals/Contributions Progress (30% weight)
  // - Check if there are any active goals or joint fund contributions
  // - If user has set up contributions (householdContributions exist): 80% base
  // - If goals have any progress (currentAmount > 0): add 20%
  // - If no goals or contributions set up: 50% (neutral, not penalized)
  let goalsScore = 50;
  const hasContributions = householdContributions && householdContributions.length > 0;
  const hasGoals = goals && goals.length > 0;

  if (hasContributions || hasGoals) {
    const base = 80;
    const hasProgress = goals && goals.some((g) => g.currentAmount > 0);
    goalsScore = base + (hasProgress ? 20 : 0);
    if (goalsScore > 100) goalsScore = 100;
  } else {
    goalsScore = 50;
  }

  // 3. Budget Coverage (30% weight)
  // - If isJointFund is true: compare contributions to bills
  // - If isJointFund is false: compare split assignments to bills
  let budgetScore = 0;

  const totalMonthlyExpenses = bills.reduce((sum, bill) => {
    const amount = bill.amount || 0;
    const freq = bill.frequency || "monthly";
    return sum + convertAmount(amount, freq, "monthly");
  }, 0);

  if (isJointFund) {
    const totalMonthlyContributions = householdContributions.reduce((sum, contribution) => {
      const amount = contribution.amount || 0;
      return sum + convertAmount(amount, contribution.frequency, "monthly");
    }, 0);

    if (totalMonthlyExpenses === 0) {
      budgetScore = 100;
    } else {
      budgetScore = Math.min(100, (totalMonthlyContributions / totalMonthlyExpenses) * 100);
    }
  } else {
    // Direct Pay mode: sum up all split amounts, normalized to monthly based on parent bill's frequency
    const totalMonthlySplits = billSplits.reduce((sum, split) => {
      const parentBill = bills.find((b) => String(b.id) === String(split.bill_id));
      const freq = parentBill?.frequency || "monthly";
      const amount = split.amount || 0;
      return sum + convertAmount(amount, freq, "monthly");
    }, 0);

    if (totalMonthlyExpenses === 0) {
      budgetScore = 100;
    } else {
      budgetScore = Math.min(100, (totalMonthlySplits / totalMonthlyExpenses) * 100);
    }
  }

  // Final weighted health score
  const finalScore = billsScore * 0.4 + goalsScore * 0.3 + budgetScore * 0.3;
  return Math.round(finalScore);
}

/**
 * Formats a date string relative to the current local date (e.g. "Today", "Yesterday", "3 days ago").
 */
export function getRelativeTime(dateStr: string): string {
  if (!dateStr) return "";
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const date = parseBillDate(dateStr);
  date.setHours(0, 0, 0, 0);
  
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays === -1) return "Tomorrow";
  
  if (diffDays < -1) {
    // Future date
    const absDays = Math.abs(diffDays);
    if (absDays < 7) {
      return `In ${absDays} days`;
    }
  } else if (diffDays > 1 && diffDays < 7) {
    // Past date within a week
    return `${diffDays} days ago`;
  }
  
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Converts a dollar amount from one billing frequency (weekly, fortnightly, monthly, yearly) to another.
 * Uses budgeting coefficients: 4.33 weeks per month, 2.16 fortnights per month.
 */
export function convertAmount(amount: number, fromFrequency: string, toFrequency: string): number {
  if (!fromFrequency || !toFrequency) return amount;
  
  const from = fromFrequency.toLowerCase();
  const to = toFrequency.toLowerCase();
  
  if (from === to) return amount;
  
  // Convert to monthly first (base unit)
  let monthly: number;
  switch (from) {
    case "weekly":
      monthly = amount * 4.33;
      break;
    case "fortnightly":
      monthly = amount * 2.16;
      break;
    case "monthly":
      monthly = amount;
      break;
    case "yearly":
      monthly = amount / 12;
      break;
    default:
      monthly = amount;
  }

  // Convert from monthly to target frequency
  switch (to) {
    case "weekly":
      return monthly / 4.33;
    case "fortnightly":
      return monthly / 2.16;
    case "monthly":
      return monthly;
    case "yearly":
      return monthly * 12;
    default:
      return monthly;
  }
}

