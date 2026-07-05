"use client";

import React from "react";

type FrequencyType = "weekly" | "by-weekly" | "monthly" | "yearly";

interface FrequencyToggleProps {
  selectedFrequency: FrequencyType;
  onChange: (frequency: FrequencyType) => void;
}

export default function FrequencyToggle({
  selectedFrequency,
  onChange,
}: FrequencyToggleProps) {
  const options: { value: FrequencyType; label: string }[] = [
    { value: "weekly", label: "Weekly" },
    { value: "by-weekly", label: "Fortnightly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
  ];

  return (
    <div className="relative w-full">
      <select
        value={selectedFrequency}
        onChange={(e) => onChange(e.target.value as FrequencyType)}
        className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-4 py-2.5 md:py-3 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all appearance-none text-sm font-semibold cursor-pointer pr-10"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-surface text-foreground">
            {opt.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted">
        <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
    </div>
  );
}