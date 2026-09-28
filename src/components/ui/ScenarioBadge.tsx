import React from "react";
import { cn } from "@/lib/utils";
import { ScenarioType } from "@/types";

interface ScenarioBadgeProps {
  type: ScenarioType;
  className?: string;
}

export function ScenarioBadge({ type, className }: ScenarioBadgeProps) {
  let badgeStyles = "bg-slate-800/80 text-slate-300 border-slate-700/60";

  switch (type) {
    case "Positive":
      badgeStyles = "bg-emerald-950/70 text-emerald-300 border-emerald-700/50";
      break;
    case "Negative":
      badgeStyles = "bg-rose-950/70 text-rose-300 border-rose-700/50";
      break;
    case "Boundary":
      badgeStyles = "bg-amber-950/70 text-amber-300 border-amber-600/50";
      break;
    case "Role-Based":
      badgeStyles = "bg-indigo-950/70 text-indigo-300 border-indigo-700/50";
      break;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider border",
        badgeStyles,
        className
      )}
    >
      {type}
    </span>
  );
}
