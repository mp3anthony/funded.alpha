"use client";

import React from "react";
import { Users, Wallet, Info } from "lucide-react";

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

      <div className="flex flex-col sm:flex-row gap-4 w-full">
        {/* Direct Pay Card */}
        <button
          type="button"
          onClick={() => onModeChange(false)}
          className={`flex-1 flex flex-col items-center sm:items-start p-5 rounded-2xl bg-surface border transition-all duration-300 text-left focus:outline-none focus:ring-2 focus:ring-primary/50 ${
            currentMode === false
              ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
              : "border-border hover:border-white/20 hover:bg-surface-raised"
          }`}
        >
          <div className={`p-3 rounded-xl mb-4 transition-colors ${
            currentMode === false ? "bg-primary/20 text-primary" : "bg-surface-elevated text-subtle"
          }`}>
            <Users className="h-6 w-6" />
          </div>
          <h4 className="font-syne font-semibold text-base text-foreground mb-1">
            Direct Pay
          </h4>
          <p className="font-mono text-xs text-muted leading-relaxed text-center sm:text-left">
            Each person pays their share directly to the bill assignee.
          </p>
        </button>

        {/* Joint Fund Card */}
        <button
          type="button"
          onClick={() => onModeChange(true)}
          className={`flex-1 flex flex-col items-center sm:items-start p-5 rounded-2xl bg-surface border transition-all duration-300 text-left focus:outline-none focus:ring-2 focus:ring-primary/50 ${
            currentMode === true
              ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
              : "border-border hover:border-white/20 hover:bg-surface-raised"
          }`}
        >
          <div className={`p-3 rounded-xl mb-4 transition-colors ${
            currentMode === true ? "bg-primary/20 text-primary" : "bg-surface-elevated text-subtle"
          }`}>
            <Wallet className="h-6 w-6" />
          </div>
          <h4 className="font-syne font-semibold text-base text-foreground mb-1">
            Joint Fund
          </h4>
          <p className="font-mono text-xs text-muted leading-relaxed text-center sm:text-left">
            Everyone contributes to a shared household account for bills.
          </p>
        </button>
      </div>

      <div className="flex items-start space-x-2 p-3 bg-surface-raised rounded-xl border border-border">
        <Info className="h-4 w-4 text-subtle shrink-0 mt-0.5" />
        <p className="font-mono text-[10px] text-muted leading-normal">
          <strong>Tip:</strong> Direct Pay is great for houses where roommates split individual transfers. Joint Fund is ideal for couples or families who share a bank account.
        </p>
      </div>
    </div>
  );
}
