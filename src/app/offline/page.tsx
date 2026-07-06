"use client";

import React from "react";
import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] px-4 py-8 text-center relative">
      {/* Ambient background glow */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-full max-w-2xl aspect-[3/1] bg-[radial-gradient(ellipse_at_top,_rgba(200,255,0,0.08),_transparent_70%)] pointer-events-none -z-10" />

      <div className="max-w-md w-full space-y-6 bg-surface border border-border p-8 rounded-3xl backdrop-blur-md relative overflow-hidden shadow-2xl">
        {/* Neon accent line at the top */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#c8ff00] to-transparent" />
        
        {/* Offline Icon Container */}
        <div className="mx-auto inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-primary/10 border border-primary/25 text-primary animate-pulse">
          <WifiOff className="h-9 w-9" />
        </div>

        {/* Text content */}
        <div className="space-y-3">
          <h1 className="text-2xl font-extrabold tracking-tight font-heading text-foreground">
            You are Offline
          </h1>
          <p className="text-sm text-muted leading-relaxed">
            It looks like your internet connection is unavailable right now. Don&apos;t worry—your cached data remains accessible. Connect to a network to sync your changes.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handleRetry}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-black text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:brightness-110 active:scale-[0.98] cursor-pointer"
          >
            <RefreshCw size={14} className="animate-spin-slow" />
            Check Connection
          </button>
        </div>
      </div>
    </div>
  );
}
