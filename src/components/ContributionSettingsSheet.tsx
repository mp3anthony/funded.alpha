"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { useApp, type Member } from "@/context/AppContext";
import { type HouseholdContribution } from "@/types";
import Dialog from "@/components/ui/Dialog";

interface ContributionSettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  householdMembers: Member[];
  contributions: HouseholdContribution[];
}

export default function ContributionSettingsSheet({
  isOpen,
  onClose,
  householdMembers,
  contributions,
}: ContributionSettingsSheetProps) {
  const { setContribution } = useApp();

  if (!isOpen) return null;

  // Calculate total monthly contribution
  const totalMonthly = contributions.reduce((sum, c) => {
    let monthlyAmount = Number(c.amount) || 0;
    if (c.frequency === "weekly") {
      monthlyAmount = monthlyAmount * 4.33;
    } else if (c.frequency === "fortnightly") {
      monthlyAmount = monthlyAmount * 2.16;
    }
    return sum + monthlyAmount;
  }, 0);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title="Joint Fund Contributions"
      footer={
        <div className="w-full flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-subtle uppercase tracking-wider block font-mono">
              Total Household Budget
            </span>
            <span className="text-xs text-muted font-body">
              Normalized combined contribution
            </span>
          </div>
          <div className="text-right">
            <span className="text-xl font-heading font-extrabold text-primary font-mono block">
              ${totalMonthly.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-muted uppercase font-mono">
              per month
            </span>
          </div>
        </div>
      }
    >
      {/* Members Rows */}
      <div className="divide-y divide-white/5 -my-1">
        {householdMembers.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted">
            No household members added yet.
          </div>
        ) : (
          householdMembers.map((member) => {
            const existing = contributions.find((c) => String(c.member_id) === String(member.id));
            return (
              <MemberContributionRow
                key={member.id}
                member={member}
                existing={existing}
                onSave={async (amount, frequency) => {
                  await setContribution(String(member.id), amount, frequency);
                }}
              />
            );
          })
        )}
      </div>
    </Dialog>
  );
}

interface MemberContributionRowProps {
  member: Member;
  existing?: HouseholdContribution;
  onSave: (amount: number, frequency: "weekly" | "fortnightly" | "monthly") => Promise<void>;
}

function MemberContributionRow({
  member,
  existing,
  onSave,
}: MemberContributionRowProps) {
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<"weekly" | "fortnightly" | "monthly">("monthly");
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (existing) {
      setAmount(String(existing.amount));
      setFrequency(existing.frequency);
      setIsSaved(true);
    } else {
      setAmount("");
      setFrequency("monthly");
      setIsSaved(false);
    }
  }, [existing]);

  const isValid = amount !== "" && !isNaN(Number(amount)) && Number(amount) > 0;

  const getConversions = () => {
    const val = Number(amount) || 0;
    let w = 0;
    let f = 0;
    let m = 0;

    if (frequency === "weekly") {
      w = val;
      f = val * 2;
      m = val * 4.33;
    } else if (frequency === "fortnightly") {
      w = val / 2;
      f = val;
      m = val * 2.16;
    } else if (frequency === "monthly") {
      w = val / 4.33;
      f = val / 2.16;
      m = val;
    }

    return {
      weekly: w,
      "fortnightly": f,
      monthly: m,
    };
  };

  const conversions = getConversions();

  const handleSave = async () => {
    if (!isValid) return;
    setIsSaving(true);
    try {
      await onSave(Number(amount), frequency);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="py-5 flex flex-col space-y-3">
      {/* Member Name */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {member.avatar_url ? (
            <img src={member.avatar_url} alt={member.name} className="h-6 w-6 rounded-full object-cover shrink-0" />
          ) : (
            <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-primary to-emerald-500 flex items-center justify-center text-foreground font-bold text-[10px] shrink-0">
              {member.avatar || member.name.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm font-semibold text-foreground truncate pr-2">
            {member.name}
          </span>
        </div>
        {existing && (
          <span className="text-[10px] font-mono text-muted uppercase">
            Active: ${Number(existing.amount).toFixed(2)} / {existing.frequency}
          </span>
        )}
      </div>

      {/* Inputs row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Frequency Segmented Control */}
        <div className="grid grid-cols-3 gap-1 bg-background border border-border rounded-[2px] p-1 shrink-0">
          {(["weekly", "fortnightly", "monthly"] as const).map((freq) => (
            <button
              key={freq}
              type="button"
              onClick={() => {
                setFrequency(freq);
                setIsSaved(false);
              }}
              className={`py-1.5 px-3 rounded-[2px] text-[10px] font-bold uppercase tracking-wider transition-all ${
                frequency === freq
                  ? "bg-primary text-primary-fg shadow"
                  : "text-muted hover:text-foreground hover:bg-white/5"
              }`}
            >
              {freq === "fortnightly" ? "Fortnight" : freq === "weekly" ? "Week" : "Month"}
            </button>
          ))}
        </div>

        {/* Amount Input */}
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted font-mono text-xs">$</span>
          <input
            type="number"
            placeholder="0.00"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setIsSaved(false);
            }}
            className="w-full bg-background border border-border rounded-[2px] pl-6 pr-3 py-2 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            required
          />
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={!isValid || isSaving}
          className={`py-2 px-4 rounded-[2px] font-heading text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 shrink-0 ${
            isSaved
              ? "bg-primary/25 text-primary border border-primary/30"
              : isValid
              ? "bg-primary text-primary-fg hover:brightness-110 active:scale-95 cursor-pointer"
              : "bg-surface-raised text-zinc-500 cursor-not-allowed"
          }`}
        >
          {isSaving ? (
            <span>Saving...</span>
          ) : isSaved ? (
            <>
              <Check size={12} />
              <span>Saved</span>
            </>
          ) : (
            <span>Save</span>
          )}
        </button>
      </div>

      {/* Frequency Equivalents Display */}
      {isValid && (
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1 px-1 font-mono text-[10px]">
          <span className={frequency === "weekly" ? "text-primary font-bold animate-pulse" : "text-muted"}>
            Weekly: ${conversions.weekly.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className={frequency === "fortnightly" ? "text-primary font-bold animate-pulse" : "text-muted"}>
            Fortnightly: ${conversions["fortnightly"].toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className={frequency === "monthly" ? "text-primary font-bold animate-pulse" : "text-muted"}>
            Monthly: ${conversions.monthly.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      )}
    </div>
  );
}
