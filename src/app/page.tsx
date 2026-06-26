"use client";

import { useMemo } from "react";
import {
  PiggyBank,
  Calendar,
  ListChecks,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  Target,
  Clock,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import HouseholdHealth from "@/components/HouseholdHealth";

/* ── Helpers ─────────────────────────────────── */
function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  // Try ISO first, then natural language date string
  let target = new Date(dateStr + "T00:00:00");
  if (isNaN(target.getTime())) {
    target = new Date(dateStr);
  }
  if (isNaN(target.getTime())) return NaN;
  return Math.ceil((target.getTime() - now.getTime()) / 86_400_000);
}

function formatCurrency(n: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function isCurrentMonth(dateStr: string): boolean {
  const now = new Date();
  let d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export default function Home() {
  const { bills, funds, paydays, householdName } = useApp();

  /* ── Derived summary values ────────────────── */
  const totalSaved = useMemo(
    () => funds.reduce((s, f) => s + f.currentAmount, 0),
    [funds],
  );

  const unpaidBills = useMemo(
    () => bills.filter((b) => b.status !== "Paid"),
    [bills],
  );

  const totalUnpaid = useMemo(
    () => unpaidBills.reduce((s, b) => s + b.amount, 0),
    [unpaidBills],
  );

  const nextPayday = useMemo(() => {
    const upcoming = paydays
      .filter((p) => daysUntil(p.date) >= 0)
      .sort((a, b) => a.date.localeCompare(b.date));
    return upcoming[0] ?? null;
  }, [paydays]);

  const nextPaydayDays = nextPayday ? daysUntil(nextPayday.date) : null;

  /* Monthly bill progress — all bills due this calendar month */
  const monthlyBillsTotal = useMemo(
    () => bills.filter((b) => isCurrentMonth(b.dueDate)).reduce((s, b) => s + b.amount, 0),
    [bills],
  );

  const monthlyBillsPaid = useMemo(
    () =>
      bills
        .filter((b) => isCurrentMonth(b.dueDate) && b.status === "Paid")
        .reduce((s, b) => s + b.amount, 0),
    [bills],
  );

  const monthlyBillsPercent =
    monthlyBillsTotal > 0 ? Math.round((monthlyBillsPaid / monthlyBillsTotal) * 100) : 0;

  /* First 3 unpaid bills for the preview list */
  const previewBills = unpaidBills.slice(0, 3);

  /* Top 2 funds for the savings preview */
  const previewFunds = funds.slice(0, 2);

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 sm:px-6 md:py-12 space-y-8">
      {/* Header Greeting */}
      <div className="relative">
        {/* Ambient radial glow background */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-full max-w-2xl aspect-[3/1] bg-[radial-gradient(ellipse_at_top,_rgba(200,255,0,0.15),_transparent_70%)] pointer-events-none -z-10" />

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Welcome to {householdName || "Funded"}
          </h1>
          <p className="text-sm text-muted mt-1">
            {"Here's your financial overview for today."}
          </p>
        </div>

        {/* Household Health Section */}
        <div className="mt-6">
          <HouseholdHealth />
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Funds Card */}
        <div className="relative overflow-hidden bg-surface border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-subtle">
              Total Saved
            </span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <PiggyBank className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-foreground tracking-tight">
              ${formatCurrency(totalSaved)}
            </h3>
            <div className="flex items-center gap-1.5 mt-2 text-primary text-xs font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{funds.length} active goal{funds.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>

        {/* Next Payday Card */}
        <div className="relative overflow-hidden bg-surface border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-secondary" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-subtle">
              Next Payday
            </span>
            <div className="p-2 rounded-xl bg-secondary/10 text-secondary">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            {nextPayday ? (
              <>
                <h3 className="text-3xl font-bold text-foreground tracking-tight">
                  ${formatCurrency(nextPayday.amount)}
                </h3>
                <span className="inline-block text-xs font-medium text-secondary mt-2 bg-secondary/10 px-2 py-0.5 rounded-full">
                  {nextPaydayDays === 0
                    ? "Today! 🎉"
                    : nextPaydayDays === 1
                      ? "In 1 day"
                      : `In ${nextPaydayDays} days`}
                </span>
              </>
            ) : (
              <>
                <h3 className="text-3xl font-bold text-muted tracking-tight">—</h3>
                <span className="inline-block text-xs font-medium text-muted mt-2">
                  No upcoming paydays
                </span>
              </>
            )}
          </div>
        </div>

        {/* Upcoming Bills Summary Card */}
        <div className="relative overflow-hidden bg-surface border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-accent" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-subtle">
              Upcoming Bills
            </span>
            <div className="p-2 rounded-xl bg-accent/10 text-accent">
              <ListChecks className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-foreground tracking-tight">
              ${formatCurrency(totalUnpaid)}
            </h3>
            <span className="inline-block text-xs font-medium text-accent mt-2 bg-accent/10 px-2 py-0.5 rounded-full">
              {unpaidBills.length} bill{unpaidBills.length !== 1 ? "s" : ""} due
            </span>
          </div>
        </div>

        {/* Monthly Bill Progress Card */}
        <div className="relative overflow-hidden bg-surface border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-emerald-400" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-subtle">
              Monthly Progress
            </span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-foreground tracking-tight">
              ${formatCurrency(monthlyBillsPaid)}
              <span className="text-base font-medium text-muted ml-1">
                / ${formatCurrency(monthlyBillsTotal)}
              </span>
            </h3>
            {/* Progress bar */}
            <div className="mt-3 space-y-1.5">
              <div className="h-2.5 w-full bg-surface-raised rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${monthlyBillsPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                  {monthlyBillsPercent}% paid this month
                </span>
                {monthlyBillsPercent === 100 && (
                  <span className="text-[10px] font-bold text-primary">✓ Complete</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Savings Goals Preview Section ─────────── */}
      {previewFunds.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <Target className="h-5 w-5 text-secondary" />
              Savings Goals
            </h2>
            <Link
              href="/funds"
              className="text-xs font-bold text-secondary hover:text-secondary-dark transition-colors flex items-center gap-1 group"
            >
              <span>View All</span>
              <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {previewFunds.map((fund) => {
              const percent =
                fund.targetAmount > 0
                  ? Math.round((fund.currentAmount / fund.targetAmount) * 100)
                  : 0;

              return (
                <div
                  key={fund.id}
                  className="bg-surface border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-xl flex items-center justify-center ${fund.bgLight}`}
                      >
                        <fund.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{fund.name}</h4>
                        <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">
                          {fund.category}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs font-bold ${fund.accentText}`}>
                      {percent}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 w-full bg-surface-raised rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out ${fund.barColor}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-medium text-muted">
                      ${formatCurrency(fund.currentAmount)}
                    </span>
                    <span className="text-xs font-medium text-subtle">
                      ${formatCurrency(fund.targetAmount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Upcoming Bills List Section ───────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
            Upcoming Bills Details
          </h2>
          <Link
            href="/bills"
            className="text-xs font-bold text-secondary hover:text-secondary-dark transition-colors flex items-center gap-1 group"
          >
            <span>View All</span>
            <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm divide-y divide-border">
          {previewBills.length === 0 ? (
            <div className="p-8 text-center">
              <ListChecks className="h-8 w-8 mx-auto text-muted mb-2" />
              <p className="text-sm text-muted font-medium">All bills are paid! 🎉</p>
            </div>
          ) : (
            previewBills.map((bill) => {
              const days = daysUntil(bill.dueDate);
              let timeBadge: { label: string; className: string } | null = null;

              if (isNaN(days)) {
                timeBadge = null; // can't parse date, skip badge
              } else if (days < 0) {
                timeBadge = {
                  label: "Overdue",
                  className:
                    "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                };
              } else if (days === 0) {
                timeBadge = {
                  label: "Due today",
                  className:
                    "bg-accent/10 text-accent",
                };
              } else if (days <= 7) {
                timeBadge = {
                  label: `in ${days} day${days !== 1 ? "s" : ""}`,
                  className:
                    "bg-accent/10 text-accent",
                };
              } else {
                timeBadge = {
                  label: `in ${days} days`,
                  className:
                    "bg-surface-raised text-muted",
                };
              }

              return (
                <div
                  key={bill.id}
                  className="p-4 sm:p-5 flex items-center justify-between hover:bg-surface-raised transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`hidden sm:flex h-10 w-10 rounded-xl items-center justify-center font-bold text-xs ${bill.categoryColor}`}>
                      {bill.category.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-semibold text-foreground">
                        {bill.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-subtle">
                          Due: {bill.dueDate}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-border-strong" />
                        <span className="text-xs font-medium text-muted bg-surface-raised px-2 py-0.5 rounded-md">
                          {bill.category}
                        </span>
                        {timeBadge && (
                          <>
                            <span className="h-1 w-1 rounded-full bg-border-strong" />
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${timeBadge.className}`}
                            >
                              {days < 0 ? (
                                <AlertTriangle className="h-3 w-3" />
                              ) : days <= 7 ? (
                                <Clock className="h-3 w-3" />
                              ) : null}
                              {timeBadge.label}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <span className="text-base sm:text-lg font-bold text-foreground">
                      ${bill.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
