"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Users, Trash2, X, AlertTriangle, Loader2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { type Member } from "@/types";

interface RemoveMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  householdMembers: Member[];
}

export default function RemoveMemberModal({
  isOpen,
  onClose,
  member,
  householdMembers,
}: RemoveMemberModalProps) {
  const { bills, funds, paySchedules, billSplits, removeMember } = useApp();

  const [reassignBillsTo, setReassignBillsTo] = useState<string>("delete");
  const [reassignGoalsTo, setReassignGoalsTo] = useState<string>("delete");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter other members who can take over
  const otherMembers = useMemo(() => {
    if (!member) return [];
    return householdMembers.filter((m) => String(m.id) !== String(member.id));
  }, [member, householdMembers]);

  // Set default reassign target to the first available member if any
  React.useEffect(() => {
    if (otherMembers.length > 0) {
      setReassignBillsTo(String(otherMembers[0].id));
      setReassignGoalsTo(String(otherMembers[0].id));
    } else {
      setReassignBillsTo("delete");
      setReassignGoalsTo("delete");
    }
  }, [otherMembers]);

  // Memoize counts of affected items
  const { billsCount, goalsCount, schedulesCount } = useMemo(() => {
    if (!member) return { billsCount: 0, goalsCount: 0, schedulesCount: 0 };

    const bCount = billSplits.filter((s) => String(s.member_id) === String(member.id)).length;
    const gCount = funds.filter((f) => String(f.member_id) === String(member.id)).length;
    const sCount = paySchedules.filter((s) => String(s.member_id) === String(member.id)).length;

    return { billsCount: bCount, goalsCount: gCount, schedulesCount: sCount };
  }, [member, billSplits, funds, paySchedules]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.classList.add("modal-open");
    return () => {
      const activeModals = document.querySelectorAll(".modal-backdrop");
      if (activeModals.length <= 1) {
        document.body.classList.remove("modal-open");
      }
    };
  }, [isOpen]);

  if (!isOpen || !member) return null;

  async function handleRemove(e: React.FormEvent) {
    e.preventDefault();
    if (!member) return;
    setLoading(true);
    setError(null);

    const reassignBillsTarget = reassignBillsTo === "delete" ? undefined : reassignBillsTo;
    const reassignGoalsTarget = reassignGoalsTo === "delete" ? undefined : reassignGoalsTo;

    // Double confirmation if deletion of bills/goals is selected
    if (
      (reassignBillsTo === "delete" && billsCount > 0) ||
      (reassignGoalsTo === "delete" && goalsCount > 0)
    ) {
      const confirmText = `You are choosing to delete this member's ${
        reassignBillsTo === "delete" && billsCount > 0 ? "bill splits" : ""
      }${
        reassignGoalsTo === "delete" && goalsCount > 0
          ? (reassignBillsTo === "delete" && billsCount > 0 ? " and " : "") + "goals"
          : ""
      } permanently. Are you sure you want to proceed?`;
      
      if (!window.confirm(confirmText)) {
        setLoading(false);
        return;
      }
    }

    try {
      await removeMember(member.id, reassignBillsTarget, reassignGoalsTarget);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to remove member. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] modal-backdrop flex items-center justify-center bg-foreground/20 dark:bg-foreground/20 dark:bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-2xl w-full max-w-lg max-h-[92dvh] flex flex-col shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
          <h3 className="text-lg font-bold text-foreground font-syne flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Remove Household Member
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleRemove} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5 md:space-y-6">
            {error && (
              <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                {error}
              </div>
            )}

            {/* Warning Message */}
            <div className="space-y-2">
              <p className="text-sm text-foreground font-sans leading-relaxed">
                Removing <strong className="text-foreground">{member.name}</strong> will revoke their access to the household and require reassigning or deleting their active financial records.
              </p>
            </div>

            {/* Affected items breakdown */}
            <div className="p-4 rounded-xl bg-foreground/5 border border-border-strong space-y-3">
              <h4 className="text-xs font-bold text-muted uppercase tracking-wider">
                Affected Financial Items
              </h4>
              <div className="grid grid-cols-3 gap-4 font-mono">
                <div className="p-3 rounded-lg bg-foreground/5 text-center">
                  <span className="block text-2xl font-bold text-foreground">{billsCount}</span>
                  <span className="text-[9px] text-subtle uppercase tracking-wider">Bill Splits</span>
                </div>
                <div className="p-3 rounded-lg bg-foreground/5 text-center">
                  <span className="block text-2xl font-bold text-foreground">{goalsCount}</span>
                  <span className="text-[9px] text-subtle uppercase tracking-wider">Goals Owned</span>
                </div>
                <div className="p-3 rounded-lg bg-foreground/5 text-center">
                  <span className="block text-2xl font-bold text-foreground">{schedulesCount}</span>
                  <span className="text-[9px] text-subtle uppercase tracking-wider">Pay Schedules</span>
                </div>
              </div>
            </div>

            {/* Reassignments form */}
            {(billsCount > 0 || goalsCount > 0) && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-muted uppercase tracking-wider">
                  Reassignment Configuration
                </h4>

                {/* Reassign Bills */}
                {billsCount > 0 && (
                  <div className="space-y-2">
                    <label
                      htmlFor="reassign-bills"
                      className="block text-xs font-bold text-muted"
                    >
                      Who should take over their Bill Splits?
                    </label>
                    <select
                      id="reassign-bills"
                      value={reassignBillsTo}
                      onChange={(e) => setReassignBillsTo(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-foreground text-sm font-medium focus:ring-2 focus:ring-[#c8ff00]/30 focus:border-primary outline-none transition-all cursor-pointer"
                    >
                      {otherMembers.length > 0 ? (
                        otherMembers.map((m) => (
                          <option key={m.id} value={String(m.id)}>
                            Reassign to {m.name} ({m.email})
                          </option>
                        ))
                      ) : (
                        <option value="delete" disabled>No other members available</option>
                      )}
                      <option value="delete" className="text-destructive">
                        Delete splits/assignments entirely (Destructive)
                      </option>
                    </select>
                  </div>
                )}

                {/* Reassign Goals */}
                {goalsCount > 0 && (
                  <div className="space-y-2">
                    <label
                      htmlFor="reassign-goals"
                      className="block text-xs font-bold text-muted"
                    >
                      Who should take over their Goals?
                    </label>
                    <select
                      id="reassign-goals"
                      value={reassignGoalsTo}
                      onChange={(e) => setReassignGoalsTo(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-foreground text-sm font-medium focus:ring-2 focus:ring-[#c8ff00]/30 focus:border-primary outline-none transition-all cursor-pointer"
                    >
                      {otherMembers.length > 0 ? (
                        otherMembers.map((m) => (
                          <option key={m.id} value={String(m.id)}>
                            Reassign to {m.name} ({m.email})
                          </option>
                        ))
                      ) : (
                        <option value="delete" disabled>No other members available</option>
                      )}
                      <option value="delete" className="text-destructive">
                        Delete goals entirely (Destructive)
                      </option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {billsCount === 0 && goalsCount === 0 && schedulesCount > 0 && (
              <p className="text-xs text-subtle leading-relaxed font-sans">
                Only their pay schedules will be deleted. No goals or active bill splits are affected.
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 p-5 border-t border-border font-sans shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 rounded-xl border border-border text-sm font-bold text-muted hover:text-foreground hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-destructive text-foreground text-sm font-bold hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <Trash2 className="h-4 w-4" />
              Remove Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
