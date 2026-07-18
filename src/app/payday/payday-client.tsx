"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, User, Trash2, CheckCircle2, AlertCircle, Clock, PiggyBank, DollarSign, ChevronDown, ChevronRight } from "lucide-react";
import { useApp, useCurrentUser, type PaySchedule, type PayHistory } from "@/context/AppContext";
import AddPayScheduleSheet from "@/components/AddPayScheduleSheet";
import EnterPayAmountModal from "@/components/EnterPayAmountModal";
import PayHistoryCard from "@/components/PayHistoryCard";
import SurplusSuggestionModal from "@/components/SurplusSuggestionModal";
import PayScheduleDetailSheet from "@/components/PayScheduleDetailSheet";
import PageHeader from "@/components/PageHeader";

export default function PaydayClient() {
  const { paySchedules, payHistory, householdMembers, deletePaySchedule, logPay, calculateAveragePay, addToGoal, isJointFund, householdContributions, checkAndApplyRules, applyRuleAllocation, funds, autoLogMissedPays, confirmAndUpdatePay } = useApp();
  const currentUser = useCurrentUser();

  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
  const [activeVariableSchedule, setActiveVariableSchedule] = useState<PaySchedule | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<PaySchedule | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [surplusInfo, setSurplusInfo] = useState<{
    memberId: string;
    newPayAmount: number;
    surplusAmount: number;
  } | null>(null);
  const [pendingHistoryToConfirm, setPendingHistoryToConfirm] = useState<PayHistory | null>(null);

  const [minimizedMembers, setMinimizedMembers] = useState<Record<string, boolean>>({});
  const [selectedContributor, setSelectedContributor] = useState<string>("All");

  const toggleMemberHistory = (memberId: string) => {
    setMinimizedMembers(prev => ({ ...prev, [memberId]: !(prev[memberId] ?? true) }));
  };

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-log missed pays on mount / when schedules load
  const hasAutoLogged = useRef(false);
  useEffect(() => {
    if (paySchedules.length > 0 && !hasAutoLogged.current) {
      hasAutoLogged.current = true;
      autoLogMissedPays();
    }
  }, [paySchedules]);

  const today = isMounted ? new Date() : new Date("2026-07-05");
  today.setHours(0, 0, 0, 0);

  // Helper to determine if schedule is loggable (next_pay_date <= today)
  const isLoggable = (schedule: PaySchedule) => {
    const nextPay = new Date(schedule.next_pay_date + "T00:00:00");
    nextPay.setHours(0, 0, 0, 0);
    return nextPay.getTime() <= today.getTime();
  };

  // Helper for countdown
  const getCountdown = (schedule: PaySchedule) => {
    const nextPay = new Date(schedule.next_pay_date + "T00:00:00");
    nextPay.setHours(0, 0, 0, 0);
    const diffTime = nextPay.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return {
        text: "Ready to Log",
        color: "text-primary bg-primary/10 border-primary/20",
        icon: CheckCircle2,
      };
    } else {
      return {
        text: `in ${diffDays} day${diffDays !== 1 ? "s" : ""}`,
        color: "text-muted bg-white/5 border-border-strong",
        icon: Clock,
      };
    }
  };

  // Delete handler
  const handleDeleteSchedule = async (schedule: PaySchedule) => {
    const memberName = householdMembers.find((m) => String(m.id) === String(schedule.member_id))?.name || "Member";
    if (confirm(`Delete payday schedule for ${memberName}? Any logged history will be preserved.`)) {
      await deletePaySchedule(schedule.id);
    }
  };

  // Unified pay handler — both fixed and variable go through the modal
  const handleConfirmPay = async (amount: number, notes: string | null) => {
    if (activeVariableSchedule) {
      const memberId = activeVariableSchedule.member_id;
      const avg = calculateAveragePay(memberId);

      const logDate = new Date().toISOString().split("T")[0];
      const newHistory = await logPay(activeVariableSchedule.id, amount, logDate, notes || "Pay logged");

      if (newHistory) {
        // Trigger rules checking
        const triggered = checkAndApplyRules(memberId, amount);
        for (const rule of triggered) {
          await applyRuleAllocation(rule, newHistory.id);

          let targetName = "contribution";
          if (rule.action_type === "goal") {
            const goal = funds.find((g) => String(g.id) === String(rule.action_target_id));
            targetName = goal ? goal.name : "goal";
          }
          alert(`Rule triggered: Added $${rule.amount_to_add.toFixed(2)} to ${targetName}`);
        }
      }

      if (avg !== null && amount > avg * 1.10) {
        const surplus = amount - avg;
        setSurplusInfo({
          memberId,
          newPayAmount: amount,
          surplusAmount: surplus,
        });
      }

      setActiveVariableSchedule(null);
    }
  };

  const handleAllocateSurplus = async (target: string, amount: number) => {
    if (target === "bills_surplus") {
      console.log(`Allocated surplus of $${amount} to Bills Surplus Pool.`);
      alert(`Successfully allocated $${amount.toFixed(2)} to Bills Surplus Pool!`);
    } else {
      try {
        await addToGoal(target, amount);
        alert(`Successfully allocated $${amount.toFixed(2)} to your savings goal!`);
      } catch (err) {
        console.error("Failed to allocate surplus to goal:", err);
      }
    }
    setSurplusInfo(null);
  };

  // Handler when user clicks Confirm on a pending PayHistoryCard
  const handleConfirmPendingClick = (history: PayHistory) => {
    setPendingHistoryToConfirm(history);
  };

  // Handler when user submits the confirm-pending modal
  const handleConfirmPendingSubmit = async (amount: number, notes: string | null) => {
    if (!pendingHistoryToConfirm) return;
    await confirmAndUpdatePay(pendingHistoryToConfirm.id, amount, notes);
    setPendingHistoryToConfirm(null);
  };

  // Filter FIRST (by selected contributor), then cap at 10, then group by member.
  const groupedHistory = React.useMemo(() => {
    const source = selectedContributor === "All"
      ? payHistory
      : payHistory.filter((h) => String(h.member_id) === String(selectedContributor));
    const limited = source.slice(0, 10);
    const groups: Record<string, PayHistory[]> = {};
    limited.forEach((history) => {
      const id = String(history.member_id);
      if (!groups[id]) {
        groups[id] = [];
      }
      groups[id].push(history);
    });
    return groups;
  }, [payHistory, selectedContributor]);

  // Dropdown options derived from the FULL payHistory (not the capped/grouped view).
  const contributorOptions = React.useMemo(() => {
    const uniqueIds = Array.from(new Set(payHistory.map((h) => String(h.member_id))));
    return uniqueIds
      .map((id) => householdMembers.find((m) => String(m.id) === id))
      .filter((m): m is NonNullable<typeof m> => Boolean(m))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [payHistory, householdMembers]);

  const visibleGroups = Object.entries(groupedHistory);
  const isEmpty = visibleGroups.length === 0;

  // Explicit, hydration-safe ordering for the unified Upcoming Pays card.
  // Primary: next_pay_date ascending (YYYY-MM-DD string compare = chronological).
  // Tie-break: member name ascending.
  const sortedSchedules = React.useMemo(() => {
    return [...paySchedules].sort((a, b) => {
      const dateCompare = a.next_pay_date.localeCompare(b.next_pay_date);
      if (dateCompare !== 0) return dateCompare;
      const aName = householdMembers.find((m) => String(m.id) === String(a.member_id))?.name || "";
      const bName = householdMembers.find((m) => String(m.id) === String(b.member_id))?.name || "";
      return aName.localeCompare(bName);
    });
  }, [paySchedules, householdMembers]);

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 pt-4 pb-24 sm:px-6 md:pt-6 space-y-8">
      <PageHeader
        title="Payday"
        subtitle="Manage & track incomes"
        action={
          <button
            onClick={() => setIsAddScheduleOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/95 text-primary-fg text-xs font-semibold px-3 py-2 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer font-heading uppercase animate-in fade-in duration-200"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New Schedule</span>
          </button>
        }
      />

      {/* Upcoming Pays */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-subtle uppercase tracking-wider px-1 font-heading">
          Upcoming Pays
        </h2>

        {paySchedules.length === 0 ? (
          <div className="bg-surface border border-border rounded-2xl p-10 text-center shadow-sm">
            <DollarSign className="h-10 w-10 text-muted mx-auto mb-3" />
            <p className="text-sm font-semibold text-muted">No pay schedules active.</p>
            <p className="text-xs text-subtle mt-1">Create a schedule to automate or log household income.</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-surface border border-border shadow-sm overflow-hidden">
            <div className="divide-y divide-border-strong">
              {sortedSchedules.map((schedule) => {
                const member = householdMembers.find((m) => String(m.id) === String(schedule.member_id));
                const memberName = member ? member.name : "Unknown Member";
                const countdown = getCountdown(schedule);
                const isReady = isLoggable(schedule);

                const formattedAmount = schedule.is_fixed_amount && schedule.amount
                  ? `$${Number(schedule.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                  : "Variable";

                const CountdownIcon = countdown.icon;

                return (
                  <div
                    key={schedule.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setSelectedSchedule(schedule);
                      setIsDetailOpen(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedSchedule(schedule);
                        setIsDetailOpen(true);
                      }
                    }}
                    className="flex flex-col gap-3 p-4 hover:bg-surface-raised transition-all cursor-pointer group"
                  >
                    {/* Top zone: avatar · name/amount + freq/countdown · delete */}
                    <div className="flex items-center gap-3">
                      {/* Leading avatar */}
                      <div className="shrink-0 flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg bg-surface-elevated border border-primary text-base font-bold text-foreground">
                        {member?.avatar_url ? (
                          <img src={member.avatar_url} alt={memberName} className="h-full w-full object-cover" />
                        ) : (
                          member?.avatar || memberName.charAt(0).toUpperCase()
                        )}
                      </div>

                      {/* Right column: name+amount over frequency+countdown */}
                      <div className="flex flex-col flex-1 min-w-0 gap-2">
                        {/* Row 1: Name & Amount */}
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-body font-semibold text-lg text-foreground truncate">
                            {memberName}
                          </h3>
                          <span className={`shrink-0 font-mono font-extrabold tracking-tight text-xl ${schedule.is_fixed_amount ? "text-primary" : "text-muted"}`}>
                            {formattedAmount}
                          </span>
                        </div>

                        {/* Row 2: Frequency & Countdown badge */}
                        <div className="flex w-full items-center justify-between gap-2">
                          <span className="min-w-0 truncate font-mono text-xs uppercase text-muted">
                            {schedule.frequency}
                          </span>
                          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border shrink-0 ${countdown.color}`}>
                            <CountdownIcon size={12} className="shrink-0" />
                            <span>{countdown.text}</span>
                          </div>
                        </div>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSchedule(schedule);
                        }}
                        className="shrink-0 p-1.5 text-muted hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                        title="Delete Schedule"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Log-Pay CTA — only shown when pay is due */}
                    {isReady && (
                      <div className="pt-3 mt-1 border-t border-border-strong">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveVariableSchedule(schedule);
                          }}
                          className="w-full py-2.5 rounded-xl font-heading text-xs font-bold uppercase bg-primary text-primary-fg hover:brightness-110 active:scale-[0.98] cursor-pointer transition-all"
                        >
                          {schedule.is_fixed_amount ? "Log Pay" : "Enter Pay Amount"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Recent Pay History */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-subtle uppercase tracking-wider px-1 font-heading">
          Recent Pay History
        </h2>

        {payHistory.length === 0 ? (
          <div className="bg-surface border border-border rounded-2xl p-10 text-center shadow-sm">
            <PiggyBank className="h-10 w-10 text-muted mx-auto mb-3" />
            <p className="text-sm font-semibold text-muted">No history logged yet.</p>
            <p className="text-xs text-subtle mt-1">Logged payday transactions will appear here.</p>
          </div>
        ) : (
          <>
            {/* Contributor filter */}
            <div className="flex flex-col gap-3 px-1">
              <div className="space-y-1.5">
                <label htmlFor="contributor-filter" className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">
                  Contributor
                </label>
                <div className="relative">
                  <select
                    id="contributor-filter"
                    value={selectedContributor}
                    onChange={(e) => setSelectedContributor(e.target.value)}
                    className="w-full rounded-xl border border-primary/30 bg-background px-2 py-2 text-[10px] font-semibold text-foreground focus:border-primary focus:outline-none appearance-none cursor-pointer pr-6"
                  >
                    <option value="All">All Contributors</option>
                    {contributorOptions.map((m) => (
                      <option key={String(m.id)} value={String(m.id)}>{m.name}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-muted">
                    <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {isEmpty && selectedContributor !== "All" ? (
              <div className="bg-surface border border-border rounded-2xl p-10 text-center shadow-sm">
                <PiggyBank className="h-10 w-10 text-muted mx-auto mb-3" />
                <p className="text-sm font-semibold text-muted">
                  No pays logged for {householdMembers.find((m) => String(m.id) === String(selectedContributor))?.name || "this contributor"} yet.
                </p>
                <p className="text-xs text-subtle mt-1">Logged payday transactions will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {visibleGroups.map(([memberId, histories]) => {
                  const member = householdMembers.find((m) => String(m.id) === String(memberId));
                  const memberName = member ? member.name : "Unknown Member";
                  // True means collapsed (minimized). Defaults to collapsed; force-expanded when filtered to one member.
                  const isMinimized = selectedContributor === "All" ? (minimizedMembers[memberId] ?? true) : false;

                  const headerContent = (
                    <div className="flex items-center gap-2.5">
                      <span className="text-base font-semibold text-foreground">{memberName}'s History</span>
                      <span className="text-xs text-muted font-mono bg-white/5 px-2 py-0.5 rounded-full">{histories.length}</span>
                    </div>
                  );

                  return (
                    <div key={memberId} className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
                      {selectedContributor === "All" ? (
                        <button
                          onClick={() => toggleMemberHistory(memberId)}
                          className="group w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          {headerContent}
                          {isMinimized ? (
                            <ChevronRight className="h-4 w-4 text-muted group-hover:text-foreground transition-colors" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted group-hover:text-foreground transition-colors" />
                          )}
                        </button>
                      ) : (
                        <div className="w-full flex items-center justify-between p-3">
                          {headerContent}
                        </div>
                      )}

                      {!isMinimized && (
                        <div className="p-4 pt-0 border-t border-border-strong">
                          <div className="grid grid-cols-1 gap-3 pt-4">
                            {histories.map((history) => (
                              <PayHistoryCard
                                key={history.id}
                                history={history}
                                onConfirmPending={handleConfirmPendingClick}
                                hideMemberInfo={true}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Pay Schedule Sheet Overlay */}
      <AddPayScheduleSheet
        isOpen={isAddScheduleOpen}
        onClose={() => setIsAddScheduleOpen(false)}
      />

      {/* Edit Pay Schedule Sheet Overlay */}
      <AddPayScheduleSheet
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        existingSchedule={selectedSchedule}
      />

      {/* Pay Schedule Detail Sheet */}
      <PayScheduleDetailSheet
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        paySchedule={selectedSchedule}
        householdMembers={householdMembers}
        onEdit={() => {
          setIsDetailOpen(false);
          setIsEditOpen(true);
        }}
        onDelete={async () => {
          if (selectedSchedule && confirm("Are you sure you want to delete this payday schedule?")) {
            await deletePaySchedule(selectedSchedule.id);
            setIsDetailOpen(false);
          }
        }}
      />

      {/* Unified Pay Log Modal (for both fixed & variable) */}
      <EnterPayAmountModal
        isOpen={activeVariableSchedule !== null}
        onClose={() => setActiveVariableSchedule(null)}
        schedule={activeVariableSchedule}
        onConfirm={handleConfirmPay}
      />

      {/* Surplus Allocation Suggestion Modal */}
      <SurplusSuggestionModal
        isOpen={surplusInfo !== null}
        onClose={() => setSurplusInfo(null)}
        memberId={surplusInfo?.memberId || ""}
        newPayAmount={surplusInfo?.newPayAmount || 0}
        surplusAmount={surplusInfo?.surplusAmount || 0}
        onAllocate={handleAllocateSurplus}
      />

      {/* Confirm Pending Pay Modal */}
      {pendingHistoryToConfirm && (() => {
        // Build a synthetic schedule so the modal can render
        const pendingSchedule = paySchedules.find(
          (s) => s.id === pendingHistoryToConfirm.pay_schedule_id
        ) || {
          id: pendingHistoryToConfirm.pay_schedule_id || "pending",
          household_id: "",
          member_id: pendingHistoryToConfirm.member_id,
          amount: pendingHistoryToConfirm.amount || null,
          frequency: "monthly" as const,
          is_fixed_amount: false,
          next_pay_date: pendingHistoryToConfirm.pay_date,
          created_at: "",
        };
        return (
          <EnterPayAmountModal
            isOpen={true}
            onClose={() => setPendingHistoryToConfirm(null)}
            schedule={pendingSchedule}
            onConfirm={handleConfirmPendingSubmit}
            title="Confirm Pending Pay"
            submitLabel="Confirm & Save"
            initialAmount={pendingHistoryToConfirm.amount || null}
            initialNotes={pendingHistoryToConfirm.notes}
          />
        );
      })()}
    </div>
  );
}
