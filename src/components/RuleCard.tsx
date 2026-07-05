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

        {/* Toggle Dropdown */}
        <div className="relative shrink-0">
          <select
            value={rule.is_active ? "active" : "inactive"}
            onChange={onToggle}
            className="rounded-lg border border-white/10 bg-[#0a0a0a] px-2.5 py-1 text-[10px] font-bold text-foreground focus:border-primary focus:outline-none appearance-none cursor-pointer pr-6 uppercase tracking-wider"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-muted">
            <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
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
