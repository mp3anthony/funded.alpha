"use client";

import React, { useState } from "react";
import { useApp, type Bill, type BillSplit, type Member } from "@/context/AppContext";
import { convertAmount } from "@/lib/utils";
import BillDetailSheet from "./BillDetailSheet";
import AddBillSheet from "./AddBillSheet";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export interface BillCardProps {
  bill: Bill;
  splits?: BillSplit[];
  householdMembers: Member[];
  displayFrequency?: "weekly" | "fortnightly" | "monthly" | "yearly";
}

export default function BillCard({
  bill,
  splits = [],
  householdMembers,
  displayFrequency = "weekly",
}: BillCardProps) {
  const { deleteBill } = useApp();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const highlightBillId = searchParams ? searchParams.get("billId") : null;

  const [prevHighlightId, setPrevHighlightId] = useState<string | null>(null);

  if (highlightBillId !== prevHighlightId) {
    setPrevHighlightId(highlightBillId);
    if (highlightBillId && highlightBillId === bill.id.toString()) {
      setIsDetailOpen(true);
    }
  }

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    if (highlightBillId === bill.id.toString()) {
      const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
      params.delete("billId");
      const newQuery = params.toString();
      router.replace(`${pathname}${newQuery ? `?${newQuery}` : ""}`);
    }
  };
  // Determine assignee
  const assigneeSplit = splits.find((s) => s.is_assignee);
  const assigneeId = bill.assignee_id || (assigneeSplit?.member_id);
  const assignee = householdMembers.find((m) => String(m.id) === String(assigneeId));

  // Determine urgency
  const due = new Date(bill.dueDate);
  const today = new Date();
  const timeDiff = due.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  const isUrgent = daysDiff <= 3; // True if due in 3 days, today, or overdue

  // Determine Payment Type format
  const isAutoPay = bill.payment_type?.toLowerCase() === "auto";
  const paymentTypeStr = isAutoPay ? "AUTO" : "MANUAL";

  // Convert amount based on selected frequency
  const convertedAmount = convertAmount(bill.amount, bill.frequency || "monthly", displayFrequency);

  // Format currency beautifully
  const formattedAmount = convertedAmount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Calculate secondary label logic moved to BillDetailSheet
  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${bill.name}"?`)) {
      try {
        await deleteBill(bill.id);
        setIsDetailOpen(false);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Unknown error";
        alert("Failed to delete bill: " + errMsg);
      }
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsDetailOpen(true)}
        className="w-full text-left rounded-2xl bg-surface border border-border flex hover:border-primary/30 hover:bg-surface-raised transition-all group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background p-4 flex-col space-y-2.5"
      >
      {/* Top Row: Name & Badges */}
      <div className="flex items-center justify-between w-full">
        <h3 className="font-heading font-semibold text-lg text-foreground tracking-wide truncate pr-4">
          {bill.name}
        </h3>
        <div className="flex items-center gap-2 shrink-0">
          {/* Removed Recurring/Frequency Badges */}
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
      </div>

      {/* Middle Row: Amount */}
      <div className="flex items-baseline gap-2.5 w-full">
        <span className="font-mono font-extrabold text-foreground tracking-tight text-2xl">
          ${formattedAmount}
        </span>
      </div>

      {/* Bottom Row: Due Date & Assignee */}
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col space-y-1">
          <span
            className={`font-mono text-xs uppercase font-medium transition-colors ${
              isUrgent ? "text-[#ff4500]" : "text-muted"
            }`}
          >
            DUE {bill.dueDate}
          </span>
          {bill.notes && (
            <p className="text-xs text-muted font-mono mt-1">
              {bill.notes}
            </p>
          )}
        </div>


        {assignee && (
          <div
            className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-xl bg-surface-elevated text-[10px] font-bold text-foreground border border-border group-hover:border-primary/30 transition-colors shadow-sm"
            title={`Assignee: ${assignee.name}`}
          >
            {assignee.avatar_url ? (
              <img
                src={assignee.avatar_url}
                alt={assignee.name}
                className="h-full w-full object-cover"
              />
            ) : (
              assignee.avatar || assignee.name.charAt(0).toUpperCase()
            )}
          </div>
        )}
      </div>

      {/* Tap for more prompt */}
      <div className="w-full text-center text-[9px] font-semibold text-muted/60 uppercase tracking-widest group-hover:text-primary transition-colors flex items-center justify-center gap-1">
        Tap for more
        <span aria-hidden="true">›</span>
      </div>
      </button>

      <BillDetailSheet
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        bill={bill}
        splits={splits}
        householdMembers={householdMembers}
        onEdit={() => {
          setIsDetailOpen(false);
          setIsEditOpen(true);
        }}
        onDelete={handleDelete}
      />

      <AddBillSheet
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        existingBill={bill}
        existingSplits={splits}
      />
    </>
  );
}
