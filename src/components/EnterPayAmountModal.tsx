"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { PaySchedule } from "@/context/AppContext";

interface EnterPayAmountModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: PaySchedule | null;
  onConfirm: (amount: number, notes: string | null) => void;
}

export default function EnterPayAmountModal({
  isOpen,
  onClose,
  schedule,
  onConfirm,
}: EnterPayAmountModalProps) {
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen) {
      setAmount(schedule?.amount ? String(schedule.amount) : "");
      setNotes("");
    }
  }, [isOpen, schedule]);

  if (!isOpen || !schedule) return null;

  const isValid = amount !== "" && !isNaN(Number(amount)) && Number(amount) > 0;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onConfirm(Number(amount), notes.trim() || null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* Backdrop overlay */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <form
        onSubmit={handleConfirm}
        className="relative w-full max-w-sm bg-[#111111] border border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col space-y-4 animate-in zoom-in-95 duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-syne font-bold text-base text-foreground">
            Log Income Payment
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-muted hover:bg-white/5 hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-4">
          <div className="flex flex-col space-y-1.5">
            <label className="font-heading text-xs font-semibold text-subtle uppercase tracking-wider">
              Amount Received
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
                autoFocus
                required
              />
            </div>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="font-heading text-xs font-semibold text-subtle uppercase tracking-wider">
              Notes (Optional)
            </label>
            <textarea
              placeholder="e.g. Regular monthly pay, overtime bonus"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 h-20 resize-none font-sans"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/10 text-xs font-bold text-muted hover:text-foreground hover:bg-white/5 transition-colors cursor-pointer uppercase tracking-wider"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg transition-all ${
              isValid
                ? "bg-primary text-primary-fg hover:brightness-110 active:scale-95 cursor-pointer"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            }`}
          >
            Confirm Log
          </button>
        </div>
      </form>
    </div>
  );
}
