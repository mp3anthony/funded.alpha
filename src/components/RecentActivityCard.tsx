"use client";

import React, { useMemo } from "react";
import { CreditCard, DollarSign, PiggyBank, Activity } from "lucide-react";
import { type Bill, type Fund, type PayHistory, type Member } from "@/context/AppContext";
import { parseBillDate, getRelativeTime } from "@/lib/utils";

interface RecentActivityCardProps {
  bills: Bill[];
  payHistory: PayHistory[];
  funds: Fund[];
  members: Member[];
}

interface ActivityItem {
  id: string;
  type: "bill" | "paycheck" | "contribution";
  description: string;
  date: Date;
  dateStr: string;
  amount: number;
}

export const RecentActivityCard = React.memo(function RecentActivityCard({
  bills,
  payHistory,
  funds,
  members,
}: RecentActivityCardProps) {
  // Aggregate and sort the last 5 activities
  const activitiesList = useMemo(() => {
    const list: ActivityItem[] = [];

    // 1. Paid Bills
    bills
      .filter((b) => b.status === "Paid")
      .forEach((b) => {
        list.push({
          id: `bill-${b.id}`,
          type: "bill",
          description: `Paid $${b.amount.toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })} to ${b.name}`,
          date: parseBillDate(b.due_date || b.dueDate),
          dateStr: b.due_date || b.dueDate,
          amount: b.amount,
        });
      });

    // 2. Pay History Logs
    payHistory.forEach((p) => {
      const member = members.find((m) => String(m.id) === String(p.member_id));
      const memberName = member ? member.name : "Household member";

      if (p.allocation_type === "goal") {
        const goal = funds.find((g) => String(g.id) === String(p.allocation_target_id));
        const goalName = goal ? goal.name : "Savings Goal";
        list.push({
          id: `pay-goal-${p.id}`,
          type: "contribution",
          description: `${memberName} contributed $${p.amount.toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })} to ${goalName}`,
          date: parseBillDate(p.pay_date),
          dateStr: p.pay_date,
          amount: p.amount,
        });
      } else if (p.allocation_type === "contribution") {
        list.push({
          id: `pay-contrib-${p.id}`,
          type: "contribution",
          description: `${memberName} contributed $${p.amount.toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })} to Joint Fund`,
          date: parseBillDate(p.pay_date),
          dateStr: p.pay_date,
          amount: p.amount,
        });
      } else {
        list.push({
          id: `paycheck-${p.id}`,
          type: "paycheck",
          description: `${memberName} logged $${p.amount.toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })} pay`,
          date: parseBillDate(p.pay_date),
          dateStr: p.pay_date,
          amount: p.amount,
        });
      }
    });

    // Sort by date descending, then slice 5
    return list
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);
  }, [bills, payHistory, funds, members]);

  return (
    <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:border-white/20">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <Activity className="h-4 w-4 text-[#c8ff00]" />
        <h3 className="font-syne font-bold text-base text-white tracking-wide">
          Recent Activity
        </h3>
      </div>

      {/* Content */}
      <div className="flex flex-col justify-center">
        {activitiesList.length === 0 ? (
          <div className="py-8 text-center flex flex-col items-center justify-center space-y-2.5">
            <div className="p-3 bg-white/[0.02] rounded-full border border-white/5">
              <Activity className="h-6 w-6 text-neutral-600" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-neutral-400">No activity yet</p>
              <p className="text-xs text-neutral-500 font-sans max-w-[220px] mx-auto">
                Log your first paycheck to see activity here.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {activitiesList.map((act) => {
              // Determine Icon, colors, and layout
              let ActivityIcon = DollarSign;
              let iconColor = "text-sky-400";
              let iconBg = "bg-sky-400/10";
              
              if (act.type === "bill") {
                ActivityIcon = CreditCard;
                iconColor = "text-[#c8ff00]"; // Lime Green positive accent
                iconBg = "bg-[#c8ff00]/10";
              } else if (act.type === "contribution") {
                ActivityIcon = PiggyBank;
                iconColor = "text-[#c8ff00]"; // Lime Green positive accent
                iconBg = "bg-[#c8ff00]/10";
              }

              return (
                <div
                  key={act.id}
                  className="py-3.5 flex items-center justify-between gap-4 hover:bg-white/[0.01] -mx-4 px-4 rounded-xl transition-all duration-200"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}
                    >
                      <ActivityIcon className="h-4.5 w-4.5" />
                    </div>
                    <span className="font-sans font-medium text-sm text-neutral-300 min-w-0 truncate">
                      {act.description}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-neutral-500 shrink-0 uppercase tracking-wider">
                    {getRelativeTime(act.dateStr)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});

RecentActivityCard.displayName = "RecentActivityCard";
export default RecentActivityCard;
