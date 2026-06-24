"use client";

import { useState } from "react";
import { Target, Plus, PiggyBank, TrendingUp } from "lucide-react";
import { useApp } from "@/context/AppContext";

const ADD_AMOUNT = 50; // dollars added per click

export default function Funds() {
  const { funds, addFund, addMoneyToFund } = useApp();

  // ── Local UI state ────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTarget, setNewTarget] = useState("");

  // ── Derived summary values ────────────────────────────────────────
  const totalSaved = funds.reduce((sum, f) => sum + f.currentAmount, 0);
  const avgCompletion =
    funds.length > 0
      ? funds.reduce((sum, f) => sum + (f.currentAmount / f.targetAmount) * 100, 0) /
        funds.length
      : 0;

  // ── Handlers ──────────────────────────────────────────────────────
  function handleCreateFund(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const newFund = {
      id: Date.now(),
      name: newName,
      category: "Custom",
      currentAmount: 0,
      targetAmount: parseFloat(newTarget),
      bgLight: "bg-secondary/10 text-secondary",
      barColor: "bg-secondary",
      accentText: "text-secondary",
      icon: PiggyBank,
    };
    addFund(newFund);
    setNewName("");
    setNewTarget("");
    setIsModalOpen(false);
  }

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 sm:px-6 md:py-12 space-y-6">
      {/* Header and Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Savings Goals
          </h1>
          <p className="text-sm text-muted mt-1">
            Track and build your specific fund buckets.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-secondary hover:bg-secondary-dark active:scale-95 text-secondary-fg text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-secondary/15 transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Summary Banner — reactive to state */}
      <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-subtle block">
            Total Accumulated Savings
          </span>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              ${totalSaved.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className="text-xs font-semibold text-primary flex items-center gap-0.5">
              <TrendingUp className="h-3.5 w-3.5" />
              +5.2% this month
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-surface-raised p-4 rounded-2xl border border-border flex-1 sm:max-w-xs">
          <div className="flex h-10 w-10 rounded-xl bg-secondary/10 text-secondary items-center justify-center font-bold shrink-0">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-foreground">
              {funds.length} Active Goal{funds.length !== 1 ? "s" : ""}
            </div>
            <p className="text-xs text-muted mt-0.5">
              Average completion: {avgCompletion.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Fund Buckets Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-subtle uppercase tracking-wider px-1">
          Fund Buckets
        </h2>

        {funds.length === 0 ? (
          <div className="bg-surface border border-border rounded-2xl p-10 text-center shadow-sm">
            <PiggyBank className="h-10 w-10 text-subtle mx-auto mb-3" />
            <p className="text-sm font-semibold text-muted">No funds yet.</p>
            <p className="text-xs text-subtle mt-1">Create your first savings goal to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {funds.map((fund) => {
              const IconComponent = fund.icon;
              const percentage = Math.min((fund.currentAmount / fund.targetAmount) * 100, 100);
              const isComplete = fund.currentAmount >= fund.targetAmount;

              return (
                <div
                  key={fund.id}
                  className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow"
                >
                  {/* Card header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 rounded-xl items-center justify-center shrink-0 ${fund.bgLight}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-foreground leading-none">
                          {fund.name}
                        </h4>
                        <span className="text-[10px] font-semibold tracking-wide uppercase text-subtle mt-1 block">
                          {fund.category}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs font-bold ${fund.accentText}`}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>

                  {/* Progress bar — driven by live state */}
                  <div className="space-y-2">
                    <div className="w-full bg-surface-raised rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${fund.barColor}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground">
                        ${fund.currentAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-subtle">
                        Target: ${fund.targetAmount.toLocaleString("en-US", { minimumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>

                  {/* Add Money / Completed action */}
                  {isComplete ? (
                    <div className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold">
                      <Target className="h-3.5 w-3.5" />
                      <span>Goal Reached! 🎉</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => addMoneyToFund(fund.id, ADD_AMOUNT)}
                      className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl border border-border bg-surface-raised hover:bg-primary/10 hover:border-primary/30 hover:text-primary text-muted text-xs font-semibold transition-all duration-200 active:scale-[0.98]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add ${ADD_AMOUNT}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create New Fund Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border w-full max-w-md p-6 rounded-3xl shadow-2xl flex flex-col gap-5">
            <div>
              <h3 className="text-lg font-bold text-foreground">Create New Fund</h3>
              <p className="text-xs text-muted mt-1">
                Set a name and a savings target for your new fund bucket.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleCreateFund}>
              {/* Fund Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-subtle uppercase tracking-wider">
                  Fund Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Holiday, House Deposit, Laptop"
                  className="w-full border border-border rounded-xl px-3.5 py-2.5 text-sm bg-surface-raised text-foreground outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>

              {/* Target Amount */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-subtle uppercase tracking-wider">
                  Target Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="0.00"
                    className="w-full border border-border rounded-xl pl-8 pr-3.5 py-2.5 text-sm bg-surface-raised text-foreground outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setNewName("");
                    setNewTarget("");
                    setIsModalOpen(false);
                  }}
                  className="px-4 py-2.5 border border-border text-muted hover:bg-surface-raised text-sm font-semibold rounded-xl transition-colors active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-secondary hover:bg-secondary-dark active:scale-[0.98] text-secondary-fg text-sm font-semibold rounded-xl shadow-md shadow-secondary/15 transition-colors"
                >
                  Create Fund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
