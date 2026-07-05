"use client";

import React from "react";
import AvatarDropdown from "./AvatarDropdown";
import Logo from "./Logo";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  user: { name: string; email: string; avatar: string };
  action?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, user, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Logo & Avatar Row */}
      <div className="flex items-center justify-between">
        <div className="shrink-0">
          <Logo size="medium" showWordmark={true} />
        </div>
        <div className="shrink-0 flex items-center gap-3">
          {action && <div className="flex items-center">{action}</div>}
          <AvatarDropdown user={user} />
        </div>
      </div>

      {/* Header Title & Subtitle */}
      <div className="min-w-0">
        <h1 className="font-syne font-extrabold text-2xl tracking-tight text-white min-w-0 truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-muted mt-1 font-sans">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
