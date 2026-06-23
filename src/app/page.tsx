import { PiggyBank, Calendar, ListChecks, ArrowUpRight, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function Home() {
  // Mock bills list
  const mockBills = [
    {
      id: 1,
      name: "Rent / Mortgage",
      category: "Housing",
      dueDate: "June 30, 2026",
      amount: 1200.00,
      color: "bg-secondary/10 text-secondary",
    },
    {
      id: 2,
      name: "Electricity Bill",
      category: "Utilities",
      dueDate: "July 02, 2026",
      amount: 145.50,
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      id: 3,
      name: "Fiber Internet",
      category: "Services",
      dueDate: "July 05, 2026",
      amount: 79.99,
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
  ];

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 sm:px-6 md:py-12 space-y-8">
      {/* Header Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Welcome back, Alex
          </h1>
          <p className="text-sm text-muted mt-1">
            {"Here's your financial overview for today."}
          </p>
        </div>
        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-tr from-secondary to-indigo-600 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-md shadow-secondary/20">
          A
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Funds Card */}
        <div className="relative overflow-hidden bg-surface border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-subtle">
              Total Funds
            </span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <PiggyBank className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-foreground tracking-tight">
              $12,450.00
            </h3>
            <div className="flex items-center gap-1.5 mt-2 text-primary text-xs font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+2.4% this month</span>
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
            <h3 className="text-3xl font-bold text-foreground tracking-tight">
              $4,250.00
            </h3>
            <span className="inline-block text-xs font-medium text-secondary mt-2 bg-secondary/10 px-2 py-0.5 rounded-full">
              In 12 days (July 5)
            </span>
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
              $1,425.49
            </h3>
            <span className="inline-block text-xs font-medium text-accent mt-2 bg-accent/10 px-2 py-0.5 rounded-full">
              3 bills due soon
            </span>
          </div>
        </div>
      </div>

      {/* Upcoming Bills List Section */}
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
          {mockBills.map((bill) => (
            <div
              key={bill.id}
              className="p-4 sm:p-5 flex items-center justify-between hover:bg-surface-raised transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`hidden sm:flex h-10 w-10 rounded-xl items-center justify-center font-bold text-xs ${bill.color}`}>
                  {bill.category.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-foreground">
                    {bill.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-subtle">
                      Due: {bill.dueDate}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-border-strong" />
                    <span className="text-xs font-medium text-muted bg-surface-raised px-2 py-0.5 rounded-md">
                      {bill.category}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base sm:text-lg font-bold text-foreground">
                  ${bill.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="block text-[10px] text-accent font-semibold tracking-wider uppercase mt-1">
                  Pay Soon
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
