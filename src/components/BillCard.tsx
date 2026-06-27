"use client";

import React, { useState } from "react";
import { useApp, type Bill, type BillSplit, type Member } from "@/context/AppContext";
import BillDetailSheet from "./BillDetailSheet";
import AddBillSheet from "./AddBillSheet";

export interface BillCardProps {
  bill: Bill;
  splits?: BillSplit[];
  householdMembers: Member[];
}

export default function BillCard({ bill, splits = [], householdMembers }: BillCardProps) {
  const { deleteBill } = useApp();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
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

  // Format currency beautifully
  const formattedAmount = Number(bill.amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${bill.name}"?`)) {
      deleteBill(bill.id);
      setIsDetailOpen(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsDetailOpen(true)}
        className="w-full text-left rounded-2xl bg-surface border border-border p-5 flex flex-col space-y-4 hover:border-primary/30 hover:bg-surface-raised transition-all group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
      >
      {/* Top Row: Name & Payment Type Badge */}
      <div className="flex w-full items-center justify-between">
        <h3 className="font-heading font-semibold text-lg text-foreground tracking-wide truncate pr-4">
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

      {/* Middle Row: Amount */}
      <div className="flex w-full items-center">
        <span className="font-heading font-extrabold text-3xl text-foreground tracking-tight">
          ${formattedAmount}
        </span>
      </div>

      {/* Bottom Row: Due Date & Assignee */}
      <div className="flex w-full items-center justify-between pt-2">
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
            className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-elevated text-[10px] font-bold text-foreground border border-border group-hover:border-primary/30 transition-colors shadow-sm"
            title={`Assignee: ${assignee.name}`}
          >
            {assignee.avatar || assignee.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      </button>

      <BillDetailSheet
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
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
