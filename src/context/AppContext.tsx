"use client";

import React, { createContext, useContext, useState, type ReactNode } from "react";
import { CheckCircle, Clock, AlertCircle, Plane, Shield, Car, PiggyBank } from "lucide-react";

/* ═══════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════ */

export interface Bill {
  id: number;
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
  id: number;
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
  id: number;
  date: string; // ISO YYYY-MM-DD
  amount: number;
}

/* ═══════════════════════════════════════════════
   Initial Mock Data
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
   Context Shape
   ═══════════════════════════════════════════════ */

interface AppContextValue {
  /* Bills */
  bills: Bill[];
  addBill: (bill: Bill) => void;
  togglePaid: (id: number) => void;
  deleteBill: (id: number) => void;

  /* Funds */
  funds: Fund[];
  addFund: (fund: Fund) => void;
  addMoneyToFund: (id: number, amount: number) => void;

  /* Paydays */
  paydays: Payday[];
  addPayday: (payday: Payday) => void;
  deletePayday: (id: number) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

/* ═══════════════════════════════════════════════
   Provider
   ═══════════════════════════════════════════════ */

export function AppProvider({ children }: { children: ReactNode }) {
  /* ── Bills ──────────────────────────────────── */
  const [bills, setBills] = useState<Bill[]>(INITIAL_BILLS);

  function addBill(bill: Bill) {
    setBills((prev) => [...prev, bill]);
  }

  function togglePaid(id: number) {
    setBills((prev) =>
      prev.map((bill) =>
        bill.id === id
          ? {
              ...bill,
              status: "Paid",
              statusColor: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400",
              statusIcon: CheckCircle,
            }
          : bill,
      ),
    );
  }

  function deleteBill(id: number) {
    setBills((prev) => prev.filter((b) => b.id !== id));
  }

  /* ── Funds ─────────────────────────────────── */
  const [funds, setFunds] = useState<Fund[]>(INITIAL_FUNDS);

  function addFund(fund: Fund) {
    setFunds((prev) => [...prev, fund]);
  }

  function addMoneyToFund(id: number, amount: number) {
    setFunds((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, currentAmount: Math.min(f.currentAmount + amount, f.targetAmount) }
          : f,
      ),
    );
  }

  /* ── Paydays ───────────────────────────────── */
  const [paydays, setPaydays] = useState<Payday[]>(INITIAL_PAYDAYS);

  function addPayday(payday: Payday) {
    setPaydays((prev) => [...prev, payday]);
  }

  function deletePayday(id: number) {
    setPaydays((prev) => prev.filter((p) => p.id !== id));
  }

  /* ── Value ─────────────────────────────────── */
  const value: AppContextValue = {
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
