import { type Bill, type Fund, type PayHistory } from "@/context/AppContext";

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
 * - Bills paid on time (40% weight)
 * - Goals progress (30% weight)
 * - Budget adherence (30% weight)
 */
export function calculateHealthScore(
  bills: Bill[],
  goals: Fund[],
  _payHistory: PayHistory[]
): number {
  // 1. Bills Paid on Time (40% weight)
  // We check how many of the total bills are NOT status === "Overdue"
  const totalBillsCount = bills.length;
  const overdueBills = bills.filter((b) => b.status === "Overdue");
  const onTimeBillsCount = totalBillsCount - overdueBills.length;
  const billsOnTimeRate = totalBillsCount === 0 ? 100 : (onTimeBillsCount / totalBillsCount) * 100;

  // 2. Goals Progress (30% weight)
  // Average progress across all active goals (funds)
  const activeGoals = goals.filter((g) => g.status !== "completed");
  const goalsToCalculate = activeGoals.length > 0 ? activeGoals : goals;
  
  const averageGoalsProgress =
    goalsToCalculate.length === 0
      ? 100
      : goalsToCalculate.reduce((sum, g) => {
          const progress = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 100;
          return sum + Math.min(100, Math.max(0, progress));
        }, 0) / goalsToCalculate.length;

  // 3. Budget Adherence (30% weight)
  // Compare paid bill amounts vs total bill amounts
  const totalBillsAmount = bills.reduce((sum, b) => sum + b.amount, 0);
  const paidBillsAmount = bills
    .filter((b) => b.status === "Paid")
    .reduce((sum, b) => sum + b.amount, 0);
  const budgetAdherence = totalBillsAmount === 0 ? 100 : (paidBillsAmount / totalBillsAmount) * 100;

  // Weighted average calculation
  const finalScore = billsOnTimeRate * 0.4 + averageGoalsProgress * 0.3 + budgetAdherence * 0.3;
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

