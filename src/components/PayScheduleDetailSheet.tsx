"use client";

import React from "react";
import { X, Calendar, User, Clock } from "lucide-react";
import type { PaySchedule, Member } from "@/context/AppContext";

interface PayScheduleDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  paySchedule: PaySchedule | null;
  householdMembers: Member[];
  onEdit: () => void;
  onDelete: () => void;
}

export default function PayScheduleDetailSheet({
  isOpen,
  onClose,
  paySchedule,
  householdMembers,
  onEdit,
  onDelete,
}: PayScheduleDetailSheetProps) {
  if (!isOpen || !paySchedule) return null;

  const member = householdMembers.find((m) => String(m.id) === String(paySchedule.member_id));
  const memberName = member ? member.name : "Unknown Member";

  const formattedAmount = paySchedule.is_fixed_amount && paySchedule.amount
    ? `$${Number(paySchedule.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "Variable";

  // Format Next Pay Date
  let formattedNextPayDate = paySchedule.next_pay_date;
  try {
    const d = new Date(paySchedule.next_pay_date + "T00:00:00");
    if (!isNaN(d.getTime())) {
      formattedNextPayDate = d.toLocaleDateString("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
      });
    }
  } catch (e) {
    console.error("Failed to format next pay date:", paySchedule.next_pay_date);
  }

  // Format Created At
  let formattedCreatedAt = "N/A";
  if (paySchedule.created_at) {
    try {
      const d = new Date(paySchedule.created_at);
      if (!isNaN(d.getTime())) {
        formattedCreatedAt = d.toLocaleDateString("en-US", {
          month: "long",
          day: "2-digit",
          year: "numeric",
        });
      }
    } catch (e) {
      console.error("Failed to format created_at date:", paySchedule.created_at);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center animate-in fade-in duration-200">
      {/* Backdrop overlay */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Content */}
      <div className="relative w-full max-h-[90vh] overflow-y-auto rounded-t-2xl bg-[#111111] sm:max-w-md sm:rounded-2xl border-t sm:border border-white/10 flex flex-col shadow-2xl animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#111111]/90 px-6 py-4 backdrop-blur">
          <h2 className="font-heading text-lg font-bold text-foreground">Schedule Details</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-2 text-muted hover:bg-white/5 hover:text-foreground transition-colors focus:outline-none"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex flex-col space-y-5 px-6 py-5">
          
          {/* Member Name & Frequency */}
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-xl text-foreground truncate pr-4 flex items-center gap-2">
                {member?.avatar_url ? (
                  <img src={member.avatar_url} alt={memberName} className="h-6 w-6 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-primary to-emerald-500 flex items-center justify-center text-white font-bold text-[10px] shrink-0">
                    {member?.avatar || memberName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span>{memberName}</span>
              </h3>
              <span className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-heading font-bold uppercase tracking-wider bg-white/5 text-muted border border-white/10">
                {paySchedule.frequency}
              </span>
            </div>
            <div className="flex items-baseline mt-2 text-2xl font-heading font-extrabold text-foreground">
              {formattedAmount}
              {paySchedule.is_fixed_amount && (
                <span className="text-xs font-normal text-muted font-mono ml-2">
                  fixed per payday
                </span>
              )}
            </div>
          </div>

          {/* Details Info Grid */}
          <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-5 font-mono text-xs">
            <div className="space-y-1">
              <span className="text-subtle uppercase font-semibold">Next Pay Date</span>
              <div className="flex items-center space-x-1.5 text-foreground">
                <Calendar size={13} className="text-muted" />
                <span>{formattedNextPayDate}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-subtle uppercase font-semibold">Created Date</span>
              <div className="flex items-center space-x-1.5 text-foreground">
                <Clock size={13} className="text-muted" />
                <span>{formattedCreatedAt}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 border-t border-white/5 bg-[#111111]/90 px-6 py-4 backdrop-blur flex space-x-3">
          <button
            onClick={onDelete}
            className="flex-1 py-3 bg-destructive/15 text-destructive border border-destructive/20 rounded-xl font-heading font-bold uppercase tracking-wider text-xs hover:bg-destructive hover:text-white transition-all active:scale-[0.98] cursor-pointer"
          >
            Delete
          </button>
          <button
            onClick={onEdit}
            className="flex-1 py-3 bg-primary text-primary-fg rounded-xl font-heading font-bold uppercase tracking-wider text-xs hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
          >
            Edit Schedule
          </button>
        </div>

      </div>
    </div>
  );
}
