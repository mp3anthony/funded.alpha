"use client";

import { useState } from "react";
import { Target, Plus, PiggyBank, TrendingUp } from "lucide-react";
import { useApp, useCurrentUser, type Fund } from "@/context/AppContext";
import AddGoalSheet from "@/components/AddGoalSheet";
import EditGoalSheet from "@/components/EditGoalSheet";
import GoalDetailSheet from "@/components/GoalDetailSheet";
import AddAmountModal from "@/components/AddAmountModal";
import PageHeader from "@/components/PageHeader";

const ADD_AMOUNT = 50; // dollars added per click

export default function Funds() {
  const { funds, deleteGoal, addToGoal } = useApp();
  const currentUser = useCurrentUser();

  // ── Local UI state ────────────────────────────────────────────────
  const [selectedGoal, setSelectedGoal] = useState<Fund | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addAmountGoal, setAddAmountGoal] = useState<Fund | null>(null);

  // ── Derived summary values ────────────────────────────────────────
  const totalSaved = funds.reduce((sum, f) => sum + f.currentAmount, 0);
  const avgCompletion =
    funds.length > 0
      ? funds.reduce((sum, f) => sum + (f.currentAmount / f.targetAmount) * 100, 0) /
        funds.length
      : 0;

  // ── Handlers ──────────────────────────────────────────────────────
  const handleDeleteGoal = async () => {
    if (selectedGoal && confirm(`Are you sure you want to delete "${selectedGoal.name}"?`)) {
      await deleteGoal(selectedGoal.id);
      setIsDetailOpen(false);
      setSelectedGoal(null);
    }
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 sm:px-6 md:py-12 space-y-6">
      <PageHeader
        title="Goals"
        subtitle="Track your savings and financial targets"
        user={currentUser}
        action={
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 bg-secondary hover:bg-secondary-dark active:scale-95 text-secondary-fg text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-secondary/15 transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>New Goal</span>
          </button>
        }
      />

      {/* Summary Banner — reactive to state */}
      <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-subtle block">
            Total Accumulated Savings
          </span>
          <div className="flex items-baseline gap-2">
            <h3 className="text-[clamp(1.75rem,5vw,2.25rem)] font-black text-foreground tracking-tight">
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

      {/* Savings Goals Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-subtle uppercase tracking-wider px-1">
          Savings Goals
        </h2>

        {funds.length === 0 ? (
          <div className="bg-surface border border-border rounded-2xl p-10 text-center shadow-sm">
            <Target className="h-10 w-10 text-subtle mx-auto mb-3" />
            <p className="text-sm font-semibold text-muted">No goals configured yet.</p>
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
                  onClick={() => {
                    setSelectedGoal(fund);
                    setIsDetailOpen(true);
                  }}
                  className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-4 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
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
                      onClick={(e) => {
                        e.stopPropagation();
                        setAddAmountGoal(fund);
                      }}
                      className="flex items-center justify-center gap-1.5 w-full py-2 border border-border bg-surface-raised hover:bg-primary/10 hover:border-primary/30 hover:text-primary text-muted text-xs font-semibold transition-all duration-200 active:scale-[0.98]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Amount
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Goal Detail Sheet */}
      <GoalDetailSheet
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedGoal(null);
        }}
        goal={selectedGoal}
        onEdit={() => {
          setIsDetailOpen(false);
          setIsEditOpen(true);
        }}
        onDelete={handleDeleteGoal}
      />

      {/* Edit Goal Sheet */}
      <EditGoalSheet
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedGoal(null);
        }}
        existingGoal={selectedGoal}
      />

      {/* Add Goal Sheet */}
      <AddGoalSheet
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />

      {/* Add Amount Modal */}
      <AddAmountModal
        isOpen={addAmountGoal !== null}
        onClose={() => setAddAmountGoal(null)}
        goal={addAmountGoal}
        onConfirm={(amount) => {
          if (addAmountGoal) {
            addToGoal(addAmountGoal.id, amount);
          }
        }}
      />
    </div>
  );
}
