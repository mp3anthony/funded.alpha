"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import BottomNav from "@/components/BottomNav";
import Onboarding from "@/components/Onboarding";
import Logo from "./Logo";

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
      <div className="flex h-screen w-screen items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-6 animate-in fade-in duration-300">
          <Logo size="large" showWordmark={true} />
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#c8ff00] border-t-transparent" />
        </div>
      </div>
    );
  }

  // If auth resolved but there's no session, show spinner while redirect fires
  if (!session) {
    console.log('AppShell guard - showing redirecting spinner because session is null');
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-6 animate-in fade-in duration-300">
          <Logo size="large" showWordmark={true} />
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#c8ff00] border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!isOnboarded) {
    return <Onboarding />;
  }

  return (
    <div className="relative min-h-screen">
      <main className="flex-1 w-full pt-14 pb-16 flex flex-col">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
