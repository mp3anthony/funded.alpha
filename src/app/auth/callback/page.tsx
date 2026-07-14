"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import Logo from "@/components/Logo";

function getParam(name: string, search: URLSearchParams, hash: URLSearchParams) {
  return search.get(name) || hash.get(name);
}

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search.replace(/^\?/, ""));
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));

    const error =
      getParam("error", searchParams, hashParams) ||
      getParam("error_code", searchParams, hashParams) ||
      getParam("error_description", searchParams, hashParams);

    if (error) {
      router.replace("/login?error=link_expired");
      return;
    }

    // Recovery links also establish a session, but AppContext's PASSWORD_RECOVERY
    // listener owns that redirect (to /reset-password/update) — don't race it by
    // also sending recovery sessions to the dashboard from here.
    const isRecovery = getParam("type", searchParams, hashParams) === "recovery";

    let settled = false;
    const settle = (path: string) => {
      if (settled) return;
      settled = true;
      router.replace(path);
    };

    if (!isRecovery) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) settle("/");
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_IN" && session) {
          settle("/");
        }
      });

      const timeout = setTimeout(() => settle("/login?error=link_failed"), 5000);

      return () => {
        subscription.unsubscribe();
        clearTimeout(timeout);
      };
    }

    // Give Supabase a moment to process the recovery hash before giving up.
    const timeout = setTimeout(() => settle("/login?error=link_failed"), 5000);

    return () => {
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="flex-1 w-full flex items-center justify-center p-4 min-h-screen bg-background">
      <div className="w-full max-w-md bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
        <div className="flex justify-center mb-6">
          <Logo size="large" showWordmark={true} />
        </div>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-secondary" />
          <p className="text-sm text-muted">Verifying your link...</p>
        </div>
      </div>
    </div>
  );
}
