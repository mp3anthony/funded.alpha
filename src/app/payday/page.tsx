"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Calendar, User, Trash2, CheckCircle2, AlertCircle, Clock, PiggyBank, DollarSign } from "lucide-react";
import { useApp, useCurrentUser, type PaySchedule, type PayHistory } from "@/context/AppContext";
import AddPayScheduleSheet from "@/components/AddPayScheduleSheet";
import EnterPayAmountModal from "@/components/EnterPayAmountModal";
import PayHistoryCard from "@/components/PayHistoryCard";
import SurplusSuggestionModal from "@/components/SurplusSuggestionModal";
import PayScheduleDetailSheet from "@/components/PayScheduleDetailSheet";
import PageHeader from "@/components/PageHeader";

export default function PaydayPage() {
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

  // Auto-log missed pays on mount / when schedules load
  const hasAutoLogged = useRef(false);
  useEffect(() => {
    if (paySchedules.length > 0 && !hasAutoLogged.current) {
      hasAutoLogged.current = true;
      autoLogMissedPays();
    }
  }, [paySchedules]);

  const today = new Date();
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
        color: "text-[#c8ff00] bg-[#c8ff00]/10 border-[#c8ff00]/20",
        icon: CheckCircle2,
      };
    } else {
      return {
        text: `in ${diffDays} day${diffDays !== 1 ? "s" : ""}`,
        color: "text-muted bg-white/5 border-white/5",
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

  const recentHistory = payHistory.slice(0, 10);

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 sm:px-6 md:py-12 space-y-8 pb-24">
      <PageHeader
        title="Payday"
        subtitle="Manage & track incomes"
        user={currentUser}
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
        <h2 className="text-base font-bold text-subtle uppercase tracking-wider px-1 font-syne">
          Upcoming Pays
        </h2>

        {paySchedules.length === 0 ? (
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-10 text-center shadow-sm">
            <DollarSign className="h-10 w-10 text-muted mx-auto mb-3" />
            <p className="text-sm font-semibold text-muted">No pay schedules active.</p>
            <p className="text-xs text-subtle mt-1">Create a schedule to automate or log household income.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paySchedules.map((schedule) => {
              const member = householdMembers.find((m) => String(m.id) === String(schedule.member_id));
              const memberName = member ? member.name : "Unknown Member";
              const countdown = getCountdown(schedule);
              const isReady = isLoggable(schedule);

              const contribution = isJointFund && member
                ? householdContributions.find((c) => String(c.member_id) === String(member.id))
                : null;

              const formattedAmount = schedule.is_fixed_amount && schedule.amount
                ? `$${Number(schedule.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                : "Variable";

              const CountdownIcon = countdown.icon;

              return (
                <div
                  key={schedule.id}
                  onClick={() => {
                    setSelectedSchedule(schedule);
                    setIsDetailOpen(true);
                  }}
                  className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="space-y-2">
                    {/* Member & Actions */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-foreground font-bold text-sm min-w-0">
                        {member?.avatar_url ? (
                          <img src={member.avatar_url} alt={memberName} className="h-6 w-6 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-primary to-emerald-500 flex items-center justify-center text-white font-bold text-[10px] shrink-0">
                            {member?.avatar || memberName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="truncate">{memberName}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSchedule(schedule);
                        }}
                        className="p-1.5 text-muted hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Delete Schedule"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Meta info */}
                    <div className="flex items-center justify-between gap-2 flex-wrap text-xs text-muted font-mono pt-1">
                      <div className="flex items-center gap-1.5 uppercase min-w-0">
                        <span className="truncate">{schedule.frequency}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Calendar size={12} className="shrink-0" />
                        <span>Next: {schedule.next_pay_date}</span>
                      </div>
                    </div>

                    {/* Amount & Status Badge */}
                    <div className="flex items-center justify-between gap-2 flex-wrap pt-2">
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs text-muted font-mono uppercase truncate">Amount</span>
                        <span className="text-lg font-heading font-extrabold text-foreground tracking-tight font-mono truncate whitespace-nowrap">
                          {formattedAmount}
                        </span>
                      </div>
                      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0 ${countdown.color}`}>
                        <CountdownIcon size={12} className="shrink-0" />
                        <span className="truncate">{countdown.text}</span>
                      </div>
                    </div>

                    {/* Expected Joint Fund Contribution */}
                    {contribution && (
                      <div className="mt-3 p-3 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between gap-2 flex-wrap text-[10px] font-mono">
                        <span className="text-muted uppercase min-w-0 truncate">Expected Contribution</span>
                        <span className="text-primary font-bold whitespace-nowrap">
                          ${Number(contribution.amount).toFixed(2)} per {contribution.frequency}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar — only shown when pay is due */}
                  {isReady && (
                    <div className="pt-2 border-t border-white/5">
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
        )}
      </div>

      {/* Recent Pay History */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-subtle uppercase tracking-wider px-1 font-syne">
          Recent Pay History
        </h2>

        {recentHistory.length === 0 ? (
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-10 text-center shadow-sm">
            <PiggyBank className="h-10 w-10 text-muted mx-auto mb-3" />
            <p className="text-sm font-semibold text-muted">No history logged yet.</p>
            <p className="text-xs text-subtle mt-1">Logged payday transactions will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {recentHistory.map((history) => (
              <PayHistoryCard
                key={history.id}
                history={history}
                onConfirmPending={handleConfirmPendingClick}
              />
            ))}
          </div>
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
