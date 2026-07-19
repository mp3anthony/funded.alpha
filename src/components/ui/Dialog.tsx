"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   Dialog — the single "1d" popup template every modal/sheet uses.

   One shell: 20px-ish radius, header (title + X), scrollable body,
   optional footer. Destructive flows only swap the solid button colour.

   Two behaviours this MUST preserve to fit the existing app:
   • The backdrop carries the `modal-backdrop` class — AppShell's
     MutationObserver toggles body scroll-lock on its presence, and
     globals.css applies the mobile centered-card treatment to it.
   • It portals to document.body — a nested position:fixed inside the
     AppShell overflow-hidden wrapper is reclassified to absolute on iOS
     WebKit (see AGENTS.md invariant #2 and the pre-existing household
     modals that already portal for this reason).
   ───────────────────────────────────────────────────────────── */

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  /** Optional icon shown before the title (lucide element). */
  icon?: React.ReactNode;
  /** Body content. */
  children: React.ReactNode;
  /** Footer content — pass DialogButton(s); wrapped in the standard bar. */
  footer?: React.ReactNode;
  /** Panel max width. Defaults to max-w-md (matches app + globals.css cap). */
  maxWidthClass?: string;
  /** Hide the header close button (rare). */
  hideClose?: boolean;
}

export default function Dialog({
  open,
  onClose,
  title,
  icon,
  children,
  footer,
  maxWidthClass = "max-w-md",
  hideClose = false,
}: DialogProps) {
  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] modal-backdrop flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          "bg-surface border border-border-strong rounded-2xl w-full max-h-[92dvh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200",
          maxWidthClass
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
          <h3 className="text-[17px] font-bold text-foreground font-heading flex items-center gap-2 min-w-0">
            {icon}
            <span className="truncate">{title}</span>
          </h3>
          {!hideClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="p-2 -mr-2 text-muted hover:text-foreground hover:bg-surface-raised rounded-xl transition-colors shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center gap-3 p-5 border-t border-border shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

/* ── Footer button — ghost / primary / destructive ──────────────
   Ghost is the left cancel; the solid (primary or destructive) sits on
   the right. This is the only part of the shell that varies per dialog. */

type DialogButtonVariant = "ghost" | "primary" | "destructive";

interface DialogButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: DialogButtonVariant;
}

export function DialogButton({
  variant = "ghost",
  className,
  children,
  ...props
}: DialogButtonProps) {
  const styles: Record<DialogButtonVariant, string> = {
    ghost:
      "border border-border-strong text-muted hover:text-foreground hover:bg-surface-raised",
    primary:
      "bg-primary text-primary-fg hover:brightness-110 active:scale-95 shadow-lg shadow-primary/20",
    destructive:
      "bg-destructive text-destructive-fg hover:brightness-110 active:scale-95 shadow-lg shadow-destructive/20",
  };

  return (
    <button
      className={cn(
        "flex-1 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer disabled:opacity-60 disabled:pointer-events-none",
        styles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
