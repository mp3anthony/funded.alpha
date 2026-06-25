"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import BottomNav from "@/components/BottomNav";
import Onboarding from "@/components/Onboarding";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isOnboarded, session, isAuthLoading } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  // Skip all auth guards on the login page — it handles its own auth
  const isLoginPage = pathname === "/login";

  console.log('AppShell render - isAuthLoading:', isAuthLoading, 'session:', session ? 'exists (user: ' + session.user?.id + ')' : 'null', 'isOnboarded:', isOnboarded, 'pathname:', pathname);

  useEffect(() => {
    if (!isAuthLoading && !session && !isLoginPage) {
      console.log('AppShell useEffect - triggering redirect to /login');
      router.replace("/login");
    }
  }, [isAuthLoading, session, isLoginPage, router]);

  // Let the login page render without any auth guards
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Show loading spinner while auth is resolving
  if (isAuthLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-400 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  // If auth resolved but there's no session, show spinner while redirect fires
  if (!session) {
    console.log('AppShell guard - showing redirecting spinner because session is null');
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-400 animate-pulse">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (!isOnboarded) {
    return <Onboarding />;
  }

  return (
    <>
      <main className="flex-1 w-full pb-16 flex flex-col">
        {children}
      </main>
      <BottomNav />
    </>
  );
}
