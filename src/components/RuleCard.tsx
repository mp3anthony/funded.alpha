"use client";

import React from "react";
import { Edit2, Trash2, ArrowRight } from "lucide-react";
import { type ContributionRule } from "@/types";

interface RuleCardProps {
  rule: ContributionRule;
  memberName: string;
  targetName: string; // Goal Name or "Contribution"
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function RuleCard({
  rule,
  memberName,
  targetName,
  onToggle,
  onEdit,
  onDelete,
}: RuleCardProps) {
  const formattedThreshold = rule.threshold_amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const isPercentage = rule.amount_type === "percentage";

  const formattedAmount = isPercentage
    ? `${rule.amount_to_add}% of surplus`
    : `$${rule.amount_to_add.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

  return (
    <div
      className={`bg-[#111111] border border-white/10 rounded-xl p-4 flex flex-col justify-between space-y-3 transition-all ${
        rule.is_active ? "opacity-100" : "opacity-50"
      }`}
    >
      <div className="flex items-start justify-between">
        {/* Rule Logic Details */}
        <div className="space-y-1 min-w-0">
          <span className="text-[10px] font-bold text-primary uppercase tracking-wider block font-mono">
            {memberName}&apos;s Rule
          </span>
          <h4 className="font-sans text-xs text-muted leading-relaxed">
            When pay exceeds{" "}
            <span className="font-jetbrains font-bold text-foreground text-sm">${formattedThreshold}</span>:
          </h4>
          <div className="flex items-center gap-1.5 pt-0.5 text-xs font-bold text-foreground min-w-0">
            <span>Add <span className="font-jetbrains text-primary">{formattedAmount}</span></span>
            <ArrowRight size={12} className="text-muted shrink-0" />
            <span className="truncate">
              {rule.action_type === "goal" ? `Goal: ${targetName}` : "My joint contribution"}
            </span>
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          onClick={onToggle}
          type="button"
          role="switch"
          aria-checked={rule.is_active}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            rule.is_active ? "bg-primary" : "bg-zinc-800"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              rule.is_active ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Card Actions */}
      <div className="flex items-center justify-end gap-2 border-t border-white/5 pt-2">
        <button
          onClick={onEdit}
          className="p-1.5 text-muted hover:text-foreground hover:bg-white/5 rounded-lg transition-all cursor-pointer"
          title="Edit Rule"
        >
          <Edit2 size={13} />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 text-muted hover:text-destructive hover:bg-destructive/15 rounded-lg transition-all cursor-pointer"
          title="Delete Rule"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
