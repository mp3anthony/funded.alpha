"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useApp, useCurrentUser } from "@/context/AppContext";
import BottomNav from "@/components/BottomNav";
import Onboarding from "@/components/Onboarding";
import Logo from "./Logo";
import AvatarDropdown from "./AvatarDropdown";

// NOTE: AvatarDropdown was moved here from PageHeader so it can float
// as a fixed-position element that stays visible during scrolling.

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
    <div 
      className="flex-1 flex flex-col w-full relative overflow-hidden text-white"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Floating Avatar — fixed position, always visible when authenticated */}
      {!isLoading && currentUser && (
        <div className="floating-avatar">
          <AvatarDropdown user={currentUser} />
        </div>
      )}

      {/* Main Content */}
      <main 
        className="flex-1 overflow-y-auto w-full relative z-10 transform-gpu pb-6"
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
