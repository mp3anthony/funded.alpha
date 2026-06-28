"use client";

import React, { useState } from "react";
import { Mail, Shield, X, Loader2 } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  householdId?: string;
}

export default function InviteMemberModal({ isOpen, onClose }: InviteMemberModalProps) {
  const { inviteMember } = useApp();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"owner" | "member">("member");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await inviteMember(email.trim(), role);
      setSuccess(true);
      setEmail("");
      setRole("member");
      // Close modal on success after a short delay
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err?.message || "Failed to send invitation. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h3 className="text-lg font-bold text-white font-syne">
            Invite Household Member
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-[#ff3d57]/10 border border-[#ff3d57]/20 text-[#ff3d57] text-xs font-medium">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3.5 rounded-xl bg-[#c8ff00]/10 border border-[#c8ff00]/20 text-[#c8ff00] text-xs font-bold">
                ✓ Invitation sent successfully!
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="invite-email"
                className="block text-[10px] font-bold tracking-wider uppercase text-neutral-400"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <input
                  id="invite-email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  disabled={loading || success}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white text-sm font-medium focus:ring-2 focus:ring-[#c8ff00]/30 focus:border-[#c8ff00] outline-none transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <label
                htmlFor="invite-role"
                className="block text-[10px] font-bold tracking-wider uppercase text-neutral-400"
              >
                Role
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <select
                  id="invite-role"
                  value={role}
                  disabled={loading || success}
                  onChange={(e) => setRole(e.target.value as "owner" | "member")}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white text-sm font-medium focus:ring-2 focus:ring-[#c8ff00]/30 focus:border-[#c8ff00] outline-none transition-all appearance-none disabled:opacity-50"
                >
                  <option value="member">Member</option>
                  <option value="owner">Owner</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 p-5 border-t border-white/10 font-sans">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 rounded-xl border border-white/10 text-sm font-bold text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success || !email.trim()}
              className="flex-1 py-3 rounded-xl bg-[#c8ff00] text-black text-sm font-bold hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Send Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
