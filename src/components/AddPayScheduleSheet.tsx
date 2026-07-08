"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useApp, useCurrentUser, type PaySchedule } from "@/context/AppContext";

interface AddPayScheduleSheetProps {
  isOpen: boolean;
  onClose: () => void;
  existingSchedule?: PaySchedule | null;
}

export default function AddPayScheduleSheet({
  isOpen,
  onClose,
  existingSchedule,
}: AddPayScheduleSheetProps) {
  const { householdMembers, addPaySchedule, updatePaySchedule } = useApp();
  const currentUser = useCurrentUser();

  const [memberId, setMemberId] = useState("");
  const [frequency, setFrequency] = useState<"weekly" | "fortnightly" | "monthly">("monthly");
  const [isFixedAmount, setIsFixedAmount] = useState(true);
  const [amount, setAmount] = useState("");
  const [nextPayDate, setNextPayDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  useEffect(() => {
    if (!isOpen) {
      setHasInitialized(false);
      setErrorMsg(null);
      return;
    }

    if (isOpen && !hasInitialized) {
      if (existingSchedule) {
        setMemberId(String(existingSchedule.member_id));
        setFrequency(existingSchedule.frequency);
        setIsFixedAmount(existingSchedule.is_fixed_amount);
        setAmount(existingSchedule.amount ? String(existingSchedule.amount) : "");
        setNextPayDate(existingSchedule.next_pay_date || "");
        setHasInitialized(true);
      } else {
        const defaultMemberId = currentUser.id ? String(currentUser.id) : (householdMembers[0]?.id ? String(householdMembers[0].id) : "");
        setMemberId(defaultMemberId);
        setFrequency("monthly");
        setIsFixedAmount(true);
        setAmount("");
        setNextPayDate("");
        if (defaultMemberId) {
          setHasInitialized(true);
        }
      }
    }
  }, [isOpen, existingSchedule, householdMembers, currentUser.id, hasInitialized]);

  if (!isOpen) return null;

  const isFormValid =
    memberId !== "" &&
    nextPayDate !== "" &&
    (!isFixedAmount || (amount !== "" && !isNaN(Number(amount)) && Number(amount) > 0));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSaving(true);
    setErrorMsg(null);
    try {
      const scheduleData = {
        member_id: memberId,
        frequency,
        is_fixed_amount: isFixedAmount,
        amount: isFixedAmount ? Number(amount) : null,
        next_pay_date: nextPayDate,
      };

      if (existingSchedule) {
        await updatePaySchedule(existingSchedule.id, scheduleData);
      } else {
        await addPaySchedule(scheduleData);
      }
      onClose();
    } catch (err: any) {
      console.error("Failed to save pay schedule:", err);
      setErrorMsg(err?.message || "An unexpected error occurred while saving the pay schedule.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] modal-backdrop flex items-end justify-center bg-foreground/20 dark:bg-black/80 backdrop-blur-sm md:items-stretch md:justify-end md:p-0 md:bg-foreground/20 dark:bg-foreground/20 dark:bg-black/80 animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Content */}
      <form
        onSubmit={handleSave}
        className="relative w-full max-w-md max-h-[92dvh] md:h-screen md:max-h-screen bg-surface border border-border md:border-y-0 md:border-r-0 md:border-l rounded-t-3xl rounded-b-none md:rounded-none md:rounded-l-3xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 md:slide-in-from-right duration-250"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface/90 px-5 py-3 md:px-6 md:py-4 backdrop-blur">
          <h2 className="font-syne text-lg font-bold text-foreground">
            {existingSchedule ? "Edit Pay Schedule" : "Add Pay Schedule"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted hover:bg-white/5 hover:text-foreground transition-colors focus:outline-none"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 md:px-6 md:py-5 space-y-4 md:space-y-5">
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-3 text-red-500 text-xs font-mono break-words whitespace-pre-wrap">
              <span className="font-bold">Error:</span> {errorMsg}
            </div>
          )}

          {/* Member Dropdown */}
          <div className="flex flex-col space-y-1 md:space-y-1.5">
            <label className="font-heading text-[10px] md:text-xs font-semibold text-subtle uppercase tracking-wider">
              Household Member
            </label>
            <div className="relative">
              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 md:py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 appearance-none transition-all"
                required
              >
                <option value="" disabled>Select member...</option>
                {householdMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Frequency Dropdown */}
          <div className="flex flex-col space-y-1 md:space-y-1.5">
            <label className="font-heading text-[10px] md:text-xs font-semibold text-subtle capitalize tracking-wider">
              Frequency
            </label>
            <div className="relative">
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as "weekly" | "fortnightly" | "monthly")}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 md:py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 appearance-none transition-all cursor-pointer pr-10"
              >
                <option value="weekly">Weekly</option>
                <option value="fortnightly">Fortnightly</option>
                <option value="monthly">Monthly</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Fixed Amount Dropdown */}
          <div className="flex flex-col space-y-1.5 md:space-y-1.5 bg-background border border-border rounded-xl p-3 md:p-4">
            <div className="flex flex-col mb-2">
              <span className="text-xs md:text-sm font-semibold text-foreground">Pay Type</span>
              <span className="text-[10px] md:text-xs text-muted">Choose whether pay amount is fixed or varies each time</span>
            </div>
            <div className="relative">
              <select
                value={isFixedAmount ? "fixed" : "variable"}
                onChange={(e) => setIsFixedAmount(e.target.value === "fixed")}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 md:py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 appearance-none transition-all cursor-pointer pr-10"
              >
                <option value="fixed">Fixed Pay Amount</option>
                <option value="variable">Variable Pay Amount</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Fixed Amount Input (Conditional) */}
          {isFixedAmount && (
            <div className="flex flex-col space-y-1 md:space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <label className="font-heading text-[10px] md:text-xs font-semibold text-subtle capitalize tracking-wider">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-mono text-sm">$</span>
                <input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl pl-8 pr-4 py-2.5 md:py-3 font-mono text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                  required={isFixedAmount}
                />
              </div>
            </div>
          )}

          {/* Next Pay Date Datepicker */}
          <div className="flex flex-col space-y-1 md:space-y-1.5">
            <label className="font-heading text-[10px] md:text-xs font-semibold text-subtle uppercase tracking-wider">
              Next Pay Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={nextPayDate}
                onChange={(e) => setNextPayDate(e.target.value)}
                className="w-full min-w-0 bg-surface border border-border rounded-lg p-2.5 md:p-3 font-mono text-sm text-foreground [color-scheme:dark] focus:outline-none focus:ring-1 focus:ring-primary/50"
                required
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div 
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
          className="sticky bottom-0 z-10 border-t border-border bg-surface/95 px-5 pt-3 pb-3 md:px-6 md:pt-4 md:pb-4 backdrop-blur flex items-center gap-3 shrink-0"
        >
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 md:py-4 rounded-xl border border-border text-sm font-bold text-muted hover:text-foreground hover:bg-white/5 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isFormValid || isSaving}
            className={`flex-1 rounded-xl py-3 md:py-4 text-sm font-bold uppercase tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary cursor-pointer ${
              isFormValid && !isSaving
                ? "bg-primary text-primary-fg hover:brightness-110 active:scale-[0.98]"
                : "bg-surface-raised text-zinc-500 cursor-not-allowed"
            }`}
          >
            {existingSchedule
              ? (isSaving ? "Updating..." : "Update Schedule")
              : (isSaving ? "Saving..." : "Add Schedule")}
          </button>
        </div>
      </form>
    </div>
  );
}
