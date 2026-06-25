"use client";

import { useState } from "react";
import {
  User,
  Bell,
  Mail,
  Users,
  LogOut,
  Plus,
  X,
  Trash2,
  Save,
  Check,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

/* ── Page Component ──────────────────────────── */
export default function SettingsPage() {
  /* Context */
  const { members, addMember, removeMember } = useApp();

  /* Profile */
  const [fullName, setFullName] = useState("Ant");
  const [email, setEmail] = useState("ant@funded.com");
  const [profileSaved, setProfileSaved] = useState(false);

  /* Preferences */
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);

  /* Invite modal */
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  /* ── Handlers ──────────────────────────────── */
  function handleProfileSave() {
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  }

  function handleInvite() {
    if (!inviteEmail.trim()) return;
    const name = inviteEmail.split("@")[0];
    addMember({
      id: Date.now(), // placeholder, Supabase will assign real UUID
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email: inviteEmail.trim(),
      role: "member",
      avatar: name.charAt(0).toUpperCase(),
    });
    setInviteEmail("");
    setShowInvite(false);
  }

  function handleRemoveMember(id: string | number) {
    removeMember(id);
  }

  /* ── Render ────────────────────────────────── */
  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 sm:px-6 md:py-12 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-sm text-muted mt-1">
          Customize your application and account preferences.
        </p>
      </div>

      {/* ── Profile Section ──────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-subtle uppercase tracking-wider px-1">
          Profile
        </h2>

        <div className="bg-surface border border-border rounded-2xl shadow-sm p-5 sm:p-6 space-y-5">
          {/* Avatar + badge row */}
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-secondary to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md shrink-0">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                {fullName || "Your Name"}
              </h3>
              <span className="inline-block text-[10px] font-bold text-secondary uppercase tracking-wider bg-secondary/10 px-2 py-0.5 rounded-md mt-1">
                Funded Premium
              </span>
            </div>
          </div>

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

        <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden divide-y divide-border">
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
            members.map((member) => (
              <div
                key={member.id}
                className="group p-4 sm:p-5 flex items-center justify-between hover:bg-surface-raised transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                    {member.avatar}
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-foreground">
                      {member.name}
                    </h4>
                    <p className="text-xs text-muted mt-0.5">{member.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveMember(member.id)}
                  aria-label={`Remove ${member.name}`}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-muted hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── Log Out ──────────────────────────────── */}
      <div className="pt-2 pb-4">
        <button className="w-full bg-destructive text-destructive-fg py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-destructive/20 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer">
          <LogOut className="h-4 w-4" />
          <span>Log Out</span>
        </button>
      </div>

      {/* ── Invite Member Modal ──────────────────── */}
      {showInvite && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={() => setShowInvite(false)}
        >
          <div
            className="bg-surface border border-border rounded-3xl w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">
                Invite Member
              </h3>
              <button
                onClick={() => setShowInvite(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-surface-raised transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-5 space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="invite-email"
                  className="block text-xs font-bold tracking-wider uppercase text-muted"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
                  <input
                    id="invite-email"
                    type="email"
                    placeholder="name@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-raised border border-border text-foreground text-sm font-medium focus:ring-2 focus:ring-secondary/40 focus:border-secondary outline-none transition-all"
                  />
                </div>
              </div>

              <p className="text-xs text-muted">
                They&apos;ll receive an invite to join your household and share
                bills, goals, and budgets.
              </p>
            </div>

            {/* Modal footer */}
            <div className="flex items-center gap-3 p-5 border-t border-border">
              <button
                onClick={() => setShowInvite(false)}
                className="flex-1 py-3 rounded-xl border border-border text-sm font-bold text-muted hover:text-foreground hover:bg-surface-raised transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={!inviteEmail.trim()}
                className="flex-1 py-3 rounded-xl bg-secondary text-secondary-fg text-sm font-bold shadow-lg shadow-secondary/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
