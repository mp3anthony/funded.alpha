"use client";

import { useState, useMemo } from "react";
import { Calendar, Clock, Plus, Trash2, X, DollarSign } from "lucide-react";

/* ── Types ──────────────────────────────────── */
interface Payday {
  id: number;
  date: string;   // ISO date string (YYYY-MM-DD)
  amount: number;
}

/* ── Helpers ─────────────────────────────────── */
function daysUntil(isoDate: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(isoDate + "T00:00:00");
  return Math.ceil((target.getTime() - now.getTime()) / 86_400_000);
}

function formatDate(isoDate: string): string {
  return new Date(isoDate + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "2-digit",
    year: "numeric",
  });
}

function formatCurrency(n: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/* ── Initial Mock Data ───────────────────────── */
const INITIAL_PAYDAYS: Payday[] = [
  { id: 1, date: "2026-07-05", amount: 2500 },
  { id: 2, date: "2026-07-19", amount: 2500 },
  { id: 3, date: "2026-08-02", amount: 2500 },
];

/* ── Page Component ──────────────────────────── */
export default function PaydayPage() {
  const [paydays, setPaydays] = useState<Payday[]>(INITIAL_PAYDAYS);
  const [showModal, setShowModal] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newAmount, setNewAmount] = useState("");

  /* Sort ascending & derive upcoming (>= today) */
  const upcoming = useMemo(
    () =>
      [...paydays]
        .filter((p) => daysUntil(p.date) >= 0)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [paydays],
  );

  const next = upcoming[0] ?? null;

  /* ── Handlers ──────────────────────────────── */
  function handleAdd() {
    if (!newDate || !newAmount) return;
    const entry: Payday = {
      id: Date.now(),
      date: newDate,
      amount: parseFloat(newAmount),
    };
    setPaydays((prev) => [...prev, entry]);
    setNewDate("");
    setNewAmount("");
    setShowModal(false);
  }

  function handleDelete(id: number) {
    setPaydays((prev) => prev.filter((p) => p.id !== id));
  }

  /* ── Render ────────────────────────────────── */
  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 sm:px-6 md:py-12 space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Payday Schedule
          </h1>
          <p className="text-sm text-muted mt-1">
            Monitor your income streams and payroll dates.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-secondary-fg text-sm font-bold shadow-lg shadow-secondary/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Payday
        </button>
      </div>

      {/* ── Prominent "Next Payday" Countdown Card ── */}
      {next ? (
        <div className="relative overflow-hidden bg-gradient-to-br from-secondary to-indigo-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-secondary/15">
          {/* Background visual accents */}
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute left-1/3 top-0 -translate-y-12 w-32 h-32 bg-white/5 rounded-full blur-xl" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold tracking-wide uppercase">
                <Clock className="h-3.5 w-3.5" />
                Next Payday
              </span>
              <div>
                <div className="text-4xl sm:text-5xl font-black tracking-tight">
                  {daysUntil(next.date) === 0
                    ? "Today!"
                    : daysUntil(next.date) === 1
                      ? "1 Day"
                      : `${daysUntil(next.date)} Days`}
                </div>
                <p className="text-sm text-blue-100/90 mt-1.5 font-medium">
                  {daysUntil(next.date) === 0
                    ? "Your payday is today 🎉"
                    : `${daysUntil(next.date)} day${daysUntil(next.date) !== 1 ? "s" : ""} away · ${formatDate(next.date)}`}
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 md:min-w-[240px] flex flex-col justify-between">
              <span className="text-xs font-bold tracking-wider uppercase text-blue-200">
                Expected Amount
              </span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl sm:text-4xl font-extrabold">
                  ${formatCurrency(next.amount)}
                </span>
              </div>
              <div className="border-t border-white/10 mt-4 pt-3 flex items-center justify-between text-xs text-blue-100/85">
                <span>Direct Deposit</span>
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty state when no paydays exist */
        <div className="bg-surface border border-border rounded-2xl p-10 text-center space-y-3">
          <Calendar className="h-10 w-10 mx-auto text-muted" />
          <p className="text-muted text-sm font-medium">
            No upcoming paydays.&nbsp;
            <button
              onClick={() => setShowModal(true)}
              className="text-secondary font-bold hover:underline cursor-pointer"
            >
              Add one
            </button>
          </p>
        </div>
      )}

      {/* ── Upcoming Paychecks List ─────────────── */}
      {upcoming.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-subtle uppercase tracking-wider px-1">
            Upcoming Paychecks
          </h2>

          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm divide-y divide-border">
            {upcoming.map((payday) => {
              const days = daysUntil(payday.date);
              return (
                <div
                  key={payday.id}
                  className="group p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-raised transition-colors"
                >
                  {/* Left: icon + info */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 rounded-xl bg-secondary/10 text-secondary items-center justify-center">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-foreground">
                        {formatDate(payday.date)}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-semibold text-muted">
                          {days === 0
                            ? "Today"
                            : days === 1
                              ? "In 1 day"
                              : `In ${days} days`}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-border-strong" />
                        <span className="text-xs text-secondary bg-secondary/10 px-2 py-0.5 rounded-full font-bold">
                          Scheduled
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: amount + delete */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
                    <div className="text-left sm:text-right">
                      <span className="text-base sm:text-lg font-extrabold text-foreground flex items-center gap-1 sm:justify-end">
                        <span className="text-primary text-sm font-semibold">+</span>
                        ${formatCurrency(payday.amount)}
                      </span>
                      <span className="block text-[10px] text-muted font-medium mt-0.5">
                        Direct Deposit
                      </span>
                    </div>

                    <button
                      onClick={() => handleDelete(payday.id)}
                      aria-label="Delete payday"
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-muted hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Add Payday Modal ─────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-surface border border-border rounded-3xl w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">Add Payday</h3>
              <button
                onClick={() => setShowModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-surface-raised transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-5 space-y-5">
              {/* Date field */}
              <div className="space-y-2">
                <label
                  htmlFor="payday-date"
                  className="block text-xs font-bold tracking-wider uppercase text-muted"
                >
                  Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
                  <input
                    id="payday-date"
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-raised border border-border text-foreground text-sm font-medium focus:ring-2 focus:ring-secondary/40 focus:border-secondary outline-none transition-all"
                  />
                </div>
              </div>

              {/* Amount field */}
              <div className="space-y-2">
                <label
                  htmlFor="payday-amount"
                  className="block text-xs font-bold tracking-wider uppercase text-muted"
                >
                  Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
                  <input
                    id="payday-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="2,500.00"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-raised border border-border text-foreground text-sm font-medium focus:ring-2 focus:ring-secondary/40 focus:border-secondary outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center gap-3 p-5 border-t border-border">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl border border-border text-sm font-bold text-muted hover:text-foreground hover:bg-surface-raised transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!newDate || !newAmount}
                className="flex-1 py-3 rounded-xl bg-secondary text-secondary-fg text-sm font-bold shadow-lg shadow-secondary/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                Save Payday
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
