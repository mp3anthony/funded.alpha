"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { Fund } from "@/context/AppContext";

interface AddAmountModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Fund | null;
  onConfirm: (amount: number) => void;
}

export default function AddAmountModal({
  isOpen,
  onClose,
  goal,
  onConfirm,
}: AddAmountModalProps) {
  const [amountStr, setAmountStr] = useState("");

  useEffect(() => {
    if (isOpen) {
      setAmountStr("");
    }
  }, [isOpen]);

  if (!isOpen || !goal) return null;

  const handleInputChange = (val: string) => {
    let raw = val;
    if (raw.startsWith("$")) {
      raw = raw.substring(1);
    }
    // Only allow digits and one decimal point
    const parts = raw.split(".");
    let numeric = parts[0].replace(/[^0-9]/g, "");
    if (parts.length > 1) {
      numeric += "." + parts[1].replace(/[^0-9]/g, "").substring(0, 2);
    }
    setAmountStr(numeric);
  };

  const handleConfirm = () => {
    const numericAmt = parseFloat(amountStr);
    if (!isNaN(numericAmt) && numericAmt > 0) {
      onConfirm(numericAmt);
      onClose();
    }
  };

  const isValid = !isNaN(parseFloat(amountStr)) && parseFloat(amountStr) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* Backdrop click close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-sm bg-[#111111] border border-white/10 rounded-2xl shadow-2xl max-h-[92dvh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
          <h3 className="font-heading font-bold text-base text-foreground">
            Add to {goal.name}
          </h3>
          <button 
            onClick={onClose}
            className="rounded-full p-1 text-muted hover:bg-white/5 hover:text-foreground transition-colors animate-none"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Input Field */}
          <div className="space-y-3">
            <input
              type="text"
              placeholder="$0.00"
              value={amountStr ? `$${amountStr}` : ""}
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 font-mono text-center text-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted"
              autoFocus
            />

            {/* Quick-Add Options */}
            <div className="grid grid-cols-4 gap-2">
              {[10, 25, 50, 100].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmountStr(amt.toFixed(2))}
                  className="rounded-xl border border-white/10 bg-white/5 py-2 font-mono text-xs text-foreground hover:bg-white/10 active:scale-95 transition-all"
                >
                  +${amt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex gap-3 p-5 border-t border-white/10 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/10 text-sm font-bold text-muted hover:text-foreground hover:bg-white/5 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValid}
            className={`flex-1 py-3 rounded-xl font-bold text-sm shadow-lg transition-all ${
              isValid 
                ? "bg-primary text-primary-fg hover:brightness-110 active:scale-95 cursor-pointer" 
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            }`}
          >
            Confirm
          </button>
        </div>

      </div>
    </div>
  );
}
