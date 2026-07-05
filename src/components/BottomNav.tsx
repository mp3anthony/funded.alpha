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
    <nav 
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      className="z-50 w-full shrink-0 transform-gpu border-t border-zinc-200/50 bg-[#111111]/85 backdrop-blur-lg dark:border-white/10 dark:bg-black/80 shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.5)]"
    >
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.name}
              href={item.path}
              className="group flex flex-1 flex-col items-center justify-center py-2.5 text-center transition-all duration-200 ease-in-out hover:scale-105"
            >
              <div className="relative flex flex-col items-center gap-1">
                {/* Active Indicator Dot */}
                {isActive && (
                  <span className="absolute -top-1.5 h-1.5 w-1.5 rounded-full bg-[#c8ff00] shadow-[0_0_8px_rgba(200,255,0,0.6)] animate-pulse" />
                )}
                <Icon
                  className={`h-5 w-5 transition-colors duration-200 ${
                    isActive
                      ? "text-[#c8ff00] scale-105"
                      : "text-zinc-500 group-hover:text-zinc-300 dark:text-zinc-500 dark:group-hover:text-zinc-300"
                  }`}
                />
                <span
                  className={`text-[10px] font-semibold tracking-wider transition-colors duration-200 ${
                    isActive
                      ? "text-[#c8ff00] font-bold"
                      : "text-zinc-500 group-hover:text-zinc-300 dark:text-zinc-500 dark:group-hover:text-zinc-300"
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
