import React from "react";
import { SectionCard } from "@/components/ui/SectionCard";
import { CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";

export function TestCoverageCard() {
  return (
    <SectionCard
      title="Test Coverage"
      description="Requirement-to-scenario traceability metric."
      badge="Sample Metric"
    >
      <div className="space-y-4">
        {/* Overall Percentage */}
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-extrabold text-white font-mono">
            87.5%
          </span>
          <span className="text-xs font-mono text-emerald-400 font-medium">
            28 / 32 Covered
          </span>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden flex">
          <div className="bg-emerald-500 h-full w-[70%]" title="Covered: 70%" />
          <div className="bg-amber-500 h-full w-[17.5%]" title="Partial: 17.5%" />
          <div className="bg-rose-500/80 h-full w-[12.5%]" title="Uncovered: 12.5%" />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>28 Fully</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>3 Partial</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <HelpCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>1 Gap</span>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
