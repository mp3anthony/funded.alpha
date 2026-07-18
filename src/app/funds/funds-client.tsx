"use client";

import { useState, useMemo, useEffect } from "react";
import { Target, Plus, PiggyBank, TrendingUp, ChevronDown, ChevronRight } from "lucide-react";
import { useApp, useCurrentUser, type Fund } from "@/context/AppContext";
import AddGoalSheet from "@/components/AddGoalSheet";
import EditGoalSheet from "@/components/EditGoalSheet";
import GoalDetailSheet from "@/components/GoalDetailSheet";
import AddAmountModal from "@/components/AddAmountModal";
import EditCategoryOrderModal from "@/components/EditCategoryOrderModal";
import PageHeader from "@/components/PageHeader";

const ADD_AMOUNT = 50; // dollars added per click

const GOAL_CATEGORIES = [
  "Home & Living",
  "Debt & Finance",
  "Vacation & Travel",
  "Savings",
  "Emergency",
  "Short-Term",
  "Education",
  "Other",
];

// Legacy goal category names → new 8-category scheme
const GOAL_CATEGORY_REMAP: Record<string, string> = {
  "Emergency Fund": "Emergency",
  "Buy a House": "Home & Living",
  "Vacation": "Vacation & Travel",
  "Transport": "Vacation & Travel",
  "Debt Payoff": "Debt & Finance",
  "Interest Free Payment": "Debt & Finance",
};

export default function FundsClient() {
  const { funds, deleteGoal, addToGoal } = useApp();
  const currentUser = useCurrentUser();

  // ── Local UI state ────────────────────────────────────────────────
  const [selectedGoal, setSelectedGoal] = useState<Fund | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addAmountGoal, setAddAmountGoal] = useState<Fund | null>(null);

  const [categoryFilter, setCategoryFilter] = useState("All");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [isEditCategoryOrderOpen, setIsEditCategoryOrderOpen] = useState(false);
  const [categoryOrder, setCategoryOrder] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  useEffect(() => {
    const savedOrder = localStorage.getItem("goalCategoryOrder");
    if (savedOrder) {
      try {
        const parsed: string[] = JSON.parse(savedOrder);
        const cleaned = Array.from(
          new Set(
            parsed
              .map((c) => GOAL_CATEGORY_REMAP[c] || c)
              .filter((c) => GOAL_CATEGORIES.includes(c))
          )
        );
        setCategoryOrder(cleaned);
        localStorage.setItem("goalCategoryOrder", JSON.stringify(cleaned));
      } catch (e) {}
    }
  }, []);

  // ── Derived summary values ────────────────────────────────────────
  const totalSaved = funds.reduce((sum, f) => sum + f.currentAmount, 0);
  const avgCompletion =
    funds.length > 0
      ? funds.reduce((sum, f) => sum + (f.currentAmount / f.targetAmount) * 100, 0) /
        funds.length
      : 0;

  const filteredFunds = useMemo(() => {
    return funds.filter((f) => {
      if (categoryFilter === "All") return true;
      return (f.category || "Other") === categoryFilter;
    });
  }, [funds, categoryFilter]);

  const groupedFunds = useMemo(() => {
    const groups: Record<string, typeof filteredFunds> = {};
    filteredFunds.forEach((fund) => {
      const cat = fund.category || "Other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(fund);
    });

    Object.keys(groups).forEach((cat) => {
      groups[cat].sort((a, b) => b.currentAmount - a.currentAmount);
    });

    return groups;
  }, [filteredFunds]);

  const allCategories = useMemo(() => {
    const currentCats = Object.keys(groupedFunds);
    return Array.from(new Set([...categoryOrder, ...GOAL_CATEGORIES, ...currentCats]));
  }, [groupedFunds, categoryOrder]);

  // ── Handlers ──────────────────────────────────────────────────────
  const handleDeleteGoal = async () => {
    if (selectedGoal && confirm(`Are you sure you want to delete "${selectedGoal.name}"?`)) {
      try {
        await deleteGoal(selectedGoal.id);
        setIsDetailOpen(false);
        setSelectedGoal(null);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Unknown error";
        alert("Failed to delete goal: " + errMsg);
      }
    }
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 pt-4 pb-8 sm:px-6 md:pt-6 md:pb-12 space-y-6">
      <PageHeader
        title="Goals"
        subtitle="Track your savings and financial targets"
        action={
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 bg-secondary hover:bg-secondary-dark active:scale-95 text-secondary-fg text-xs font-semibold px-3 py-2 rounded-xl shadow-md shadow-secondary/15 transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Goal</span>
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
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-subtle uppercase tracking-wider">
            Savings Goals
          </h2>
          <button
            onClick={() => setIsEditCategoryOrderOpen(true)}
            className="text-[10px] font-bold text-muted hover:text-foreground uppercase tracking-wider transition-colors"
          >
            Edit Order
          </button>
        </div>

        {/* Category Filter */}
        <div className="px-1">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">
              Category
            </label>
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-xl border border-primary/30 bg-background px-2 py-2 text-[10px] font-semibold text-foreground focus:border-primary focus:outline-none appearance-none cursor-pointer pr-6"
              >
                <option value="All">All</option>
                <option value="Home & Living">Home & Living</option>
                <option value="Debt & Finance">Debt & Finance</option>
                <option value="Vacation & Travel">Vacation & Travel</option>
                <option value="Savings">Savings</option>
                <option value="Emergency">Emergency</option>
                <option value="Short-Term">Short-Term</option>
                <option value="Education">Education</option>
                <option value="Other">Other</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-muted">
                <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {filteredFunds.length === 0 ? (
          <div className="bg-surface border border-border rounded-2xl p-10 text-center shadow-sm">
            <Target className="h-10 w-10 text-subtle mx-auto mb-3" />
            {categoryFilter !== "All" ? (
              <p className="text-sm font-semibold text-muted">No goals in {categoryFilter}</p>
            ) : (
              <>
                <p className="text-sm font-semibold text-muted">No goals configured yet.</p>
                <p className="text-xs text-subtle mt-1">Create your first savings goal to get started.</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedFunds)
              .sort(([a], [b]) => {
                const idxA = allCategories.indexOf(a);
                const idxB = allCategories.indexOf(b);
                if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                if (idxA !== -1) return -1;
                if (idxB !== -1) return 1;
                return a.localeCompare(b);
              })
              .map(([category, categoryFunds]) => (
              <div key={category} className="space-y-2">
                <button
                  onClick={() => toggleCategory(category)}
                  className="flex items-center gap-2 w-full text-left px-1 focus:outline-none group"
                >
                  {!expandedCategories[category] ? (
                    <ChevronRight className="h-4 w-4 text-muted group-hover:text-foreground transition-colors" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted group-hover:text-foreground transition-colors" />
                  )}
                  <h3 className="text-xs font-bold text-subtle uppercase tracking-wider group-hover:text-foreground transition-colors">
                    {category} <span className="text-muted font-normal ml-1">({categoryFunds.length})</span>
                  </h3>
                </button>

                {expandedCategories[category] && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {categoryFunds.map((fund) => {
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
            ))}
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

      {/* Edit Category Order Modal */}
      <EditCategoryOrderModal
        isOpen={isEditCategoryOrderOpen}
        onClose={() => setIsEditCategoryOrderOpen(false)}
        categories={allCategories}
        onSave={(newOrder) => {
          setCategoryOrder(newOrder);
          localStorage.setItem("goalCategoryOrder", JSON.stringify(newOrder));
        }}
      />
    </div>
  );
}
