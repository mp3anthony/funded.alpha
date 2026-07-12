"use client";

import React, { useState, useEffect } from "react";
import { X, User, Shield, Trash2, Loader2, Check } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { type Member } from "@/types";

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onRemoveTrigger: (member: Member) => void;
}

export default function EditMemberModal({
  isOpen,
  onClose,
  member,
  onRemoveTrigger,
}: EditMemberModalProps) {
  const { updateMember } = useApp();
  const [name, setName] = useState("");
  const [role, setRole] = useState<'owner' | 'member'>('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (member) {
      setName(member.name);
      setRole(member.role);
      setError(null);
      setSuccess(false);
    }
  }, [member, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.classList.add("modal-open");
    return () => {
      const activeModals = document.querySelectorAll(".modal-backdrop");
      if (activeModals.length <= 1) {
        document.body.classList.remove("modal-open");
      }
    };
  }, [isOpen]);

  if (!isOpen || !member) return null;

  // Determine if the name is editable by the owner 
  // (editable if they haven't set their own custom name in their profile yet, i.e., user_id is null or name is email prefix)
  const emailPrefix = member.email ? member.email.split("@")[0] : "";
  const isNameEditable = !member.user_id || member.name === emailPrefix;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!member) return;
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const updateData: Partial<Omit<Member, "id">> = {};
      if (isNameEditable && name.trim() && name !== member.name) {
        updateData.name = name.trim();
      }
      if (role !== member.role) {
        updateData.role = role;
      }

      if (Object.keys(updateData).length > 0) {
        await updateMember(member.id, updateData);
      }
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err?.message || "Failed to update member settings.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] modal-backdrop flex items-center justify-center bg-foreground/20 dark:bg-foreground/20 dark:bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-2xl w-full max-w-md max-h-[92dvh] flex flex-col shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
          <h3 className="text-lg font-bold text-foreground font-heading flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Edit Member Settings
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5 md:space-y-6 font-body">
            {error && (
              <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-medium flex items-center gap-2">
                <Check className="h-4 w-4" />
                Changes saved successfully!
              </div>
            )}

            {/* Member Info */}
            <div className="flex items-center gap-3 pb-4 border-b border-border-strong">
              <div className="h-10 w-10 rounded-xl overflow-hidden bg-gradient-to-tr from-primary to-emerald-500 flex items-center justify-center text-foreground font-bold text-sm shadow-sm shrink-0">
                {member.avatar_url ? (
                  <img src={member.avatar_url} alt={member.name} className="h-full w-full object-cover" />
                ) : (
                  member.avatar
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">{member.name}</h4>
                <p className="text-xs text-muted">{member.email}</p>
              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <label htmlFor="member-name" className="block text-xs font-bold tracking-wider uppercase text-muted">
                Display Name
              </label>
              <input
                id="member-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isNameEditable}
                className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-foreground text-sm font-medium focus:ring-2 focus:ring-[#c8ff00]/30 focus:border-primary outline-none transition-all disabled:opacity-50"
              />
              {!isNameEditable && (
                <p className="text-[10px] text-subtle leading-normal">
                  This member has set their own profile name. It cannot be modified by other users.
                </p>
              )}
            </div>

            {/* Role Select */}
            <div className="space-y-2">
              <label className="block text-xs font-bold tracking-wider uppercase text-muted">
                Household Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('member')}
                  className={`py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                    role === 'member'
                      ? 'bg-white/5 border-white/20 text-foreground'
                      : 'bg-transparent border-border-strong text-subtle hover:text-foreground'
                  }`}
                >
                  Member
                </button>
                <button
                  type="button"
                  onClick={() => setRole('owner')}
                  className={`py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border flex items-center justify-center gap-1.5 ${
                    role === 'owner'
                      ? 'bg-primary/10 border-primary/20 text-primary'
                      : 'bg-transparent border-border-strong text-subtle hover:text-foreground'
                  }`}
                >
                  <Shield className="h-3.5 w-3.5" />
                  Owner
                </button>
              </div>
              {role === 'owner' && member.role !== 'owner' && (
                <p className="text-[10px] text-primary leading-normal font-body">
                  Promoting this member to Owner grants them full administrative control, including the ability to manage other members and edit household configurations.
                </p>
              )}
            </div>

            {/* Remove Action Button */}
            {member.role !== 'owner' && (
              <div className="pt-4 border-t border-border-strong flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-destructive uppercase tracking-wider">Remove Member</h4>
                  <p className="text-[10px] text-subtle mt-0.5 leading-normal">Revoke access and reassign their data.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onRemoveTrigger(member);
                    onClose();
                  }}
                  className="px-3 py-2 rounded-xl bg-destructive/10 hover:bg-destructive text-destructive hover:text-foreground border border-destructive/20 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer font-heading uppercase tracking-wider"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 p-5 border-t border-border font-body shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 rounded-xl border border-border text-sm font-bold text-muted hover:text-foreground hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (name === member.name && role === member.role)}
              className="flex-1 py-3 rounded-xl bg-primary text-black text-sm font-bold hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-1.5 cursor-pointer font-heading uppercase tracking-wider"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin text-black" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
