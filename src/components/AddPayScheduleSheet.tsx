"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useApp, type PaySchedule } from "@/context/AppContext";

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

  const [memberId, setMemberId] = useState("");
  const [frequency, setFrequency] = useState<"weekly" | "fortnightly" | "monthly">("monthly");
  const [isFixedAmount, setIsFixedAmount] = useState(true);
  const [amount, setAmount] = useState("");
  const [nextPayDate, setNextPayDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && existingSchedule) {
      setMemberId(String(existingSchedule.member_id));
      setFrequency(existingSchedule.frequency);
      setIsFixedAmount(existingSchedule.is_fixed_amount);
      setAmount(existingSchedule.amount ? String(existingSchedule.amount) : "");
      setNextPayDate(existingSchedule.next_pay_date || "");
    } else if (isOpen) {
      setMemberId(householdMembers[0]?.id ? String(householdMembers[0].id) : "");
      setFrequency("monthly");
      setIsFixedAmount(true);
      setAmount("");
      setNextPayDate("");
    }
  }, [isOpen, existingSchedule, householdMembers]);

  if (!isOpen) return null;

  const isFormValid =
    memberId !== "" &&
    nextPayDate !== "" &&
    (!isFixedAmount || (amount !== "" && !isNaN(Number(amount)) && Number(amount) > 0));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSaving(true);
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
    } catch (err) {
      console.error("Failed to save pay schedule:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center animate-in fade-in duration-200">
      {/* Overlay to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Content */}
      <form
        onSubmit={handleSave}
        className="relative w-full max-h-[90vh] overflow-y-auto rounded-t-2xl bg-[#111111] sm:max-w-md sm:rounded-2xl border-t sm:border border-white/10 flex flex-col shadow-2xl animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#111111]/90 px-6 py-4 backdrop-blur">
          <h2 className="font-syne text-lg font-bold text-foreground">
            {existingSchedule ? "Edit Pay Schedule" : "Add Pay Schedule"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted hover:bg-white/5 hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex flex-col space-y-5 px-6 py-5">
          {/* Member Dropdown */}
          <div className="flex flex-col space-y-1.5">
            <label className="font-heading text-xs font-semibold text-subtle uppercase tracking-wider">
              Household Member
            </label>
            <div className="relative">
              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 appearance-none transition-all"
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

          {/* Frequency Segmented Control */}
          <div className="flex flex-col space-y-1.5">
            <label className="font-heading text-xs font-semibold text-subtle uppercase tracking-wider">
              Frequency
            </label>
            <div className="grid grid-cols-3 gap-2 bg-[#0a0a0a] border border-white/10 rounded-xl p-1">
              {(["weekly", "fortnightly", "monthly"] as const).map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setFrequency(freq)}
                  className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    frequency === freq
                      ? "bg-primary text-primary-fg shadow"
                      : "text-muted hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  {freq === "fortnightly" ? "Fortnight" : freq === "weekly" ? "Weekly" : "Monthly"}
                </button>
              ))}
            </div>
          </div>

          {/* Fixed Amount Toggle */}
          <div className="flex items-center justify-between bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">Fixed Pay Amount?</span>
              <span className="text-xs text-muted">Toggle off if pay varies each time</span>
            </div>
            <button
              type="button"
              onClick={() => setIsFixedAmount(!isFixedAmount)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isFixedAmount ? "bg-primary" : "bg-zinc-800"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isFixedAmount ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Fixed Amount Input (Conditional) */}
          {isFixedAmount && (
            <div className="flex flex-col space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <label className="font-heading text-xs font-semibold text-subtle uppercase tracking-wider">
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
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-8 pr-4 py-3 font-mono text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                  required={isFixedAmount}
                />
              </div>
            </div>
          )}

          {/* Next Pay Date Datepicker */}
          <div className="flex flex-col space-y-1.5">
            <label className="font-heading text-xs font-semibold text-subtle uppercase tracking-wider">
              Next Pay Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={nextPayDate}
                onChange={(e) => setNextPayDate(e.target.value)}
                className="w-full bg-[#111111] border border-white/10 rounded-lg p-3 font-mono text-sm text-white [color-scheme:dark] focus:outline-none focus:ring-1 focus:ring-primary/50"
                required
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-white/10 bg-[#111111]/90 px-6 py-4 backdrop-blur">
          <button
            type="submit"
            disabled={!isFormValid || isSaving}
            className={`w-full rounded-xl py-3.5 font-heading text-sm font-bold uppercase tracking-wider transition-all ${
              isFormValid && !isSaving
                ? "bg-primary text-primary-fg hover:brightness-110 active:scale-[0.98] cursor-pointer"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
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
