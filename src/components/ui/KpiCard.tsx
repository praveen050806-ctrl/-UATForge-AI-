import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  accentColor?: "gold" | "emerald" | "rose" | "indigo" | "slate";
  isDemo?: boolean;
  className?: string;
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor = "gold",
  isDemo = true,
  className,
}: KpiCardProps) {
  const accentBorders = {
    gold: "hover:border-amber-500/40 border-slate-800/80",
    emerald: "hover:border-emerald-500/40 border-slate-800/80",
    rose: "hover:border-rose-500/40 border-slate-800/80",
    indigo: "hover:border-indigo-500/40 border-slate-800/80",
    slate: "hover:border-slate-600/40 border-slate-800/80",
  };

  const iconGradients = {
    gold: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    rose: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    slate: "text-slate-400 bg-slate-500/10 border-slate-500/20",
  };

  return (
    <div
      className={cn(
        "relative p-5 rounded-xl bg-slate-900/60 backdrop-blur-md border transition-all duration-200 group shadow-xs",
        accentBorders[accentColor],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              {title}
            </p>
            {isDemo && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-400/90 border border-amber-500/20">
                SAMPLE
              </span>
            )}
          </div>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white font-mono">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "p-2.5 rounded-lg border transition-transform duration-200 group-hover:scale-105",
            iconGradients[accentColor]
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {subtitle && (
        <p className="mt-3 text-xs text-slate-400 flex items-center gap-1.5 border-t border-slate-800/60 pt-2.5">
          {subtitle}
        </p>
      )}
    </div>
  );
}
