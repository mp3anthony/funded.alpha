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

  // Skip auth guards on the login and email confirmation pages
  const isLoginPage = pathname === "/login";
  const isConfirmEmailPage = pathname === "/confirm-email";

  console.log('AppShell render - isAuthLoading:', isAuthLoading, 'session:', session ? 'exists (user: ' + session.user?.id + ')' : 'null', 'isOnboarded:', isOnboarded, 'pathname:', pathname);

  // 1. Manage Visual Viewport (for mobile keyboard support)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateVisualViewport = () => {
      const vv = window.visualViewport;
      if (vv) {
        document.documentElement.style.setProperty(
          "--visual-viewport-height",
          `${vv.height}px`
        );
        document.documentElement.style.setProperty(
          "--visual-viewport-offsetTop",
          `${vv.offsetTop}px`
        );
      } else {
        document.documentElement.style.setProperty(
          "--visual-viewport-height",
          `${window.innerHeight}px`
        );
        document.documentElement.style.setProperty(
          "--visual-viewport-offsetTop",
          "0px"
        );
      }
    };

    updateVisualViewport();

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", updateVisualViewport);
      window.visualViewport.addEventListener("scroll", updateVisualViewport);
    } else {
      window.addEventListener("resize", updateVisualViewport);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", updateVisualViewport);
        window.visualViewport.removeEventListener("scroll", updateVisualViewport);
      } else {
        window.removeEventListener("resize", updateVisualViewport);
      }
    };
  }, []);

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

  useEffect(() => {
    if (isAuthLoading) return;

    if (!session) {
      if (!isLoginPage && !isConfirmEmailPage) {
        console.log('AppShell useEffect - triggering redirect to /login');
        router.replace("/login");
      }
    } else {
      const isConfirmed = !!session.user.email_confirmed_at;
      if (!isConfirmed) {
        if (!isConfirmEmailPage) {
          console.log('AppShell useEffect - redirecting unconfirmed user to /confirm-email');
          router.replace("/confirm-email");
        }
      } else {
        if (isConfirmEmailPage) {
          console.log('AppShell useEffect - redirecting confirmed user away from /confirm-email');
          router.replace("/");
        }
      }
    }
  }, [isAuthLoading, session, isLoginPage, isConfirmEmailPage, router]);

  // Let the login or email confirmation page render fullscreen
  if (isLoginPage || isConfirmEmailPage) {
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
      <main 
        style={{ 
          paddingTop: "calc(env(safe-area-inset-top) + 3.5rem)", 
          paddingBottom: "calc(env(safe-area-inset-bottom) + 5rem)" 
        }}
        className="flex-1 w-full flex flex-col"
      >
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
