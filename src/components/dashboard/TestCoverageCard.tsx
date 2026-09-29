import React from "react";
import { SectionCard } from "@/components/ui/SectionCard";
import { CheckCircle2, AlertCircle, HelpCircle, XCircle } from "lucide-react";
import { ExecutionSummary } from "@/types";

interface TestCoverageCardProps {
  metrics?: ExecutionSummary;
  isLive?: boolean;
}

export function TestCoverageCard({
  metrics,
  isLive = false,
}: TestCoverageCardProps) {
  const total = metrics?.total || 12;
  const passed = metrics?.passed ?? 5;
  const failed = metrics?.failed ?? 2;
  const blocked = metrics?.blocked ?? 1;
  const notExecuted = metrics?.notExecuted ?? 4;
  const coveragePct = metrics?.coveragePercentage ?? 66.7;

  const passPct = total > 0 ? (passed / total) * 100 : 0;
  const failPct = total > 0 ? (failed / total) * 100 : 0;
  const blockPct = total > 0 ? (blocked / total) * 100 : 0;
  const notExecPct = total > 0 ? (notExecuted / total) * 100 : 0;

  return (
    <SectionCard
      title="UAT Execution Progress"
      description="Real-time execution coverage and pass/fail signoff status."
      badge={isLive ? "Live Session Metrics" : "Sample Metric"}
    >
      <div className="space-y-4">
        {/* Overall Percentage */}
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-3xl font-extrabold text-white font-mono">
              {coveragePct}%
            </span>
            <span className="text-xs text-slate-400 ml-2 font-mono">
              executed ({total - notExecuted} of {total})
            </span>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-medium">
            {passed} Passed
          </span>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden flex">
          <div
            className="bg-emerald-500 h-full transition-all duration-500"
            style={{ width: `${passPct}%` }}
            title={`Passed: ${passed} (${passPct.toFixed(0)}%)`}
          />
          <div
            className="bg-rose-500 h-full transition-all duration-500"
            style={{ width: `${failPct}%` }}
            title={`Failed: ${failed} (${failPct.toFixed(0)}%)`}
          />
          <div
            className="bg-amber-500 h-full transition-all duration-500"
            style={{ width: `${blockPct}%` }}
            title={`Blocked: ${blocked} (${blockPct.toFixed(0)}%)`}
          />
          <div
            className="bg-slate-700 h-full transition-all duration-500"
            style={{ width: `${notExecPct}%` }}
            title={`Not Executed: ${notExecuted} (${notExecPct.toFixed(0)}%)`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{passed} Pass</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>{failed} Fail</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{blocked} Blocked</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{notExecuted} Pending</span>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
