"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, Calendar, AlertCircle, CheckCircle2, Clock, ChevronUp, ChevronDown } from "lucide-react";
import { type Bill } from "@/context/AppContext";
import { parseBillDate } from "@/lib/utils";

interface UpcomingBillsCardProps {
  bills: Bill[];
  onBillClick: (bill: Bill) => void;
}

export const UpcomingBillsCard = React.memo(function UpcomingBillsCard({
  bills,
  onBillClick,
}: UpcomingBillsCardProps) {
  const [isMinimised, setIsMinimised] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("dashboard_upcoming_bills_minimised");
    if (stored === "false") {
      setIsMinimised(false);
    } else if (stored === "true") {
      setIsMinimised(true);
    }
  }, []);

  const handleToggle = () => {
    setIsMinimised((prev) => {
      const next = !prev;
      localStorage.setItem("dashboard_upcoming_bills_minimised", String(next));
      return next;
    });
  };

  // Get next 5 upcoming or unpaid bills sorted by due date, excluding auto-pay
  const upcomingBillsList = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return [...bills]
      .filter((b) => {
        // Only show manual payment bills
        if (b.payment_type?.toLowerCase() === "auto") return false;

        // Show all unpaid bills (even if overdue)
        if (b.status !== "Paid") return true;
        // Show paid bills only if they are due today or in the future
        const dueDate = parseBillDate(b.due_date || b.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() >= today.getTime();
      })
      .sort((a, b) => {
        const dateA = parseBillDate(a.due_date || a.dueDate);
        const dateB = parseBillDate(b.due_date || b.dueDate);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 5);
  }, [bills]);

  return (
    <div className={`bg-[#111111] border border-white/10 rounded-2xl p-6 flex flex-col shadow-xl transition-all duration-300 hover:border-white/20 ${isMinimised ? "h-fit" : "h-full"}`}>
      {/* Header */}
      <div className={`flex items-center justify-between gap-3 ${isMinimised ? "" : "mb-5"}`}>
        <h3 className="font-syne font-bold text-sm sm:text-base text-white tracking-wide flex items-start gap-2 min-w-0">
          <Calendar className="h-4 w-4 text-[#c8ff00] shrink-0 mt-0.5" />
          <span className="break-words">Upcoming Manual Payments</span>
        </h3>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/bills"
            className="text-[10px] font-syne font-bold uppercase tracking-wider text-[#c8ff00] hover:text-white transition-colors flex items-center gap-1 group whitespace-nowrap"
          >
            <span>View All <span className="hidden sm:inline">Bills</span></span>
            <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
          <button
            onClick={handleToggle}
            className="text-neutral-400 hover:text-white transition-colors p-1 flex items-center justify-center focus:outline-none"
            aria-label={isMinimised ? "Expand Upcoming Manual Payments" : "Minimize Upcoming Manual Payments"}
          >
            {isMinimised ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimised && (
        <div className="flex-1 flex flex-col justify-center">
          {upcomingBillsList.length === 0 ? (
            <div className="py-8 text-center flex flex-col items-center justify-center space-y-2.5">
              <div className="p-3 bg-white/[0.02] rounded-full border border-white/5">
                <Calendar className="h-6 w-6 text-neutral-600" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-neutral-400">No upcoming manual payments</p>
                <p className="text-xs text-neutral-500 font-sans max-w-[240px] mx-auto">
                  Start by adding your manual bills to keep track of due dates.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-white/5 flex flex-col">
              {upcomingBillsList.map((bill) => {
                // Calculate countdown
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const dueDate = parseBillDate(bill.due_date || bill.dueDate);
                dueDate.setHours(0, 0, 0, 0);

                const diffTime = dueDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                let countdownText = "";
                let isOverdue = false;
                const isPaid = bill.status === "Paid";

                if (isPaid) {
                  countdownText = "Paid";
                } else if (diffDays < 0) {
                  const absDays = Math.abs(diffDays);
                  countdownText = `${absDays} day${absDays !== 1 ? "s" : ""} overdue`;
                  isOverdue = true;
                } else if (diffDays === 0) {
                  countdownText = "Due today";
                } else if (diffDays === 1) {
                  countdownText = "Due tomorrow";
                } else {
                  countdownText = `Due in ${diffDays} days`;
                }

                // Badges styling
                let badgeBg = "bg-white/[0.04] text-neutral-400";
                let badgeLabel = bill.status;

                if (isPaid) {
                  badgeBg = "bg-[#00e676]/10 text-[#00e676]";
                  badgeLabel = "Paid";
                } else if (isOverdue) {
                  badgeBg = "bg-[#ff3d57]/10 text-[#ff3d57]";
                  badgeLabel = "Overdue";
                } else {
                  badgeBg = "bg-[#ffab00]/10 text-[#ffab00]";
                  badgeLabel = "Pending";
                }

                return (
                  <div
                    key={bill.id}
                    onClick={() => onBillClick(bill)}
                    className="py-3.5 flex items-center justify-between hover:bg-white/[0.02] -mx-4 px-4 rounded-xl cursor-pointer transition-all duration-200 group active:scale-[0.99]"
                  >
                    <div className="flex flex-col min-w-0 pr-4">
                      <span className="font-sans font-bold text-sm text-neutral-200 truncate group-hover:text-white transition-colors">
                        {bill.name}
                      </span>
                      <span
                        className={`font-mono text-[10px] font-semibold mt-0.5 uppercase tracking-wider flex items-center gap-1 ${
                          isOverdue ? "text-[#ff3d57]" : isPaid ? "text-[#00e676]" : "text-neutral-500"
                        }`}
                      >
                        {isOverdue && <AlertCircle className="h-3 w-3 inline" />}
                        {isPaid && <CheckCircle2 className="h-3 w-3 inline" />}
                        {!isOverdue && !isPaid && <Clock className="h-3 w-3 inline" />}
                        {countdownText}
                      </span>
                    </div>
                    <div className="flex flex-col items-end shrink-0 gap-1.5">
                      <span className="font-jetbrains text-sm font-bold text-white tracking-tight">
                        ${bill.amount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                      <span
                        className={`text-[9px] font-bold font-mono uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeBg}`}
                      >
                        {badgeLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

UpcomingBillsCard.displayName = "UpcomingBillsCard";
export default UpcomingBillsCard;
