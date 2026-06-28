"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Mail, Lock, Loader2, AlertCircle, Check } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Check URL query parameters for validation errors
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("error") === "confirmation_failed") {
        setErrorMsg("Email confirmation failed. The link may have expired or is invalid.");
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        
        if (error) throw error;

        // If email confirmation is required, session will be null
        if (data.user && !data.session) {
          setSuccessMsg("Please check your email to confirm your account before logging in.");
          setIsSignUp(false);
          setEmail("");
          setPassword("");
        } else {
          router.replace("/");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace("/");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="h-12 w-12 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="font-syne text-2xl font-extrabold text-white tracking-tight">
            {isSignUp ? "Create an account" : "Welcome back"}
          </h1>
          <p className="text-sm text-muted mt-2">
            {isSignUp
              ? "Sign up to start managing your funds"
              : "Sign in to your account to continue"}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-[#c8ff00]/10 border border-[#c8ff00]/20 text-[#c8ff00] text-sm font-semibold flex items-center gap-3">
            <Check className="h-5 w-5 shrink-0" />
            <p>{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-bold tracking-wider uppercase text-muted">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-raised border border-border text-foreground text-sm font-medium focus:ring-2 focus:ring-secondary/40 focus:border-secondary outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold tracking-wider uppercase text-muted">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-raised border border-border text-foreground text-sm font-medium focus:ring-2 focus:ring-secondary/40 focus:border-secondary outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-secondary text-secondary-fg text-sm font-bold shadow-lg shadow-secondary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none mt-2"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className="text-sm font-medium text-muted hover:text-foreground transition-colors"
          >
            {isSignUp
              ? "Already have an account? Sign In"
              : "Need an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
