"use client";

import { useState } from "react";
import { Plus, Search, Filter, CheckCircle, Clock, AlertCircle, Trash2 } from "lucide-react";

const initialMockBills = [
  {
    id: 1,
    name: "Rent / Mortgage",
    category: "Housing",
    dueDate: "June 30, 2026",
    amount: 1200.00,
    status: "Due Soon",
    frequency: "Monthly",
    statusColor: "text-amber-600 bg-amber-500/10 dark:text-amber-400",
    statusIcon: Clock,
    categoryColor: "bg-secondary/10 text-secondary",
  },
  {
    id: 2,
    name: "Electricity Bill",
    category: "Utilities",
    dueDate: "July 02, 2026",
    amount: 145.50,
    status: "Due Soon",
    frequency: "Monthly",
    statusColor: "text-amber-600 bg-amber-500/10 dark:text-amber-400",
    statusIcon: Clock,
    categoryColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    id: 3,
    name: "Fiber Internet",
    category: "Services",
    dueDate: "July 05, 2026",
    amount: 79.99,
    status: "Due Soon",
    frequency: "Monthly",
    statusColor: "text-amber-600 bg-amber-500/10 dark:text-amber-400",
    statusIcon: Clock,
    categoryColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
  {
    id: 4,
    name: "Gold's Gym Membership",
    category: "Health & Fitness",
    dueDate: "June 20, 2026",
    amount: 45.00,
    status: "Paid",
    frequency: "Monthly",
    statusColor: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400",
    statusIcon: CheckCircle,
    categoryColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    id: 5,
    name: "Car Insurance",
    category: "Auto",
    dueDate: "June 18, 2026",
    amount: 180.00,
    status: "Paid",
    frequency: "Monthly",
    statusColor: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400",
    statusIcon: CheckCircle,
    categoryColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  },
  {
    id: 6,
    name: "Netflix & Spotify Premium",
    category: "Entertainment",
    dueDate: "June 15, 2026",
    amount: 24.99,
    status: "Overdue",
    frequency: "Monthly",
    statusColor: "text-rose-600 bg-rose-500/10 dark:text-rose-400",
    statusIcon: AlertCircle,
    categoryColor: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  },
];

export default function Bills() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bills, setBills] = useState(initialMockBills);

  // Form field state
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [frequency, setFrequency] = useState("Monthly");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const newBill = {
      id: Date.now(),
      name,
      category: "Other",
      dueDate,
      amount: parseFloat(amount),
      status: "Due Soon",
      frequency,
      statusColor: "text-amber-600 bg-amber-500/10 dark:text-amber-400",
      statusIcon: Clock,
      categoryColor: "bg-secondary/10 text-secondary",
    };
    setBills([...bills, newBill]);
    setName("");
    setAmount("");
    setDueDate("");
    setFrequency("Monthly");
    setIsModalOpen(false);
  }

  function togglePaid(id: number) {
    setBills((prev) =>
      prev.map((bill) =>
        bill.id === id
          ? {
              ...bill,
              status: "Paid",
              statusColor: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400",
              statusIcon: CheckCircle,
            }
          : bill
      )
    );
  }

  function deleteBill(id: number) {
    setBills((prev) => prev.filter((bill) => bill.id !== id));
  }

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 sm:px-6 md:py-12 space-y-6">
      {/* Header and Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            My Bills
          </h1>
          <p className="text-sm text-muted mt-1">
            Track and manage your upcoming payments.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-secondary hover:bg-secondary-dark active:scale-95 text-secondary-fg text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-secondary/15 transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Add Bill</span>
        </button>
      </div>

      {/* Summary Banner Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-subtle">
            Total Monthly Bills
          </span>
          <h3 className="text-2xl font-bold text-foreground mt-1 tracking-tight">
            $1,675.48
          </h3>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-subtle">
            Remaining Due
          </span>
          <h3 className="text-2xl font-bold text-accent mt-1 tracking-tight">
            $1,425.49
          </h3>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-subtle">
            Total Paid
          </span>
          <h3 className="text-2xl font-bold text-primary mt-1 tracking-tight">
            $225.00
          </h3>
        </div>
      </div>

      {/* Filter and Search Bar Mockup */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-surface border border-border rounded-2xl p-4 shadow-sm">
        <div className="flex w-full sm:w-auto items-center gap-2 border border-border rounded-xl px-3 py-2 bg-surface-raised flex-1 sm:max-w-md">
          <Search className="h-4 w-4 text-subtle" />
          <input
            type="text"
            placeholder="Search bills..."
            className="bg-transparent border-none text-sm text-foreground outline-none w-full placeholder:text-subtle"
            disabled
          />
        </div>
        <div className="flex w-full sm:w-auto gap-2 justify-end">
          <button className="flex items-center gap-1.5 border border-border rounded-xl px-3 py-2 text-xs font-semibold text-muted hover:bg-surface-raised transition-colors">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter</span>
          </button>
          <div className="flex bg-surface-raised p-1 rounded-xl border border-border">
            <button className="bg-surface text-foreground text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
              All
            </button>
            <button className="text-muted text-xs font-semibold px-3 py-1.5 rounded-lg">
              Unpaid
            </button>
            <button className="text-muted text-xs font-semibold px-3 py-1.5 rounded-lg">
              Paid
            </button>
          </div>
        </div>
      </div>

      {/* Bills Scrollable Container */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-subtle uppercase tracking-wider px-1">
          Bills List
        </h2>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm divide-y divide-border max-h-[500px] overflow-y-auto">
          {bills.map((bill) => {
            const StatusIcon = bill.statusIcon;

            return (
              <div
                key={bill.id}
                className="p-4 sm:p-5 flex items-center justify-between hover:bg-surface-raised transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Category icon container */}
                  <div className={`hidden sm:flex h-11 w-11 rounded-xl items-center justify-center font-bold text-xs ${bill.categoryColor}`}>
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
                      <span className="h-1 w-1 rounded-full bg-border-strong" />
                      <span className="text-xs font-medium text-subtle">
                        {bill.frequency}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="text-right">
                    <span className="text-base sm:text-lg font-bold text-foreground block">
                      ${bill.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${bill.statusColor}`}>
                    <StatusIcon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{bill.status}</span>
                  </div>
                  {/* Mark as Paid */}
                  <button
                    type="button"
                    onClick={() => togglePaid(bill.id)}
                    title="Mark as Paid"
                    disabled={bill.status === "Paid"}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-subtle hover:text-primary hover:bg-primary/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => deleteBill(bill.id)}
                    title="Delete bill"
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-subtle hover:text-destructive hover:bg-destructive/10 transition-all duration-150"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Bill Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border w-full max-w-md p-6 rounded-3xl shadow-2xl flex flex-col gap-5">
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Add New Bill
              </h3>
              <p className="text-xs text-muted mt-1">
                Enter details below to register a new recurring bill.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-subtle uppercase tracking-wider">
                  Bill Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Electricity, Water, Rent"
                  className="w-full border border-border rounded-xl px-3.5 py-2.5 text-sm bg-surface-raised text-foreground outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-subtle uppercase tracking-wider">
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle text-sm">$</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full border border-border rounded-xl pl-8 pr-3.5 py-2.5 text-sm bg-surface-raised text-foreground outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-subtle uppercase tracking-wider">
                    Due Date
                  </label>
                  <input
                    type="date"
                    className="w-full border border-border rounded-xl px-3.5 py-2.5 text-sm bg-surface-raised text-foreground outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-subtle uppercase tracking-wider">
                  Frequency
                </label>
                <select
                  className="w-full border border-border rounded-xl px-3.5 py-2.5 text-sm bg-surface-raised text-foreground outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all appearance-none cursor-pointer"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                >
                  <option value="Weekly">Weekly</option>
                  <option value="Bi-Weekly">Bi-Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-border text-muted hover:bg-surface-raised text-sm font-semibold rounded-xl transition-colors active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-secondary hover:bg-secondary-dark active:scale-[0.98] text-secondary-fg text-sm font-semibold rounded-xl shadow-md shadow-secondary/15 transition-colors"
                >
                  Save Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
