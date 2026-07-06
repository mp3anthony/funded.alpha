"use client";

import React, { useState, useEffect } from "react";
import { X, PiggyBank } from "lucide-react";
import { useApp, type Fund } from "@/context/AppContext";

interface AddGoalSheetProps {
  isOpen: boolean;
  onClose: () => void;
  existingGoal?: Fund;
}

export default function AddGoalSheet({
  isOpen,
  onClose,
  existingGoal,
}: AddGoalSheetProps) {
  const { addFund, updateGoal } = useApp();

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("0");
  const [category, setCategory] = useState("Emergency Fund");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState<'not_started' | 'in_progress' | 'completed' | 'paused'>("not_started");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    document.body.classList.add("modal-open");
    return () => {
      const activeModals = document.querySelectorAll(".modal-backdrop");
      if (activeModals.length <= 1) {
        document.body.classList.remove("modal-open");
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && existingGoal) {
      setName(existingGoal.name);
      setTargetAmount(existingGoal.targetAmount.toString());
      setCurrentAmount(existingGoal.currentAmount.toString());
      setCategory(existingGoal.category);
      setDeadline(existingGoal.deadline || "");
      setStatus(existingGoal.status || "not_started");
    } else if (isOpen) {
      setName("");
      setTargetAmount("");
      setCurrentAmount("0");
      setCategory("Emergency Fund");
      setDeadline("");
      setStatus("not_started");
    }
  }, [isOpen, existingGoal]);

  if (!isOpen) return null;

  const isFormValid = 
    name.trim() !== "" && 
    targetAmount.trim() !== "" && 
    !isNaN(Number(targetAmount)) && 
    Number(targetAmount) > 0 &&
    !isNaN(Number(currentAmount));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSaving(true);
    try {
      // Determine styling details based on category
      let bgLight = "bg-slate-500/10 text-slate-600 dark:text-slate-400";
      let barColor = "bg-slate-500";
      let accentText = "text-slate-600 dark:text-slate-400";

      if (category === "Vacation") {
        bgLight = "bg-secondary/10 text-secondary";
        barColor = "bg-secondary";
        accentText = "text-secondary";
      } else if (category === "Emergency Fund") {
        bgLight = "bg-primary/10 text-primary";
        barColor = "bg-primary";
        accentText = "text-primary";
      } else if (category === "Transport") {
        bgLight = "bg-accent/10 text-accent";
        barColor = "bg-accent";
        accentText = "text-accent";
      } else if (category === "Buy a House") {
        bgLight = "bg-indigo-500/10 text-indigo-500";
        barColor = "bg-indigo-500";
        accentText = "text-indigo-500";
      } else if (category === "Education") {
        bgLight = "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
        barColor = "bg-yellow-500";
        accentText = "text-yellow-600 dark:text-yellow-400";
      } else if (category === "Debt Payoff") {
        bgLight = "bg-rose-500/10 text-rose-500";
        barColor = "bg-rose-500";
        accentText = "text-rose-500";
      } else if (category === "Interest Free Payment") {
        bgLight = "bg-purple-500/10 text-purple-500";
        barColor = "bg-purple-500";
        accentText = "text-purple-500";
      }

      const goalData = {
        name,
        category,
        currentAmount: Number(currentAmount) || 0,
        targetAmount: Number(targetAmount),
        bgLight,
        barColor,
        accentText,
        icon: PiggyBank,
        deadline: deadline || null,
        status,
      };

      if (existingGoal) {
        await updateGoal(existingGoal.id, goalData);
      } else {
        await addFund({
          id: Date.now(), // placeholder
          ...goalData,
        });
      }

      // Reset
      setName("");
      setTargetAmount("");
      setCurrentAmount("0");
      setCategory("Emergency Fund");
      setDeadline("");
      setStatus("not_started");

      onClose();
    } catch (error) {
      console.error("Failed to save goal:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] modal-backdrop flex items-end justify-center bg-foreground/20 dark:bg-black/80 backdrop-blur-sm md:items-stretch md:justify-end md:p-0 md:bg-foreground/20 dark:bg-foreground/20 dark:bg-black/80 animate-in fade-in duration-200">
      {/* Overlay to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Content */}
      <form 
        onSubmit={handleSave}
        className="relative w-full max-w-md max-h-[92dvh] md:h-screen md:max-h-screen bg-surface border border-border md:border-y-0 md:border-r-0 md:border-l rounded-t-3xl rounded-b-none md:rounded-none md:rounded-l-3xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 md:slide-in-from-right duration-250"
      >
        
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface/90 px-5 py-3 md:px-6 md:py-4 backdrop-blur">
          <h2 className="font-syne text-xl font-bold text-foreground">
            {existingGoal ? "Edit Goal" : "Create Goal"}
          </h2>
          <button 
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted hover:bg-white/5 hover:text-foreground transition-colors focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 md:px-6 md:py-6 space-y-4 md:space-y-6">
          
          {/* Goal Name */}
          <div className="flex flex-col space-y-1.5 md:space-y-2">
            <label className="font-heading text-xs font-semibold text-subtle uppercase tracking-wider">
              Goal Name
            </label>
            <input 
              type="text" 
              placeholder="e.g. Holiday Trip, House Deposit"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-raised px-4 py-2.5 md:py-3 text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-sans text-sm"
              required
            />
          </div>

          {/* Target Amount */}
          <div className="flex flex-col space-y-1.5 md:space-y-2">
            <label className="font-heading text-xs font-semibold text-subtle uppercase tracking-wider">
              Target Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-mono">$</span>
              <input 
                type="number" 
                placeholder="0.00"
                min="1"
                step="0.01"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-raised pl-8 pr-4 py-2.5 md:py-3 font-mono text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                required
              />
            </div>
          </div>

          {/* Current Amount */}
          <div className="flex flex-col space-y-1.5 md:space-y-2">
            <label className="font-heading text-xs font-semibold text-subtle uppercase tracking-wider">
              Current Saved Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-mono">$</span>
              <input 
                type="number" 
                placeholder="0.00"
                min="0"
                step="0.01"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-raised pl-8 pr-4 py-2.5 md:py-3 font-mono text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
              />
            </div>
          </div>

          {/* Deadline Date Picker */}
          <div className="flex flex-col space-y-1.5 md:space-y-2">
            <label className="font-heading text-xs font-semibold text-subtle uppercase tracking-wider">
              Deadline
            </label>
            <input 
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full min-w-0 bg-surface border border-border rounded-lg p-2.5 md:p-3 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Status Dropdown */}
          <div className="flex flex-col space-y-1.5 md:space-y-2">
            <label className="font-heading text-xs font-semibold text-subtle uppercase tracking-wider">
              Status
            </label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full rounded-xl border border-border bg-surface-raised px-4 py-2.5 md:py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none text-sm"
              >
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="flex flex-col space-y-1.5 md:space-y-2">
            <label className="font-heading text-xs font-semibold text-subtle uppercase tracking-wider">
              Category
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-raised px-4 py-2.5 md:py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none text-sm"
              >
                <option value="Emergency Fund">Emergency Fund</option>
                <option value="Vacation">Vacation</option>
                <option value="Transport">Transport</option>
                <option value="Buy a House">Buy a House</option>
                <option value="Education">Education</option>
                <option value="Debt Payoff">Debt Payoff</option>
                <option value="Interest Free Payment">Interest Free Payment</option>
                <option value="Other">Other</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div 
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
          className="sticky bottom-0 z-10 border-t border-border bg-surface/95 px-5 pt-3 pb-3 md:px-6 md:pt-4 md:pb-4 backdrop-blur flex items-center gap-3 shrink-0"
        >
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 md:py-4 rounded-xl border border-border text-sm font-bold text-muted hover:text-foreground hover:bg-white/5 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isFormValid || isSaving}
            className={`flex-1 rounded-xl py-3 md:py-4 text-sm font-bold uppercase tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary cursor-pointer ${
              isFormValid && !isSaving
                ? "bg-primary text-primary-fg hover:brightness-110 active:scale-[0.98]" 
                : "bg-surface-raised text-muted cursor-not-allowed"
            }`}
          >
            {existingGoal 
              ? (isSaving ? "Updating..." : "Update Goal") 
              : (isSaving ? "Creating..." : "Create Goal")}
          </button>
        </div>

      </form>
    </div>
  );
}
