"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
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
  const { isJointFund, markAsPaid, markAsUnpaid, togglePauseBill } = useApp();

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

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] modal-backdrop flex items-center justify-center p-4 bg-foreground/20 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop overlay */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Content */}
      <div className="relative w-full max-w-md max-h-[90dvh] bg-surface border border-border rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-250">
        
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface/90 px-6 py-4 backdrop-blur">
          <h2 className="font-heading text-xl font-bold text-foreground">Bill Details</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-2 text-muted hover:bg-white/5 hover:text-foreground transition-colors focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          
          {/* Bill Title, Badges & Amount */}
          <div className="flex flex-col space-y-4">
            
            {/* Title */}
            <h3 className="font-heading font-bold text-3xl text-foreground tracking-wide break-words">
              {bill.name}
            </h3>

            {/* Badges Section */}
            <div className="flex flex-wrap items-center gap-2">
              <span 
                className={`rounded-full px-3 py-1 text-[10px] font-heading font-bold uppercase tracking-widest ${
                  isAutoPay 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "bg-surface-elevated text-muted border border-border"
                }`}
              >
                {paymentTypeStr}
              </span>
              <span
                className="rounded-full px-3 py-1 text-[10px] font-heading font-bold uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20"
              >
                {bill.category || "Other"}
              </span>
            </div>

            {/* Amount */}
            <div className="flex flex-col items-start pt-2">
              <span className="text-4xl font-heading font-extrabold text-foreground tracking-tight">
                ${formattedAmount}
              </span>
              <span className="text-sm text-muted font-mono mt-1">
                (originally ${formattedAmount} {bill.frequency?.toLowerCase() || 'monthly'})
              </span>
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
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse shrink-0" />
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
              <p className="text-sm text-muted bg-surface p-3 rounded-xl border border-border-strong font-mono leading-relaxed whitespace-pre-wrap">
                {bill.notes}
              </p>
            </div>
          )}

        </div>

        <div 
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
          className="sticky bottom-0 z-10 border-t border-border bg-surface/95 px-6 pt-4 pb-4 backdrop-blur flex flex-col space-y-3 shrink-0"
        >
          {bill.status === "Paid" ? (
            <button
              onClick={() => {
                markAsUnpaid(bill);
                onClose();
              }}
              className="w-full rounded-xl py-3.5 bg-accent/20 text-accent border border-accent/30 font-heading font-bold uppercase tracking-wider text-xs hover:bg-accent hover:text-foreground transition-all active:scale-[0.98] cursor-pointer"
            >
              Mark as Unpaid
            </button>
          ) : (
            <button
              onClick={() => {
                markAsPaid(bill);
                onClose();
              }}
              className="w-full rounded-xl py-3.5 bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 font-heading font-bold uppercase tracking-wider text-xs hover:bg-emerald-500 hover:text-foreground transition-all active:scale-[0.98] cursor-pointer"
            >
              Mark as Paid
            </button>
          )}

          <div className="flex space-x-2 w-full">
            <button
              onClick={onDelete}
              className="flex-1 rounded-xl py-3 bg-destructive/15 text-destructive border border-destructive/20 font-heading font-bold uppercase tracking-wider text-[10px] hover:bg-destructive hover:text-foreground transition-all active:scale-[0.98] cursor-pointer"
            >
              Delete
            </button>
            <button
              onClick={onEdit}
              className="flex-1 rounded-xl py-3 bg-primary text-primary-fg font-heading font-bold uppercase tracking-wider text-[10px] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
            >
              Edit
            </button>
            {bill.is_recurring && (
              <button
                onClick={() => {
                  togglePauseBill(bill.id, !bill.is_paused);
                }}
                className="flex-1 rounded-xl py-3 bg-surface-elevated text-foreground border border-border font-heading font-bold uppercase tracking-wider text-[10px] hover:bg-white/10 active:scale-[0.98] transition-all cursor-pointer"
              >
                {bill.is_paused ? "Resume" : "Pause"}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
