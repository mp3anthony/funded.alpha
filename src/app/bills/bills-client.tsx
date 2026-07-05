"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { useApp, useCurrentUser } from "@/context/AppContext";
import AddBillSheet from "@/components/AddBillSheet";
import BillCard from "@/components/BillCard";
import PageHeader from "@/components/PageHeader";
import FrequencyToggle from "@/components/FrequencyToggle";
import { convertAmount } from "@/lib/utils";

type FrequencyType = "weekly" | "by-weekly" | "monthly" | "yearly";

export default function BillsClient() {
  const { bills, billSplits, members: householdMembers } = useApp();
  const currentUser = useCurrentUser();

  const [isAddBillSheetOpen, setIsAddBillSheetOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "week" | "month" | "overdue">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [displayFrequency, setDisplayFrequency] = useState<FrequencyType>("weekly");

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getFrequencyLabel = (freq: FrequencyType) => {
    switch (freq) {
      case "weekly": return "Weekly";
      case "by-weekly": return "By-Weekly";
      case "monthly": return "Monthly";
      case "yearly": return "Yearly";
      default: return "Weekly";
    }
  };

  const totalBills = useMemo(() => {
    return bills.reduce((sum, b) => {
      return sum + convertAmount(b.amount, b.frequency || "monthly", displayFrequency);
    }, 0);
  }, [bills, displayFrequency]);

  const filteredBills = useMemo(() => {
    const today = isMounted ? new Date() : new Date("2026-07-05");
    today.setHours(0, 0, 0, 0);

    return bills.filter((b) => {
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        if (!b.name.toLowerCase().includes(query)) return false;
      }

      const d = b.due_date ? new Date(b.due_date + "T00:00:00") : new Date(b.dueDate);
      if (isNaN(d.getTime())) return false;
      d.setHours(0, 0, 0, 0);

      const diffTime = d.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / 86_400_000);

      if (filter === "week") return diffDays >= 0 && diffDays <= 7;
      if (filter === "month") return diffDays >= 0 && diffDays <= 30;
      if (filter === "overdue") return d.getTime() < today.getTime() && b.status !== "Paid";
      return true;
    });
  }, [bills, filter, searchQuery]);

  const emptyStateMessage = useMemo(() => {
    if (searchQuery.trim() !== "") return "No bills match your search";
    if (filter === "week") return "No bills due this week";
    if (filter === "month") return "No bills due this month";
    if (filter === "overdue") return "No overdue bills";
    return "No bills found";
  }, [filter, searchQuery]);

  return (
    // 1. Drastically reduced padding and spacing to fix the "oversized" feel
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 pt-4 pb-4 sm:px-6 sm:pt-6 sm:pb-6 space-y-4">

      {/* 2. Clean Header - Action slot added to hold the Add Bill button next to avatar */}
      <PageHeader
        title="Bills"
        subtitle="All household costs, organised by category."
        action={
          <button
            onClick={() => setIsAddBillSheetOpen(true)}
            className="flex items-center gap-2 bg-secondary hover:bg-secondary-dark active:scale-95 text-secondary-fg text-xs font-semibold px-3 py-2 rounded-xl shadow-md shadow-secondary/15 transition-all duration-200 cursor-pointer animate-in fade-in duration-200"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Bill</span>
          </button>
        }
      />

      {/* 3. Total Bar */}
      <div className="px-1">
        <div className="text-3xl font-bold text-accent tracking-tight font-jetbrains">
          ${totalBills.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="text-xs font-bold uppercase tracking-wider text-subtle mt-1">
          {getFrequencyLabel(displayFrequency)} Total
        </div>
      </div>

      {/* 4. Compact Search, Filter, and Add Bill Button */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search bills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg pl-4 pr-10 py-2.5 font-mono text-sm placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors p-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Compact Filter Dropdown */}
        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as "all" | "week" | "month" | "overdue")}
            className="rounded-lg border border-border bg-surface px-3 py-2.5 text-xs font-bold text-foreground focus:border-primary focus:outline-none appearance-none cursor-pointer pr-8"
          >
            <option value="all">All</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="overdue">Overdue</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted">
            <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>

      </div>

      {/* Period Toggle */}
      <FrequencyToggle
        selectedFrequency={displayFrequency}
        onChange={setDisplayFrequency}
      />

      {/* Bills Scrollable Container */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-subtle uppercase tracking-wider px-1">
          Bills List
        </h2>
        {filteredBills.length === 0 ? (
          <div className="bg-surface border border-border rounded-2xl p-8 text-center shadow-sm">
            <p className="text-muted font-mono text-center py-4 text-sm">{emptyStateMessage}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredBills.map((bill) => (
              <BillCard
                key={bill.id}
                bill={bill}
                splits={billSplits.filter(s => s.bill_id === bill.id)}
                householdMembers={householdMembers}
                displayFrequency={displayFrequency}
              />
            ))}
          </div>
        )}
      </div>

      <AddBillSheet
        isOpen={isAddBillSheetOpen}
        onClose={() => setIsAddBillSheetOpen(false)}
      />
    </div>
  );
}
