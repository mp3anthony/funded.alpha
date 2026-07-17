"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, Target, ChevronUp, ChevronDown } from "lucide-react";
import { type Fund } from "@/context/AppContext";

interface ActiveGoalsCardProps {
  funds: Fund[];
  onGoalClick: (goal: Fund) => void;
}

export const ActiveGoalsCard = React.memo(function ActiveGoalsCard({
  funds,
  onGoalClick,
}: ActiveGoalsCardProps) {
  const [isMinimised, setIsMinimised] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("dashboard_active_goals_minimised");
    if (stored === "false") {
      setIsMinimised(false);
    } else if (stored === "true") {
      setIsMinimised(true);
    }
  }, []);

  const handleToggle = () => {
    setIsMinimised((prev) => {
      const next = !prev;
      localStorage.setItem("dashboard_active_goals_minimised", String(next));
      return next;
    });
  };

  // Get top 3 active goals sorted by progress percentage (highest progress first)
  const activeGoalsList = useMemo(() => {
    return [...funds]
      .filter((f) => f.status !== "completed")
      .map((f) => {
        const progress = f.targetAmount > 0 ? (f.currentAmount / f.targetAmount) * 100 : 0;
        return { ...f, progress };
      })
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 3);
  }, [funds]);

  return (
    <div className={`bg-surface border border-border rounded-2xl p-6 flex flex-col shadow-xl transition-all duration-300 hover:border-white/20 ${isMinimised ? "h-fit" : "h-full"}`}>
      {/* Header */}
      <div className={`flex items-center justify-between gap-3 ${isMinimised ? "" : "mb-5"}`}>
        <h3 className="font-heading font-bold text-sm sm:text-base text-foreground tracking-wide flex items-start gap-2 min-w-0">
          <Target className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <span className="break-words">Savings Goals</span>
        </h3>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/funds"
            prefetch={false}
            className="text-[10px] font-heading font-bold uppercase tracking-wider text-primary hover:text-foreground transition-colors flex items-center gap-1 group whitespace-nowrap"
          >
            <span>View All</span>
            <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
          <button
            onClick={handleToggle}
            className="text-muted hover:text-foreground transition-colors p-1 flex items-center justify-center focus:outline-none"
            aria-label={isMinimised ? "Expand Savings Goals" : "Minimize Savings Goals"}
          >
            {isMinimised ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimised && (
        <div className="flex-1 flex flex-col justify-center">
          {activeGoalsList.length === 0 ? (
            <div className="py-8 text-center flex flex-col items-center justify-center space-y-2.5">
              <div className="p-3 bg-foreground/5 rounded-full border border-border-strong">
                <Target className="h-6 w-6 text-neutral-600" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-muted">No active goals</p>
                <p className="text-xs text-subtle font-body max-w-[200px] mx-auto">
                  Set up your savings goals to track progress here.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-5 flex flex-col">
              {activeGoalsList.map((goal) => {
                const GoalIcon = goal.icon || Target;
                const roundedPercent = Math.min(100, Math.round(goal.progress));

                return (
                  <div
                    key={goal.id}
                    onClick={() => onGoalClick(goal)}
                    className="space-y-2 cursor-pointer group active:scale-[0.99] transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div
                          className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                            goal.bgLight || "bg-white/5 text-foreground"
                          }`}
                        >
                          <GoalIcon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-body font-bold text-xs text-foreground truncate group-hover:text-foreground transition-colors leading-none">
                            {goal.name}
                          </h4>
                          <span className="text-[8px] font-bold font-mono text-subtle uppercase tracking-wider block mt-0.5">
                            {goal.category}
                          </span>
                        </div>
                      </div>
                      <span className={`text-xs font-bold font-mono leading-none ${goal.accentText || "text-primary"}`}>
                        {roundedPercent}%
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ease-out ${
                          goal.barColor || "bg-primary"
                        }`}
                        style={{ width: `${roundedPercent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between font-mono text-[9px] text-subtle">
                      <span className="font-mono">
                        ${goal.currentAmount.toLocaleString("en-US", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                      <span className="font-mono text-neutral-600">
                        target: ${goal.targetAmount.toLocaleString("en-US", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

ActiveGoalsCard.displayName = "ActiveGoalsCard";
export default ActiveGoalsCard;
