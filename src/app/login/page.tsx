"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Mail, Lock, Loader2, AlertCircle, Check, Eye, EyeOff } from "lucide-react";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Check URL query parameters for validation errors
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("error") === "confirmation_failed") {
        Promise.resolve().then(() => {
          setErrorMsg("Email confirmation failed. The link may have expired or is invalid.");
        });
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    if (mode !== "forgot" && !password) return;

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (mode === "signup") {
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
          setMode("signin");
          setEmail("");
          setPassword("");
        } else {
          router.replace("/");
        }
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace("/");
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback`,
        });
        if (error) throw error;
        setSuccessMsg("Recovery link sent! Check your email to reset your password.");
        setMode("signin");
        setEmail("");
      }
    } catch (err: any) {
      const isRateLimit = 
        err?.status === 429 || 
        err?.message?.toLowerCase().includes("rate limit") || 
        err?.message?.toLowerCase().includes("too many requests");
        
      if (isRateLimit) {
        setErrorMsg("You've reached the testing rate limit (2 emails per hour). Please wait an hour before trying again.");
      } else {
        const message = err instanceof Error ? err.message : "An error occurred";
        setErrorMsg(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo size="large" showWordmark={true} />
          </div>
          <h1 className="font-syne text-2xl font-extrabold text-foreground tracking-tight">
            {mode === "signup"
              ? "Create an account"
              : mode === "forgot"
              ? "Reset password"
              : "Welcome back"}
          </h1>
          <p className="text-sm text-muted mt-2">
            {mode === "signup"
              ? "Sign up to start managing your funds"
              : mode === "forgot"
              ? "Enter your email address to recover your account"
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
          <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-semibold flex items-center gap-3">
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

          {mode !== "forgot" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold tracking-wider uppercase text-muted">
                  Password
                </label>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setErrorMsg("");
                      setSuccessMsg("");
                    }}
                    className="text-xs text-secondary hover:underline cursor-pointer font-semibold"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-surface-raised border border-border text-foreground text-sm font-medium focus:ring-2 focus:ring-secondary/40 focus:border-secondary outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-foreground transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-secondary text-secondary-fg text-sm font-bold shadow-lg shadow-secondary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none mt-2 cursor-pointer"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
            {mode === "signup" ? "Sign Up" : mode === "forgot" ? "Send Reset Link" : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center">
          {mode === "forgot" ? (
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className="text-sm font-medium text-muted hover:text-foreground transition-colors cursor-pointer"
            >
              Back to Sign In
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className="text-sm font-medium text-muted hover:text-foreground transition-colors cursor-pointer"
            >
              {mode === "signin"
                ? "Need an account? Sign Up"
                : "Already have an account? Sign In"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
