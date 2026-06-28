"use client";

import React from "react";
import { X, Calendar, Target, Award, Play, Pause, Check } from "lucide-react";
import type { Fund } from "@/context/AppContext";

interface GoalDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Fund | null;
  onEdit: () => void;
  onDelete: () => void;
}

export default function GoalDetailSheet({
  isOpen,
  onClose,
  goal,
  onEdit,
  onDelete,
}: GoalDetailSheetProps) {
  if (!isOpen || !goal) return null;

  const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  const isComplete = goal.currentAmount >= goal.targetAmount;

  // Format currency
  const formattedCurrent = Number(goal.currentAmount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formattedTarget = Number(goal.targetAmount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Status Badge Logic
  const status = goal.status || "not_started";
  let statusLabel = "Not Started";
  let statusBadgeClass = "bg-zinc-800 text-zinc-400 border border-zinc-700";
  let StatusIcon = Play;

  if (status === "in_progress") {
    statusLabel = "In Progress";
    statusBadgeClass = "bg-primary/10 text-primary border border-primary/20";
    StatusIcon = Play;
  } else if (status === "completed") {
    statusLabel = "Completed";
    statusBadgeClass = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    StatusIcon = Check;
  } else if (status === "paused") {
    statusLabel = "Paused";
    statusBadgeClass = "bg-amber-500/10 text-amber-500 border border-amber-500/20";
    StatusIcon = Pause;
  }

  // Format Deadline
  let formattedDeadline = "No deadline set";
  if (goal.deadline) {
    const d = new Date(goal.deadline + "T00:00:00");
    if (!isNaN(d.getTime())) {
      formattedDeadline = d.toLocaleDateString("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
      });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm md:items-stretch md:justify-end md:p-0 md:bg-black/60 animate-in fade-in duration-200">
      {/* Backdrop overlay */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Content */}
      <div className="relative w-full max-w-md max-h-[90dvh] md:h-screen md:max-h-screen bg-[#111111] border border-white/10 md:border-y-0 md:border-r-0 md:border-l rounded-2xl md:rounded-none md:rounded-l-3xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 md:zoom-in-100 md:slide-in-from-right duration-250">
        
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#111111]/90 px-6 py-4 backdrop-blur">
          <h2 className="font-syne text-xl font-bold text-foreground">Goal Details</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-2 text-muted hover:bg-white/5 hover:text-foreground transition-colors focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          
          {/* Goal Name & Category */}
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="font-syne font-bold text-2xl text-foreground tracking-wide truncate pr-4">
                {goal.name}
              </h3>
              <span className="shrink-0 rounded-full px-3 py-1 text-[10px] font-heading font-bold uppercase tracking-widest bg-surface-elevated text-muted border border-border">
                {goal.category}
              </span>
            </div>
            <div className="flex items-baseline mt-2 text-3xl font-heading font-extrabold text-foreground">
              ${formattedCurrent}
              <span className="text-sm font-normal text-muted font-mono ml-2">
                saved of ${formattedTarget} target
              </span>
            </div>
          </div>

          {/* Progress Section */}
          <div className="space-y-3 bg-surface-raised border border-border p-5 rounded-2xl">
            <div className="flex justify-between items-center text-xs uppercase font-mono">
              <span className="text-subtle font-semibold">Progress</span>
              <span className={`font-bold ${goal.accentText}`}>{percentage.toFixed(1)}%</span>
            </div>
            
            <div className="w-full bg-surface rounded-full h-3.5 overflow-hidden border border-border">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${goal.barColor}`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            {isComplete && (
              <div className="flex items-center space-x-2 text-primary font-mono text-xs font-bold pt-1">
                <Award size={16} />
                <span>Savings target fully achieved! 🎉</span>
              </div>
            )}
          </div>

          {/* Goal Info Grid */}
          <div className="grid grid-cols-2 gap-4 border-t border-border pt-6 font-mono text-xs">
            <div className="space-y-1.5">
              <span className="text-subtle uppercase font-semibold">Target Deadline</span>
              <div className="flex items-center space-x-1.5 text-foreground">
                <Calendar size={14} className="text-muted" />
                <span>{formattedDeadline}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-subtle uppercase font-semibold">Status</span>
              <div className="flex items-center">
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusBadgeClass}`}>
                  <StatusIcon size={12} />
                  <span>{statusLabel}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div 
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
          className="sticky bottom-0 z-10 border-t border-white/10 bg-[#111111]/95 px-6 pt-4 pb-4 backdrop-blur flex space-x-3 shrink-0"
        >
          <button
            onClick={onDelete}
            className="flex-1 rounded-xl py-3.5 bg-destructive/15 text-destructive border border-destructive/20 font-heading font-bold uppercase tracking-wider text-xs hover:bg-destructive hover:text-white transition-all active:scale-[0.98] cursor-pointer"
          >
            Delete Goal
          </button>
          <button
            onClick={onEdit}
            className="flex-1 rounded-xl py-3.5 bg-primary text-primary-fg font-heading font-bold uppercase tracking-wider text-xs hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
          >
            Edit Goal
          </button>
        </div>

      </div>
    </div>
  );
}
