"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Sparkles, AlertCircle } from "lucide-react";
import { useApp, type Member } from "@/context/AppContext";
import { type ContributionRule, type HouseholdContribution } from "@/types";
import RuleCard from "./RuleCard";

interface RulesSettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  householdMembers: Member[];
  rules: ContributionRule[];
  goals: any[];
  contributions: HouseholdContribution[];
}

export default function RulesSettingsSheet({
  isOpen,
  onClose,
  householdMembers,
  rules,
  goals,
  contributions,
}: RulesSettingsSheetProps) {
  const { addRule, updateRule, deleteRule, toggleRuleActive } = useApp();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ContributionRule | null>(null);

  // Form State
  const [memberId, setMemberId] = useState("");
  const [threshold, setThreshold] = useState("");
  const [actionType, setActionType] = useState<"goal" | "contribution">("goal");
  const [actionTargetId, setActionTargetId] = useState("");
  const [amountToAdd, setAmountToAdd] = useState("");
  const [amountType, setAmountType] = useState<"fixed" | "percentage">("fixed");

  useEffect(() => {
    if (editingRule) {
      setMemberId(String(editingRule.member_id));
      setThreshold(String(editingRule.threshold_amount));
      setActionType(editingRule.action_type);
      setActionTargetId(String(editingRule.action_target_id));
      setAmountToAdd(String(editingRule.amount_to_add));
      setAmountType(editingRule.amount_type || "fixed");
      setIsFormOpen(true);
    } else {
      setMemberId(householdMembers[0]?.id ? String(householdMembers[0].id) : "");
      setThreshold("");
      setActionType("goal");
      setActionTargetId(goals[0]?.id ? String(goals[0].id) : "");
      setAmountToAdd("");
      setAmountType("fixed");
    }
  }, [editingRule, isOpen, householdMembers, goals]);

  useEffect(() => {
    if (!editingRule) {
      if (actionType === "goal") {
        setActionTargetId(goals[0]?.id ? String(goals[0].id) : "");
      } else {
        const matchingContribution = contributions.find((c) => String(c.member_id) === String(memberId));
        setActionTargetId(matchingContribution?.id ? String(matchingContribution.id) : memberId);
      }
    }
  }, [actionType, memberId, contributions, goals, editingRule]);

  if (!isOpen) return null;

  const handleEditClick = (rule: ContributionRule) => {
    setEditingRule(rule);
  };

  const handleDeleteClick = async (ruleId: string) => {
    if (confirm("Are you sure you want to delete this contribution rule?")) {
      await deleteRule(ruleId);
    }
  };

  const handleToggleClick = async (ruleId: string) => {
    await toggleRuleActive(ruleId);
  };

  const isPercentageOverLimit =
    amountType === "percentage" &&
    amountToAdd !== "" &&
    !isNaN(Number(amountToAdd)) &&
    Number(amountToAdd) > 100;

  const isAmountValid =
    amountToAdd !== "" &&
    !isNaN(Number(amountToAdd)) &&
    (amountType === "percentage"
      ? Number(amountToAdd) >= 0.01 && Number(amountToAdd) <= 100
      : Number(amountToAdd) > 0);

  const isFormValid =
    memberId !== "" &&
    threshold !== "" &&
    !isNaN(Number(threshold)) &&
    Number(threshold) >= 0 &&
    isAmountValid &&
    actionTargetId !== "";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    let targetId = actionTargetId;
    if (actionType === "contribution") {
      const match = contributions.find((c) => String(c.member_id) === String(memberId));
      targetId = match ? String(match.id) : memberId;
    }

    const payload = {
      member_id: memberId,
      threshold_amount: Number(threshold),
      action_type: actionType,
      action_target_id: targetId,
      amount_to_add: Number(amountToAdd),
      amount_type: amountType,
      is_active: editingRule ? editingRule.is_active : true,
    };

    if (editingRule) {
      await updateRule(editingRule.id, payload);
    } else {
      await addRule(payload);
    }

    setIsFormOpen(false);
    setEditingRule(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center animate-in fade-in duration-200">
      {/* Overlay to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Content */}
      <div className="relative w-full max-h-[90vh] overflow-y-auto rounded-t-2xl bg-[#111111] sm:max-w-lg sm:rounded-2xl border-t sm:border border-white/10 flex flex-col shadow-2xl animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#111111]/90 px-6 py-4 backdrop-blur">
          <div>
            <h2 className="font-syne text-lg font-bold text-foreground flex items-center gap-1.5">
              <Sparkles size={18} className="text-primary animate-pulse" />
              <span>Contribution Rules</span>
            </h2>
            <p className="text-[10px] text-muted font-sans mt-0.5">
              Automatically allocate excess pay when you earn above a threshold
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted hover:bg-white/5 hover:text-foreground transition-colors focus:outline-none"
          >
            <X size={18} />
          </button>
        </div>

        {/* Rule Form Panel Overlay */}
        {isFormOpen ? (
          <form onSubmit={handleSave} className="flex flex-col space-y-5 px-6 py-5 border-b border-white/5 bg-[#0a0a0a]/50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary font-syne">
              {editingRule ? "Edit Automation Rule" : "Create Automation Rule"}
            </h3>

            {/* Household Member */}
            <div className="flex flex-col space-y-1.5">
              <label className="font-heading text-[10px] font-semibold text-subtle uppercase tracking-wider">
                Household Member
              </label>
              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                required
              >
                {householdMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Threshold Amount */}
            <div className="flex flex-col space-y-1.5">
              <label className="font-heading text-[10px] font-semibold text-subtle uppercase tracking-wider">
                When my pay exceeds
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted font-mono text-xs">$</span>
                <input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="w-full bg-[#111111] border border-white/10 rounded-xl pl-6 pr-3 py-2.5 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                  required
                />
              </div>
            </div>

            {/* Action Type Segmented Control */}
            <div className="flex flex-col space-y-1.5">
              <label className="font-heading text-[10px] font-semibold text-subtle uppercase tracking-wider">
                Action Type
              </label>
              <div className="grid grid-cols-2 gap-1 bg-[#111111] border border-white/10 rounded-xl p-1 shrink-0">
                {(["goal", "contribution"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setActionType(type)}
                    className={`py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                      actionType === type
                        ? "bg-primary text-primary-fg shadow"
                        : "text-muted hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    {type === "goal" ? "Add to Goal" : "Add to Contribution"}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Target Selector */}
            {actionType === "goal" ? (
              <div className="flex flex-col space-y-1.5">
                <label className="font-heading text-[10px] font-semibold text-subtle uppercase tracking-wider">
                  Target savings goal
                </label>
                <select
                  value={actionTargetId}
                  onChange={(e) => setActionTargetId(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                  required
                >
                  <option value="" disabled>Select goal...</option>
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="p-3 bg-[#111111] border border-white/5 rounded-xl text-[11px] text-muted">
                Action: Add excess money directly to my active Joint Fund contribution
              </div>
            )}

            {/* Calculation Type Segmented Control */}
            <div className="flex flex-col space-y-1.5">
              <label className="font-heading text-[10px] font-semibold text-subtle uppercase tracking-wider">
                Calculation Type
              </label>
              <div className="grid grid-cols-2 gap-1 bg-[#111111] border border-white/10 rounded-xl p-1 shrink-0">
                {(["fixed", "percentage"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setAmountType(type)}
                    className={`py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                      amountType === type
                        ? "bg-primary text-primary-fg shadow"
                        : "text-muted hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    {type === "fixed" ? "Fixed Dollar ($)" : "Percentage (%)"}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount to Add */}
            <div className="flex flex-col space-y-1.5">
              <label className="font-heading text-[10px] font-semibold text-subtle uppercase tracking-wider">
                {amountType === "percentage" ? "Percentage of Surplus" : "Amount to Add"}
              </label>
              <div className="relative">
                {amountType === "fixed" ? (
                  <>
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted font-mono text-xs">$</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      min="0.01"
                      value={amountToAdd}
                      onChange={(e) => setAmountToAdd(e.target.value)}
                      className="w-full bg-[#111111] border border-white/10 rounded-xl pl-6 pr-3 py-2.5 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                      required
                    />
                  </>
                ) : (
                  <>
                    <input
                      type="number"
                      placeholder="0.0"
                      step="0.1"
                      min="0.01"
                      max="100"
                      value={amountToAdd}
                      onChange={(e) => setAmountToAdd(e.target.value)}
                      className="w-full bg-[#111111] border border-white/10 rounded-xl pl-6 pr-10 py-2.5 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                      required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted font-mono text-xs">%</span>
                  </>
                )}
              </div>
              {amountType === "percentage" && (
                <div className="space-y-1">
                  <p className="text-[10px] text-muted leading-relaxed">
                    This percentage will be calculated from the amount over your threshold (e.g., 50% means half of your surplus)
                  </p>
                  {isPercentageOverLimit && (
                    <p className="text-[10px] text-red-500 font-semibold uppercase tracking-wider">
                      Percentage must be between 0.01 and 100
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingRule(null);
                }}
                className="flex-1 py-2.5 border border-white/10 rounded-xl text-xs font-bold text-muted hover:text-foreground hover:bg-white/5 transition-all cursor-pointer uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isFormValid}
                className={`flex-1 py-2.5 rounded-xl font-heading text-xs font-bold uppercase tracking-wider transition-all ${
                  isFormValid
                    ? "bg-primary text-primary-fg hover:brightness-110 active:scale-95 cursor-pointer"
                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                }`}
              >
                Save Rule
              </button>
            </div>
          </form>
        ) : null}

        {/* Existing Rules List */}
        <div className="flex flex-col space-y-3 px-6 py-5 max-h-[50vh] overflow-y-auto">
          <span className="text-[10px] font-bold text-subtle uppercase tracking-wider block font-mono">
            Active Rules
          </span>

          {rules.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-white/10 rounded-xl bg-[#0a0a0a]/20">
              <AlertCircle className="h-6 w-6 text-muted mx-auto mb-2" />
              <p className="text-xs text-muted font-medium">No contribution rules set.</p>
              <p className="text-[10px] text-subtle mt-0.5">Automate excess pay allocation by setting a rule below.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {rules.map((rule) => {
                const member = householdMembers.find((m) => String(m.id) === String(rule.member_id));
                const memberName = member ? member.name : "Member";

                let targetName = "Contribution";
                if (rule.action_type === "goal") {
                  const goal = goals.find((g) => String(g.id) === String(rule.action_target_id));
                  targetName = goal ? goal.name : "Unknown Goal";
                }

                return (
                  <RuleCard
                    key={rule.id}
                    rule={rule}
                    memberName={memberName}
                    targetName={targetName}
                    onToggle={() => handleToggleClick(rule.id)}
                    onEdit={() => handleEditClick(rule)}
                    onDelete={() => handleDeleteClick(rule.id)}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Trigger to Add Rule */}
        {!isFormOpen && (
          <div className="sticky bottom-0 border-t border-white/10 bg-[#111111]/95 px-6 py-4 backdrop-blur">
            <button
              onClick={() => setIsFormOpen(true)}
              className="w-full py-3.5 bg-primary text-primary-fg rounded-xl font-heading text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:brightness-110 active:scale-[0.98]"
            >
              <Plus size={14} />
              <span>Add automation rule</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
