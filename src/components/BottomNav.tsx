"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, DollarSign, ListChecks, Target } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "HOME", path: "/", icon: Home },
    { name: "PAYDAY", path: "/payday", icon: DollarSign },
    { name: "BILLS", path: "/bills", icon: ListChecks },
    { name: "GOALS", path: "/funds", icon: Target },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200/50 bg-white/80 pb-safe-bottom backdrop-blur-lg dark:border-zinc-800/50 dark:bg-zinc-950/80 shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.04)]">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.name}
              href={item.path}
              className="group flex flex-1 flex-col items-center justify-center py-2 text-center transition-all duration-200 ease-in-out hover:scale-105"
            >
              <div className="relative flex flex-col items-center gap-1">
                {/* Active Indicator Dot */}
                {isActive && (
                  <span className="absolute -top-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse" />
                )}
                <Icon
                  className={`h-5 w-5 transition-colors duration-200 ${
                    isActive
                      ? "text-blue-500 dark:text-blue-400 scale-105"
                      : "text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300"
                  }`}
                />
                <span
                  className={`text-[10px] font-semibold tracking-wider transition-colors duration-200 ${
                    isActive
                      ? "text-blue-500 dark:text-blue-400 font-bold"
                      : "text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300"
                  }`}
                >
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
