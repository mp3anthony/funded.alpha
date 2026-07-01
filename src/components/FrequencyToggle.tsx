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
    { value: "by-weekly", label: "By-Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
  ];

  return (
    <div className="flex w-full p-0.5 bg-[#111111] border border-white/10 rounded-lg shrink-0">
      {options.map((opt) => {
        const isSelected = selectedFrequency === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 text-center py-2 rounded-md text-[10px] sm:text-xs font-heading font-bold uppercase tracking-wider transition-all duration-200 focus:outline-none cursor-pointer ${isSelected
                ? "bg-[#c8ff00] text-black font-extrabold shadow-sm"
                : "text-neutral-400 hover:text-white hover:bg-white/[0.02]"
              }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}