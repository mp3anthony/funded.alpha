"use client";

import { CheckCircle2 } from "lucide-react";
import Dialog, { DialogButton } from "@/components/ui/Dialog";

interface EmailVerifiedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmailVerifiedModal({ isOpen, onClose }: EmailVerifiedModalProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title="Email verified!"
      maxWidthClass="max-w-sm"
      footer={
        <DialogButton variant="primary" onClick={onClose}>
          Continue to Funded
        </DialogButton>
      }
    >
      <div className="flex flex-col items-center text-center gap-4 py-2">
        <CheckCircle2 className="h-12 w-12 text-primary" />
        <p className="text-sm text-muted font-body leading-relaxed">
          Your account is ready. Let&apos;s get your household set up.
        </p>
      </div>
    </Dialog>
  );
}
