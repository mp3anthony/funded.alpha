"use client";

import React, { useState } from "react";
import { Trash2, Calendar, User, FileText, Sparkles } from "lucide-react";
import { useApp, type PayHistory } from "@/context/AppContext";

interface PayHistoryCardProps {
  history: PayHistory;
}

export default function PayHistoryCard({ history }: PayHistoryCardProps) {
  const { householdMembers, deletePayHistory, funds, contributionRules } = useApp();
  const [isDeleting, setIsDeleting] = useState(false);

  // Find member name
  const member = householdMembers.find((m) => String(m.id) === String(history.member_id));
  const memberName = member ? member.name : "Unknown Member";

  // Find rule allocation details
  const rule = history.rule_id
    ? contributionRules.find((r) => String(r.id) === String(history.rule_id))
    : null;

  let allocationTargetName = "contribution";
  let allocationAmount = 0;
  if (rule) {
    if (rule.amount_type === "percentage") {
      const surplus = Number(history.amount) - Number(rule.threshold_amount);
      allocationAmount = surplus > 0 ? surplus * (Number(rule.amount_to_add) / 100) : 0;
    } else {
      allocationAmount = Number(rule.amount_to_add);
    }
    if (rule.action_type === "goal") {
      const goal = funds.find((g) => String(g.id) === String(rule.action_target_id));
      allocationTargetName = goal ? goal.name : "goal";
    }
  }

  // Format date
  let formattedDate = history.pay_date;
  try {
    const d = new Date(history.pay_date + "T00:00:00");
    if (!isNaN(d.getTime())) {
      formattedDate = d.toLocaleDateString("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
      });
    }
  } catch (e) {
    console.error("Failed to format pay date:", history.pay_date);
  }

  // Format amount
  const formattedAmount = Number(history.amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handleDelete = async () => {
    if (confirm(`Delete this payment of $${formattedAmount} logged on ${formattedDate}?`)) {
      setIsDeleting(true);
      try {
        await deletePayHistory(history.id);
      } catch (err) {
        console.error("Failed to delete pay history entry:", err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4 transition-all hover:border-white/20">
      <div className="flex-1 min-w-0 space-y-2">
        {/* Top Row: Member & Amount */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-foreground font-semibold text-sm truncate">
            {member?.avatar_url ? (
              <img src={member.avatar_url} alt={memberName} className="h-6 w-6 rounded-full object-cover shrink-0" />
            ) : (
              <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-primary to-emerald-500 flex items-center justify-center text-white font-bold text-[10px] shrink-0">
                {member?.avatar || memberName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="truncate">{memberName}</span>
          </div>
          <span className="font-mono font-extrabold text-primary text-base whitespace-nowrap">
            ${formattedAmount}
          </span>
        </div>

        {/* Date & Automation rule allocations row */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-1.5 text-xs text-muted font-mono">
            <Calendar size={13} className="shrink-0" />
            <span>{formattedDate}</span>
          </div>

          {history.rule_id && rule && (
            <div className="flex items-center gap-1 bg-[#c8ff00]/10 border border-[#c8ff00]/20 text-[9px] text-[#c8ff00] font-mono rounded-full px-2.5 py-0.5 w-fit uppercase font-bold shrink-0">
              <Sparkles size={10} className="shrink-0 animate-pulse text-[#c8ff00]" />
              <span>Rule: +${allocationAmount.toFixed(2)} to {allocationTargetName}</span>
            </div>
          )}
        </div>

        {/* Notes (Conditional) */}
        {history.notes && (
          <div className="flex items-start gap-1.5 bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs text-subtle">
            <FileText size={13} className="mt-0.5 shrink-0 text-muted" />
            <span className="break-words font-sans">{history.notes}</span>
          </div>
        )}
      </div>

      {/* Delete button */}
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="shrink-0 p-2.5 rounded-xl border border-white/10 bg-white/5 text-muted hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        title="Delete history entry"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
