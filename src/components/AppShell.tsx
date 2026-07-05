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
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);

  // Detect navigation start via click interception
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Only intercept internal links (not external, not anchors, not same page)
      if (href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:")) return;

      const targetPath = href.split("?")[0].split("#")[0];
      if (targetPath === pathname) return;

      setIsPageTransitioning(true);
    };

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, [pathname]);

  // Reset transitioning state when pathname changes with a 350ms delay to cover hydration/mounting lag
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageTransitioning(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Skip auth guards on the login and email confirmation pages
  const isLoginPage = pathname === "/login";
  const isConfirmEmailPage = pathname === "/confirm-email";
  const isResetPasswordPage = pathname?.startsWith("/reset-password");

  console.log(
    "AppShell render - isAuthLoading:",
    isAuthLoading,
    "isDataLoading:",
    isDataLoading,
    "session:",
    session ? "exists (user: " + session.user?.id + ")" : "null",
    "isOnboarded:",
    isOnboarded,
    "pathname:",
    pathname,
    "isMounted:",
    isMounted
  );

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

  // 3. Navigation/Auth Guard Redirects
  useEffect(() => {
    if (!isMounted || isAuthLoading) return;

    if (!session) {
      if (!isLoginPage && !isConfirmEmailPage && !isResetPasswordPage) {
        console.log("AppShell useEffect - triggering redirect to /login");
        router.replace("/login");
      }
    } else {
      const isConfirmed = !!session.user.email_confirmed_at;
      if (!isConfirmed) {
        if (!isConfirmEmailPage) {
          console.log("AppShell useEffect - redirecting unconfirmed user to /confirm-email");
          router.replace("/confirm-email");
        }
      } else {
        if (isConfirmEmailPage) {
          console.log("AppShell useEffect - redirecting confirmed user away from /confirm-email");
          router.replace("/");
        }
      }
    }
  }, [isMounted, isAuthLoading, session, isLoginPage, isConfirmEmailPage, isResetPasswordPage, router]);

  // Let the login, email confirmation, or reset password page render fullscreen immediately
  if (isLoginPage || isConfirmEmailPage || isResetPasswordPage) {
    return <>{children}</>;
  }

  // Navigation transition loading overlay
  if (isPageTransitioning) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black text-white z-[100] fixed inset-0">
        <div className="flex flex-col items-center gap-6 animate-in fade-in duration-300">
          <Logo size="large" showWordmark={true} />
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#c8ff00] border-t-transparent" />
        </div>
      </div>
    );
  }

  // Pre-hydration rendering path: Match server HTML to prevent flashes
  if (!isMounted) {
    if (session && isOnboarded) {
      return (
        <div 
          style={{ height: "var(--visual-viewport-height, 100dvh)" }}
          className="relative w-screen flex flex-col overflow-hidden bg-black text-white"
        >
          <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl aspect-[3/1] bg-[radial-gradient(ellipse_at_top,_rgba(200,255,0,0.15),_transparent_70%)] pointer-events-none z-0" />
          <header 
            style={{ paddingTop: "calc(env(safe-area-inset-top) + 8px)" }}
            className="w-full max-w-4xl mx-auto px-4 pb-3 flex items-center justify-between z-20 border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md shrink-0"
          >
            <Logo size="medium" showWordmark={true} />
            <AvatarDropdown user={currentUser} />
          </header>
          <main
            style={{
              paddingBottom: "calc(env(safe-area-inset-bottom) + 5.5rem)",
            }}
            className="flex-1 w-full flex flex-col relative z-10 overflow-y-auto"
          >
            <Suspense fallback={null}>
              {children}
            </Suspense>
          </main>
          <BottomNav />
        </div>
      );
    }

    return (
      <div 
        style={{ height: "var(--visual-viewport-height, 100dvh)" }}
        className="relative w-screen flex flex-col overflow-hidden bg-black text-white"
      >
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl aspect-[3/1] bg-[radial-gradient(ellipse_at_top,_rgba(200,255,0,0.15),_transparent_70%)] pointer-events-none z-0" />
        <main
          style={{
            paddingBottom: "calc(env(safe-area-inset-bottom) + 5.5rem)",
          }}
          className="flex-1 w-full flex flex-col relative z-10 overflow-y-auto"
        >
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </main>
      </div>
    );
  }

  // Post-hydration loading state: Show full-screen loader if authenticating or fetching household info
  if (isAuthLoading || (session && isDataLoading)) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-6 animate-in fade-in duration-300">
          <Logo size="large" showWordmark={true} />
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#c8ff00] border-t-transparent" />
        </div>
      </div>
    );
  }

  // If auth resolved and no session exists, show loader until redirect fires
  if (!session) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-6 animate-in fade-in duration-300">
          <Logo size="large" showWordmark={true} />
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#c8ff00] border-t-transparent" />
        </div>
      </div>
    );
  }

  // Check onboarding status
  if (!isOnboarded) {
    return <Onboarding />;
  }

  // Render normal layout
  return (
    <div 
      style={{ height: "var(--visual-viewport-height, 100dvh)" }}
      className="relative w-screen flex flex-col overflow-hidden bg-black text-white"
    >
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl aspect-[3/1] bg-[radial-gradient(ellipse_at_top,_rgba(200,255,0,0.15),_transparent_70%)] pointer-events-none z-0" />
      <header 
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 8px)" }}
        className="w-full max-w-4xl mx-auto px-4 pb-3 flex items-center justify-between z-20 border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md shrink-0"
      >
        <Logo size="medium" showWordmark={true} />
        <AvatarDropdown user={currentUser} />
      </header>
      <main
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom) + 5.5rem)",
        }}
        className="flex-1 w-full flex flex-col relative z-10 overflow-y-auto"
      >
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </main>
      <BottomNav />
    </div>
  );
}
