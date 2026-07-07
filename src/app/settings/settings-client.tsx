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
  UserCog,
} from "lucide-react";
import { useApp, useCurrentUser } from "@/context/AppContext";
import PaymentModeToggle from "@/components/PaymentModeToggle";
import ContributionSettingsSheet from "@/components/ContributionSettingsSheet";
import RulesSettingsSheet from "@/components/RulesSettingsSheet";
import PageHeader from "@/components/PageHeader";
import AvatarUpload from "@/components/AvatarUpload";
import RemoveMemberModal from "@/components/RemoveMemberModal";
import EditMemberModal from "@/components/EditMemberModal";
import JoinHouseholdSheet from "@/components/JoinHouseholdSheet";
import NotificationCenter from "@/components/NotificationCenter";
import { type Member } from "@/types";

/* ── Page Component ──────────────────────────── */
export default function SettingsClient() {
  /* Context */
  const {
    members,
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
    joinCode,
    codeExpiresAt,
    regenerateJoinCode,
    notificationSettings,
    updateNotificationSettings,
  } = useApp();
  const currentUser = useCurrentUser();

  /* Toggle States */
  const [tempMode, setTempMode] = useState<boolean | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isContributionOpen, setIsContributionOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  /* Contribution Totals */
  const contributionWeekly = householdContributions
    .filter((c) => c.frequency === "weekly")
    .reduce((sum, c) => sum + Number(c.amount), 0);

  const contributionByWeekly = householdContributions
    .filter((c) => c.frequency === "fortnightly")
    .reduce((sum, c) => sum + Number(c.amount), 0);

  const contributionMonthly = householdContributions
    .filter((c) => c.frequency === "monthly")
    .reduce((sum, c) => sum + Number(c.amount), 0);

  const grandTotalMonthly =
    contributionWeekly * 4.33 +
    contributionByWeekly * 2.16 +
    contributionMonthly;

  const hasContributions = householdContributions.length > 0;

  const currentMember = members.find((m) => String(m.email).toLowerCase() === String(session?.user?.email).toLowerCase());

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

  /* Invite, Edit, and Remove member modals */
  const [showInvite, setShowInvite] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);
  const [isJoinSheetOpen, setIsJoinSheetOpen] = useState(false);

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
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 pt-4 pb-8 sm:px-6 md:pt-6 md:pb-12 space-y-8">
      <PageHeader
        title="Settings"
        subtitle="Manage your account and household preferences"
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

      {/* ── App Settings Section ──────────────────── */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-subtle uppercase tracking-wider px-1">
          App Settings
        </h2>

        <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden divide-y divide-border">
          {/* Notifications */}
          <div className="p-4 sm:p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 rounded-xl bg-accent/10 text-accent items-center justify-center shrink-0">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-foreground">
                  Notifications
                </h4>
                <p className="text-xs text-muted mt-0.5">
                  View your inbox and manage alert preferences.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsNotificationCenterOpen(true)}
              className="px-4 py-2 bg-surface-raised border border-border rounded-xl text-xs font-bold text-foreground hover:bg-white/5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Open Notifications
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
            <div className="relative shrink-0 w-full sm:w-44">
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as "light" | "dark" | "system")}
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-bold text-foreground focus:border-primary focus:outline-none appearance-none cursor-pointer pr-8 uppercase tracking-wider"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted">
                <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Household Settings Section ────────────────── */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-subtle uppercase tracking-wider px-1">
          Household Settings
        </h2>

        <div className="bg-surface border border-border rounded-2xl shadow-sm p-5 sm:p-6 space-y-8">
          
          {/* Payment Mode & Contributions */}
          <div className="space-y-6">
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
                <div className="bg-surface border border-border rounded-2xl p-4 mt-4">
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
                              <div className="h-8 w-8 rounded-xl overflow-hidden bg-gradient-to-tr from-primary to-emerald-500 flex items-center justify-center text-foreground font-bold text-xs shadow-sm shrink-0">
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
                            <span className="text-primary text-xs font-bold uppercase tracking-wider font-mono">
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
                  <div className="bg-surface border border-border rounded-2xl p-4 mt-4">
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
                                <span className={rule.is_active ? "text-primary font-bold" : "text-muted"}>
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

          {/* Household Join Code Section */}
          <div className="border-t border-border pt-8 space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground font-syne">
                Household Join Code
              </h3>
              <p className="text-xs text-muted leading-relaxed font-sans">
                Share this 6-digit code with other members of your household to invite them. The code expires in 24 hours.
              </p>
            </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full bg-background border border-border rounded-xl px-4 py-3 flex items-center justify-between font-mono">
            {joinCode ? (
              <>
                <span className="text-primary text-lg font-bold tracking-widest uppercase">
                  {joinCode}
                </span>
                <span className="text-[10px] text-muted font-sans">
                  Expires {codeExpiresAt ? new Date(codeExpiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                </span>
              </>
            ) : (
              <span className="text-muted text-sm font-sans">No code generated yet</span>
            )}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            {joinCode && (
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(joinCode);
                  alert("Join code copied to clipboard!");
                }}
                className="flex-1 sm:flex-none px-4 py-3 rounded-xl border border-border text-xs font-bold text-foreground bg-white/5 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                Copy Code
              </button>
            )}
            <button
              type="button"
              onClick={async () => {
                try {
                  await regenerateJoinCode();
                } catch (err: any) {
                  alert(err.message || "Failed to generate code.");
                }
              }}
              className="flex-1 sm:flex-none px-4 py-3 bg-primary text-black rounded-xl text-xs font-bold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 animate-pulse hover:animate-none"
            >
              Regenerate
            </button>
          </div>
          </div>
          </div>
          {/* Household Members Section */}
          <div className="border-t border-border pt-8 space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground font-syne">
                Household Members
              </h3>
            </div>

        <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden divide-y divide-border font-sans">
          {members.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-8 w-8 mx-auto text-muted mb-2" />
              <p className="text-sm text-muted font-medium">
                No household members yet. Use the Join Code above to invite someone!
              </p>
            </div>
          ) : (
            members.map((member) => {
              const isCurrentUser = String(member.email).toLowerCase() === String(session?.user?.email).toLowerCase();
              const isOwner = member.role === "owner";
              const isPending = member.invitation_status === "pending";
              const isCurrentUserOwner = currentMember?.role === "owner";

              return (
                <div
                  key={member.id}
                  className="group p-4 sm:p-5 flex items-center justify-between hover:bg-surface-raised transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl overflow-hidden bg-gradient-to-tr from-primary to-emerald-500 flex items-center justify-center text-foreground font-bold text-sm shadow-sm shrink-0">
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
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 font-syne">
                            Owner
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-muted border border-border font-syne">
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
                      <p className="text-xs text-muted mt-0.5">{member.email}</p>
                    </div>
                  </div>

                  {/* Edit/Manage Member Button */}
                  {isCurrentUserOwner && !isCurrentUser && (
                    <button
                      onClick={() => setMemberToEdit(member)}
                      aria-label={`Edit settings for ${member.name}`}
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-muted hover:text-primary hover:bg-primary/10 transition-colors border border-border-strong bg-foreground/5 cursor-pointer"
                    >
                      <UserCog className="h-4.5 w-4.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
        </div>
        </div>
      </section>

      {/* ── Danger Zone Section ────────────── */}
      <section className="bg-surface border border-red-500/20 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-destructive font-syne">
            Danger Zone
          </h2>
          <p className="text-xs text-muted leading-relaxed font-sans">
            Irreversible actions for your household configuration.
          </p>
        </div>

        <div className="pt-2 border-t border-border-strong flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-foreground font-syne">
              Leave &amp; Join New Household
            </h4>
            <p className="text-xs text-muted max-w-sm font-sans">
              Leave your current household and join another one using a 6-digit code.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (confirm("WARNING: This will permanently delete your current household data (if you are the owner) or remove your membership (if you are a member). You cannot undo this. Are you sure you want to continue?")) {
                setIsJoinSheetOpen(true);
              }
            }}
            className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500 text-destructive hover:text-foreground border border-red-500/20 text-xs font-bold rounded-xl transition-all cursor-pointer font-heading uppercase tracking-wider shrink-0"
          >
            Switch Households
          </button>
        </div>
      </section>

      {/* ── Invite & Remove Member Modals ────────── */}

      <RemoveMemberModal
        isOpen={memberToRemove !== null}
        onClose={() => setMemberToRemove(null)}
        member={memberToRemove}
        householdMembers={members}
      />

      <EditMemberModal
        isOpen={memberToEdit !== null}
        onClose={() => setMemberToEdit(null)}
        member={memberToEdit}
        onRemoveTrigger={(m) => setMemberToRemove(m)}
      />

      {/* ── Mode Change Confirmation Modal ──────────── */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 dark:bg-foreground/20 dark:bg-black/80 backdrop-blur-sm px-4"
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
                className="flex-1 py-3 rounded-xl bg-destructive text-foreground text-sm font-bold shadow-lg shadow-destructive/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
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

      {/* Notification Center */}
      <NotificationCenter 
        isOpen={isNotificationCenterOpen} 
        onClose={() => setIsNotificationCenterOpen(false)} 
      />

      {/* Join Household Sheet */}
      <JoinHouseholdSheet
        isOpen={isJoinSheetOpen}
        onClose={() => setIsJoinSheetOpen(false)}
      />
    </div>
  );
}
