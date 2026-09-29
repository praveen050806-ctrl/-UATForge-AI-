"use client";

import React, { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import {
  getActiveSuite,
  getActiveRequirement,
  getActiveScenarios,
  getAllExecutions,
  getAllDefects,
  subscribeToUATSession,
} from "@/lib/session/uat-session";
import { runUATValidationEngine } from "@/lib/validation/engine";

export function ValidationSummaryCard() {
  const rawSession = useSyncExternalStore(
    subscribeToUATSession,
    () => {
      const suite = getActiveSuite();
      const req = getActiveRequirement();
      const scn = getActiveScenarios();
      const executions = getAllExecutions();
      const defects = getAllDefects();
      return JSON.stringify({ suite, req, scn, executions, defects });
    },
    () => null
  );

  const { suite, req, scn, executions, defects } = useMemo(() => {
    if (!rawSession) {
      return { suite: null, req: null, scn: [], executions: {}, defects: [] };
    }
    try {
      return JSON.parse(rawSession);
    } catch {
      return { suite: null, req: null, scn: [], executions: {}, defects: [] };
    }
  }, [rawSession]);

  const hasLiveSession = Boolean(
    (suite && suite.testCases?.length > 0) ||
    (scn && scn.length > 0) ||
    (req && req.title) ||
    Object.keys(executions || {}).length > 0
  );

  const liveReport = useMemo(() => {
    if (!hasLiveSession) return null;
    return runUATValidationEngine({
      requirementId: "REQ-001",
      requirementTitle: suite?.requirementTitle || req?.title,
      requirementContent: req?.rawContent,
      intelligence: req?.intelligence,
      scenarios: scn || [],
      testCases: suite?.testCases || [],
      executions: executions || {},
      defects: defects || [],
    });
  }, [hasLiveSession, suite, req, scn, executions, defects]);

  const sampleIssues = [
    {
      id: "VAL-01",
      category: "Duplicate Detection",
      title: "Potential duplicate: TC-UAT-004 overlaps with TC-UAT-012",
      severity: "Warning" as const,
    },
    {
      id: "VAL-02",
      category: "Missing Information",
      title: "Expected timeout threshold undefined in REQ-002",
      severity: "Critical" as const,
    },
    {
      id: "VAL-03",
      category: "Requirement Quality",
      title: "Ambiguous phrase 'system should be fast' in REQ-003",
      severity: "Info" as const,
    },
  ];

  const displayedIssues = liveReport ? liveReport.issues.slice(0, 4) : sampleIssues;
  const isLive = Boolean(liveReport);

  return (
    <SectionCard
      title="Validation Summary"
      description="Automated UAT suite health & integrity inspection."
      badge={isLive ? `Live Suite (${liveReport?.totalIssues || 0} Findings)` : "Sample Rules"}
      action={
        <Link
          href="/validation"
          className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      <div className="space-y-3">
        {displayedIssues.length === 0 ? (
          <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1 opacity-80" />
            <span>Zero validation issues found in active session suite.</span>
          </div>
        ) : (
          displayedIssues.map((issue) => (
            <div
              key={issue.id}
              className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">
                    {issue.category}
                  </span>
                  <StatusBadge status={issue.severity.toUpperCase() as "CRITICAL" | "WARNING" | "INFO"} />
                </div>
                <p className="text-xs text-slate-200 font-medium">{issue.title}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </SectionCard>
  );
}
