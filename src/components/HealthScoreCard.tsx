"use client";

import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { calculateHealthScore, convertAmount } from "@/lib/utils";

export const HealthScoreCard = React.memo(function HealthScoreCard() {
  const { 
    bills, 
    funds, 
    payHistory, 
    householdContributions, 
    paySchedules, 
    isJointFund, 
    billSplits,
    members 
  } = useApp();

  const [isHealthExpanded, setIsHealthExpanded] = useState(false);
  const [isContributorsExpanded, setIsContributorsExpanded] = useState(true);

  // 1. Calculate Health Score
  const score = useMemo(
    () => calculateHealthScore(bills, funds, payHistory, householdContributions, paySchedules, isJointFund, billSplits),
    [bills, funds, payHistory, householdContributions, paySchedules, isJointFund, billSplits]
  );

  // 2. Status Label Logic
  let statusText = "Needs Attention";
  let dotColor = "bg-[#ff3d57]"; // Red
  let glowColor = "#ff3d57";

  if (score >= 80) {
    statusText = "Fully Funded";
    dotColor = "bg-[#c8ff00]"; // Lime Green
    glowColor = "#c8ff00";
  } else if (score >= 60) {
    statusText = "On Track";
    dotColor = "bg-[#ffab00]"; // Amber
    glowColor = "#ffab00";
  }

  // 3. Weekly Stats Calculations
  const weeklyIncome = useMemo(() => {
    return paySchedules.reduce((sum, schedule) => {
      return sum + convertAmount(schedule.amount || 0, schedule.frequency, "weekly");
    }, 0);
  }, [paySchedules]);

  const weeklyBills = useMemo(() => {
    return bills.reduce((sum, bill) => {
      return sum + convertAmount(bill.amount || 0, bill.frequency || "monthly", "weekly");
    }, 0);
  }, [bills]);

  const weeklySurplus = weeklyIncome - weeklyBills;
  const surplusColor = weeklySurplus >= 0 ? "text-[#c8ff00]" : "text-[#ff3d57]";

  const sinkingFundsTotal = useMemo(() => {
    return funds.reduce((sum, fund) => sum + (fund.currentAmount || 0), 0);
  }, [funds]);

  // Format currency helper
  const formatCurrency = (amount: number) => {
    const isNegative = amount < 0;
    const absoluteAmount = Math.abs(amount);
    const formatted = absoluteAmount.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return `${isNegative ? "-" : ""}$${formatted}`;
  };

  return (
    <div className="bg-[#111111] border border-white/10 rounded-[28px] p-6 flex flex-col gap-7 shadow-xl relative overflow-hidden">
      {/* Top Header */}
      <div className="relative z-10 flex flex-col space-y-1.5">
        <button 
          onClick={() => setIsHealthExpanded(prev => !prev)}
          className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted font-bold hover:text-white transition-colors text-left focus:outline-none w-fit"
        >
          Household Health
          {isHealthExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
        <div className="flex items-center gap-3">
          <div 
            className={`w-3.5 h-3.5 rounded-full ${dotColor} transition-colors duration-700`}
            style={{ boxShadow: `0 0 12px ${glowColor}80` }}
          />
          <h2 className="font-syne font-extrabold text-3xl tracking-tight text-white">
            {statusText}
          </h2>
        </div>
        <p className="text-sm text-subtle font-sans pt-1">
          {weeklySurplus >= 0 
            ? `$${formatCurrency(weeklySurplus).replace('$', '')} surplus after bills this week` 
            : `-$${formatCurrency(Math.abs(weeklySurplus)).replace('$', '')} deficit after bills this week`}
        </p>
      </div>

      {/* 2x2 Stat Grid */}
      {isHealthExpanded && (
      <div className="relative z-10 grid grid-cols-2 gap-3 sm:gap-4">
        {/* Tile 1 */}
        <div className="bg-[#181818] rounded-[20px] p-4 sm:p-5 flex flex-col justify-center gap-1.5 transition-colors hover:bg-[#202020]">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted font-bold">Weekly Income</span>
          <span className="font-mono font-bold text-[22px] text-[#c8ff00] tracking-tight">{formatCurrency(weeklyIncome)}</span>
        </div>
        {/* Tile 2 */}
        <div className="bg-[#181818] rounded-[20px] p-4 sm:p-5 flex flex-col justify-center gap-1.5 transition-colors hover:bg-[#202020]">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted font-bold">Weekly Bills</span>
          <span className="font-mono font-bold text-[22px] text-white tracking-tight">{formatCurrency(weeklyBills)}</span>
        </div>
        {/* Tile 3 */}
        <div className="bg-[#181818] rounded-[20px] p-4 sm:p-5 flex flex-col justify-center gap-1.5 transition-colors hover:bg-[#202020]">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted font-bold">Surplus</span>
          <span className={`font-mono font-bold text-[22px] ${surplusColor} tracking-tight`}>{formatCurrency(weeklySurplus)}</span>
        </div>
        {/* Tile 4 */}
        <div className="bg-[#181818] rounded-[20px] p-4 sm:p-5 flex flex-col justify-center gap-1.5 transition-colors hover:bg-[#202020]">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted font-bold">Sinking Funds</span>
          <span className="font-mono font-bold text-[22px] text-[#c8ff00] tracking-tight">{formatCurrency(sinkingFundsTotal)}</span>
        </div>
      </div>
      )}

      {/* Contributors Row (Only if Joint Fund) */}
      {isJointFund && members && members.length > 0 && (
        <div className="relative z-10 pt-1 flex flex-col space-y-4">
          <button 
            onClick={() => setIsContributorsExpanded(prev => !prev)}
            className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted font-bold hover:text-white transition-colors text-left focus:outline-none w-fit"
          >
            Contributors
            {isContributorsExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          {isContributorsExpanded && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {members.map(member => {
              const contribution = householdContributions.find(c => String(c.member_id) === String(member.id));
              const weeklyAmount = contribution ? convertAmount(contribution.amount, contribution.frequency, 'weekly') : 0;
              
              return (
                <div key={member.id} className="bg-[#181818] rounded-[20px] p-3 sm:p-4 flex items-center gap-3 transition-colors hover:bg-[#202020] overflow-hidden">
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-white/5 bg-[#111111]">
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted">{member.avatar}</div>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0 gap-0.5">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted font-bold truncate">{member.name}</span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono font-bold text-[15px] sm:text-[18px] text-[#c8ff00] truncate">{formatCurrency(weeklyAmount)}</span>
                      <span className="font-mono text-[9px] sm:text-[10px] text-muted/80">/wk</span>
                    </div>
                    {contribution ? (
                      <div className="flex flex-col mt-0.5">
                        <span className="font-mono text-[9px] sm:text-[10px] text-muted/60 leading-tight">
                          {formatCurrency(contribution.amount)}
                        </span>
                        <span className="font-mono text-[9px] sm:text-[10px] text-muted/60 leading-tight">
                          {contribution.frequency.replace("by-weekly", "by-weekly")}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col mt-0.5">
                        <span className="font-mono text-[9px] sm:text-[10px] text-muted/60 leading-tight">
                          No contribution
                        </span>
                        <span className="font-mono text-[9px] sm:text-[10px] text-muted/60 leading-tight">
                          set
                        </span>
                      </div>
                    )}
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

HealthScoreCard.displayName = "HealthScoreCard";
export default HealthScoreCard;
