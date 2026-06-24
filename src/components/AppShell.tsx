"use client";

import { useApp } from "@/context/AppContext";
import BottomNav from "@/components/BottomNav";
import Onboarding from "@/components/Onboarding";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isOnboarded } = useApp();

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
