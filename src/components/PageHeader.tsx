"use client";

import React from "react";
import Logo from "./Logo";
import AvatarDropdown from "./AvatarDropdown";
import { useCurrentUser } from "@/context/AppContext";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  const currentUser = useCurrentUser();

  return (
    <div className="flex flex-col w-full mb-4 mt-2 space-y-4">
      {/* Top Row: Logo & Avatar */}
      <div className="flex items-center justify-between w-full">
        <Logo size="medium" showWordmark={true} />
        <div className="shrink-0 flex items-center relative z-50">
          {currentUser && <AvatarDropdown user={currentUser} />}
        </div>
      </div>
      
      {/* Title & Subtitle */}
      <div className="flex items-center justify-between">
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
        {action && <div className="shrink-0 flex items-center">{action}</div>}
      </div>
    </div>
  );
}
