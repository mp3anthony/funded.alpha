/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import { useApp, type BillSplit } from "@/context/AppContext";

export interface SplitResult {
  member_id: string | number;
  amount: number;
  is_assignee: boolean;
}

interface ContributorSplitsProps {
  totalBillAmount: number;
  assigneeMemberId: string | number;
  onSplitsChange: (splits: SplitResult[]) => void;
  initialSplits?: BillSplit[];
}

export default function ContributorSplits({
  totalBillAmount,
  assigneeMemberId,
  onSplitsChange,
  initialSplits,
}: ContributorSplitsProps) {
  const { members } = useApp();
  const [splitMode, setSplitMode] = useState<"percentage" | "amount">("percentage");
  
  // Store raw string values to allow easy typing (e.g., decimal points)
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  // Effect to load initial splits if editing
  useEffect(() => {
    if (initialSplits && initialSplits.length > 0) {
      const vals: Record<string, string> = {};
      initialSplits.forEach((s) => {
        vals[s.member_id] = s.amount.toString();
      });
      setInputValues(vals);
      setSplitMode("amount");
    } else {
      setInputValues({});
      setSplitMode("percentage");
    }
  }, [initialSplits]);

  // Reset inputs when mode changes
  const handleModeChange = (mode: "percentage" | "amount") => {
    setSplitMode(mode);
    setInputValues({}); // This will trigger the effect to auto-assign 100% / total to the assignee
  };

  // Effect to handle auto-assignment when assignee, total, or mode changes
  useEffect(() => {
    if (assigneeMemberId) {
      setInputValues((prev) => {
        let nonAssigneeTotal = 0;
        members.forEach((m) => {
          if (m.id !== assigneeMemberId) {
            nonAssigneeTotal += parseFloat(prev[m.id] || "0") || 0;
          }
        });
        
        let remainder = 0;
        if (splitMode === "percentage") {
          remainder = Math.max(0, 100 - nonAssigneeTotal);
        } else {
          remainder = Math.max(0, totalBillAmount - nonAssigneeTotal);
        }
        
        const newAssigneeVal = parseFloat(remainder.toFixed(2)).toString();
        
        // Only update if it actually changed to prevent infinite loops
        if (prev[assigneeMemberId] !== newAssigneeVal) {
          return { ...prev, [assigneeMemberId]: newAssigneeVal };
        }
        return prev;
      });
    }
  }, [assigneeMemberId, splitMode, totalBillAmount, members]);

  const handleInputChange = (memberId: string | number, value: string) => {
    setInputValues((prev) => {
      const newVals = { ...prev, [memberId]: value };

      // Auto-assign remainder to assignee if a non-assignee changes
      if (memberId !== assigneeMemberId && assigneeMemberId) {
        let nonAssigneeTotal = 0;
        members.forEach((m) => {
          if (m.id !== assigneeMemberId) {
            nonAssigneeTotal += parseFloat(newVals[m.id] || "0") || 0;
          }
        });
        
        let remainder = 0;
        if (splitMode === "percentage") {
          remainder = Math.max(0, 100 - nonAssigneeTotal);
        } else {
          remainder = Math.max(0, totalBillAmount - nonAssigneeTotal);
        }
        
        newVals[assigneeMemberId] = parseFloat(remainder.toFixed(2)).toString();
      }
      return newVals;
    });
  };

  // Calculate totals for validation status
  const totalAllocated = members.reduce((sum, member) => {
    const val = parseFloat(inputValues[member.id] || "0");
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  let remaining = 0;
  let isExact = false;
  let isOver = false;

  if (splitMode === "percentage") {
    remaining = 100 - totalAllocated;
    isExact = Math.abs(remaining) < 0.01;
    isOver = remaining < -0.01;
  } else {
    remaining = totalBillAmount - totalAllocated;
    isExact = Math.abs(remaining) < 0.01;
    isOver = remaining < -0.01;
  }

  // Effect to emit splits
  useEffect(() => {
    const results: SplitResult[] = members.map((member) => {
      const val = parseFloat(inputValues[member.id] || "0");
      const numVal = isNaN(val) ? 0 : val;
      
      let amount = 0;
      if (splitMode === "percentage") {
        amount = (numVal / 100) * totalBillAmount;
      } else {
        amount = numVal;
      }
      
      // Round to 2 decimal places to avoid floating point errors
      amount = Math.round(amount * 100) / 100;
      
      return {
        member_id: member.id,
        amount,
        is_assignee: member.id === assigneeMemberId,
      };
    });

    onSplitsChange(results);
  }, [inputValues, splitMode, totalBillAmount, members, assigneeMemberId, onSplitsChange]);

  const statusColor = isExact 
    ? "text-primary font-bold" 
    : isOver 
      ? "text-[#ff4500] font-bold" 
      : "text-subtle";

  return (
    <div className="flex flex-col space-y-5 rounded-xl border border-border bg-surface-raised/30 p-5">
      {/* Mode Toggle */}
      <div className="flex rounded-xl bg-surface p-1 border border-border">
        <button
          type="button"
          onClick={() => handleModeChange("percentage")}
          className={`flex-1 rounded-lg py-1.5 text-sm font-heading font-medium transition-all ${
            splitMode === "percentage"
              ? "bg-surface-elevated text-foreground shadow-sm ring-1 ring-border"
              : "text-muted hover:text-foreground"
          }`}
        >
          Percentage (%)
        </button>
        <button
          type="button"
          onClick={() => handleModeChange("amount")}
          className={`flex-1 rounded-lg py-1.5 text-sm font-heading font-medium transition-all ${
            splitMode === "amount"
              ? "bg-surface-elevated text-foreground shadow-sm ring-1 ring-border"
              : "text-muted hover:text-foreground"
          }`}
        >
          Amount ($)
        </button>
      </div>

      {/* Member Inputs */}
      <div className="flex flex-col space-y-3">
        {members.map((member) => {
          const isAssignee = member.id === assigneeMemberId;
          
          return (
            <div 
              key={member.id} 
              className={`flex items-center justify-between space-x-4 transition-all duration-300 ${
                isAssignee ? "border-l-2 border-l-primary pl-3 -ml-[14px]" : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-elevated text-xs font-bold text-foreground border border-border shadow-sm">
                  {member.avatar || member.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">{member.name}</span>
                  {isAssignee && (
                    <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-primary">
                      Assignee
                    </span>
                  )}
                </div>
              </div>
              
              <div className="relative w-24 sm:w-28">
                {splitMode === "amount" && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted font-mono text-sm">$</span>
                )}
                <input
                  type="number"
                  placeholder="0"
                  value={inputValues[member.id] || ""}
                  onChange={(e) => handleInputChange(member.id, e.target.value)}
                  className={`w-full rounded-lg border border-border bg-surface py-2 font-mono text-sm text-right text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all ${
                    splitMode === "amount" ? "pl-7 pr-3" : "px-3 pr-7"
                  }`}
                />
                {splitMode === "percentage" && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted font-mono text-sm">%</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-time Validation Status */}
      <div className="flex flex-col items-center justify-center pt-3 border-t border-border/50">
        <p className={`font-mono text-sm transition-colors duration-300 ${statusColor}`}>
          {splitMode === "percentage" ? (
            isOver ? (
              `${Math.abs(remaining).toFixed(1)}% over`
            ) : (
              `${Math.abs(remaining).toFixed(1)}% remaining`
            )
          ) : (
            isOver ? (
              `-$${Math.abs(remaining).toFixed(2)} over`
            ) : (
              `$${Math.abs(remaining).toFixed(2)} remaining`
            )
          )}
        </p>
      </div>
    </div>
  );
}
