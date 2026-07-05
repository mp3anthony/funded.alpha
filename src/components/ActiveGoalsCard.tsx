"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight, Target } from "lucide-react";
import { type Fund } from "@/context/AppContext";

interface ActiveGoalsCardProps {
  funds: Fund[];
  onGoalClick: (goal: Fund) => void;
}

export const ActiveGoalsCard = React.memo(function ActiveGoalsCard({
  funds,
  onGoalClick,
}: ActiveGoalsCardProps) {
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
    <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 flex flex-col h-full shadow-xl transition-all duration-300 hover:border-white/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-syne font-bold text-base text-white tracking-wide flex items-center gap-2">
          <Target className="h-4 w-4 text-[#c8ff00]" />
          Savings Goals
        </h3>
        <Link
          href="/funds"
          className="text-[10px] font-syne font-bold uppercase tracking-wider text-[#c8ff00] hover:text-white transition-colors flex items-center gap-1 group"
        >
          <span>View All</span>
          <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center">
        {activeGoalsList.length === 0 ? (
          <div className="py-8 text-center flex flex-col items-center justify-center space-y-2.5">
            <div className="p-3 bg-white/[0.02] rounded-full border border-white/5">
              <Target className="h-6 w-6 text-neutral-600" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-neutral-400">No active goals</p>
              <p className="text-xs text-neutral-500 font-sans max-w-[200px] mx-auto">
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
                          goal.bgLight || "bg-white/5 text-white"
                        }`}
                      >
                        <GoalIcon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-sans font-bold text-xs text-neutral-200 truncate group-hover:text-white transition-colors leading-none">
                          {goal.name}
                        </h4>
                        <span className="text-[8px] font-bold font-mono text-neutral-500 uppercase tracking-wider block mt-0.5">
                          {goal.category}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs font-bold font-mono leading-none ${goal.accentText || "text-[#c8ff00]"}`}>
                      {roundedPercent}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out ${
                        goal.barColor || "bg-[#c8ff00]"
                      }`}
                      style={{ width: `${roundedPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between font-mono text-[9px] text-neutral-500">
                    <span className="font-jetbrains">
                      ${goal.currentAmount.toLocaleString("en-US", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span className="font-jetbrains text-neutral-600">
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
    </div>
  );
});

ActiveGoalsCard.displayName = "ActiveGoalsCard";
export default ActiveGoalsCard;
