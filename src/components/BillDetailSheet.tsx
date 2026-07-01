"use client";

import React from "react";
import { X, Calendar, AlertTriangle } from "lucide-react";
import { useApp, type Bill, type BillSplit, type Member } from "@/context/AppContext";

interface BillDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  bill: Bill | null;
  splits: BillSplit[];
  householdMembers: Member[];
  onEdit: () => void;
  onDelete: () => void;
}

export default function BillDetailSheet({
  isOpen,
  onClose,
  bill,
  splits,
  householdMembers,
  onEdit,
  onDelete,
}: BillDetailSheetProps) {
  const { isJointFund } = useApp();
  if (!isOpen || !bill) return null;

  // Find assignee
  const assigneeSplit = splits.find((s) => s.is_assignee);
  const assigneeId = bill.assignee_id || (assigneeSplit?.member_id);
  const assignee = householdMembers.find((m) => String(m.id) === String(assigneeId));

  // Auto/Manual formatted text
  const isAutoPay = bill.payment_type?.toLowerCase() === "auto";
  const paymentTypeStr = isAutoPay ? "Auto-Pay" : "Manual";

  // Format amount
  const formattedAmount = Number(bill.amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm md:items-stretch md:justify-end md:p-0 md:bg-black/60 animate-in fade-in duration-200">
      {/* Backdrop overlay */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Content */}
      <div className="relative w-full max-w-md max-h-[90dvh] md:h-screen md:max-h-screen bg-[#111111] border border-white/10 md:border-y-0 md:border-r-0 md:border-l rounded-2xl md:rounded-none md:rounded-l-3xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 md:zoom-in-100 md:slide-in-from-right duration-250">
        
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#111111]/90 px-6 py-4 backdrop-blur">
          <h2 className="font-syne text-xl font-bold text-foreground">Bill Details</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-2 text-muted hover:bg-white/5 hover:text-foreground transition-colors focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          
          {/* Bill Title & Amount */}
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-2xl text-foreground tracking-wide truncate pr-4">
                {bill.name}
              </h3>
              <span 
                className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-heading font-bold uppercase tracking-widest ${
                  isAutoPay 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "bg-surface-elevated text-muted border border-border"
                }`}
              >
                {paymentTypeStr}
              </span>
            </div>
            <div className="flex items-baseline mt-2 text-3xl font-heading font-extrabold text-foreground">
              ${formattedAmount}
            </div>
          </div>

          {/* Dates & Assignee Row Grid */}
          <div className="grid grid-cols-2 gap-4 border-t border-b border-border py-4 font-mono text-xs">
            <div className="space-y-1">
              <span className="text-subtle uppercase font-semibold">Due Date</span>
              <div className="flex items-center space-x-1.5 text-foreground">
                <Calendar size={14} className="text-muted animate-pulse" />
                <span>{bill.dueDate}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-subtle uppercase font-semibold">Invoice Date</span>
              <div className="flex items-center space-x-1.5 text-foreground">
                <Calendar size={14} className="text-muted" />
                <span>{bill.invoice_date ? new Date(bill.invoice_date + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" }) : "N/A"}</span>
              </div>
            </div>

            <div className="col-span-2 space-y-1">
              <span className="text-subtle uppercase font-semibold">Assignee (Payer)</span>
              <div className="flex items-center space-x-2 text-foreground">
                <div className="h-6 w-6 rounded-full bg-surface-elevated border border-border flex items-center justify-center font-bold text-[10px]">
                  {assignee?.avatar || "P"}
                </div>
                <span className="text-sm font-semibold">{assignee?.name || "Unassigned"}</span>
              </div>
            </div>
          </div>

          {/* Splits Breakdown */}
          <div className="space-y-3">
            <h4 className="font-heading text-sm font-semibold text-subtle uppercase tracking-wider">
              Paid By
            </h4>

            {splits.length === 0 ? (
              <div className="flex items-center space-x-2.5 p-3.5 bg-surface-raised rounded-xl border border-border">
                {isJointFund ? (
                  <>
                    <div className="h-2 w-2 rounded-full bg-[#c8ff00] animate-pulse shrink-0" />
                    <p className="text-xs text-muted font-mono">Paid directly from the household Joint Fund.</p>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={15} className="text-muted shrink-0" />
                    <p className="text-xs text-muted font-mono">No splits configured. Assignee pays 100%.</p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {splits.map((split) => {
                  const member = householdMembers.find((m) => String(m.id) === String(split.member_id));
                  const splitPercent = bill.amount > 0 ? Math.round((split.amount / bill.amount) * 100) : 0;
                  
                  return (
                    <div 
                      key={split.id}
                      className={`flex items-center justify-between p-3 rounded-xl bg-surface-raised border border-border ${
                        split.is_assignee ? "border-l-2 border-l-primary" : ""
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="h-6 w-6 rounded-full bg-surface-elevated flex items-center justify-center font-bold text-[10px]">
                          {member?.avatar || "M"}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm text-foreground font-semibold">
                            {member?.name || "Unknown"}
                          </span>
                          {split.is_assignee && (
                            <span className="text-[9px] font-heading font-semibold text-primary uppercase">
                              Assignee
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-sm font-bold text-foreground font-mono">
                          ${Number(split.amount).toFixed(2)}
                        </span>
                        <span className="block text-[10px] text-muted font-mono">
                          {splitPercent}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notes Section */}
          {bill.notes && (
            <div className="space-y-2 border-t border-border pt-4">
              <h4 className="font-heading text-sm font-semibold text-subtle uppercase tracking-wider">
                Notes
              </h4>
              <p className="text-sm text-muted bg-[#111111] p-3 rounded-xl border border-white/5 font-mono leading-relaxed whitespace-pre-wrap">
                {bill.notes}
              </p>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div 
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
          className="sticky bottom-0 z-10 border-t border-white/10 bg-[#111111]/95 px-6 pt-4 pb-4 backdrop-blur flex space-x-3 shrink-0"
        >
          <button
            onClick={onDelete}
            className="flex-1 rounded-xl py-3.5 bg-destructive/15 text-destructive border border-destructive/20 font-heading font-bold uppercase tracking-wider text-xs hover:bg-destructive hover:text-white transition-all active:scale-[0.98] cursor-pointer"
          >
            Delete Bill
          </button>
          <button
            onClick={onEdit}
            className="flex-1 rounded-xl py-3.5 bg-primary text-primary-fg font-heading font-bold uppercase tracking-wider text-xs hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
          >
            Edit Bill
          </button>
        </div>

      </div>
    </div>
  );
}
