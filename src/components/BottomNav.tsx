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
    <nav className="z-50 w-full shrink-0 border-t border-white/10 bg-black backdrop-blur-lg">
      <div 
        className="mx-auto flex max-w-md items-center justify-around px-4 pt-2"
        style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.name}
              href={item.path}
              className="group flex flex-1 flex-col items-center justify-center pb-3 pt-2 text-center transition-all duration-200 ease-in-out hover:-translate-y-1"
            >
              <div className="relative flex flex-col items-center gap-1">
                <Icon
                  className={`h-5 w-5 transition-all duration-200 ${
                    isActive
                      ? "text-[#c8ff00] scale-110 drop-shadow-[0_0_8px_rgba(200,255,0,0.6)]"
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
