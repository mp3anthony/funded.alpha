"use client";

import React from "react";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ConfirmEmailPage() {
  const { session } = useApp();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const handleBackToLogin = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (err) {
      console.error("Sign out failed:", err);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const userEmail = session?.user?.email || "your email address";

  return (
    <div className="flex-1 w-full flex items-center justify-center p-4 min-h-[80vh]">
      <div className="w-full max-w-md bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
        <div className="h-16 w-16 bg-[#c8ff00]/10 text-[#c8ff00] rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-[#c8ff00]/5 animate-pulse">
          <Mail className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="font-syne font-extrabold text-2xl tracking-tight text-white">
            Confirm Your Email
          </h1>
          <p className="text-sm text-neutral-300 leading-relaxed font-sans max-w-xs mx-auto">
            We sent a verification link to <strong className="text-white">{userEmail}</strong>. Please check your inbox and confirm your account.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-neutral-500 font-mono leading-relaxed max-w-xs mx-auto">
          Once confirmed, you will be redirected automatically to the household dashboard. If you don't receive it, please check your spam folder.
        </div>

        <button
          onClick={handleBackToLogin}
          disabled={loading}
          className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 text-sm font-bold text-neutral-400 hover:text-white hover:bg-white/5 transition-all duration-200 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowLeft className="h-4 w-4" />
          )}
          Back to Sign In
        </button>
      </div>
    </div>
  );
}
