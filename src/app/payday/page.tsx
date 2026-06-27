"use client";

import React, { useState } from "react";
import { Plus, Calendar, User, Trash2, CheckCircle2, AlertCircle, Clock, PiggyBank, DollarSign } from "lucide-react";
import { useApp, useCurrentUser, type PaySchedule, type PayHistory } from "@/context/AppContext";
import AddPayScheduleSheet from "@/components/AddPayScheduleSheet";
import EnterPayAmountModal from "@/components/EnterPayAmountModal";
import PayHistoryCard from "@/components/PayHistoryCard";
import SurplusSuggestionModal from "@/components/SurplusSuggestionModal";
import PayScheduleDetailSheet from "@/components/PayScheduleDetailSheet";
import PageHeader from "@/components/PageHeader";

export default function PaydayPage() {
  const { paySchedules, payHistory, householdMembers, deletePaySchedule, logPay, calculateAveragePay, addToGoal, isJointFund, householdContributions, checkAndApplyRules, applyRuleAllocation, funds } = useApp();
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

    if (diffDays < 0) {
      const absDays = Math.abs(diffDays);
      return {
        text: `${absDays} day${absDays !== 1 ? "s" : ""} overdue`,
        color: "text-destructive bg-destructive/10 border-destructive/20",
        icon: AlertCircle,
      };
    } else if (diffDays === 0) {
      return {
        text: "today",
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

  // Log handler
  const handleLogFixedPay = async (schedule: PaySchedule) => {
    const memberName = householdMembers.find((m) => String(m.id) === String(schedule.member_id))?.name || "Member";
    const formattedAmount = Number(schedule.amount || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
    });
    if (confirm(`Log pay entry of $${formattedAmount} for ${memberName}?`)) {
      const logDate = new Date().toISOString().split("T")[0];
      await logPay(schedule.id, schedule.amount || 0, logDate, "Regular fixed amount logged");
    }
  };

  const handleConfirmVariablePay = async (amount: number, notes: string | null) => {
    if (activeVariableSchedule) {
      const memberId = activeVariableSchedule.member_id;
      const avg = calculateAveragePay(memberId);

      const logDate = new Date().toISOString().split("T")[0];
      const newHistory = await logPay(activeVariableSchedule.id, amount, logDate, notes || "Variable amount logged");
      
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

  const recentHistory = payHistory.slice(0, 10);

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 sm:px-6 md:py-12 space-y-8 pb-24">
      <PageHeader
        title="Payday Hub"
        subtitle="Manage scheduled payouts and track income"
        user={currentUser}
        action={
          <button
            onClick={() => setIsAddScheduleOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/95 text-primary-fg text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer font-heading uppercase tracking-wider animate-in fade-in duration-200"
          >
            <Plus size={16} />
            <span>New Schedule</span>
          </button>
        }
      />

      {/* Upcoming Pays */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-subtle uppercase tracking-wider px-1 font-heading">
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
                    <div className="flex items-center justify-between">
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
                        className="p-1.5 text-muted hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                        title="Delete Schedule"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Meta info */}
                    <div className="flex items-center justify-between text-xs text-muted font-mono pt-1">
                      <div className="flex items-center gap-1.5 uppercase">
                        <span>{schedule.frequency}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>Next: {schedule.next_pay_date}</span>
                      </div>
                    </div>

                    {/* Amount & Status Badge */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted font-mono uppercase">Amount</span>
                        <span className="text-lg font-heading font-extrabold text-foreground tracking-tight font-mono">
                          {formattedAmount}
                        </span>
                      </div>
                      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${countdown.color}`}>
                        <CountdownIcon size={12} className="shrink-0" />
                        <span>{countdown.text}</span>
                      </div>
                    </div>

                    {/* Expected Joint Fund Contribution */}
                    {contribution && (
                      <div className="mt-3 p-3 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between text-[10px] font-mono">
                        <span className="text-muted uppercase">Expected Contribution</span>
                        <span className="text-primary font-bold">
                          ${Number(contribution.amount).toFixed(2)} per {contribution.frequency}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-white/5">
                    {schedule.is_fixed_amount ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLogFixedPay(schedule);
                        }}
                        disabled={!isReady}
                        className={`w-full py-2.5 rounded-xl font-heading text-xs font-bold uppercase tracking-wider transition-all ${
                          isReady
                            ? "bg-primary text-primary-fg hover:brightness-110 active:scale-[0.98] cursor-pointer"
                            : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                        }`}
                      >
                        Log Pay
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveVariableSchedule(schedule);
                        }}
                        disabled={!isReady}
                        className={`w-full py-2.5 rounded-xl font-heading text-xs font-bold uppercase tracking-wider transition-all ${
                          isReady
                            ? "bg-primary text-primary-fg hover:brightness-110 active:scale-[0.98] cursor-pointer"
                            : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                        }`}
                      >
                        Enter Pay Amount
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Pay History */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-subtle uppercase tracking-wider px-1 font-heading">
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
              <PayHistoryCard key={history.id} history={history} />
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

      {/* Variable Pay Log Overlay */}
      <EnterPayAmountModal
        isOpen={activeVariableSchedule !== null}
        onClose={() => setActiveVariableSchedule(null)}
        schedule={activeVariableSchedule}
        onConfirm={handleConfirmVariablePay}
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
    </div>
  );
}
