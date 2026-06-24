"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Clock } from "lucide-react";
import {
  Home,
  Calendar,
  Receipt,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";

const TOTAL_STEPS = 4;

export default function Onboarding() {
  const { addPayday, addBill, completeOnboarding, setHouseholdName: setGlobalHouseholdName } = useApp();

  const [currentStep, setCurrentStep] = useState(1);

  /* Step 1 — Welcome */
  const [localHouseholdName, setLocalHouseholdName] = useState("");

  /* Step 2 — Payday */
  const [paydayDate, setPaydayDate] = useState("");
  const [payAmount, setPayAmount] = useState("");

  /* Step 3 — First Bill */
  const [billName, setBillName] = useState("");
  const [billAmount, setBillAmount] = useState("");
  const [billFrequency, setBillFrequency] = useState("Monthly");

  /* ── Navigation ─────────────────────────────── */
  function handleNext() {
    if (currentStep === 1 && localHouseholdName.trim()) {
      setGlobalHouseholdName(localHouseholdName.trim());
    }

    if (currentStep === 2 && paydayDate && payAmount) {
      addPayday({
        id: Date.now(),
        date: paydayDate,
        amount: parseFloat(payAmount),
      });
    }

    if (currentStep === 3 && billName && billAmount) {
      addBill({
        id: Date.now(),
        name: billName,
        category: "Other",
        dueDate: new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "2-digit",
          year: "numeric",
        }),
        amount: parseFloat(billAmount),
        status: "Due Soon",
        frequency: billFrequency,
        statusColor: "text-amber-600 bg-amber-500/10 dark:text-amber-400",
        statusIcon: Clock,
        categoryColor: "bg-secondary/10 text-secondary",
      });
    }

    setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function handleBack() {
    setCurrentStep((s) => Math.max(s - 1, 1));
  }

  /* ── Can proceed? ──────────────────────────── */
  function canProceed(): boolean {
    if (currentStep === 1) return localHouseholdName.trim().length > 0;
    if (currentStep === 2) return paydayDate !== "" && payAmount !== "";
    if (currentStep === 3) return billName.trim().length > 0 && billAmount !== "";
    return true;
  }

  /* ── Step icons for progress ───────────────── */
  const stepIcons = [Home, Calendar, Receipt, Sparkles];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background px-4">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      <div className="relative w-full max-w-lg">
        {/* Card */}
        <div className="bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden">
          {/* Progress bar */}
          <div className="h-1.5 bg-surface-raised">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
            />
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-3 pt-6 pb-2">
            {stepIcons.map((Icon, i) => {
              const stepNum = i + 1;
              const isActive = stepNum === currentStep;
              const isDone = stepNum < currentStep;
              return (
                <div
                  key={i}
                  className={`flex items-center justify-center h-10 w-10 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-secondary text-white shadow-lg shadow-secondary/30 scale-110"
                      : isDone
                        ? "bg-primary/10 text-primary"
                        : "bg-surface-raised text-subtle"
                  }`}
                >
                  {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs font-bold text-subtle uppercase tracking-widest pb-2">
            Step {currentStep} of {TOTAL_STEPS}
          </p>

          {/* Step content */}
          <div className="px-6 sm:px-8 pb-6 pt-2 min-h-[280px] flex flex-col">
            {/* ── Step 1: Welcome ── */}
            {currentStep === 1 && (
              <div className="flex-1 flex flex-col justify-center space-y-6">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 text-white mx-auto shadow-lg shadow-primary/25">
                    <Home className="h-7 w-7" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                    Welcome to Funded
                  </h2>
                  <p className="text-sm text-muted max-w-xs mx-auto">
                    Let&apos;s set up your household in just a few quick steps.
                  </p>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="ob-household"
                    className="block text-xs font-bold tracking-wider uppercase text-muted"
                  >
                    Household Name
                  </label>
                  <input
                    id="ob-household"
                    type="text"
                    placeholder="e.g. The Smiths"
                    value={localHouseholdName}
                    onChange={(e) => setLocalHouseholdName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-surface-raised border border-border text-foreground text-sm font-medium focus:ring-2 focus:ring-secondary/40 focus:border-secondary outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* ── Step 2: Payday ── */}
            {currentStep === 2 && (
              <div className="flex-1 flex flex-col justify-center space-y-6">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-secondary to-indigo-600 text-white mx-auto shadow-lg shadow-secondary/25">
                    <Calendar className="h-7 w-7" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                    Your Payday
                  </h2>
                  <p className="text-sm text-muted max-w-xs mx-auto">
                    When do you next get paid? We&apos;ll track it for you.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="ob-paydate"
                      className="block text-xs font-bold tracking-wider uppercase text-muted"
                    >
                      Next Payday Date
                    </label>
                    <input
                      id="ob-paydate"
                      type="date"
                      value={paydayDate}
                      onChange={(e) => setPaydayDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-surface-raised border border-border text-foreground text-sm font-medium focus:ring-2 focus:ring-secondary/40 focus:border-secondary outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="ob-payamount"
                      className="block text-xs font-bold tracking-wider uppercase text-muted"
                    >
                      Pay Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle text-sm font-semibold">$</span>
                      <input
                        id="ob-payamount"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="2,500.00"
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                        className="w-full pl-8 pr-4 py-3 rounded-xl bg-surface-raised border border-border text-foreground text-sm font-medium focus:ring-2 focus:ring-secondary/40 focus:border-secondary outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3: First Bill ── */}
            {currentStep === 3 && (
              <div className="flex-1 flex flex-col justify-center space-y-6">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-accent to-amber-500 text-white mx-auto shadow-lg shadow-accent/25">
                    <Receipt className="h-7 w-7" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                    Add a Bill
                  </h2>
                  <p className="text-sm text-muted max-w-xs mx-auto">
                    Enter your first recurring bill so we can start tracking it.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="ob-billname"
                      className="block text-xs font-bold tracking-wider uppercase text-muted"
                    >
                      Bill Name
                    </label>
                    <input
                      id="ob-billname"
                      type="text"
                      placeholder="e.g. Rent, Electricity"
                      value={billName}
                      onChange={(e) => setBillName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-surface-raised border border-border text-foreground text-sm font-medium focus:ring-2 focus:ring-secondary/40 focus:border-secondary outline-none transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label
                        htmlFor="ob-billamount"
                        className="block text-xs font-bold tracking-wider uppercase text-muted"
                      >
                        Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle text-sm font-semibold">$</span>
                        <input
                          id="ob-billamount"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={billAmount}
                          onChange={(e) => setBillAmount(e.target.value)}
                          className="w-full pl-8 pr-4 py-3 rounded-xl bg-surface-raised border border-border text-foreground text-sm font-medium focus:ring-2 focus:ring-secondary/40 focus:border-secondary outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="ob-billfreq"
                        className="block text-xs font-bold tracking-wider uppercase text-muted"
                      >
                        Frequency
                      </label>
                      <select
                        id="ob-billfreq"
                        value={billFrequency}
                        onChange={(e) => setBillFrequency(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-surface-raised border border-border text-foreground text-sm font-medium focus:ring-2 focus:ring-secondary/40 focus:border-secondary outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="Weekly">Weekly</option>
                        <option value="Bi-Weekly">Bi-Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Yearly">Yearly</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 4: Success ── */}
            {currentStep === 4 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                <div className="relative">
                  <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-gradient-to-br from-primary to-emerald-500 text-white shadow-xl shadow-primary/30">
                    <Sparkles className="h-9 w-9" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-6 w-6 bg-secondary text-white rounded-full flex items-center justify-center shadow-md">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                    You&apos;re All Set! 🎉
                  </h2>
                  <p className="text-sm text-muted max-w-xs mx-auto">
                    <span className="font-bold text-foreground">{localHouseholdName || "Your household"}</span> is ready to go.
                    Your payday and first bill are already tracked.
                  </p>
                </div>
                <button
                  onClick={completeOnboarding}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary to-emerald-500 text-white text-sm font-bold shadow-lg shadow-primary/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  Enter App
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* ── Footer navigation (steps 1–3) ────── */}
          {currentStep < 4 && (
            <div className="px-6 sm:px-8 pb-6 flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-sm font-bold text-muted hover:text-foreground hover:bg-surface-raised transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              ) : (
                <div /> /* spacer */
              )}
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-secondary text-secondary-fg text-sm font-bold shadow-lg shadow-secondary/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
