"use client";

import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4 mt-2">
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
  );
}
