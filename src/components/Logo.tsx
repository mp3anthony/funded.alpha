"use client";

import React from "react";

interface LogoProps {
  size?: "small" | "medium" | "large";
  showWordmark?: boolean;
}

export default function Logo({ size = "medium", showWordmark = false }: LogoProps) {
  // Define dimensions based on size prop
  let iconSize = 36;
  let wordmarkWidth = 135;
  let wordmarkHeight = 36;

  if (size === "small") {
    iconSize = 24;
    wordmarkWidth = 90;
    wordmarkHeight = 24;
  } else if (size === "large") {
    iconSize = 52;
    wordmarkWidth = 195;
    wordmarkHeight = 52;
  }

  if (showWordmark) {
    return (
      <div 
        className="flex items-center select-none shrink-0 transition-transform duration-200 hover:scale-[1.03]"
        style={{ width: wordmarkWidth, height: wordmarkHeight }}
      >
        <img
          src="/logo-wordmark.svg"
          alt="Funded"
          width={wordmarkWidth}
          height={wordmarkHeight}
          className="object-contain w-full h-full"
        />
      </div>
    );
  }

  return (
    <div 
      className="flex items-center select-none shrink-0 transition-transform duration-200 hover:scale-[1.05]"
      style={{ width: iconSize, height: iconSize }}
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-[#c8ff00] fill-current"
      >
        {/* Sleek geometric lowercase 'f' */}
        <path d="M20 13H16V9.5C16 8.5 16.5 8 18 8H20V5H18C14.5 5 13 6.8 13 9.5V13H10V16H13V27H16V16H20V13Z" />
        {/* Basline circular dot '.' */}
        <circle cx="21" cy="25.5" r="2" />
      </svg>
    </div>
  );
}
