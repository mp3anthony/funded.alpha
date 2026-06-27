"use client";

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { CheckCircle, Clock, AlertCircle, Plane, Shield, Car, PiggyBank, Home, BookOpen, CreditCard, TrendingUp, HelpCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { type Session } from "@supabase/supabase-js";
import { type HouseholdContribution, type ContributionRule } from "@/types";

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
  assignee_id?: string;
  payment_type?: "auto" | "manual";
  invoice_date?: string | null;
  due_date?: string | null;
  notes?: string | null;
  is_recurring?: boolean;
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
  deadline: string | null;
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
}

export interface Payday {
  id: string | number;
  date: string; // ISO YYYY-MM-DD
  amount: number;
}

export interface PaySchedule {
  id: string;
  household_id: string;
  member_id: string;
  amount: number | null;
  frequency: "weekly" | "fortnightly" | "monthly";
  is_fixed_amount: boolean;
  next_pay_date: string; // YYYY-MM-DD
  created_at: string;
}

export interface PayHistory {
  id: string;
  household_id: string;
  member_id: string;
  pay_schedule_id: string | null;
  amount: number;
  pay_date: string; // YYYY-MM-DD
  notes: string | null;
  created_at: string;
  rule_id: string | null;
  allocation_type: "goal" | "contribution" | null;
  allocation_target_id: string | null;
}

export interface Member {
  id: string | number;
  name: string;
  email: string;
  role: string;
  avatar: string;
  avatar_url?: string | null;
}

export interface Household {
  id: string;
  name: string;
  is_joint_fund: boolean;
  user_id?: string;
  created_at?: string;
}

export interface BillSplit {
  id: string;
  bill_id: string;
  member_id: string;
  amount: number;
  created_at: string;
  status?: string;
  is_assignee?: boolean;
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
    is_recurring: true,
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
    is_recurring: true,
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
    is_recurring: true,
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
    is_recurring: true,
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
    is_recurring: true,
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
    is_recurring: true,
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
    deadline: null,
    status: "in_progress",
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
    deadline: null,
    status: "in_progress",
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
    deadline: null,
    status: "in_progress",
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
    case "Vacation":
      return {
        bgLight: "bg-secondary/10 text-secondary",
        barColor: "bg-secondary",
        accentText: "text-secondary",
        icon: Plane,
      };
    case "Emergency Fund":
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
    case "Buy a House":
      return {
        bgLight: "bg-indigo-500/10 text-indigo-500",
        barColor: "bg-indigo-500",
        accentText: "text-indigo-500",
        icon: Home,
      };
    case "Education":
      return {
        bgLight: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
        barColor: "bg-yellow-500",
        accentText: "text-yellow-600 dark:text-yellow-400",
        icon: BookOpen,
      };
    case "Debt Payoff":
      return {
        bgLight: "bg-rose-500/10 text-rose-500",
        barColor: "bg-rose-500",
        accentText: "text-rose-500",
        icon: CreditCard,
      };
    case "Interest Free Payment":
      return {
        bgLight: "bg-purple-500/10 text-purple-500",
        barColor: "bg-purple-500",
        accentText: "text-purple-500",
        icon: PiggyBank,
      };
    case "Other":
    default:
      return {
        bgLight: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
        barColor: "bg-slate-500",
        accentText: "text-slate-600 dark:text-slate-400",
        icon: HelpCircle,
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
    assignee_id: dbBill.assignee_id,
    payment_type: dbBill.payment_type ? (dbBill.payment_type.toLowerCase() as "auto" | "manual") : undefined,
    invoice_date: dbBill.invoice_date,
    due_date: dbBill.due_date,
    is_recurring: dbBill.is_recurring !== undefined ? dbBill.is_recurring : true,
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
    deadline: dbFund.deadline || null,
    status: dbFund.status || 'not_started',
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMemberFromDb(dbMember: any): Member {
  const name = dbMember.name || dbMember.email.split("@")[0];
  return {
    id: dbMember.id,
    name,
    email: dbMember.email,
    role: dbMember.role || "member",
    avatar: name.charAt(0).toUpperCase(),
    avatar_url: dbMember.avatar_url || null,
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
  setHouseholdName: (name: string, userId?: string | null) => void;
  isJointFund: boolean;
  updateHouseholdPaymentMode: (isJointFund: boolean) => Promise<void>;

  /* Bills */
  bills: Bill[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addBill: (billData: any, splitsData?: any[]) => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateBill: (billId: string | number, billData: any, splitsData: any[]) => Promise<void>;
  togglePaid: (id: string | number) => void;
  deleteBill: (id: string | number) => void;

  /* Funds */
  funds: Fund[];
  addFund: (fund: Fund) => void;
  updateGoal: (id: string | number, goalData: any) => Promise<void>;
  deleteGoal: (id: string | number) => Promise<void>;
  updateFund: (id: string | number, fundData: any) => Promise<void>;
  deleteFund: (id: string | number) => Promise<void>;
  addMoneyToFund: (id: string | number, amount: number) => void;
  addToGoal: (id: string | number, amount: number) => Promise<void>;

  /* Paydays */
  paydays: Payday[];
  addPayday: (payday: Payday) => void;
  deletePayday: (id: string | number) => void;

  /* Payday Schedule & History */
  paySchedules: PaySchedule[];
  payHistory: PayHistory[];
  addPaySchedule: (data: Omit<PaySchedule, "id" | "household_id" | "created_at">) => Promise<void>;
  updatePaySchedule: (id: string, data: Omit<PaySchedule, "id" | "household_id" | "created_at">) => Promise<void>;
  deletePaySchedule: (id: string) => Promise<void>;
  logPay: (payScheduleId: string, amount: number, date: string, notes: string | null) => Promise<PayHistory | null>;
  deletePayHistory: (id: string) => Promise<void>;
  calculateAveragePay: (memberId: string) => number | null;

  /* Household Contributions */
  householdContributions: HouseholdContribution[];
  fetchHouseholdContributions: (householdId?: string) => Promise<void>;
  setContribution: (memberId: string, amount: number, frequency: "weekly" | "fortnightly" | "monthly") => Promise<void>;
  deleteContribution: (id: string) => Promise<void>;

  /* Contribution Rules */
  contributionRules: ContributionRule[];
  fetchContributionRules: (householdId?: string) => Promise<void>;
  addRule: (ruleData: Omit<ContributionRule, "id" | "household_id" | "created_at">) => Promise<void>;
  updateRule: (id: string, ruleData: Partial<Omit<ContributionRule, "id" | "household_id" | "created_at">>) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
  toggleRuleActive: (id: string) => Promise<void>;
  checkAndApplyRules: (memberId: string, payAmount: number) => ContributionRule[];
  applyRuleAllocation: (rule: ContributionRule, payHistoryId: string) => Promise<void>;

  /* Members */
  members: Member[];
  householdMembers: Member[];
  addMember: (member: Member) => void;
  removeMember: (id: string | number) => void;
  updateMember: (id: string | number, data: Partial<Omit<Member, "id">>) => Promise<void>;
  updateMemberAvatar: (memberId: string | number, avatarUrl: string | null) => Promise<void>;

  /* Bill Splits */
  billSplits: BillSplit[];
  setBillSplits: React.Dispatch<React.SetStateAction<BillSplit[]>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addBillSplit: (splitData: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateBillSplit: (id: string | number, splitData: any) => void;
  deleteBillSplit: (id: string | number) => void;

  /* Auth */
  session: Session | null;
  isAuthLoading: boolean;

  /* Theme */
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
}

const AppContext = createContext<AppContextValue | null>(null);

/* ═══════════════════════════════════════════════
   Provider
   ═══════════════════════════════════════════════ */

export function AppProvider({ children }: { children: ReactNode }) {
  /* ── Theme State & Logic ─────────────────────── */
  const [theme, setThemeState] = useState<"light" | "dark" | "system">("system");

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null;
      if (savedTheme) {
        setTimeout(() => {
          setThemeState(savedTheme);
        }, 0);
      }
    }
  }, []);

  // Update theme settings on change
  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    
    const applyTheme = (t: "light" | "dark" | "system") => {
      let activeTheme = t;
      if (t === "system") {
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        activeTheme = systemPrefersDark ? "dark" : "light";
      }
      
      // Update HTML tag classes/dataset
      if (!root.classList.contains(activeTheme)) {
        root.classList.remove("light", "dark");
        root.classList.add(activeTheme);
      }
      if (root.getAttribute("data-theme") !== activeTheme) {
        root.setAttribute("data-theme", activeTheme);
      }

      // Update BODY tag classes/dataset
      if (body) {
        if (!body.classList.contains(activeTheme)) {
          body.classList.remove("light", "dark");
          body.classList.add(activeTheme);
        }
        if (body.getAttribute("data-theme") !== activeTheme) {
          body.setAttribute("data-theme", activeTheme);
        }
      }
      
      console.log("[ThemeManager] applied:", activeTheme, "HTML classes:", root.className, "data-theme:", root.getAttribute("data-theme"));
    };

    applyTheme(theme);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
    }
    
    // Set up MutationObserver to defend against Next.js HTML tag reconciliations
    const observer = new MutationObserver(() => {
      applyTheme(theme);
    });
    
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class", "data-theme"]
    });

    let bodyObserver: MutationObserver | null = null;
    if (body) {
      bodyObserver = new MutationObserver(() => {
        applyTheme(theme);
      });
      bodyObserver.observe(body, {
        attributes: true,
        attributeFilter: ["class", "data-theme"]
      });
    }
    
    let cleanupSystemListener: (() => void) | undefined;
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme("system");
      mediaQuery.addEventListener("change", handleChange);
      cleanupSystemListener = () => mediaQuery.removeEventListener("change", handleChange);
    }

    return () => {
      observer.disconnect();
      if (bodyObserver) bodyObserver.disconnect();
      if (cleanupSystemListener) cleanupSystemListener();
    };
  }, [theme]);

  const setTheme = (newTheme: "light" | "dark" | "system") => {
    setThemeState(newTheme);
  };

  /* ── Onboarding & Household ──────────────────── */
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [householdName, setHouseholdNameState] = useState("");
  const [dbHouseholdId, setDbHouseholdId] = useState<string | null>(null);
  const [isJointFund, setIsJointFund] = useState(false);

  /* ── Auth ────────────────────────────────── */
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Auth useEffect - getSession result:', session ? 'has session' : 'no session', 'user:', session?.user?.id);
      setSession(session);
      setIsAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth useEffect - onAuthStateChange event:', _event, 'session:', session ? 'has session' : 'no session', 'user:', session?.user?.id);
      setSession(session);
      setIsAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  function completeOnboarding() {
    setIsOnboarded(true);
  }

  /* ── Data States ────────────────────────────── */
  const [bills, setBills] = useState<Bill[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [paydays, setPaydays] = useState<Payday[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [billSplits, setBillSplits] = useState<BillSplit[]>([]);
  const [paySchedules, setPaySchedules] = useState<PaySchedule[]>([]);
  const [payHistory, setPayHistory] = useState<PayHistory[]>([]);
  const [householdContributions, setHouseholdContributions] = useState<HouseholdContribution[]>([]);
  const [contributionRules, setContributionRules] = useState<ContributionRule[]>([]);

  /* ── Sync/Load Data ─────────────────────────── */
  // Only load data AFTER auth has resolved and we have a valid session.
  // This prevents a race condition where RLS returns empty results
  // (because no auth token is set yet), causing the app to show onboarding.
  useEffect(() => {
    if (isAuthLoading || !session) {
      console.log('loadData skipped - isAuthLoading:', isAuthLoading, 'session:', session ? 'exists' : 'null');
      return;
    }

    async function loadData() {
      console.log('loadData running with authenticated session, user:', session?.user?.id);
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
          console.log('loadData - found household:', household.id, household.name, household.is_joint_fund);
          setDbHouseholdId(household.id);
          setHouseholdNameState(household.name);
          setIsJointFund(!!household.is_joint_fund);
          setIsOnboarded(true);

          // Fetch related data
          const [billsRes, fundsRes, paydaysRes, membersRes, billSplitsRes] = await Promise.all([
            supabase.from("bills").select("*"),
            supabase.from("funds").select("*"),
            supabase.from("paydays").select("*"),
            supabase.from("household_members").select("*"),
            supabase.from("bill_splits").select("*"),
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
          let loadedMembers: Member[] = [];
          if (membersRes.data) {
            loadedMembers = membersRes.data.map(mapMemberFromDb);
          }
          console.log("loadData - loaded members:", loadedMembers);

          // Fallback: If household_members is empty, auto-insert the current logged-in user
          if (loadedMembers.length === 0 && session?.user) {
            console.log("loadData - household_members empty, auto-inserting owner:", session.user.email);
            const userName = session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Owner";
            const userEmail = session.user.email || "";
            const { data: newMember, error: insertMemErr } = await supabase
              .from("household_members")
              .insert({
                household_id: household.id,
                name: userName,
                email: userEmail,
                role: "owner"
              })
              .select()
              .single();

            if (insertMemErr) {
              console.error("loadData - failed to auto-insert owner:", insertMemErr);
            }
            if (newMember) {
              loadedMembers = [mapMemberFromDb(newMember)];
            }
          }
          setMembers(loadedMembers);

          if (billSplitsRes.data) {
            setBillSplits(billSplitsRes.data);
          }

          // Fetch payday schedule, history, contributions, and rules
          await Promise.all([
            fetchPayData(household.id),
            fetchHouseholdContributions(household.id),
            fetchContributionRules(household.id)
          ]);
        } else {
          // No household, user needs to onboard
          console.log('loadData - no household found, user needs onboarding');
          setIsOnboarded(false);
        }
      } catch (err) {
        console.error("Failed to load initial data from Supabase:", err);
      }
    }

    loadData();
  }, [isAuthLoading, session]);

  /* ── Fetch Pay Data ─────────────────────────── */
  async function fetchPayData(householdId?: string) {
    const hId = householdId || dbHouseholdId;
    if (!hId) return;

    try {
      const [schedulesRes, historyRes] = await Promise.all([
        supabase.from("pay_schedules").select("*").eq("household_id", hId),
        supabase.from("pay_history").select("*").eq("household_id", hId).order("pay_date", { ascending: false }),
      ]);

      if (schedulesRes.data) {
        setPaySchedules(schedulesRes.data);
      }
      if (historyRes.data) {
        setPayHistory(historyRes.data);
      }
    } catch (err) {
      console.error("Failed to fetch payday schedules and history:", err);
    }
  }

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
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    const userIdToUse = currentSession?.user?.id;
    console.log('ensureHousehold - currentSession:', currentSession ? 'exists' : 'null', 'userIdToUse:', userIdToUse);

    const insertData: any = { name: nameToUse, is_joint_fund: false };
    if (userIdToUse) {
      insertData.user_id = userIdToUse;
    }

    const { data: newHousehold, error } = await supabase
      .from("households")
      .insert(insertData)
      .select()
      .single();

    if (error || !newHousehold) {
      throw new Error(
        "Failed to resolve household: " + (error?.message || "Unknown error")
      );
    }

    setDbHouseholdId(newHousehold.id);
    setHouseholdNameState(newHousehold.name);

    if (currentSession?.user) {
      const userName = currentSession.user.user_metadata?.full_name || currentSession.user.email?.split("@")[0] || "Owner";
      const userEmail = currentSession.user.email || "";
      const { data: newMember } = await supabase
        .from("household_members")
        .insert({
          household_id: newHousehold.id,
          name: userName,
          email: userEmail,
          role: "owner"
        })
        .select()
        .single();
      if (newMember) {
        setMembers([mapMemberFromDb(newMember)]);
      }
    }

    return newHousehold.id;
  }

  /* ── Household Name Actions ─────────────────── */
  async function setHouseholdName(name: string, userId?: string | null) {
    setHouseholdNameState(name);
    try {
      if (dbHouseholdId) {
        await supabase
          .from("households")
          .update({ name })
          .eq("id", dbHouseholdId);
      } else {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        const userIdToUse = userId || currentSession?.user?.id;
        console.log('setHouseholdName - currentSession:', currentSession ? 'exists' : 'null', 'userId param:', userId, 'userIdToUse:', userIdToUse);

        const insertData: any = { name, is_joint_fund: false };
        if (userIdToUse) {
          insertData.user_id = userIdToUse;
        }

        const { data, error } = await supabase
          .from("households")
          .insert(insertData)
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function addBill(billData: any, splitsData: any[] = []) {
    try {
      const hId = await ensureHousehold();

      // Step 1: Save Bill
      const dbBillData = {
        household_id: hId,
        name: billData.name,
        amount: billData.amount,
        due_date: parseDateForDb(billData.dueDate || billData.due_date),
        invoice_date: billData.invoiceDate || billData.invoice_date ? parseDateForDb(billData.invoiceDate || billData.invoice_date) : null,
        payment_type: billData.paymentType || billData.payment_type || "manual",
        assignee_id: billData.assignee || billData.assignee_id || null,
        category: billData.category || "Uncategorized",
        status: billData.status || "Due Soon",
        frequency: billData.frequency || "Monthly",
        notes: billData.notes || null,
        is_recurring: true,
      };

      const { data: newBill, error: billError } = await supabase
        .from("bills")
        .insert(dbBillData)
        .select()
        .single();

      if (billError || !newBill) {
        console.error("Error inserting bill:", billError);
        return;
      }

      let newSplits = [];
      // Step 2: Save Splits
      if (splitsData && splitsData.length > 0) {
        const newBillId = newBill.id;
        const dbSplitsData = splitsData.map((split) => ({
          household_id: hId,
          bill_id: newBillId,
          member_id: split.member_id,
          amount: split.amount,
          status: split.status || "Pending",
          is_assignee: split.is_assignee || false,
        }));

        const { data, error: splitsError } = await supabase
          .from("bill_splits")
          .insert(dbSplitsData)
          .select();

        if (splitsError) {
          console.error("Error inserting bill splits (bill saved successfully):", splitsError);
        }
        if (data) {
          newSplits = data;
        }
      }

      // Step 3: Update Local State
      setBills((prev) => [...prev, mapBillFromDb(newBill)]);
      
      if (newSplits && newSplits.length > 0) {
        setBillSplits((prev) => [...prev, ...newSplits]);
      }
    } catch (err) {
      console.error("Failed to add bill:", err);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function updateBill(billId: string | number, billData: any, splitsData: any[]) {
    console.log('updateBill - Start - billId:', billId);
    console.log('updateBill - billData input:', billData);
    console.log('updateBill - splitsData input:', splitsData);

    try {
      const hId = await ensureHousehold();
      console.log('updateBill - householdId resolved:', hId);

      if (!billId) {
        console.error("updateBill - Error: billId is undefined or empty!");
        return;
      }

      // Step 1: Update Bill in Supabase
      const dbBillData = {
        name: billData.name,
        amount: billData.amount,
        due_date: parseDateForDb(billData.dueDate || billData.due_date),
        invoice_date: billData.invoiceDate || billData.invoice_date ? parseDateForDb(billData.invoiceDate || billData.invoice_date) : null,
        payment_type: billData.paymentType || billData.payment_type || "manual",
        assignee_id: billData.assignee || billData.assignee_id || null,
        category: billData.category || "Uncategorized",
        status: billData.status || "Due Soon",
        frequency: billData.frequency || "Monthly",
        notes: billData.notes || null,
        is_recurring: true,
      };

      console.log('updateBill - dbBillData payload:', dbBillData);

      const { data: updatedBill, error: billError } = await supabase
        .from("bills")
        .update(dbBillData)
        .eq("id", billId)
        .select()
        .single();

      if (billError || !updatedBill) {
        console.error("updateBill - Error updating bills row:", billError);
      } else {
        console.log('updateBill - successfully updated bills table row:', updatedBill);
      }

      // Step 2: Delete Existing Splits
      console.log('updateBill - deleting splits for bill_id:', billId);
      const { error: deleteError } = await supabase
        .from("bill_splits")
        .delete()
        .eq("bill_id", billId);

      if (deleteError) {
        console.error("updateBill - Error deleting existing bill splits:", deleteError);
      } else {
        console.log('updateBill - splits deleted successfully');
      }

      let newSplits = [];
      // Step 3: Insert New Splits
      if (splitsData && splitsData.length > 0) {
        const dbSplitsData = splitsData.map((split) => {
          if (!split.member_id || split.amount === undefined || isNaN(Number(split.amount))) {
            console.warn("updateBill - invalid split data detected:", split);
          }
          return {
            household_id: hId,
            bill_id: billId,
            member_id: split.member_id,
            amount: Number(split.amount) || 0,
            status: split.status || "Pending",
            is_assignee: split.is_assignee || false,
          };
        });

        console.log('updateBill - inserting new splits:', dbSplitsData);

        const { data, error: splitsError } = await supabase
          .from("bill_splits")
          .insert(dbSplitsData)
          .select();

        if (splitsError) {
          console.error("updateBill - Error inserting new bill splits:", splitsError);
        } else {
          console.log('updateBill - splits inserted successfully:', data);
        }

        if (data) {
          newSplits = data;
        }
      }

      // Step 4: Update Local State
      if (updatedBill) {
        setBills((prev) =>
          prev.map((b) => (b.id === billId ? mapBillFromDb(updatedBill) : b))
        );
      }
      setBillSplits((prev) => {
        const filtered = prev.filter((s) => String(s.bill_id) !== String(billId));
        return [...filtered, ...newSplits];
      });

    } catch (err) {
      console.error("updateBill - Fatal error during execution:", err);
    }
  }

  async function resetBillContributions() {
    try {
      const hId = await ensureHousehold();
      console.warn("resetBillContributions - Deleting all bill splits due to payment mode change for household:", hId);
      const { error } = await supabase
        .from("bill_splits")
        .delete()
        .eq("household_id", hId);

      if (error) {
        console.error("Error deleting bill splits during reset:", error);
        return;
      }

      setBillSplits([]);
    } catch (err) {
      console.error("Failed to reset bill contributions:", err);
    }
  }

  async function updateHouseholdPaymentMode(jointFundVal: boolean) {
    try {
      const hId = await ensureHousehold();
      
      // Mode is changing if household is already onboarded and the value is different
      const oldMode = isJointFund;
      const isModeChanging = isOnboarded && oldMode !== jointFundVal;

      console.log(`updateHouseholdPaymentMode - updating to: ${jointFundVal}. isModeChanging: ${isModeChanging}`);

      const { error } = await supabase
        .from("households")
        .update({ is_joint_fund: jointFundVal })
        .eq("id", hId);

      if (error) {
        console.error("Error updating household payment mode:", error);
        return;
      }

      setIsJointFund(jointFundVal);

      if (isModeChanging) {
        await resetBillContributions();
      }
    } catch (err) {
      console.error("Failed to update payment mode:", err);
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
        deadline: fund.deadline ? parseDateForDb(fund.deadline) : null,
        status: fund.status || 'not_started',
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

  async function updateGoal(id: string | number, goalData: any) {
    try {
      const dbFundData = {
        name: goalData.name,
        category: goalData.category || "Custom",
        current_amount: goalData.currentAmount,
        target_amount: goalData.targetAmount,
        deadline: goalData.deadline ? parseDateForDb(goalData.deadline) : null,
        status: goalData.status || 'not_started',
      };

      const { data, error } = await supabase
        .from("funds")
        .update(dbFundData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating goal/fund:", error);
        return;
      }

      if (data) {
        setFunds((prev) =>
          prev.map((f) => (f.id === id ? mapFundFromDb(data) : f))
        );
      }
    } catch (err) {
      console.error("Failed to update goal:", err);
    }
  }

  async function deleteGoal(id: string | number) {
    try {
      const { error } = await supabase.from("funds").delete().eq("id", id);
      if (error) {
        console.error("Error deleting goal/fund:", error);
        return;
      }
      setFunds((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error("Failed to delete goal:", err);
    }
  }

  const updateFund = updateGoal;
  const deleteFund = deleteGoal;

  async function addToGoal(id: string | number, amount: number) {
    try {
      const fund = funds.find((f) => f.id === id);
      if (!fund) return;

      const newCurrentAmount = fund.currentAmount + amount;

      const { data, error } = await supabase
        .from("funds")
        .update({ current_amount: newCurrentAmount })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error adding to goal:", error);
        return;
      }

      if (data) {
        setFunds((prev) =>
          prev.map((f) => (f.id === id ? mapFundFromDb(data) : f))
        );
      }
    } catch (err) {
      console.error("Failed to add money to goal:", err);
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

  /* ── Members Actions ────────────────────────── */
  async function addMember(member: Member) {
    try {
      const hId = await ensureHousehold();

      const dbMemberData = {
        household_id: hId,
        name: member.name,
        email: member.email,
        role: member.role || "member",
      };

      const { data, error } = await supabase
        .from("household_members")
        .insert(dbMemberData)
        .select()
        .single();

      if (error) {
        console.error("Error inserting member:", error);
        return;
      }

      if (data) {
        setMembers((prev) => [...prev, mapMemberFromDb(data)]);
      }
    } catch (err) {
      console.error("Failed to add member:", err);
    }
  }

  async function removeMember(id: string | number) {
    try {
      const { error } = await supabase.from("household_members").delete().eq("id", id);

      if (error) {
        console.error("Error deleting member:", error);
        return;
      }

      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Failed to remove member:", err);
    }
  }

  async function updateMember(id: string | number, data: Partial<Omit<Member, "id">>) {
    try {
      const { data: updated, error } = await supabase
        .from("household_members")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating member:", error);
        return;
      }

      if (updated) {
        setMembers((prev) =>
          prev.map((m) => (m.id === id ? mapMemberFromDb(updated) : m))
        );
      }
    } catch (err) {
      console.error("Failed to update member:", err);
    }
  }

  async function updateMemberAvatar(memberId: string | number, avatarUrl: string | null) {
    try {
      const { error } = await supabase
        .from("household_members")
        .update({ avatar_url: avatarUrl })
        .eq("id", memberId);

      if (error) {
        console.error("Error updating member avatar:", error);
        return;
      }

      setMembers((prev) =>
        prev.map((m) =>
          String(m.id) === String(memberId) ? { ...m, avatar_url: avatarUrl } : m
        )
      );
    } catch (err) {
      console.error("Failed to update member avatar:", err);
    }
  }

  /* ── Bill Splits Actions ────────────────────── */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function addBillSplit(splitData: any) {
    try {
      const hId = await ensureHousehold();
      const dbSplitData = { household_id: hId, ...splitData };

      const { data, error } = await supabase
        .from("bill_splits")
        .insert(dbSplitData)
        .select()
        .single();

      if (error) {
        console.error("Error inserting bill split:", error);
        return;
      }

      if (data) {
        setBillSplits((prev) => [...prev, data]);
      }
    } catch (err) {
      console.error("Failed to add bill split:", err);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function updateBillSplit(id: string | number, splitData: any) {
    try {
      const { data, error } = await supabase
        .from("bill_splits")
        .update(splitData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating bill split:", error);
        return;
      }

      if (data) {
        setBillSplits((prev) =>
          prev.map((split) => (split.id === id ? data : split))
        );
      }
    } catch (err) {
      console.error("Failed to update bill split:", err);
    }
  }

  async function deleteBillSplit(id: string | number) {
    try {
      const { error } = await supabase.from("bill_splits").delete().eq("id", id);

      if (error) {
        console.error("Error deleting bill split:", error);
        return;
      }

      setBillSplits((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Failed to delete bill split:", err);
    }
  }

  /* ── Payday Schedule & History Actions ───────── */
  async function addPaySchedule(data: Omit<PaySchedule, "id" | "household_id" | "created_at">) {
    try {
      const hId = await ensureHousehold();
      const insertData = {
        household_id: hId,
        member_id: data.member_id,
        amount: data.amount,
        frequency: data.frequency,
        is_fixed_amount: data.is_fixed_amount,
        next_pay_date: parseDateForDb(data.next_pay_date),
      };

      const { data: newSchedule, error } = await supabase
        .from("pay_schedules")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error("Error inserting pay schedule:", error);
        return;
      }

      if (newSchedule) {
        setPaySchedules((prev) => [...prev, newSchedule]);
      }
    } catch (err) {
      console.error("Failed to add pay schedule:", err);
    }
  }

  async function updatePaySchedule(id: string, data: Omit<PaySchedule, "id" | "household_id" | "created_at">) {
    try {
      const updateData = {
        member_id: data.member_id,
        amount: data.amount,
        frequency: data.frequency,
        is_fixed_amount: data.is_fixed_amount,
        next_pay_date: parseDateForDb(data.next_pay_date),
      };

      const { data: updated, error } = await supabase
        .from("pay_schedules")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating pay schedule:", error);
        return;
      }

      if (updated) {
        setPaySchedules((prev) =>
          prev.map((s) => (s.id === id ? updated : s))
        );
      }
    } catch (err) {
      console.error("Failed to update pay schedule:", err);
    }
  }

  async function deletePaySchedule(id: string) {
    try {
      const { error } = await supabase.from("pay_schedules").delete().eq("id", id);
      if (error) {
        console.error("Error deleting pay schedule:", error);
        return;
      }
      setPaySchedules((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Failed to delete pay schedule:", err);
    }
  }

  async function logPay(payScheduleId: string, amount: number, date: string, notes: string | null): Promise<PayHistory | null> {
    try {
      const hId = await ensureHousehold();
      
      const schedule = paySchedules.find((s) => s.id === payScheduleId);
      if (!schedule) {
        console.error("logPay - could not find pay schedule:", payScheduleId);
        return null;
      }

      const historyItem = {
        household_id: hId,
        member_id: schedule.member_id,
        pay_schedule_id: payScheduleId,
        amount,
        pay_date: parseDateForDb(date),
        notes,
      };

      const { data: newHistory, error: historyErr } = await supabase
        .from("pay_history")
        .insert(historyItem)
        .select()
        .single();

      if (historyErr) {
        console.error("logPay - failed to insert pay history:", historyErr);
        return null;
      }

      // Advance pay date by frequency
      const currentDate = new Date(schedule.next_pay_date + "T00:00:00");
      if (schedule.frequency === "weekly") {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (schedule.frequency === "fortnightly") {
        currentDate.setDate(currentDate.getDate() + 14);
      } else if (schedule.frequency === "monthly") {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
      
      const newNextPayDate = currentDate.toISOString().split("T")[0];

      const { data: updatedSchedule, error: scheduleErr } = await supabase
        .from("pay_schedules")
        .update({ next_pay_date: newNextPayDate })
        .eq("id", payScheduleId)
        .select()
        .single();

      if (scheduleErr) {
        console.error("logPay - failed to update next_pay_date:", scheduleErr);
      }

      if (newHistory) {
        setPayHistory((prev) => [newHistory, ...prev]);
      }
      if (updatedSchedule) {
        setPaySchedules((prev) =>
          prev.map((s) => (s.id === payScheduleId ? updatedSchedule : s))
        );
      }
      return newHistory;
    } catch (err) {
      console.error("Failed to log pay:", err);
      return null;
    }
  }

  async function deletePayHistory(id: string) {
    try {
      const { error } = await supabase.from("pay_history").delete().eq("id", id);
      if (error) {
        console.error("Error deleting pay history:", error);
        return;
      }
      setPayHistory((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      console.error("Failed to delete pay history:", err);
    }
  }

  function calculateAveragePay(memberId: string): number | null {
    const memberHistory = payHistory.filter(
      (h) => String(h.member_id) === String(memberId)
    );
    if (memberHistory.length < 3) return null;

    const sorted = [...memberHistory].sort((a, b) => new Date(b.pay_date).getTime() - new Date(a.pay_date).getTime());
    const last3 = sorted.slice(0, 3);
    const sum = last3.reduce((s, entry) => s + Number(entry.amount), 0);
    return sum / 3;
  }

  async function fetchHouseholdContributions(householdId?: string) {
    const hId = householdId || dbHouseholdId;
    if (!hId) return;

    try {
      const { data, error } = await supabase
        .from("household_contributions")
        .select("*")
        .eq("household_id", hId);

      if (error) {
        console.error("Error fetching household contributions:", error);
        return;
      }

      if (data) {
        setHouseholdContributions(data);
      }
    } catch (err) {
      console.error("Failed to fetch household contributions:", err);
    }
  }

  async function setContribution(memberId: string, amount: number, frequency: "weekly" | "fortnightly" | "monthly") {
    try {
      const hId = await ensureHousehold();

      // Clean up other frequencies for the same member to avoid orphaned cycles
      const { error: deleteErr } = await supabase
        .from("household_contributions")
        .delete()
        .eq("member_id", memberId)
        .neq("frequency", frequency);

      if (deleteErr) {
        console.error("Error cleaning up other contributions:", deleteErr);
      }

      const dbData = {
        household_id: hId,
        member_id: memberId,
        amount,
        frequency,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("household_contributions")
        .upsert(dbData, { onConflict: "household_id,member_id,frequency" })
        .select()
        .single();

      if (error) {
        console.error("Error upserting household contribution:", error);
        return;
      }

      if (data) {
        setHouseholdContributions((prev) => {
          const filtered = prev.filter(
            (c) => String(c.member_id) !== String(memberId) || c.frequency === frequency
          );
          const exists = filtered.some((c) => c.id === data.id);
          if (exists) {
            return filtered.map((c) => (c.id === data.id ? data : c));
          }
          return [...filtered, data];
        });
      }
    } catch (err) {
      console.error("Failed to set household contribution:", err);
    }
  }

  async function deleteContribution(id: string) {
    try {
      const { error } = await supabase
        .from("household_contributions")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting household contribution:", error);
        return;
      }

      setHouseholdContributions((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Failed to delete household contribution:", err);
    }
  }

  async function fetchContributionRules(householdId?: string) {
    const hId = householdId || dbHouseholdId;
    if (!hId) return;

    try {
      const { data, error } = await supabase
        .from("contribution_rules")
        .select("*")
        .eq("household_id", hId);

      if (error) {
        console.error("Error fetching contribution rules:", error);
        return;
      }

      if (data) {
        setContributionRules(data);
      }
    } catch (err) {
      console.error("Failed to fetch contribution rules:", err);
    }
  }

  async function addRule(ruleData: Omit<ContributionRule, "id" | "household_id" | "created_at">) {
    try {
      const hId = await ensureHousehold();
      const insertData = {
        household_id: hId,
        ...ruleData,
        is_active: ruleData.is_active ?? true,
      };

      const { data, error } = await supabase
        .from("contribution_rules")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error("Error inserting contribution rule:", error);
        return;
      }

      if (data) {
        setContributionRules((prev) => [...prev, data]);
      }
    } catch (err) {
      console.error("Failed to add contribution rule:", err);
    }
  }

  async function updateRule(id: string, ruleData: Partial<Omit<ContributionRule, "id" | "household_id" | "created_at">>) {
    try {
      const { data, error } = await supabase
        .from("contribution_rules")
        .update(ruleData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating contribution rule:", error);
        return;
      }

      if (data) {
        setContributionRules((prev) =>
          prev.map((r) => (r.id === id ? data : r))
        );
      }
    } catch (err) {
      console.error("Failed to update contribution rule:", err);
    }
  }

  async function deleteRule(id: string) {
    try {
      const { error } = await supabase
        .from("contribution_rules")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting contribution rule:", error);
        return;
      }

      setContributionRules((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Failed to delete contribution rule:", err);
    }
  }

  async function toggleRuleActive(id: string) {
    const rule = contributionRules.find((r) => r.id === id);
    if (!rule) return;
    await updateRule(id, { is_active: !rule.is_active });
  }

  function checkAndApplyRules(memberId: string, payAmount: number): ContributionRule[] {
    return contributionRules.filter(
      (r) =>
        r.is_active &&
        String(r.member_id) === String(memberId) &&
        payAmount > Number(r.threshold_amount)
    );
  }

  async function applyRuleAllocation(rule: ContributionRule, payHistoryId: string) {
    try {
      // Find the corresponding pay history item to get the logged pay amount
      let historyItem = payHistory.find((h) => h.id === payHistoryId);
      let payAmount = historyItem ? Number(historyItem.amount) : 0;

      if (!historyItem) {
        // Fallback: Query direct from database to prevent race conditions
        const { data, error } = await supabase
          .from("pay_history")
          .select("amount")
          .eq("id", payHistoryId)
          .single();
        if (data && !error) {
          payAmount = Number(data.amount);
        }
      }

      // Calculate calculatedAmount to allocate
      let calculatedAmount = Number(rule.amount_to_add);
      if (rule.amount_type === "percentage") {
        const surplus = payAmount - Number(rule.threshold_amount);
        calculatedAmount = surplus > 0 ? surplus * (Number(rule.amount_to_add) / 100) : 0;
      }

      // Ensure we don't allocate negative or zero amounts
      if (calculatedAmount <= 0) {
        console.log(`Skipping rule allocation for rule ${rule.id} because calculated amount is <= 0.`);
        return;
      }

      if (rule.action_type === "goal") {
        await addToGoal(rule.action_target_id, calculatedAmount);
      } else if (rule.action_type === "contribution") {
        console.log(`Allocated surplus of $${calculatedAmount.toFixed(2)} to base joint contribution.`);
      }

      const { data: updatedHistory, error } = await supabase
        .from("pay_history")
        .update({
          rule_id: rule.id,
          allocation_type: rule.action_type,
          allocation_target_id: rule.action_target_id,
        })
        .eq("id", payHistoryId)
        .select()
        .single();

      if (error) {
        console.error("Error updating pay history rule allocation:", error);
        return;
      }

      if (updatedHistory) {
        setPayHistory((prev) =>
          prev.map((h) => (h.id === payHistoryId ? updatedHistory : h))
        );
      }
    } catch (err) {
      console.error("Failed to apply rule allocation:", err);
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
    updateBill,
    togglePaid,
    deleteBill,
    isJointFund,
    updateHouseholdPaymentMode,
    funds,
    addFund,
    updateGoal,
    deleteGoal,
    updateFund,
    deleteFund,
    addMoneyToFund,
    addToGoal,
    paydays,
    addPayday,
    deletePayday,
    members,
    householdMembers: members,
    addMember,
    removeMember,
    updateMember,
    updateMemberAvatar,
    billSplits,
    setBillSplits,
    addBillSplit,
    updateBillSplit,
    deleteBillSplit,
    paySchedules,
    payHistory,
    addPaySchedule,
    updatePaySchedule,
    deletePaySchedule,
    logPay,
    deletePayHistory,
    calculateAveragePay,
    householdContributions,
    fetchHouseholdContributions,
    setContribution,
    deleteContribution,
    contributionRules,
    fetchContributionRules,
    addRule,
    updateRule,
    deleteRule,
    toggleRuleActive,
    checkAndApplyRules,
    applyRuleAllocation,
    session,
    isAuthLoading,
    theme,
    setTheme,
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

export function useCurrentUser() {
  const { session, members } = useApp();
  const email = session?.user?.email || "";
  const currentMember = members.find((m) => m.email === email);
  return {
    name: currentMember?.name || email.split("@")[0] || "User",
    email: email,
    avatar: (currentMember?.name || email || "U").charAt(0).toUpperCase(),
    avatar_url: currentMember?.avatar_url || null,
  };
}

