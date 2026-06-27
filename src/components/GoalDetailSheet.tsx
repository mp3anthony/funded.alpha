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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center animate-in fade-in duration-200">
      {/* Backdrop overlay */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Content */}
      <div className="relative w-full max-h-[90vh] overflow-y-auto rounded-t-2xl bg-surface sm:max-w-lg sm:rounded-2xl flex flex-col shadow-2xl animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface/90 px-6 py-4 backdrop-blur">
          <h2 className="font-heading text-xl font-bold text-foreground">Goal Details</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-2 text-muted hover:bg-surface-raised hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex flex-col space-y-6 px-6 py-6">
          
          {/* Goal Name & Category */}
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-2xl text-foreground tracking-wide truncate pr-4">
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
        <div className="sticky bottom-0 border-t border-border bg-surface/90 px-6 py-4 backdrop-blur flex space-x-3">
          <button
            onClick={onDelete}
            className="flex-1 rounded-xl py-3.5 bg-destructive/15 text-destructive border border-destructive/20 font-heading font-bold uppercase tracking-wider text-xs hover:bg-destructive hover:text-white transition-all active:scale-[0.98]"
          >
            Delete Goal
          </button>
          <button
            onClick={onEdit}
            className="flex-1 rounded-xl py-3.5 bg-primary text-primary-fg font-heading font-bold uppercase tracking-wider text-xs hover:brightness-110 active:scale-[0.98] transition-all"
          >
            Edit Goal
          </button>
        </div>

      </div>
    </div>
  );
}
