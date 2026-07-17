"use client";

import React from "react";
import Link from "next/link";
import Logo from "./Logo";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col w-full mb-4 mt-2 space-y-4">
      {/* Top Row: Logo (Avatar is now a floating element in AppShell) */}
      <div className="flex items-center justify-between w-full">
        <Link
          href="/"
          prefetch={false}
          aria-label="Go to dashboard"
          className="inline-flex items-center -m-2 p-2 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <Logo size="medium" showWordmark={true} />
        </Link>
      </div>
      
      {/* Title & Subtitle */}
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="font-heading font-extrabold text-2xl tracking-tight text-foreground min-w-0 truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-muted mt-1 font-body">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="shrink-0 flex items-center">{action}</div>}
      </div>
    </div>
  );
}

