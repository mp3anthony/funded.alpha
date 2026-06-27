"use client";

import React from "react";
import AvatarDropdown from "./AvatarDropdown";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  user: { name: string; email: string; avatar: string };
  action?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, user, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="flex-1 min-w-0">
        <h1 className="font-heading text-2xl sm:text-3xl font-black text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-muted mt-1 font-sans">
            {subtitle}
          </p>
        )}
      </div>
      <div className="shrink-0 pt-0.5 flex items-center gap-3">
        {action && <div className="flex items-center">{action}</div>}
        <AvatarDropdown user={user} />
      </div>
    </div>
  );
}
