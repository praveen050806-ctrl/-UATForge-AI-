import React from "react";
import { cn } from "@/lib/utils";
import { TestCaseStatus, ValidationSeverity } from "@/types";

interface StatusBadgeProps {
  status: TestCaseStatus | ValidationSeverity | "draft" | "parsed" | "validated" | "Covered" | "Partial" | "Uncovered";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  let badgeStyles = "bg-slate-800/80 text-slate-300 border-slate-700/60";

  switch (status) {
    // Test Case Status
    case "Ready":
    case "Approved":
    case "validated":
    case "Covered":
      badgeStyles = "bg-emerald-950/60 text-emerald-300 border-emerald-800/50";
      break;
    case "In Review":
    case "parsed":
    case "Partial":
    case "Warning":
    case "WARNING":
      badgeStyles = "bg-amber-950/60 text-amber-300 border-amber-800/50";
      break;
    case "Critical":
    case "CRITICAL":
    case "Uncovered":
      badgeStyles = "bg-rose-950/60 text-rose-300 border-rose-800/50";
      break;
    case "Info":
    case "INFO":
      badgeStyles = "bg-sky-950/60 text-sky-300 border-sky-800/50";
      break;
    case "Draft":
    case "draft":
    default:
      badgeStyles = "bg-slate-800/80 text-slate-400 border-slate-700/60";
      break;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border backdrop-blur-xs transition-colors",
        badgeStyles,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
}
