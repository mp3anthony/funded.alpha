"use client";

import { useState, useMemo } from "react";
import { Plus, Search, Filter, Trash2, X } from "lucide-react";
import { useApp, useCurrentUser } from "@/context/AppContext";
import AddBillSheet from "@/components/AddBillSheet";
import BillCard from "@/components/BillCard";
import PageHeader from "@/components/PageHeader";
import FrequencyToggle from "@/components/FrequencyToggle";
import { convertAmount } from "@/lib/utils";

type FrequencyType = "weekly" | "fortnightly" | "monthly" | "yearly";

export default function Bills() {
  const { bills, billSplits, members: householdMembers, togglePaid, deleteBill } = useApp();
  const currentUser = useCurrentUser();

  const [isAddBillSheetOpen, setIsAddBillSheetOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "week" | "month" | "overdue">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [displayFrequency, setDisplayFrequency] = useState<FrequencyType>("weekly");

  // Helper to format frequency labels for UI
  const getFrequencyLabel = (freq: FrequencyType) => {
    switch (freq) {
      case "weekly": return "Weekly";
      case "fortnightly": return "Fortnightly";
      case "monthly": return "Monthly";
      case "yearly": return "Yearly";
      default: return "Weekly";
    }
  };

  // Derived summary values converted dynamically based on selected frequency
  const totalBills = useMemo(() => {
    return bills.reduce((sum, b) => {
      return sum + convertAmount(b.amount, b.frequency || "monthly", displayFrequency);
    }, 0);
  }, [bills, displayFrequency]);

  const totalPaid = useMemo(() => {
    return bills
      .filter((b) => b.status === "Paid")
      .reduce((sum, b) => {
        return sum + convertAmount(b.amount, b.frequency || "monthly", displayFrequency);
      }, 0);
  }, [bills, displayFrequency]);

  const remainingDue = totalBills - totalPaid;

  const filteredBills = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return bills.filter((b) => {
      // 1. Search Query Filter
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        if (!b.name.toLowerCase().includes(query)) {
          return false;
        }
      }

      // 2. Time Filter
      let d = b.due_date ? new Date(b.due_date + "T00:00:00") : new Date(b.dueDate);
      if (isNaN(d.getTime())) return false;
      d.setHours(0, 0, 0, 0);

      const diffTime = d.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / 86_400_000);

      if (filter === "week") {
        return diffDays >= 0 && diffDays <= 7;
      }
      if (filter === "month") {
        return diffDays >= 0 && diffDays <= 30;
      }
      if (filter === "overdue") {
        return d.getTime() < today.getTime() && b.status !== "Paid";
      }
      return true; // "all"
    });
  }, [bills, filter, searchQuery]);

  const emptyStateMessage = useMemo(() => {
    if (searchQuery.trim() !== "") {
      return "No bills match your search";
    }
    if (filter === "week") {
      return "No bills due this week";
    }
    if (filter === "month") {
      return "No bills due this month";
    }
    if (filter === "overdue") {
      return "No overdue bills";
    }
    return "No bills found";
  }, [filter, searchQuery]);

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 sm:px-6 md:py-12 space-y-6">
      <PageHeader
        title="Bills"
        subtitle="Manage and track all household bills"
        user={currentUser}
        action={
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
            <FrequencyToggle
              selectedFrequency={displayFrequency}
              onChange={setDisplayFrequency}
            />
            <button
              onClick={() => setIsAddBillSheetOpen(true)}
              className="flex items-center gap-2 bg-secondary hover:bg-secondary-dark active:scale-95 text-secondary-fg text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-secondary/15 transition-all duration-200 cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Add Bill</span>
            </button>
          </div>
        }
      />

      {/* Summary Banner Cards — reactive to frequency */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-subtle">
            Total {getFrequencyLabel(displayFrequency)} Bills
          </span>
          <h3 className="text-2xl font-bold text-foreground mt-1 tracking-tight font-jetbrains">
            ${totalBills.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-subtle">
            Remaining Due ({getFrequencyLabel(displayFrequency)})
          </span>
          <h3 className="text-2xl font-bold text-accent mt-1 tracking-tight font-jetbrains">
            ${remainingDue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-subtle">
            Total Paid ({getFrequencyLabel(displayFrequency)})
          </span>
          <h3 className="text-2xl font-bold text-primary mt-1 tracking-tight font-jetbrains">
            ${totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-surface border border-border rounded-2xl p-4 shadow-sm">
        <div className="relative w-full sm:flex-1 sm:max-w-md">
          <input
            type="text"
            placeholder="Search bills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111111] border border-white/10 rounded-lg pl-4 pr-10 py-3 font-mono text-sm placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground"
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
        
        <div className="flex w-full sm:w-auto items-center gap-2 justify-end">
          <Filter className="h-4 w-4 text-muted shrink-0" />
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="rounded-xl border border-border bg-surface-raised px-4 py-2 text-xs font-bold text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer pr-10"
            >
              <option value="all">All Bills</option>
              <option value="week">This Week (7 days)</option>
              <option value="month">This Month (30 days)</option>
              <option value="overdue">Overdue</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted">
              <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Bills Scrollable Container */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-subtle uppercase tracking-wider px-1">
          Bills List
        </h2>
        {filteredBills.length === 0 ? (
          <div className="bg-surface border border-border rounded-2xl p-10 text-center shadow-sm">
            <p className="text-muted font-mono text-center py-8">{emptyStateMessage}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
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

      {/* Add Bill Sheet */}
      <AddBillSheet
        isOpen={isAddBillSheetOpen}
        onClose={() => setIsAddBillSheetOpen(false)}
      />
    </div>
  );
}

