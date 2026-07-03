/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useApp, useCurrentUser, type Bill, type BillSplit } from "@/context/AppContext";
import ContributorSplits, { type SplitResult } from "./ContributorSplits";

interface AddBillSheetProps {
  isOpen: boolean;
  onClose: () => void;
  existingBill?: Bill;
  existingSplits?: BillSplit[];
}

export default function AddBillSheet({ isOpen, onClose, existingBill, existingSplits }: AddBillSheetProps) {
  const { householdMembers, addBill, updateBill, session, isJointFund } = useApp();
  const currentUser = useCurrentUser();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [paymentType, setPaymentType] = useState<"Manual" | "Auto">("Manual");
  const [assignee, setAssignee] = useState("");
  const [splits, setSplits] = useState<SplitResult[]>([]);
  const [notes, setNotes] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [paidByMode, setPaidByMode] = useState<"joint" | "individual">("individual");
  const [isSaving, setIsSaving] = useState(false);
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

  // Pre-fill fields if in edit mode
  React.useEffect(() => {
    if (isOpen && existingBill) {
      setName(existingBill.name);
      setAmount(existingBill.amount.toString());
      setInvoiceDate(existingBill.invoice_date ? existingBill.invoice_date : "");
      setDueDate(existingBill.due_date ? existingBill.due_date : "");
      setPaymentType(existingBill.payment_type?.toLowerCase() === "auto" ? "Auto" : "Manual");
      setAssignee(existingBill.assignee_id ? existingBill.assignee_id.toString() : "");
      setNotes(existingBill.notes ? existingBill.notes : "");
      setFrequency(existingBill.frequency ? existingBill.frequency.toLowerCase() : "monthly");
      
      const hasSplits = existingSplits && existingSplits.length > 0;
      setPaidByMode(hasSplits ? "individual" : (isJointFund ? "joint" : "individual"));
    } else if (isOpen) {
      setName("");
      setAmount("");
      setInvoiceDate("");
      setDueDate("");
      setPaymentType("Manual");
      setAssignee(currentUser.id ? String(currentUser.id) : "");
      setSplits([]);
      setNotes("");
      setFrequency("monthly");
      setPaidByMode(isJointFund ? "joint" : "individual");
    }
  }, [isOpen, existingBill, currentUser.id, isJointFund, existingSplits]);

  // Fallback: If householdMembers is empty, display at least the logged-in user
  const displayMembers = householdMembers.length > 0 
    ? householdMembers 
    : (session?.user 
        ? [{
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "You",
            email: session.user.email || "",
            role: "owner",
            avatar: "Y"
          }]
        : []);

  if (!isOpen) return null;

  const isFormValid = name.trim() !== "" && amount.trim() !== "" && !isNaN(Number(amount));

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const billData = {
        name,
        amount: Number(amount),
        invoiceDate,
        dueDate,
        paymentType,
        assignee,
        notes,
        frequency,
      };

      const finalSplits = paidByMode === "joint" ? [] : splits;

      if (existingBill) {
        await updateBill(existingBill.id, billData, finalSplits);
      } else {
        await addBill(billData, finalSplits);
      }
      
      // Reset form on success
      setName("");
      setAmount("");
      setInvoiceDate("");
      setDueDate("");
      setPaymentType("Manual");
      setAssignee("");
      setSplits([]);
      setNotes("");
      
      onClose();
    } catch (error) {
      const err = error as Error;
      console.error("Failed to save bill:", err);
      setErrorMsg(err.message || "Failed to save bill. Please verify details and permissions.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] modal-backdrop flex items-end justify-center bg-black/80 backdrop-blur-sm md:items-stretch md:justify-end md:p-0 md:bg-black/60 animate-in fade-in duration-200">
      {/* Overlay to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Content */}
      <div className="relative w-full max-w-md max-h-[92dvh] md:h-screen md:max-h-screen bg-[#111111] border border-white/10 md:border-y-0 md:border-r-0 md:border-l rounded-t-3xl rounded-b-none md:rounded-none md:rounded-l-3xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 md:slide-in-from-right duration-250">
        
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#111111]/90 px-4 py-3 sm:px-6 sm:py-4 backdrop-blur">
          <h2 className="font-syne text-xl font-bold text-foreground">
            {existingBill ? "Edit Bill" : "Add Bill"}
          </h2>
          <button 
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted hover:bg-white/5 hover:text-foreground transition-colors focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6 space-y-4 md:space-y-6">
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-3 text-red-500 text-xs font-mono break-words whitespace-pre-wrap">
              <span className="font-bold">Failed to save bill:</span><br/>
              {errorMsg}
            </div>
          )}
          
          {/* 1. Bill Name */}
          <div className="flex flex-col space-y-2">
            <label className="font-heading text-sm font-semibold text-subtle uppercase tracking-wider">
              Bill Name
            </label>
            <input 
              type="text" 
              placeholder="e.g., Internet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border border-border bg-surface-raised px-4 py-2.5 md:py-3 text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
            />
          </div>

          {/* 2. Bill Amount */}
          <div className="flex flex-col space-y-2">
            <label className="font-heading text-sm font-semibold text-subtle uppercase tracking-wider">
              Bill Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-mono">$</span>
              <input 
                type="number" 
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-raised pl-8 pr-4 py-2.5 md:py-3 font-mono text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
              />
            </div>
          </div>

          {/* Payment Frequency Selector */}
          <div className="flex flex-col space-y-2">
            <div className="flex flex-col">
              <label className="font-heading text-sm font-semibold text-subtle uppercase tracking-wider">
                Payment Frequency
              </label>
              <span className="text-xs text-muted">
                How often is this bill paid?
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-[#111111] border border-white/10 rounded-xl">
              {(
                [
                  { value: "weekly", label: "Weekly" },
                  { value: "by-weekly", label: "By-Weekly" },
                  { value: "monthly", label: "Monthly" },
                  { value: "yearly", label: "Yearly" },
                ] as const
              ).map((opt) => {
                const isSelected = frequency.toLowerCase() === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFrequency(opt.value)}
                    className={`py-2 rounded-lg text-[10px] font-heading font-bold uppercase tracking-wider transition-all duration-200 focus:outline-none cursor-pointer text-center ${
                      isSelected
                        ? "bg-[#c8ff00] text-black font-extrabold shadow-sm"
                        : "text-neutral-400 hover:text-white hover:bg-white/[0.02]"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Row (3. Invoice Date & 4. Due Date) */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-1 flex-col space-y-2">
              <label className="font-heading text-sm font-semibold text-subtle uppercase tracking-wider">
                Invoice Date
              </label>
              <input 
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full min-w-0 rounded-xl border border-border bg-surface-raised px-4 py-2.5 md:py-3 font-mono text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            
            <div className="flex flex-1 flex-col space-y-2">
              <label className="font-heading text-sm font-semibold text-subtle uppercase tracking-wider">
                Due Date
              </label>
              <input 
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full min-w-0 rounded-xl border border-border bg-surface-raised px-4 py-2.5 md:py-3 font-mono text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>

          {/* 5. Payment Type */}
          <div className="flex flex-col space-y-2">
            <label className="font-heading text-sm font-semibold text-subtle uppercase tracking-wider">
              Payment Type
            </label>
            <div className="flex rounded-xl bg-surface-raised p-1">
              <button
                type="button"
                onClick={() => setPaymentType("Manual")}
                className={`flex-1 rounded-lg py-2 text-sm font-heading font-semibold tracking-wide uppercase transition-all ${
                  paymentType === "Manual" 
                    ? "bg-surface-elevated text-foreground shadow-sm ring-1 ring-border" 
                    : "text-muted hover:text-foreground"
                }`}
              >
                Manual
              </button>
              <button
                type="button"
                onClick={() => setPaymentType("Auto")}
                className={`flex-1 rounded-lg py-2 text-sm font-heading font-semibold tracking-wide uppercase transition-all ${
                  paymentType === "Auto" 
                    ? "bg-surface-elevated text-foreground shadow-sm ring-1 ring-border" 
                    : "text-muted hover:text-foreground"
                }`}
              >
                Auto-Pay
              </button>
            </div>
          </div>

          {/* 6. Assignee */}
          <div className="flex flex-col space-y-2">
            <label className="font-heading text-sm font-semibold text-subtle uppercase tracking-wider">
              Assignee
            </label>
            <div className="relative">
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-raised px-4 py-2.5 md:py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none text-sm"
              >
                <option value="" disabled>Select a member</option>
                {displayMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
            {householdMembers.length === 0 && (
              <span className="text-xs text-amber-500 font-medium">
                Add household members first (Showing logged-in user as fallback)
              </span>
            )}
          </div>

          {/* 7. Paid By Selector */}
          <div className="flex flex-col space-y-2 pt-2">
            <label className="font-heading text-sm font-semibold text-subtle uppercase tracking-wider">
              Paid By
            </label>
            {isJointFund ? (
              <div className="flex flex-col space-y-3">
                {/* Selector */}
                <div className="flex rounded-xl bg-surface-raised p-1 border border-border">
                  <button
                    type="button"
                    onClick={() => setPaidByMode("joint")}
                    className={`flex-1 rounded-lg py-2 text-xs font-heading font-bold uppercase tracking-wider transition-all cursor-pointer text-center ${
                      paidByMode === "joint"
                        ? "bg-[#c8ff00] text-black font-extrabold shadow-sm"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    Joint Fund
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaidByMode("individual")}
                    className={`flex-1 rounded-lg py-2 text-xs font-heading font-bold uppercase tracking-wider transition-all cursor-pointer text-center ${
                      paidByMode === "individual"
                        ? "bg-[#c8ff00] text-black font-extrabold shadow-sm"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    Individual Splits
                  </button>
                </div>

                {paidByMode === "individual" ? (
                  <ContributorSplits 
                    totalBillAmount={Number(amount) || 0}
                    assigneeMemberId={assignee}
                    onSplitsChange={setSplits}
                    initialSplits={existingSplits}
                  />
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-border bg-surface-raised/20 text-center">
                    <p className="text-xs text-muted font-mono">
                      Paid directly from the household Joint Fund account.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <ContributorSplits 
                totalBillAmount={Number(amount) || 0}
                assigneeMemberId={assignee}
                onSplitsChange={setSplits}
                initialSplits={existingSplits}
              />
            )}
          </div>

          {/* 8. Notes */}
          <div className="flex flex-col space-y-2 pt-2">
            <label className="font-heading text-sm font-semibold text-subtle uppercase tracking-wider">
              Notes
            </label>
            <textarea
              placeholder="Add any additional details or context here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#111111] border border-white/10 rounded-xl p-3 font-mono text-sm min-h-[80px] resize-y placeholder:text-muted text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

        </div>

        {/* Footer */}
        <div 
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
          className="sticky bottom-0 z-10 border-t border-white/10 bg-[#111111]/95 px-4 sm:px-6 pt-3 pb-3 md:pt-4 md:pb-4 backdrop-blur flex items-center gap-3 shrink-0"
        >
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 md:py-4 rounded-xl border border-white/10 text-sm font-bold text-muted hover:text-foreground hover:bg-white/5 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isFormValid || isSaving}
            className={`flex-1 rounded-xl py-3 md:py-4 text-sm font-bold uppercase tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary cursor-pointer ${
              isFormValid && !isSaving
                ? "bg-primary text-primary-fg hover:brightness-110 active:scale-[0.98]" 
                : "bg-surface-raised text-muted cursor-not-allowed"
            }`}
          >
            {existingBill 
              ? (isSaving ? "Updating..." : "Update Bill") 
              : (isSaving ? "Saving..." : "Save Bill")}
          </button>
        </div>

      </div>
    </div>
  );
}
