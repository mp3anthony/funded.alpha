"use client";

import React from "react";
import { Info } from "lucide-react";

interface PaymentModeToggleProps {
  currentMode: boolean; // false = Direct Pay, true = Joint Fund
  onModeChange: (mode: boolean) => void;
}

export default function PaymentModeToggle({ currentMode, onModeChange }: PaymentModeToggleProps) {
  return (
    <div className="flex flex-col space-y-4 w-full">
      <div className="flex flex-col space-y-2">
        <h3 className="font-syne font-bold text-lg text-foreground text-center sm:text-left">
          Does your household use a joint account?
        </h3>
        <p className="text-xs text-muted text-center sm:text-left font-mono">
          This determines how bill splits are settled in the household.
        </p>
      </div>

      <div className="relative w-full">
        <select
          value={currentMode ? "joint" : "direct"}
          onChange={(e) => onModeChange(e.target.value === "joint")}
          className="w-full rounded-xl border border-border bg-[#0a0a0a] px-4 py-2.5 md:py-3 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all appearance-none text-sm font-semibold cursor-pointer pr-10"
        >
          <option value="direct">Direct Pay (Transfer directly per bill split)</option>
          <option value="joint">Joint Fund (Shared household bank account)</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted">
          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>

      <div className="flex items-start space-x-2 p-3 bg-[#111111] border border-white/10 rounded-xl">
        <Info className="h-4 w-4 text-subtle shrink-0 mt-0.5" />
        <p className="font-mono text-[10px] text-muted leading-normal">
          <strong>Tip:</strong> Direct Pay is great for houses where roommates split individual transfers. Joint Fund is ideal for couples or families who share a bank account.
        </p>
      </div>
    </div>
  );
}
