"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { createPortal } from "react-dom";
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
  Copy,
  CreditCard,
  Settings2,
  RefreshCw,
  LogOut,
  ChevronRight,
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

  /* Modal States */
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAppSettingsModal, setShowAppSettingsModal] = useState(false);
  const [showHouseholdSettingsModal, setShowHouseholdSettingsModal] = useState(false);
  const [showHouseholdMembersModal, setShowHouseholdMembersModal] = useState(false);

  /* Deep-link: open the Profile modal when arriving via /settings?modal=profile
     (e.g. from the avatar-dropdown name button). Reactive to the query param so
     it also fires when already on /settings (a same-route soft navigation does
     not remount this component); the flag is stripped once consumed so a refresh
     or back-nav doesn't re-open it. Mirrors the billId pattern in BillCard. */
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (searchParams?.get("modal") !== "profile") return;
    setShowProfileModal(true);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("modal");
    const newQuery = params.toString();
    router.replace(`${pathname}${newQuery ? `?${newQuery}` : ""}`, { scroll: false });
  }, [searchParams, pathname, router]);

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
  const [isDirty, setIsDirty] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (currentMember) {
      setFullName(currentMember.name);
      setEmail(currentMember.email);
    } else if (session?.user) {
      setFullName(session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "");
      setEmail(session.user.email || "");
    }
  }, [currentMember, session]);

  useEffect(() => {
    if (currentMember) {
      if (fullName !== currentMember.name || email !== currentMember.email) {
        setIsDirty(true);
      } else {
        setIsDirty(false);
      }
    } else if (session?.user) {
        const defaultName = session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "";
        const defaultEmail = session.user.email || "";
        if (fullName !== defaultName || email !== defaultEmail) {
            setIsDirty(true);
        } else {
            setIsDirty(false);
        }
    }
  }, [fullName, email, currentMember, session]);

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
    setIsDirty(false);
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

  function handleCopyJoinCode() {
    if (joinCode) {
      navigator.clipboard.writeText(joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  /* ── Render ────────────────────────────────── */
  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 pt-4 pb-8 sm:px-6 md:pt-6 md:pb-12 space-y-8">
      <PageHeader
        title="Settings"
        subtitle="Manage your account and household preferences"
      />

            {/* ── Settings Menu ──────────────────────── */}
      <section className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden divide-y divide-border">
        <button
          onClick={() => setShowProfileModal(true)}
          className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-surface-raised transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 rounded-xl bg-primary/10 text-primary items-center justify-center shrink-0">
              <User className="h-5 w-5" />
            </div>
            <span className="font-bold text-sm sm:text-base text-foreground">Profile</span>
          </div>
          <ChevronRight className="h-5 w-5 text-muted" />
        </button>

        <button
          onClick={() => setShowAppSettingsModal(true)}
          className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-surface-raised transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 rounded-xl bg-accent/10 text-accent items-center justify-center shrink-0">
              <Settings2 className="h-5 w-5" />
            </div>
            <span className="font-bold text-sm sm:text-base text-foreground">App Settings</span>
          </div>
          <ChevronRight className="h-5 w-5 text-muted" />
        </button>

        <button
          onClick={() => setShowHouseholdSettingsModal(true)}
          className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-surface-raised transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 rounded-xl bg-accent/10 text-accent items-center justify-center shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <span className="font-bold text-sm sm:text-base text-foreground">Household Settings</span>
          </div>
          <ChevronRight className="h-5 w-5 text-muted" />
        </button>

        <button
          onClick={() => setShowHouseholdMembersModal(true)}
          className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-surface-raised transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 items-center justify-center shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <span className="font-bold text-sm sm:text-base text-foreground">Household Members</span>
          </div>
          <ChevronRight className="h-5 w-5 text-muted" />
        </button>
      </section>

{/* ── Danger Zone Section ────────────── */}
      <section className="bg-destructive/5 border border-destructive/20 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 rounded-xl bg-destructive/10 text-destructive items-center justify-center shrink-0">
              <LogOut className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-destructive">
                Switch Households
              </h4>
              <p className="text-xs text-muted mt-0.5">
                Leave current household and join another.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (confirm("WARNING: This will permanently delete your current household data (if you are the owner) or remove your membership (if you are a member). You cannot undo this. Are you sure you want to continue?")) {
                setIsJoinSheetOpen(true);
              }
            }}
            className="px-4 py-2 bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            Leave Household
          </button>
        </div>
      </section>

      {/* ── Version & Credits ────────── */}
      <section className="bg-white/[0.02] border border-border/40 rounded-2xl p-5 mt-8">
        <div className="flex flex-col items-center justify-center text-center">
          <p className="text-muted font-body text-xs tracking-wider leading-loose opacity-50">
            Built with AI &bull; funded. v0.7.1
          </p>
          <p className="text-muted font-body text-xs tracking-wider opacity-40">
            Concept &amp; Development: Anthony Paull
          </p>
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
               <h3 className="text-lg font-bold text-foreground font-heading">
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


      {/* ── Profile Modal ────────── */}
      {showProfileModal && (
        <div
          className="fixed inset-0 z-[100] modal-backdrop flex items-center justify-center bg-foreground/20 dark:bg-foreground/20 dark:bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowProfileModal(false)}
        >
          <div
            className="bg-surface border border-border rounded-2xl w-full max-w-md max-h-[92dvh] flex flex-col shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
              <h3 className="text-lg font-bold text-foreground font-heading flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile
              </h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-2 -mr-2 text-muted hover:text-foreground hover:bg-surface-raised rounded-xl transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-5 space-y-4">
              <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-6">
          {/* Avatar Upload (Compact) */}
          <div className="shrink-0 flex justify-center sm:justify-start">
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
          </div>

          {/* Form Fields */}
          <div className="flex-1 flex flex-col sm:flex-row gap-4">
            {/* Nickname */}
            <div className="flex-1 space-y-2">
              <label
                htmlFor="settings-name"
                className="block text-[10px] font-bold tracking-wider uppercase text-muted"
              >
                Nickname
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
                <input
                  id="settings-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-raised border border-border text-foreground text-sm font-medium focus:ring-2 focus:ring-secondary/40 focus:border-secondary outline-none transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex-1 space-y-2">
              <label
                htmlFor="settings-email"
                className="block text-[10px] font-bold tracking-wider uppercase text-muted"
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
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-raised border border-border text-foreground text-sm font-medium focus:ring-2 focus:ring-secondary/40 focus:border-secondary outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Save button (Only show when dirty or saved) */}
          <div className="shrink-0 flex justify-end">
            {(isDirty || profileSaved) && (
              <button
                onClick={handleProfileSave}
                disabled={profileSaved}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  profileSaved
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    : "bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary hover:text-secondary-fg cursor-pointer"
                }`}
              >
                {profileSaved ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    Save
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      
            </div>
          </div>
        </div>
      )}

      {/* ── App Settings Modal ────────── */}
      {showAppSettingsModal && (
        <div
          className="fixed inset-0 z-[100] modal-backdrop flex items-center justify-center bg-foreground/20 dark:bg-foreground/20 dark:bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowAppSettingsModal(false)}
        >
          <div
            className="bg-surface border border-border rounded-2xl w-full max-w-md max-h-[92dvh] flex flex-col shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
              <h3 className="text-lg font-bold text-foreground font-heading flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-accent" />
                App Settings
              </h3>
              <button
                onClick={() => setShowAppSettingsModal(false)}
                className="p-2 -mr-2 text-muted hover:text-foreground hover:bg-surface-raised rounded-xl transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-5 space-y-4">
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
              Open
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
            <div className="relative shrink-0 w-full sm:w-44 flex justify-end">
              <div className="relative w-full sm:w-36">
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as "light" | "dark" | "system")}
                  className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-bold text-foreground focus:border-primary focus:outline-none appearance-none cursor-pointer pr-8 capitalize tracking-wider"
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
        </div>
      
            </div>
          </div>
        </div>
      )}

      {/* ── Household Settings Modal ────────── */}
      {/* Portaled to document.body — nested position:fixed inside the AppShell overflow-hidden wrapper gets reclassified as absolute on iOS WebKit */}
      {showHouseholdSettingsModal && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[100] modal-backdrop flex items-center justify-center bg-foreground/20 dark:bg-foreground/20 dark:bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowHouseholdSettingsModal(false)}
        >
          <div
            className="bg-surface border border-border rounded-2xl w-full max-w-md max-h-[92dvh] flex flex-col shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
              <h3 className="text-lg font-bold text-foreground font-heading flex items-center gap-2">
                <Users className="h-5 w-5 text-accent" />
                Household Settings
              </h3>
              <button
                onClick={() => setShowHouseholdSettingsModal(false)}
                className="p-2 -mr-2 text-muted hover:text-foreground hover:bg-surface-raised rounded-xl transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-5 space-y-4">
              <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden divide-y divide-border">
          
          {/* Joint Fund Features (Only show if Joint Fund enabled) */}
          {isJointFund && (
            <>
              {/* Contribution Amounts */}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 rounded-xl bg-primary/10 text-primary items-center justify-center shrink-0">
                    <Save className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-foreground">
                      Contribution Amounts
                    </h4>
                    <p className="text-xs text-muted mt-0.5">
                      Fixed amounts members pay into the joint fund.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsContributionOpen(true)}
                  className="px-4 py-2 bg-surface-raised border border-border rounded-xl text-xs font-bold text-foreground hover:bg-white/5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  Configure
                </button>
              </div>

              {/* Automation Rules */}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 items-center justify-center shrink-0">
                    <Settings2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-foreground">
                      Automation Rules
                    </h4>
                    <p className="text-xs text-muted mt-0.5">
                      Automatically allocate excess pay above a threshold.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-3 shrink-0">
                  {contributionRules.filter(r => r.is_active).length > 0 && (
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                      {contributionRules.filter(r => r.is_active).length} Active
                    </span>
                  )}
                  <button
                    onClick={() => setIsRulesOpen(true)}
                    className="w-full flex-1 sm:flex-none sm:w-auto px-4 py-2 bg-surface-raised border border-border rounded-xl text-xs font-bold text-foreground hover:bg-white/5 transition-colors cursor-pointer whitespace-nowrap text-center"
                  >
                    Manage
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Join Code */}
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 rounded-xl bg-accent/10 text-accent items-center justify-center shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-foreground">
                  Join Code
                </h4>
                <p className="text-xs text-muted mt-0.5">
                  Share this code to invite members.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col w-full sm:w-auto shrink-0 gap-1.5 mt-2 sm:mt-0">
              {joinCode ? (
                <>
                  <span className="text-[10px] text-muted font-body uppercase font-bold self-start sm:self-end px-1">
                    Expires {codeExpiresAt ? new Date(codeExpiresAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ""}
                  </span>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="flex-1 sm:flex-none flex items-center justify-center bg-background border border-border h-9 px-4 rounded-xl">
                      <span className="text-primary font-mono text-sm font-bold tracking-widest uppercase">
                        {joinCode}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyJoinCode}
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors border cursor-pointer ${
                        copied 
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                          : "bg-surface-raised text-muted border-border hover:text-foreground hover:bg-white/5"
                      }`}
                      title="Copy Join Code"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await regenerateJoinCode();
                        } catch (err: any) {
                          alert(err.message || "Failed to generate code.");
                        }
                      }}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors border border-border bg-surface-raised text-muted hover:text-foreground hover:bg-white/5 cursor-pointer"
                      title="Regenerate Code"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 self-start sm:self-end">
                  <span className="text-muted text-xs font-body mr-2">No code</span>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await regenerateJoinCode();
                      } catch (err: any) {
                        alert(err.message || "Failed to generate code.");
                      }
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors border border-border bg-surface-raised text-muted hover:text-foreground hover:bg-white/5 cursor-pointer"
                    title="Generate Code"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Payment Mode */}
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 items-center justify-center shrink-0">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-foreground">
                  Payment Mode
                </h4>
                <p className="text-xs text-muted mt-0.5">
                  How bill splits are settled (Direct or Joint).
                </p>
              </div>
            </div>
            <div className="shrink-0 flex justify-end">
              <PaymentModeToggle
                currentMode={tempMode !== null ? tempMode : isJointFund}
                onModeChange={handleModeChangeClick}
                compact={true}
              />
            </div>
          </div>
        </div>
      
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Household Members Modal ────────── */}
      {/* Portaled to document.body — same overflow-hidden containment issue as the Household Settings modal above */}
      {showHouseholdMembersModal && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[100] modal-backdrop flex items-center justify-center bg-foreground/20 dark:bg-foreground/20 dark:bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowHouseholdMembersModal(false)}
        >
          <div
            className="bg-surface border border-border rounded-2xl w-full max-w-md max-h-[92dvh] flex flex-col shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
              <h3 className="text-lg font-bold text-foreground font-heading flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-500" />
                Household Members
              </h3>
              <button
                onClick={() => setShowHouseholdMembersModal(false)}
                className="p-2 -mr-2 text-muted hover:text-foreground hover:bg-surface-raised rounded-xl transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-5 space-y-4">
              <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden divide-y divide-border font-body">
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
                  className="group p-4 flex items-center justify-between hover:bg-surface-raised transition-colors"
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
                        <h4 className="text-sm font-bold text-foreground">
                          {member.name}
                        </h4>
                        {/* Role Badges */}
                        {isOwner ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 font-heading">
                            Owner
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/5 text-muted border border-border font-heading">
                            Member
                          </span>
                        )}
                        {/* Invitation Status Badge */}
                        {isPending && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20 font-heading">
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
                      className="flex h-8 w-8 items-center justify-center rounded-xl text-muted hover:text-primary hover:bg-primary/10 transition-colors border border-border-strong bg-foreground/5 cursor-pointer"
                    >
                      <UserCog className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      
    </div>
  );
}
