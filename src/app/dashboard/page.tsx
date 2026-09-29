"use client";

import React, { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/ui/KpiCard";
import { RecentRequirements } from "@/components/dashboard/RecentRequirements";
import { TestCoverageCard } from "@/components/dashboard/TestCoverageCard";
import { ScenarioDistributionCard } from "@/components/dashboard/ScenarioDistributionCard";
import { ValidationSummaryCard } from "@/components/dashboard/ValidationSummaryCard";
import {
  FileText,
  ListChecks,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PlayCircle,
  Bug,
  Sparkles,
  GitBranch,
  ShieldCheck,
  Download,
  GitMerge,
} from "lucide-react";
import {
  getActiveSuite,
  getActiveRequirement,
  getActiveScenarios,
  getAllExecutions,
  getAllDefects,
  calculateExecutionMetrics,
  subscribeToUATSession,
} from "@/lib/session/uat-session";
import { runUATValidationEngine } from "@/lib/validation/engine";
import { GeneratedTestCase, DefectRecord } from "@/types";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const sessionData = useSyncExternalStore(
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
    if (!sessionData) {
      return { suite: null, req: null, scn: [], executions: {}, defects: [] };
    }
    try {
      return JSON.parse(sessionData);
    } catch {
      return { suite: null, req: null, scn: [], executions: {}, defects: [] };
    }
  }, [sessionData]);

  const hasLiveSuite = Boolean(suite && suite.testCases?.length > 0);
  const hasLiveReq = Boolean(req && (req.title || req.rawContent));
  const hasLiveScn = Boolean(scn && scn.length > 0);

  // 1. Requirements Count (Real)
  const requirementsCount = hasLiveReq ? 1 : (hasLiveSuite ? 1 : 0);

  // 2. Scenarios Count (Real)
  const scenariosCount = useMemo(() => {
    if (hasLiveScn) return scn.length;
    if (hasLiveSuite && suite?.testCases) {
      const uniqueScenarios = new Set(suite.testCases.map((tc: GeneratedTestCase) => tc.scenarioId));
      return uniqueScenarios.size;
    }
    return 0;
  }, [hasLiveScn, hasLiveSuite, scn, suite]);

  // 3. UAT Test Cases Count (Real)
  const testCasesCount = hasLiveSuite ? suite.testCases.length : 0;

  // Real execution metrics
  const execMetrics = useMemo(() => {
    if (hasLiveSuite && suite?.testCases) {
      return calculateExecutionMetrics(
        suite.testCases.map((tc: GeneratedTestCase) => tc.testCaseId),
        executions
      );
    }
    return {
      total: 0,
      passed: 0,
      failed: 0,
      blocked: 0,
      notExecuted: 0,
      coveragePercentage: 0,
    };
  }, [hasLiveSuite, suite, executions]);

  // 4. Executed Count (Real)
  const executedCount = hasLiveSuite ? execMetrics.total - execMetrics.notExecuted : 0;

  // 5. Passed Count (Real)
  const passedCount = execMetrics.passed;

  // 6. Failed Count (Real)
  const failedCount = execMetrics.failed;

  // 7. Blocked Count (Real)
  const blockedCount = execMetrics.blocked;

  // Real Validation Report
  const validationReport = useMemo(() => {
    if (!hasLiveSuite && !hasLiveReq && !hasLiveScn && Object.keys(executions).length === 0) {
      return null;
    }
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
  }, [hasLiveSuite, hasLiveReq, hasLiveScn, suite, req, scn, executions, defects]);

  // 8. Validation Issues Count (Real)
  const validationIssuesCount = validationReport ? validationReport.totalIssues : 0;

  // 9. Open Defects Count (Real)
  const openDefectsCount = useMemo(() => {
    return (defects || []).filter(
      (d: DefectRecord) => d.status === "OPEN" || d.status === "IN_REVIEW"
    ).length;
  }, [defects]);

  // 10. Traceability Coverage (Real calculated without fake percentages)
  const traceabilityCoverage = useMemo(() => {
    if (!hasLiveSuite || !suite?.testCases || suite.testCases.length === 0) return 0;
    const rules = req?.intelligence?.businessRules || [];
    if (rules.length > 0) {
      const covered = rules.filter((rule: string) => {
        const norm = rule.toLowerCase();
        return suite.testCases.some((tc: GeneratedTestCase) =>
          tc.businessRuleReference?.toLowerCase().includes(norm) ||
          norm.includes(tc.businessRuleReference?.toLowerCase() || "")
        );
      }).length;
      return Number(((covered / rules.length) * 100).toFixed(1));
    }
    return 100.0;
  }, [hasLiveSuite, suite, req]);

  // Archetype distribution counts for charts
  const archetypeCounts = useMemo(() => {
    if (hasLiveSuite && suite?.testCases) {
      let positive = 0;
      let negative = 0;
      let boundary = 0;
      let roleBased = 0;

      suite.testCases.forEach((tc: GeneratedTestCase) => {
        if (tc.type === "Positive") positive++;
        else if (tc.type === "Negative") negative++;
        else if (tc.type === "Boundary") boundary++;
        else if (tc.type === "Role-Based") roleBased++;
      });

      return {
        positive,
        negative,
        boundary,
        roleBased,
        total: suite.testCases.length,
      };
    }

    return {
      positive: 0,
      negative: 0,
      boundary: 0,
      roleBased: 0,
      total: 0,
    };
  }, [hasLiveSuite, suite]);

  return (
    <AppShell>
      {/* Page Header */}
      <PageHeader
        title="UAT Executive Dashboard"
        subtitle="Complete lifecycle governance: business requirements to verified UAT test execution, validation integrity, defect tracking, and audit exports."
        badge={hasLiveSuite ? "Live UAT Session Active" : "Session Initialized"}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/execution"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm cursor-pointer"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Launch Execution</span>
            </Link>
            <Link
              href="/requirements"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>New Requirement</span>
            </Link>
          </div>
        }
      />

      {/* Primary Actions Toolbar */}
      <div className="mb-6 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Primary UAT Actions</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Real Session Orchestration
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <Link
            href="/requirements"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all group shadow-xs"
          >
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white leading-tight">New Requirement</div>
              <div className="text-[10px] text-amber-400/80 font-normal">Use Case / Spec</div>
            </div>
          </Link>

          <Link
            href="/requirements"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold transition-all group shadow-xs"
          >
            <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white leading-tight">Generate UAT Suite</div>
              <div className="text-[10px] text-sky-400/80 font-normal">Scenarios & Cases</div>
            </div>
          </Link>

          <Link
            href="/execution"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all group shadow-xs"
          >
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
              <PlayCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white leading-tight">Execute UAT</div>
              <div className="text-[10px] text-emerald-400/80 font-normal">Step-by-step Cockpit</div>
            </div>
          </Link>

          <Link
            href="/validation"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all group shadow-xs"
          >
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white leading-tight">Review Validation</div>
              <div className="text-[10px] text-indigo-400/80 font-normal">Integrity Engine</div>
            </div>
          </Link>

          <Link
            href="/defects"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all group shadow-xs"
          >
            <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 shrink-0 group-hover:scale-105 transition-transform">
              <Bug className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white leading-tight">View Defects</div>
              <div className="text-[10px] text-rose-400/80 font-normal">Workflow & Status</div>
            </div>
          </Link>

          <Link
            href="/exports"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition-all group shadow-xs"
          >
            <div className="p-1.5 rounded-lg bg-slate-700 text-slate-300 shrink-0 group-hover:scale-105 transition-transform">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white leading-tight">Export Report</div>
              <div className="text-[10px] text-slate-400 font-normal">Excel & CSV Suite</div>
            </div>
          </Link>
        </div>
      </div>

      {/* End-to-End Visual Workflow Pipeline */}
      <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Visual Workflow Pipeline</span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Requirement → Scenario → UAT Test Cases → Execute → Validate → Defect → Export
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Click any stage to enter workflow
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 items-stretch">
          {/* 1. Requirement */}
          <Link
            href="/requirements"
            className={cn(
              "p-3 rounded-xl border text-left transition-all block group relative flex flex-col justify-between",
              hasLiveReq
                ? "bg-amber-500/10 border-amber-500/40 text-white"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
            )}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-amber-400">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">
                  01
                </span>
              </div>
              <div className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                Requirement
              </div>
            </div>
            <div className="text-[10px] text-slate-400 font-mono line-clamp-1 mt-2">
              {hasLiveReq
                ? (req?.inputType === "use-case" ? "Use Case Active" : "Input Staged")
                : "Enter / Paste"}
            </div>
          </Link>

          {/* 2. Scenario */}
          <Link
            href="/requirements"
            className={cn(
              "p-3 rounded-xl border text-left transition-all block group relative flex flex-col justify-between",
              hasLiveScn
                ? "bg-sky-500/10 border-sky-500/40 text-white"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
            )}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-sky-400">
                  <GitBranch className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">
                  02
                </span>
              </div>
              <div className="text-xs font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
                Scenario
              </div>
            </div>
            <div className="text-[10px] text-slate-400 font-mono line-clamp-1 mt-2">
              {hasLiveScn ? `${scenariosCount} Scenarios` : "Archetypes"}
            </div>
          </Link>

          {/* 3. UAT Test Cases */}
          <Link
            href="/test-suites"
            className={cn(
              "p-3 rounded-xl border text-left transition-all block group relative flex flex-col justify-between",
              hasLiveSuite
                ? "bg-amber-500/10 border-amber-500/40 text-white"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
            )}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-amber-400">
                  <ListChecks className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">
                  03
                </span>
              </div>
              <div className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                UAT Test Cases
              </div>
            </div>
            <div className="text-[10px] text-slate-400 font-mono line-clamp-1 mt-2">
              {hasLiveSuite ? `${testCasesCount} Test Cases` : "Synthesized Suite"}
            </div>
          </Link>

          {/* 4. Execute */}
          <Link
            href="/execution"
            className={cn(
              "p-3 rounded-xl border text-left transition-all block group relative flex flex-col justify-between",
              executedCount > 0
                ? "bg-emerald-500/10 border-emerald-500/40 text-white"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
            )}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400">
                  <PlayCircle className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">
                  04
                </span>
              </div>
              <div className="text-xs font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                Execute
              </div>
            </div>
            <div className="text-[10px] text-slate-400 font-mono line-clamp-1 mt-2">
              {hasLiveSuite ? `${executedCount} / ${testCasesCount} Done` : "Cockpit Ready"}
            </div>
          </Link>

          {/* 5. Validate */}
          <Link
            href="/validation"
            className={cn(
              "p-3 rounded-xl border text-left transition-all block group relative flex flex-col justify-between",
              validationReport
                ? "bg-indigo-500/10 border-indigo-500/40 text-white"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
            )}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-indigo-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">
                  05
                </span>
              </div>
              <div className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                Validate
              </div>
            </div>
            <div className="text-[10px] text-slate-400 font-mono line-clamp-1 mt-2">
              {validationReport ? `${validationIssuesCount} Findings` : "Health Inspection"}
            </div>
          </Link>

          {/* 6. Defect */}
          <Link
            href="/defects"
            className={cn(
              "p-3 rounded-xl border text-left transition-all block group relative flex flex-col justify-between",
              defects.length > 0
                ? "bg-rose-500/10 border-rose-500/40 text-white"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
            )}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-rose-400">
                  <Bug className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">
                  06
                </span>
              </div>
              <div className="text-xs font-bold text-slate-100 group-hover:text-rose-300 transition-colors">
                Defect
              </div>
            </div>
            <div className="text-[10px] text-slate-400 font-mono line-clamp-1 mt-2">
              {defects.length > 0 ? `${openDefectsCount} Open (${defects.length} Total)` : "0 Defects"}
            </div>
          </Link>

          {/* 7. Export */}
          <Link
            href="/exports"
            className={cn(
              "p-3 rounded-xl border text-left transition-all block group relative flex flex-col justify-between",
              hasLiveSuite
                ? "bg-amber-500/10 border-amber-500/40 text-white"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
            )}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-amber-400">
                  <Download className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">
                  07
                </span>
              </div>
              <div className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                Export
              </div>
            </div>
            <div className="text-[10px] text-slate-400 font-mono line-clamp-1 mt-2">
              {hasLiveSuite ? "Excel & CSV Ready" : "Sign-Off Reports"}
            </div>
          </Link>
        </div>
      </div>

      {/* 10 Core Telemetry Metrics Grid (Required by Specification) */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
            <ListChecks className="w-3.5 h-3.5 text-amber-400" />
            <span>Complete UAT Telemetry Matrix (Real Session Data)</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {hasLiveSuite ? "Live Calculated" : "Session Awaiting Input"}
          </span>
        </div>

        {/* Row 1: Upstream Pipeline & Quality */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
          <KpiCard
            title="Requirements"
            value={String(requirementsCount)}
            subtitle={hasLiveReq ? `Active: ${req?.title || suite?.requirementTitle}` : "No requirement loaded"}
            icon={FileText}
            accentColor="slate"
          />
          <KpiCard
            title="Scenarios"
            value={String(scenariosCount)}
            subtitle={scenariosCount > 0 ? `${scenariosCount} scenarios generated` : "Awaiting extraction"}
            icon={GitBranch}
            accentColor="indigo"
          />
          <KpiCard
            title="UAT Test Cases"
            value={String(testCasesCount)}
            subtitle={testCasesCount > 0 ? `${testCasesCount} execution cases ready` : "Awaiting test synthesis"}
            icon={ListChecks}
            accentColor="gold"
          />
          <KpiCard
            title="Validation Issues"
            value={String(validationIssuesCount)}
            subtitle={
              validationReport
                ? `${validationReport.criticalCount} crit, ${validationReport.warningCount} warn, ${validationReport.infoCount} info`
                : "Awaiting suite inspection"
            }
            icon={ShieldCheck}
            accentColor="gold"
          />
          <KpiCard
            title="Traceability Coverage"
            value={`${traceabilityCoverage}%`}
            subtitle={hasLiveSuite ? "Requirements to test cases mapped" : "End-to-end chain coverage"}
            icon={GitMerge}
            accentColor="emerald"
          />
        </div>

        {/* Row 2: Live Execution & Defect Tracking */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
          <KpiCard
            title="Executed"
            value={testCasesCount > 0 ? `${executedCount} / ${testCasesCount}` : "0"}
            subtitle={testCasesCount > 0 ? `${execMetrics.coveragePercentage}% completed` : "No tests executed"}
            icon={PlayCircle}
            accentColor="slate"
          />
          <KpiCard
            title="Passed"
            value={String(passedCount)}
            subtitle={executedCount > 0 ? `${((passedCount / (executedCount || 1)) * 100).toFixed(0)}% of executed passed` : "Zero tests passed"}
            icon={CheckCircle2}
            accentColor="emerald"
          />
          <KpiCard
            title="Failed"
            value={String(failedCount)}
            subtitle={failedCount > 0 ? "Eligible for Defect creation" : "Zero failing test cases"}
            icon={XCircle}
            accentColor="rose"
          />
          <KpiCard
            title="Blocked"
            value={String(blockedCount)}
            subtitle={blockedCount > 0 ? "Execution blocked by environment" : "Zero blockages"}
            icon={AlertCircle}
            accentColor="gold"
          />
          <KpiCard
            title="Open Defects"
            value={String(openDefectsCount)}
            subtitle={defects.length > 0 ? `${defects.length} total logged in session` : "Zero open defects"}
            icon={Bug}
            accentColor="rose"
          />
        </div>
      </div>

      {/* Main Grid: Recent Requirements & Execution Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <RecentRequirements />
        </div>
        <div>
          <TestCoverageCard
            metrics={hasLiveSuite ? execMetrics : undefined}
            isLive={hasLiveSuite}
          />
        </div>
      </div>

      {/* Secondary Grid: Scenario Archetypes & Validation Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScenarioDistributionCard
          counts={hasLiveSuite ? archetypeCounts : undefined}
          isLive={hasLiveSuite}
        />
        <ValidationSummaryCard />
      </div>
    </AppShell>
  );
}
