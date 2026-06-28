"use client";

import React, { useState, useMemo } from "react";
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h3 className="text-lg font-bold text-white font-syne flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-[#ff3d57]" />
            Remove Household Member
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleRemove}>
          <div className="p-6 space-y-6">
            {error && (
              <div className="p-3.5 rounded-xl bg-[#ff3d57]/10 border border-[#ff3d57]/20 text-[#ff3d57] text-xs font-medium">
                {error}
              </div>
            )}

            {/* Warning Message */}
            <div className="space-y-2">
              <p className="text-sm text-neutral-300 font-sans leading-relaxed">
                Removing <strong className="text-white">{member.name}</strong> will revoke their access to the household and require reassigning or deleting their active financial records.
              </p>
            </div>

            {/* Affected items breakdown */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Affected Financial Items
              </h4>
              <div className="grid grid-cols-3 gap-4 font-mono">
                <div className="p-3 rounded-lg bg-white/[0.02] text-center">
                  <span className="block text-2xl font-bold text-white">{billsCount}</span>
                  <span className="text-[9px] text-neutral-500 uppercase tracking-wider">Bill Splits</span>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.02] text-center">
                  <span className="block text-2xl font-bold text-white">{goalsCount}</span>
                  <span className="text-[9px] text-neutral-500 uppercase tracking-wider">Goals Owned</span>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.02] text-center">
                  <span className="block text-2xl font-bold text-white">{schedulesCount}</span>
                  <span className="text-[9px] text-neutral-500 uppercase tracking-wider">Pay Schedules</span>
                </div>
              </div>
            </div>

            {/* Reassignments form */}
            {(billsCount > 0 || goalsCount > 0) && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Reassignment Configuration
                </h4>

                {/* Reassign Bills */}
                {billsCount > 0 && (
                  <div className="space-y-2">
                    <label
                      htmlFor="reassign-bills"
                      className="block text-xs font-bold text-neutral-400"
                    >
                      Who should take over their Bill Splits?
                    </label>
                    <select
                      id="reassign-bills"
                      value={reassignBillsTo}
                      onChange={(e) => setReassignBillsTo(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white text-sm font-medium focus:ring-2 focus:ring-[#c8ff00]/30 focus:border-[#c8ff00] outline-none transition-all cursor-pointer"
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
                      <option value="delete" className="text-[#ff3d57]">
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
                      className="block text-xs font-bold text-neutral-400"
                    >
                      Who should take over their Goals?
                    </label>
                    <select
                      id="reassign-goals"
                      value={reassignGoalsTo}
                      onChange={(e) => setReassignGoalsTo(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white text-sm font-medium focus:ring-2 focus:ring-[#c8ff00]/30 focus:border-[#c8ff00] outline-none transition-all cursor-pointer"
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
                      <option value="delete" className="text-[#ff3d57]">
                        Delete goals entirely (Destructive)
                      </option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {billsCount === 0 && goalsCount === 0 && schedulesCount > 0 && (
              <p className="text-xs text-neutral-500 leading-relaxed font-sans">
                Only their pay schedules will be deleted. No goals or active bill splits are affected.
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 p-5 border-t border-white/10 font-sans">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 rounded-xl border border-white/10 text-sm font-bold text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-[#ff3d57] text-white text-sm font-bold hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-1.5 cursor-pointer"
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
