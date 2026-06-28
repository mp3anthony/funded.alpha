"use client";

import React from "react";
import { useApp, type Bill, type Fund, type PayHistory } from "@/context/AppContext";
import { calculateHealthScore } from "@/lib/utils";

interface HealthScoreCardProps {
  bills: Bill[];
  funds: Fund[];
  payHistory: PayHistory[];
}

export const HealthScoreCard = React.memo(function HealthScoreCard({
  bills,
  funds,
  payHistory,
}: HealthScoreCardProps) {
  const { householdContributions, paySchedules, isJointFund, billSplits } = useApp();

  // Memoize health score calculation
  const score = React.useMemo(
    () => calculateHealthScore(bills, funds, payHistory, householdContributions, paySchedules, isJointFund, billSplits),
    [bills, funds, payHistory, householdContributions, paySchedules, isJointFund, billSplits]
  );

  // Determine tiers, colors, and descriptions
  let statusText = "Needs Attention";
  let statusColor = "text-[#ff3d57]"; // Red
  let statusBg = "bg-[#ff3d57]/10";
  let dialColor = "#ff3d57";
  let description = isJointFund
    ? "Your household financial health needs attention. Focus on resolving any overdue bills, establishing steady goal contributions, and ensuring your joint fund contributions cover your total bills."
    : "Your household financial health needs attention. Focus on resolving any overdue bills, establishing steady goal contributions, and ensuring your bill assignments cover your total bills.";

  if (score >= 80) {
    statusText = "Excellent";
    statusColor = "text-[#c8ff00]"; // Lime Green
    statusBg = "bg-[#c8ff00]/10";
    dialColor = "#c8ff00";
    description = isJointFund
      ? "Your household financial health is excellent! You're staying ahead of your bills, ensuring your joint fund contributions cover your total bills, and building consistent savings systems."
      : "Your household financial health is excellent! You're staying ahead of your bills, maintaining complete split coverage across all bills, and building consistent savings systems.";
  } else if (score >= 60) {
    statusText = "Good";
    statusColor = "text-[#ffab00]"; // Amber
    statusBg = "bg-[#ffab00]/10";
    dialColor = "#ffab00";
    description = isJointFund
      ? "Your household finances are in good shape. Keep ensuring your joint fund contributions cover your total bills, setting up goal contributions, and ensuring no bills fall overdue."
      : "Your household finances are in good shape. Keep maintaining your split coverage, setting up goal contributions, and ensuring no bills fall overdue.";
  }

  // SVG Circular progress values
  const size = 110;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-xl transition-all duration-300 hover:border-white/20">
      {/* Left Column: Circular Progress indicator */}
      <div className="relative shrink-0 flex items-center justify-center w-[110px] h-[110px]">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            className="text-white/[0.05]"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Active progress circle */}
          <circle
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke={dialColor}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            className="transition-all duration-700 ease-out-back"
          />
        </svg>
        {/* Score text in the center */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="font-mono text-3xl font-bold tracking-tight text-white leading-none">
            {score}
          </span>
          <span className="text-[10px] text-muted-foreground/60 uppercase font-mono tracking-wider mt-0.5">
            / 100
          </span>
        </div>
      </div>

      {/* Right Column: Descriptions and Info */}
      <div className="flex-1 text-center md:text-left space-y-2">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 justify-center md:justify-start">
          <h2 className="font-syne font-bold text-lg text-white">
            Household Health Score
          </h2>
          <span
            className={`inline-block self-center md:self-auto font-syne text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusBg} ${statusColor}`}
          >
            {statusText}
          </span>
        </div>
        <p className="text-sm text-neutral-400 font-sans leading-relaxed max-w-xl">
          {description}
        </p>
        <div className="pt-1 flex flex-wrap gap-x-4 gap-y-1 justify-center md:justify-start font-mono text-[10px] text-neutral-600">
          <span>• Bills Management (40%)</span>
          <span>• Goals/Contributions (30%)</span>
          <span>• {isJointFund ? "Joint Fund Coverage (30%)" : "Budget Adherence (30%)"}</span>
        </div>
      </div>
    </div>
  );
});

HealthScoreCard.displayName = "HealthScoreCard";
export default HealthScoreCard;
