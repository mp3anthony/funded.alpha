"use client";

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { CheckCircle, Clock, AlertCircle, Plane, Shield, Car, PiggyBank } from "lucide-react";
import { supabase } from "@/lib/supabase";

/* ═══════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════ */

export interface Bill {
  id: string | number;
  name: string;
  category: string;
  dueDate: string;
  amount: number;
  status: string;
  frequency: string;
  statusColor: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  statusIcon: React.ComponentType<any>;
  categoryColor: string;
}

export interface Fund {
  id: string | number;
  name: string;
  category: string;
  currentAmount: number;
  targetAmount: number;
  bgLight: string;
  barColor: string;
  accentText: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>;
}

export interface Payday {
  id: string | number;
  date: string; // ISO YYYY-MM-DD
  amount: number;
}

/* ═══════════════════════════════════════════════
   Initial Mock Data (Retained for reference)
   ═══════════════════════════════════════════════ */

const INITIAL_BILLS: Bill[] = [
  {
    id: 1,
    name: "Rent / Mortgage",
    category: "Housing",
    dueDate: "June 30, 2026",
    amount: 1200.0,
    status: "Due Soon",
    frequency: "Monthly",
    statusColor: "text-amber-600 bg-amber-500/10 dark:text-amber-400",
    statusIcon: Clock,
    categoryColor: "bg-secondary/10 text-secondary",
  },
  {
    id: 2,
    name: "Electricity Bill",
    category: "Utilities",
    dueDate: "July 02, 2026",
    amount: 145.5,
    status: "Due Soon",
    frequency: "Monthly",
    statusColor: "text-amber-600 bg-amber-500/10 dark:text-amber-400",
    statusIcon: Clock,
    categoryColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    id: 3,
    name: "Fiber Internet",
    category: "Services",
    dueDate: "July 05, 2026",
    amount: 79.99,
    status: "Due Soon",
    frequency: "Monthly",
    statusColor: "text-amber-600 bg-amber-500/10 dark:text-amber-400",
    statusIcon: Clock,
    categoryColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
  {
    id: 4,
    name: "Gold's Gym Membership",
    category: "Health & Fitness",
    dueDate: "June 20, 2026",
    amount: 45.0,
    status: "Paid",
    frequency: "Monthly",
    statusColor: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400",
    statusIcon: CheckCircle,
    categoryColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    id: 5,
    name: "Car Insurance",
    category: "Auto",
    dueDate: "June 18, 2026",
    amount: 180.0,
    status: "Paid",
    frequency: "Monthly",
    statusColor: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400",
    statusIcon: CheckCircle,
    categoryColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  },
  {
    id: 6,
    name: "Netflix & Spotify Premium",
    category: "Entertainment",
    dueDate: "June 15, 2026",
    amount: 24.99,
    status: "Overdue",
    frequency: "Monthly",
    statusColor: "text-rose-600 bg-rose-500/10 dark:text-rose-400",
    statusIcon: AlertCircle,
    categoryColor: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  },
];

const INITIAL_FUNDS: Fund[] = [
  {
    id: 1,
    name: "Holiday Trip",
    category: "Travel",
    currentAmount: 3250.0,
    targetAmount: 5000.0,
    bgLight: "bg-secondary/10 text-secondary",
    barColor: "bg-secondary",
    accentText: "text-secondary",
    icon: Plane,
  },
  {
    id: 2,
    name: "Emergency Fund",
    category: "Safety Net",
    currentAmount: 7500.0,
    targetAmount: 10000.0,
    bgLight: "bg-primary/10 text-primary",
    barColor: "bg-primary",
    accentText: "text-primary",
    icon: Shield,
  },
  {
    id: 3,
    name: "New Car",
    category: "Transport",
    currentAmount: 1700.0,
    targetAmount: 15000.0,
    bgLight: "bg-accent/10 text-accent",
    barColor: "bg-accent",
    accentText: "text-accent",
    icon: Car,
  },
];

const INITIAL_PAYDAYS: Payday[] = [
  { id: 1, date: "2026-07-05", amount: 2500 },
  { id: 2, date: "2026-07-19", amount: 2500 },
  { id: 3, date: "2026-08-02", amount: 2500 },
];

/* ═══════════════════════════════════════════════
   UI Mapping Utilities
   ═══════════════════════════════════════════════ */

function getStatusStyle(status: string) {
  switch (status) {
    case "Paid":
      return {
        statusColor: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400",
        statusIcon: CheckCircle,
      };
    case "Overdue":
      return {
        statusColor: "text-rose-600 bg-rose-500/10 dark:text-rose-400",
        statusIcon: AlertCircle,
      };
    case "Due Soon":
    default:
      return {
        statusColor: "text-amber-600 bg-amber-500/10 dark:text-amber-400",
        statusIcon: Clock,
      };
  }
}

function getCategoryColor(category: string) {
  switch (category) {
    case "Housing":
      return "bg-secondary/10 text-secondary";
    case "Utilities":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
    case "Services":
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
    case "Health & Fitness":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    case "Auto":
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400";
    case "Entertainment":
      return "bg-pink-500/10 text-pink-600 dark:text-pink-400";
    default:
      return "bg-slate-500/10 text-slate-600 dark:text-slate-400";
  }
}

function getFundStyle(category: string) {
  switch (category) {
    case "Travel":
      return {
        bgLight: "bg-secondary/10 text-secondary",
        barColor: "bg-secondary",
        accentText: "text-secondary",
        icon: Plane,
      };
    case "Safety Net":
      return {
        bgLight: "bg-primary/10 text-primary",
        barColor: "bg-primary",
        accentText: "text-primary",
        icon: Shield,
      };
    case "Transport":
      return {
        bgLight: "bg-accent/10 text-accent",
        barColor: "bg-accent",
        accentText: "text-accent",
        icon: Car,
      };
    default:
      return {
        bgLight: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
        barColor: "bg-slate-500",
        accentText: "text-slate-600 dark:text-slate-400",
        icon: PiggyBank,
      };
  }
}

function parseDateForDb(dateStr: string): string {
  try {
    const parsed = Date.parse(dateStr);
    if (!isNaN(parsed)) {
      return new Date(parsed).toISOString().split("T")[0];
    }
  } catch (e) {
    console.error("Failed to parse date for database:", dateStr);
  }
  return dateStr;
}

function formatDateForUi(dateStr: string): string {
  try {
    const d = new Date(dateStr + "T00:00:00");
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
      });
    }
  } catch (e) {
    console.error("Failed to format date for UI:", dateStr);
  }
  return dateStr;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBillFromDb(dbBill: any): Bill {
  const statusStyle = getStatusStyle(dbBill.status);
  const categoryColor = getCategoryColor(dbBill.category);
  return {
    id: dbBill.id,
    name: dbBill.name,
    category: dbBill.category,
    dueDate: formatDateForUi(dbBill.due_date),
    amount: parseFloat(dbBill.amount),
    status: dbBill.status,
    frequency: dbBill.frequency,
    statusColor: statusStyle.statusColor,
    statusIcon: statusStyle.statusIcon,
    categoryColor,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapFundFromDb(dbFund: any): Fund {
  const fundStyle = getFundStyle(dbFund.category);
  return {
    id: dbFund.id,
    name: dbFund.name,
    category: dbFund.category,
    currentAmount: parseFloat(dbFund.current_amount),
    targetAmount: parseFloat(dbFund.target_amount),
    bgLight: fundStyle.bgLight,
    barColor: fundStyle.barColor,
    accentText: fundStyle.accentText,
    icon: fundStyle.icon,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPaydayFromDb(dbPayday: any): Payday {
  return {
    id: dbPayday.id,
    date: dbPayday.date,
    amount: parseFloat(dbPayday.amount),
  };
}

/* ═══════════════════════════════════════════════
   Context Shape
   ═══════════════════════════════════════════════ */

interface AppContextValue {
  /* Onboarding */
  isOnboarded: boolean;
  completeOnboarding: () => void;
  householdName: string;
  setHouseholdName: (name: string) => void;

  /* Bills */
  bills: Bill[];
  addBill: (bill: Bill) => void;
  togglePaid: (id: string | number) => void;
  deleteBill: (id: string | number) => void;

  /* Funds */
  funds: Fund[];
  addFund: (fund: Fund) => void;
  addMoneyToFund: (id: string | number, amount: number) => void;

  /* Paydays */
  paydays: Payday[];
  addPayday: (payday: Payday) => void;
  deletePayday: (id: string | number) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

/* ═══════════════════════════════════════════════
   Provider
   ═══════════════════════════════════════════════ */

export function AppProvider({ children }: { children: ReactNode }) {
  /* ── Onboarding & Household ──────────────────── */
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [householdName, setHouseholdNameState] = useState("");
  const [dbHouseholdId, setDbHouseholdId] = useState<string | null>(null);

  function completeOnboarding() {
    setIsOnboarded(true);
  }

  /* ── Data States ────────────────────────────── */
  const [bills, setBills] = useState<Bill[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [paydays, setPaydays] = useState<Payday[]>([]);

  /* ── Sync/Load Data ─────────────────────────── */
  useEffect(() => {
    async function loadData() {
      try {
        const { data: households, error: hError } = await supabase
          .from("households")
          .select("*")
          .limit(1);

        if (hError) {
          console.error("Error fetching household:", hError);
          return;
        }

        if (households && households.length > 0) {
          const household = households[0];
          setDbHouseholdId(household.id);
          setHouseholdNameState(household.name);
          setIsOnboarded(true);

          // Fetch related data
          const [billsRes, fundsRes, paydaysRes] = await Promise.all([
            supabase.from("bills").select("*").eq("household_id", household.id),
            supabase.from("funds").select("*").eq("household_id", household.id),
            supabase.from("paydays").select("*").eq("household_id", household.id),
          ]);

          if (billsRes.data) {
            setBills(billsRes.data.map(mapBillFromDb));
          }
          if (fundsRes.data) {
            setFunds(fundsRes.data.map(mapFundFromDb));
          }
          if (paydaysRes.data) {
            setPaydays(paydaysRes.data.map(mapPaydayFromDb));
          }
        } else {
          // No household, user needs to onboard
          setIsOnboarded(false);
        }
      } catch (err) {
        console.error("Failed to load initial data from Supabase:", err);
      }
    }

    loadData();
  }, []);

  /* ── Helper to Ensure Household Exists ──────── */
  async function ensureHousehold(): Promise<string> {
    if (dbHouseholdId) return dbHouseholdId;

    const { data: households } = await supabase
      .from("households")
      .select("id, name")
      .limit(1);

    if (households && households.length > 0) {
      setDbHouseholdId(households[0].id);
      setHouseholdNameState(households[0].name);
      return households[0].id;
    }

    const nameToUse = householdName.trim() || "My Household";
    const { data: newHousehold, error } = await supabase
      .from("households")
      .insert({ name: nameToUse })
      .select()
      .single();

    if (error || !newHousehold) {
      throw new Error(
        "Failed to resolve household: " + (error?.message || "Unknown error")
      );
    }

    setDbHouseholdId(newHousehold.id);
    setHouseholdNameState(newHousehold.name);
    return newHousehold.id;
  }

  /* ── Household Name Actions ─────────────────── */
  async function setHouseholdName(name: string) {
    setHouseholdNameState(name);
    try {
      if (dbHouseholdId) {
        await supabase
          .from("households")
          .update({ name })
          .eq("id", dbHouseholdId);
      } else {
        const { data, error } = await supabase
          .from("households")
          .insert({ name })
          .select()
          .single();

        if (error) {
          console.error("Error creating household:", error);
          return;
        }

        if (data) {
          setDbHouseholdId(data.id);
        }
      }
    } catch (err) {
      console.error("Failed to update/set household name:", err);
    }
  }

  /* ── Bills Actions ──────────────────────────── */
  async function addBill(bill: Bill) {
    try {
      const hId = await ensureHousehold();

      const dbBillData = {
        household_id: hId,
        name: bill.name,
        category: bill.category,
        due_date: parseDateForDb(bill.dueDate),
        amount: bill.amount,
        status: bill.status,
        frequency: bill.frequency,
      };

      const { data, error } = await supabase
        .from("bills")
        .insert(dbBillData)
        .select()
        .single();

      if (error) {
        console.error("Error inserting bill:", error);
        return;
      }

      if (data) {
        setBills((prev) => [...prev, mapBillFromDb(data)]);
      }
    } catch (err) {
      console.error("Failed to add bill:", err);
    }
  }

  async function togglePaid(id: string | number) {
    try {
      const { data, error } = await supabase
        .from("bills")
        .update({ status: "Paid" })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating bill status:", error);
        return;
      }

      if (data) {
        setBills((prev) =>
          prev.map((bill) => (bill.id === id ? mapBillFromDb(data) : bill))
        );
      }
    } catch (err) {
      console.error("Failed to toggle paid:", err);
    }
  }

  async function deleteBill(id: string | number) {
    try {
      const { error } = await supabase.from("bills").delete().eq("id", id);

      if (error) {
        console.error("Error deleting bill:", error);
        return;
      }

      setBills((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Failed to delete bill:", err);
    }
  }

  /* ── Funds Actions ──────────────────────────── */
  async function addFund(fund: Fund) {
    try {
      const hId = await ensureHousehold();

      const dbFundData = {
        household_id: hId,
        name: fund.name,
        category: fund.category,
        current_amount: fund.currentAmount,
        target_amount: fund.targetAmount,
      };

      const { data, error } = await supabase
        .from("funds")
        .insert(dbFundData)
        .select()
        .single();

      if (error) {
        console.error("Error inserting fund:", error);
        return;
      }

      if (data) {
        setFunds((prev) => [...prev, mapFundFromDb(data)]);
      }
    } catch (err) {
      console.error("Failed to add fund:", err);
    }
  }

  async function addMoneyToFund(id: string | number, amount: number) {
    try {
      const fund = funds.find((f) => f.id === id);
      if (!fund) return;

      const newCurrentAmount = Math.min(fund.currentAmount + amount, fund.targetAmount);

      const { data, error } = await supabase
        .from("funds")
        .update({ current_amount: newCurrentAmount })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating fund amount:", error);
        return;
      }

      if (data) {
        setFunds((prev) =>
          prev.map((f) => (f.id === id ? mapFundFromDb(data) : f))
        );
      }
    } catch (err) {
      console.error("Failed to add money to fund:", err);
    }
  }

  /* ── Paydays Actions ────────────────────────── */
  async function addPayday(payday: Payday) {
    try {
      const hId = await ensureHousehold();

      const dbPaydayData = {
        household_id: hId,
        date: payday.date,
        amount: payday.amount,
      };

      const { data, error } = await supabase
        .from("paydays")
        .insert(dbPaydayData)
        .select()
        .single();

      if (error) {
        console.error("Error inserting payday:", error);
        return;
      }

      if (data) {
        setPaydays((prev) => [...prev, mapPaydayFromDb(data)]);
      }
    } catch (err) {
      console.error("Failed to add payday:", err);
    }
  }

  async function deletePayday(id: string | number) {
    try {
      const { error } = await supabase.from("paydays").delete().eq("id", id);

      if (error) {
        console.error("Error deleting payday:", error);
        return;
      }

      setPaydays((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Failed to delete payday:", err);
    }
  }

  /* ── Value ─────────────────────────────────── */
  const value: AppContextValue = {
    isOnboarded,
    completeOnboarding,
    householdName,
    setHouseholdName,
    bills,
    addBill,
    togglePaid,
    deleteBill,
    funds,
    addFund,
    addMoneyToFund,
    paydays,
    addPayday,
    deletePayday,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/* ═══════════════════════════════════════════════
   Hook
   ═══════════════════════════════════════════════ */

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within an <AppProvider>");
  }
  return ctx;
}

