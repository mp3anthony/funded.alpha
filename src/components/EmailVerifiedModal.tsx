"use client";

import { CheckCircle2 } from "lucide-react";

interface EmailVerifiedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmailVerifiedModal({ isOpen, onClose }: EmailVerifiedModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] modal-backdrop flex items-center justify-center bg-foreground/20 dark:bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-2xl w-full max-w-sm shadow-2xl transform transition-all animate-in fade-in zoom-in duration-200 p-6 sm:p-8 flex flex-col items-center text-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <CheckCircle2 className="h-12 w-12 text-primary" />
        <h3 className="text-lg font-bold text-foreground font-heading">Email verified!</h3>
        <p className="text-sm text-muted font-body leading-relaxed">
          Your account is ready. Let&apos;s get your household set up.
        </p>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-primary text-primary-fg text-sm font-bold hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
        >
          Continue to Funded
        </button>
      </div>
    </div>
  );
}
