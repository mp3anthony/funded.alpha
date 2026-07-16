"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import Logo from "@/components/Logo";
import AuthDebugOverlay from "@/components/AuthDebugOverlay";
import { debugLog } from "@/lib/authDebugLog";

function getParam(name: string, search: URLSearchParams, hash: URLSearchParams) {
  return search.get(name) || hash.get(name);
}

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    sessionStorage.removeItem("authDebugLog");
    debugLog(`callback mounted hash=${window.location.hash.length}chars search=${window.location.search}`);

    const searchParams = new URLSearchParams(window.location.search.replace(/^\?/, ""));
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));

    const error =
      getParam("error", searchParams, hashParams) ||
      getParam("error_code", searchParams, hashParams) ||
      getParam("error_description", searchParams, hashParams);

    if (error) {
      debugLog(`error param found: ${error}`);
      router.replace("/login?error=link_expired");
      return;
    }

    let settled = false;
    const settle = (path: string) => {
      if (settled) return;
      settled = true;
      debugLog(`settle(${path})`);
      router.replace(path);
    };

    // Trust Supabase's own auth event instead of re-parsing the URL ourselves —
    // by the time this effect runs, detectSessionInUrl may have already consumed
    // and cleared the hash, so a manual re-parse here is unreliable. The event
    // Supabase fires (PASSWORD_RECOVERY vs SIGNED_IN) is authoritative.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      debugLog(`onAuthStateChange event=${event} session=${!!session} confirmed=${session?.user?.email_confirmed_at ?? "n/a"}`);
      if (event === "PASSWORD_RECOVERY") {
        settle("/reset-password/update");
      } else if (event === "SIGNED_IN" && session) {
        sessionStorage.setItem("justVerified", "1");
        debugLog(`justVerified flag set, sessionStorage now=${sessionStorage.getItem("justVerified")}`);
        settle("/");
      }
    });

    const timeout = setTimeout(() => {
      debugLog("5s timeout fired — no SIGNED_IN/PASSWORD_RECOVERY event received");
      settle("/login?error=link_failed");
    }, 5000);

    return () => {
      subscription.unsubscribe();
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
      <AuthDebugOverlay />
    </div>
  );
}
