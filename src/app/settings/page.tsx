"use client";

import { useState, useEffect } from "react";
import {
  User,
  Bell,
  Mail,
  Users,
  Plus,
  X,
  Trash2,
  Save,
  Check,
  SunMoon,
} from "lucide-react";
import { useApp, useCurrentUser } from "@/context/AppContext";
import PaymentModeToggle from "@/components/PaymentModeToggle";
import ContributionSettingsSheet from "@/components/ContributionSettingsSheet";
import RulesSettingsSheet from "@/components/RulesSettingsSheet";
import PageHeader from "@/components/PageHeader";
import AvatarUpload from "@/components/AvatarUpload";
import InviteMemberModal from "@/components/InviteMemberModal";
import RemoveMemberModal from "@/components/RemoveMemberModal";
import { type Member } from "@/types";
import { AlertTriangle } from "lucide-react";

/* ── Page Component ──────────────────────────── */
export default function SettingsPage() {
  /* Context */
  const {
    members,
    addMember,
    removeMember,
    isJointFund,
    updateHouseholdPaymentMode,
    householdContributions,
    contributionRules,
    funds,
    session,
    updateMember,
    updateMemberAvatar,
    theme,
    setTheme,
  } = useApp();
  const currentUser = useCurrentUser();

  /* Toggle States */
  const [tempMode, setTempMode] = useState<boolean | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isContributionOpen, setIsContributionOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  /* Contribution Totals */
  const contributionWeekly = householdContributions
    .filter((c) => c.frequency === "weekly")
    .reduce((sum, c) => sum + Number(c.amount), 0);

  const contributionFortnightly = householdContributions
    .filter((c) => c.frequency === "fortnightly")
    .reduce((sum, c) => sum + Number(c.amount), 0);

  const contributionMonthly = householdContributions
    .filter((c) => c.frequency === "monthly")
    .reduce((sum, c) => sum + Number(c.amount), 0);

  const grandTotalMonthly =
    contributionWeekly * 4.33 +
    contributionFortnightly * 2.16 +
    contributionMonthly;

  const hasContributions = householdContributions.length > 0;

  const currentMember = members.find((m) => m.email === session?.user?.email);

  /* Profile */
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (currentMember) {
      setFullName(currentMember.name);
      setEmail(currentMember.email);
    } else if (session?.user) {
      setFullName(session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "");
      setEmail(session.user.email || "");
    }
  }, [currentMember, session]);

  /* Preferences */
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);

  /* Invite and Remove member modals */
  const [showInvite, setShowInvite] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);

  /* ── Handlers ──────────────────────────────── */
  async function handleProfileSave() {
    if (currentMember) {
      await updateMember(currentMember.id, { name: fullName, email: email });
    }
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  }

  function handleModeChangeClick(newMode: boolean) {
    if (newMode === isJointFund) return;
    setTempMode(newMode);
    setShowConfirm(true);
  }

  async function handleConfirmModeChange() {
    if (tempMode !== null) {
      await updateHouseholdPaymentMode(tempMode);
    }
    setTempMode(null);
    setShowConfirm(false);
  }

  function handleCancelModeChange() {
    setTempMode(null);
    setShowConfirm(false);
  }

  /* ── Render ────────────────────────────────── */
  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 sm:px-6 md:py-12 space-y-8">
      <PageHeader
        title="Settings"
        subtitle="Manage your account and household preferences"
        user={currentUser}
      />

      {/* ── Profile Section ──────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-subtle uppercase tracking-wider px-1">
          Profile
        </h2>

        <div className="bg-surface border border-border rounded-2xl shadow-sm p-5 sm:p-6 space-y-5">
          {/* Avatar Upload */}
          {currentMember && (
            <AvatarUpload
              currentAvatarUrl={currentMember.avatar_url || null}
              memberName={currentMember.name}
              userId={String(currentMember.id)}
              onAvatarChange={async (newUrl) => {
                await updateMemberAvatar(currentMember.id, newUrl);
              }}
            />
          )}

          {/* Full Name */}
          <div className="space-y-2">
            <label
              htmlFor="settings-name"
              className="block text-xs font-bold tracking-wider uppercase text-muted"
            >
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
              <input
                id="settings-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-raised border border-border text-foreground text-sm font-medium focus:ring-2 focus:ring-secondary/40 focus:border-secondary outline-none transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label
              htmlFor="settings-email"
              className="block text-xs font-bold tracking-wider uppercase text-muted"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
              <input
                id="settings-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-raised border border-border text-foreground text-sm font-medium focus:ring-2 focus:ring-secondary/40 focus:border-secondary outline-none transition-all"
              />
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleProfileSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary text-secondary-fg text-sm font-bold shadow-lg shadow-secondary/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            {profileSaved ? (
              <>
                <Check className="h-4 w-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </section>

      {/* ── Preferences Section ──────────────────── */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-subtle uppercase tracking-wider px-1">
          Preferences
        </h2>

        <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden divide-y divide-border">
          {/* Push Notifications */}
          <div className="p-4 sm:p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 rounded-xl bg-accent/10 text-accent items-center justify-center shrink-0">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-foreground">
                  Push Notifications
                </h4>
                <p className="text-xs text-muted mt-0.5">
                  Get alerts for payday, upcoming bills, and low balances.
                </p>
              </div>
            </div>
            <button
              role="switch"
              aria-checked={pushNotifications}
              onClick={() => setPushNotifications((v) => !v)}
              className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors duration-200 cursor-pointer focus:ring-2 focus:ring-secondary/40 focus:ring-offset-2 focus:ring-offset-surface ${
                pushNotifications ? "bg-primary" : "bg-zinc-300 dark:bg-zinc-600"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-200 mt-1 ${
                  pushNotifications ? "translate-x-6 ml-0.5" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Email Alerts */}
          <div className="p-4 sm:p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 rounded-xl bg-secondary/10 text-secondary items-center justify-center shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-foreground">
                  Email Alerts
                </h4>
                <p className="text-xs text-muted mt-0.5">
                  Receive weekly summaries and reminders via email.
                </p>
              </div>
            </div>
            <button
              role="switch"
              aria-checked={emailAlerts}
              onClick={() => setEmailAlerts((v) => !v)}
              className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors duration-200 cursor-pointer focus:ring-2 focus:ring-secondary/40 focus:ring-offset-2 focus:ring-offset-surface ${
                emailAlerts ? "bg-primary" : "bg-zinc-300 dark:bg-zinc-600"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-200 mt-1 ${
                  emailAlerts ? "translate-x-6 ml-0.5" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* App Theme Mode Toggle */}
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 rounded-xl bg-primary/10 text-primary items-center justify-center shrink-0">
                <SunMoon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-foreground">
                  App Theme
                </h4>
                <p className="text-xs text-muted mt-0.5">
                  Choose between Light, Dark, or System mode.
                </p>
              </div>
            </div>
            
            <div className="inline-flex p-1 bg-[#111111] border border-white/10 rounded-xl shrink-0">
              {(
                [
                  { value: "light", label: "Light" },
                  { value: "dark", label: "Dark" },
                  { value: "system", label: "System" },
                ] as const
              ).map((opt) => {
                const isSelected = theme === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTheme(opt.value)}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-heading font-bold uppercase tracking-wider transition-all duration-200 focus:outline-none cursor-pointer ${
                      isSelected
                        ? "bg-[#c8ff00] text-black font-extrabold shadow-sm"
                        : "text-neutral-400 hover:text-white hover:bg-white/[0.02]"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Household Settings Section ────────────────── */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-subtle uppercase tracking-wider px-1">
          Household Settings
        </h2>

        <div className="bg-surface border border-border rounded-2xl shadow-sm p-5 sm:p-6 space-y-6">
          <PaymentModeToggle
            currentMode={tempMode !== null ? tempMode : isJointFund}
            onModeChange={handleModeChangeClick}
          />

          {isJointFund && (
            <div className="border-t border-border pt-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-foreground">
                    Joint Fund Contributions
                  </h4>
                  <p className="text-xs text-muted">
                    Configure how much each household member contributes per pay cycle.
                  </p>
                </div>
                <button
                  onClick={() => setIsContributionOpen(true)}
                  className="px-4 py-2.5 bg-primary text-primary-fg text-xs font-bold rounded-xl shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer font-heading uppercase tracking-wider shrink-0"
                >
                  Set Contributions
                </button>
              </div>

              {/* Individual Contributions Display Tile */}
              <div className="bg-[#111111] border border-white/10 rounded-2xl p-4 mt-4">
                {!hasContributions ? (
                  <p className="text-muted text-sm font-mono text-center py-2">
                    No contributions set. Click &apos;Set Contributions&apos; to get started.
                  </p>
                ) : (
                  <div className="divide-y divide-white/5">
                    {householdContributions.map((contribution, idx) => {
                      const member = members.find((m) => String(m.id) === String(contribution.member_id));
                      const memberName = member ? member.name : "Unknown Member";
                      const memberAvatar = member ? member.avatar : "?";

                      return (
                        <div
                          key={contribution.id}
                          className={`flex items-center justify-between py-3 ${
                            idx > 0 ? "pt-3" : "pt-0"
                          } ${idx < householdContributions.length - 1 ? "pb-3" : "pb-0"}`}
                        >
                          {/* Left: Avatar & Name */}
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-8 w-8 rounded-full overflow-hidden bg-gradient-to-tr from-primary to-emerald-500 flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
                              {member?.avatar_url ? (
                                <img src={member.avatar_url} alt={memberName} className="h-full w-full object-cover" />
                              ) : (
                                memberAvatar
                              )}
                            </div>
                            <span className="font-syne text-sm font-bold text-foreground truncate">
                              {memberName}
                            </span>
                          </div>

                          {/* Center: Contribution Amount */}
                          <span className="font-jetbrains text-sm font-semibold text-foreground">
                            ${Number(contribution.amount).toFixed(2)}
                          </span>

                          {/* Right: Selected Frequency highlighted in lime green */}
                          <span className="text-[#c8ff00] text-xs font-bold uppercase tracking-wider font-mono">
                            {contribution.frequency}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Contribution Rules Section */}
              <div className="border-t border-border pt-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-foreground">
                      Contribution Rules
                    </h4>
                    <p className="text-xs text-muted">
                      Automatically allocate excess pay when you earn above a threshold.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsRulesOpen(true)}
                    className="px-4 py-2.5 bg-primary text-primary-fg text-xs font-bold rounded-xl shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer font-heading uppercase tracking-wider shrink-0"
                  >
                    Manage Rules
                  </button>
                </div>

                {/* Rules Summary Tile */}
                <div className="bg-[#111111] border border-white/10 rounded-2xl p-4 mt-4">
                  {contributionRules.length === 0 ? (
                    <p className="text-muted text-xs font-mono text-center py-2">
                      No rules set. Click &apos;Manage Rules&apos; to automate excess pay allocation.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider block font-mono">
                        {contributionRules.filter(r => r.is_active).length} Active Automation Rules
                      </span>
                      <div className="divide-y divide-white/5 font-mono text-[11px] text-muted">
                        {contributionRules.map((rule, idx) => {
                          const m = members.find((member) => String(member.id) === String(rule.member_id));
                          const mName = m ? m.name : "Member";
                          
                          let targetName = "contribution";
                          if (rule.action_type === "goal") {
                            const goal = funds.find((g) => String(g.id) === String(rule.action_target_id));
                            targetName = goal ? goal.name : "goal";
                          }

                          return (
                            <div
                              key={rule.id}
                              className={`flex items-center justify-between py-2 ${
                                idx > 0 ? "pt-2" : "pt-0"
                              } ${idx < contributionRules.length - 1 ? "pb-2" : "pb-0"}`}
                            >
                              <span>
                                When {mName}&apos;s pay &gt; ${rule.threshold_amount.toFixed(2)}
                              </span>
                              <span className={rule.is_active ? "text-[#c8ff00] font-bold" : "text-muted"}>
                                Add {rule.amount_type === "percentage" ? `${rule.amount_to_add}% of surplus` : `$${rule.amount_to_add.toFixed(2)}`} to {targetName}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Household Members Section ────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-subtle uppercase tracking-wider">
            Household Members
          </h2>
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary text-xs font-bold hover:bg-secondary/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Invite Member
          </button>
        </div>

        <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden divide-y divide-border font-sans">
          {members.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-8 w-8 mx-auto text-muted mb-2" />
              <p className="text-sm text-muted font-medium">
                No household members yet.{" "}
                <button
                  onClick={() => setShowInvite(true)}
                  className="text-secondary font-bold hover:underline cursor-pointer"
                >
                  Invite someone
                </button>
              </p>
            </div>
          ) : (
            members.map((member) => {
              const isCurrentUser = String(member.email).toLowerCase() === String(session?.user?.email).toLowerCase();
              const isOwner = member.role === "owner";
              const isPending = member.invitation_status === "pending";

              return (
                <div
                  key={member.id}
                  className="group p-4 sm:p-5 flex items-center justify-between hover:bg-surface-raised transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-tr from-primary to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                      {member.avatar_url ? (
                        <img src={member.avatar_url} alt={member.name} className="h-full w-full object-cover" />
                      ) : (
                        member.avatar
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm sm:text-base font-bold text-foreground">
                          {member.name}
                        </h4>
                        {/* Role Badges */}
                        {isOwner ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#c8ff00]/10 text-[#c8ff00] border border-[#c8ff00]/20 font-syne">
                            Owner
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-neutral-400 border border-white/10 font-syne">
                            Member
                          </span>
                        )}
                        {/* Invitation Status Badge */}
                        {isPending && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 font-syne">
                            Pending
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5">{member.email}</p>
                    </div>
                  </div>

                  {/* Remove Button */}
                  {!isOwner && (
                    <button
                      onClick={() => setMemberToRemove(member)}
                      disabled={isCurrentUser}
                      aria-label={`Remove ${member.name}`}
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-neutral-400 hover:text-[#ff3d57] hover:bg-[#ff3d57]/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-neutral-400 disabled:pointer-events-none cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>


      {/* ── Invite & Remove Member Modals ────────── */}
      <InviteMemberModal
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
      />

      <RemoveMemberModal
        isOpen={memberToRemove !== null}
        onClose={() => setMemberToRemove(null)}
        member={memberToRemove}
        householdMembers={members}
      />

      {/* ── Mode Change Confirmation Modal ──────────── */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={handleCancelModeChange}
        >
          <div
            className="bg-surface border border-border rounded-3xl w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="p-5 border-b border-border">
              <h3 className="text-lg font-bold text-foreground font-syne">
                Confirm Payment Mode Change
              </h3>
            </div>

            {/* Modal body */}
            <div className="p-5 space-y-3">
              <p className="text-sm text-foreground">
                Changing the payment mode will **reset all bill contributor splits**.
              </p>
              <p className="text-xs text-muted leading-relaxed font-mono">
                You will need to reconfigure who pays what share for all existing bills. This action cannot be undone. Are you sure you want to continue?
              </p>
            </div>

            {/* Modal footer */}
            <div className="flex items-center gap-3 p-5 border-t border-border">
              <button
                onClick={handleCancelModeChange}
                className="flex-1 py-3 rounded-xl border border-border text-sm font-bold text-muted hover:text-foreground hover:bg-surface-raised transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmModeChange}
                className="flex-1 py-3 rounded-xl bg-destructive text-white text-sm font-bold shadow-lg shadow-destructive/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contribution Settings Sheet */}
      <ContributionSettingsSheet
        isOpen={isContributionOpen}
        onClose={() => setIsContributionOpen(false)}
        householdMembers={members}
        contributions={householdContributions}
      />

      {/* Rules Settings Sheet */}
      <RulesSettingsSheet
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        householdMembers={members}
        rules={contributionRules}
        goals={funds}
        contributions={householdContributions}
      />
    </div>
  );
}
