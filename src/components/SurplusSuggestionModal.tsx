"use client";

import React, { useEffect } from "react";
import { X, TrendingUp, PiggyBank, Target, ArrowRight } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface SurplusSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  newPayAmount: number;
  surplusAmount: number;
  onAllocate: (target: string, amount: number) => void;
}

export default function SurplusSuggestionModal({
  isOpen,
  onClose,
  memberId,
  newPayAmount,
  surplusAmount,
  onAllocate,
}: SurplusSuggestionModalProps) {
  const { funds, householdMembers } = useApp();

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

  if (!isOpen) return null;

  const member = householdMembers.find((m) => String(m.id) === String(memberId));
  const memberName = member ? member.name : "Member";

  // Calculate top 3 goals by progress percentage descending
  const topGoals = [...funds]
    .map((f) => {
      const progress = f.targetAmount > 0 ? (f.currentAmount / f.targetAmount) * 100 : 0;
      return { ...f, progress };
    })
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3);

  const formattedSurplus = surplusAmount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="fixed inset-0 z-[100] modal-backdrop flex items-center justify-center bg-foreground/20 dark:bg-foreground/20 dark:bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* Backdrop overlay */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-sm bg-surface border border-border rounded-2xl shadow-2xl max-h-[92dvh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
          <div className="flex items-center gap-2 text-primary">
            <TrendingUp size={20} />
            <h3 className="font-syne font-extrabold text-base text-foreground tracking-wide">
              Surplus Detected!
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-muted hover:bg-white/5 hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Title details */}
          <div className="space-y-1">
            <h4 className="font-syne font-bold text-lg text-foreground leading-tight">
              {memberName} earned <span className="text-primary font-mono">${formattedSurplus}</span> over average!
            </h4>
            <p className="text-xs text-muted font-sans">
              Would you like to allocate this extra income to your savings goals or bills surplus pool?
            </p>
          </div>

          {/* Allocations Options list */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-subtle uppercase tracking-wider block font-mono">
              Allocate Surplus To:
            </span>

            {/* Goals */}
            <div className="space-y-2">
              {topGoals.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => onAllocate(String(goal.id), surplusAmount)}
                  className="w-full bg-background border border-border rounded-xl p-3 flex items-center justify-between text-left hover:border-primary/30 transition-all active:scale-[0.99] group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-1.5 rounded-lg bg-secondary/15 text-secondary shrink-0`}>
                      <Target size={14} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-foreground block truncate">
                        {goal.name}
                      </span>
                      <span className="text-[10px] text-muted font-mono block">
                        Progress: {goal.progress.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-xs font-bold text-primary whitespace-nowrap bg-primary/10 px-2.5 py-1 rounded-lg group-hover:bg-primary group-hover:text-primary-fg transition-all">
                    <span>+${formattedSurplus}</span>
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>

            {/* Bills Surplus Pool */}
            <button
              onClick={() => onAllocate("bills_surplus", surplusAmount)}
              className="w-full bg-background border border-border rounded-xl p-3 flex items-center justify-between text-left hover:border-primary/30 transition-all active:scale-[0.99] group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                  <PiggyBank size={14} />
                </div>
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    Bills Surplus Pool
                  </span>
                  <span className="text-[10px] text-muted block font-sans">
                    Keep in household balance pool
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 font-mono text-xs font-bold text-primary whitespace-nowrap bg-primary/10 px-2.5 py-1 rounded-lg group-hover:bg-primary group-hover:text-primary-fg transition-all">
                <span>+${formattedSurplus}</span>
                <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          </div>
        </div>

        {/* Skip Actions Footer */}
        <div className="p-5 border-t border-border shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl border border-border text-xs font-bold text-muted hover:text-foreground hover:bg-white/5 transition-colors cursor-pointer uppercase tracking-wider"
          >
            Skip Allocation
          </button>
        </div>
      </div>
    </div>
  );
}
