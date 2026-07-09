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
    <nav className="z-50 w-full shrink-0 border-t border-border bg-background/80 dark:bg-foreground/20 dark:bg-black/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-md items-center justify-around px-4 pt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.name}
              href={item.path}
              className="group flex flex-1 flex-col items-center justify-center pt-2 text-center transition-colors duration-200 ease-in-out"
              style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}
            >
              <div className="relative flex flex-col items-center gap-1">
                <Icon
                  className={`h-5 w-5 transition-all duration-200 ${
                    isActive
                      ? "text-primary scale-110 drop-shadow-[0_0_8px_rgba(200,255,0,0.6)]"
                      : "text-muted group-hover:text-foreground"
                  }`}
                />
                <span
                  className={`text-[10px] font-semibold tracking-wider transition-colors duration-200 ${
                    isActive
                      ? "text-primary font-bold"
                      : "text-muted group-hover:text-foreground"
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
