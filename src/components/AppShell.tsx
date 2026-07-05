"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useApp, useCurrentUser } from "@/context/AppContext";
import BottomNav from "@/components/BottomNav";
import Onboarding from "@/components/Onboarding";
import Logo from "./Logo";
import AvatarDropdown from "./AvatarDropdown";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    Promise.resolve().then(() => {
      setIsMounted(true);
    });
  }, []);

  return <AppShellBody isMounted={isMounted}>{children}</AppShellBody>;
}

function AppShellBody({ children, isMounted }: { children: React.ReactNode; isMounted: boolean }) {
  const { isOnboarded, session, isAuthLoading, isDataLoading } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const currentUser = useCurrentUser();

  // Skip auth guards on the login and email confirmation pages
  const isLoginPage = pathname === "/login";
  const isConfirmEmailPage = pathname === "/confirm-email";
  const isResetPasswordPage = pathname?.startsWith("/reset-password");

  // 2. Global Scroll Lock (MutationObserver)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateScrollLock = () => {
      const activeModals = document.querySelectorAll(".modal-backdrop");
      if (activeModals.length > 0) {
        document.body.classList.add("modal-open");
        document.documentElement.classList.add("modal-open");
      } else {
        document.body.classList.remove("modal-open");
        document.documentElement.classList.remove("modal-open");
      }
    };

    updateScrollLock();

    const observer = new MutationObserver(() => {
      updateScrollLock();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      document.body.classList.remove("modal-open");
      document.documentElement.classList.remove("modal-open");
    };
  }, []);

  // 3. Navigation/Auth Guard Redirects
  useEffect(() => {
    if (!isMounted || isAuthLoading) return;

    if (!session) {
      if (!isLoginPage && !isConfirmEmailPage && !isResetPasswordPage) {
        router.replace("/login");
      }
    } else {
      const isConfirmed = !!session.user.email_confirmed_at;
      if (!isConfirmed) {
        if (!isConfirmEmailPage) {
          router.replace("/confirm-email");
        }
      } else {
        if (isConfirmEmailPage) {
          router.replace("/");
        }
      }
    }
  }, [isMounted, isAuthLoading, session, isLoginPage, isConfirmEmailPage, isResetPasswordPage, router]);

  // Let the login, email confirmation, or reset password page render fullscreen immediately
  if (isLoginPage || isConfirmEmailPage || isResetPasswordPage) {
    return <>{children}</>;
  }

  // If fully loaded and we know user is not onboarded, show Onboarding
  if (isMounted && !isAuthLoading && session && !isOnboarded) {
    return <Onboarding />;
  }

  // Define loading state for the main content area
  const isLoading = !isMounted || isAuthLoading || (session && isDataLoading) || !session;

  return (
    <div className="flex-1 flex flex-col w-full relative overflow-hidden text-white">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[350px] aspect-square bg-[radial-gradient(ellipse_at_left,_rgba(200,255,0,0.12),_transparent_70%)] pointer-events-none z-0" />
      
      {/* Header */}
      {(!isLoading || session) && (
        <header 
          style={{ paddingTop: "env(safe-area-inset-top)" }}
          className="w-full max-w-4xl mx-auto px-4 pb-3 flex items-center justify-between z-20 border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md shrink-0 relative"
        >
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[linear-gradient(to_left,_rgba(200,255,0,0.22),_transparent)] pointer-events-none z-0" />
          <div className="relative z-10">
            <Logo size="medium" showWordmark={true} />
          </div>
          <div className="relative z-10">
            {currentUser && <AvatarDropdown user={currentUser} />}
          </div>
        </header>
      )}

      {/* Main Content */}
      <main 
        className="flex-1 overflow-y-auto w-full relative z-10 transform-gpu"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {isLoading ? (
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex flex-col items-center gap-6 animate-in fade-in duration-300">
              <Logo size="large" showWordmark={true} />
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#c8ff00] border-t-transparent" />
            </div>
          </div>
        ) : (
          <Suspense fallback={null}>
            {children}
          </Suspense>
        )}
      </main>

      {/* Bottom Nav */}
      {(!isLoading || session) && <BottomNav />}
    </div>
  );
}
