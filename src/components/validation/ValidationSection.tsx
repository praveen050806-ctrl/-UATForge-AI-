"use client";

import React, { useState, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  Copy,
  FileQuestion,
  HelpCircle,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  Activity,
  Bug,
  ExternalLink,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ValidationCategory, ValidationIssue, ValidationEntityStats } from "@/types";
import {
  getActiveSuite,
  getActiveRequirement,
  getActiveScenarios,
  getAllExecutions,
  getAllDefects,
  subscribeToUATSession,
} from "@/lib/session/uat-session";
import { runUATValidationEngine } from "@/lib/validation/engine";
import { cn } from "@/lib/utils";

const DEMO_ISSUES: ValidationIssue[] = [
  {
    id: "DUP-001",
    category: "Duplicate Detection",
    severity: "Warning",
    title: "High step overlap between TC-UAT-001 and TC-UAT-014",
    description:
      "Both test cases verify initial TOTP QR scanning without distinct variance in preconditions or expected outcomes.",
    targetRef: "TC-UAT-001 / TC-UAT-014",
    suggestedFix:
      "Merge into single parameterized scenario or parameterize device OS variations.",
    testCaseId: "TC-UAT-001",
    scenarioId: "SCN-001",
    requirementId: "REQ-001",
    linkHref: "/test-suites?search=TC-UAT-001",
  },
  {
    id: "INC-001",
    category: "Incomplete Test Cases",
    severity: "Critical",
    title: "Missing terminal assertion in TC-UAT-008",
    description:
      "Step 4 contains an action to 'Submit order payment' but does not specify database or UI expected results.",
    targetRef: "TC-UAT-008",
    suggestedFix:
      "Define exact HTTP 200 response, order state 'CONFIRMED', and email receipt dispatch.",
    testCaseId: "TC-UAT-008",
    scenarioId: "SCN-003",
    requirementId: "REQ-002",
    linkHref: "/test-suites?search=TC-UAT-008",
  },
  {
    id: "MIS-001",
    category: "Missing Information",
    severity: "Warning",
    title: "Undefined session timeout interval in REQ-001",
    description:
      "MFA enrollment lockout duration is defined (5 min), but idle window before QR token invalidation is omitted.",
    targetRef: "REQ-001 §3.2",
    suggestedFix: "Specify standard 10-minute idle session timeout threshold.",
    requirementId: "REQ-001",
    linkHref: "/requirements",
  },
  {
    id: "QUA-001",
    category: "Requirement Quality",
    severity: "Info",
    title: "Requirement meets IEEE 830 acceptance criteria standards",
    description:
      "Story demonstrates clear role definition, testable acceptance rules, and unambiguous outcomes.",
    targetRef: "REQ-001",
    suggestedFix: "No modifications required.",
    requirementId: "REQ-001",
    linkHref: "/requirements",
  },
  {
    id: "AMB-001",
    category: "Ambiguous Requirements",
    severity: "Critical",
    title: "Subjective SLA constraint 'system should be fast'",
    description:
      "Specification mentions 'fast response time under high load' without specifying P95 latency in milliseconds.",
    targetRef: "REQ-002 §4.1",
    suggestedFix:
      "Quantify constraint to 'P95 response time < 450ms under 2,500 concurrent connections'.",
    requirementId: "REQ-002",
    linkHref: "/requirements",
  },
  {
    id: "EXE-001",
    category: "Execution Integrity",
    severity: "Warning",
    title: "Failed Test Case TC-UAT-002 Has No Logged Defect Ticket",
    description:
      "Test case TC-UAT-002 recorded failure during live verification, but no defect has been registered in the defect registry.",
    targetRef: "TC-UAT-002",
    suggestedFix: "Log a defect ticket with step reproduction details in the Execution Cockpit.",
    testCaseId: "TC-UAT-002",
    scenarioId: "SCN-002",
    requirementId: "REQ-001",
    linkHref: "/execution?id=TC-UAT-002",
  },
];

const CATEGORY_META: {
  category: ValidationCategory;
  icon: React.ElementType;
  description: string;
}[] = [
  {
    category: "Duplicate Detection",
    icon: Copy,
    description: "Identifies redundant test cases and duplicated assertions across suites.",
  },
  {
    category: "Incomplete Test Cases",
    icon: FileQuestion,
    description: "Detects missing steps, omitted assertions, or blank expected outcomes.",
  },
  {
    category: "Missing Information",
    icon: HelpCircle,
    description: "Highlights gaps in specifications such as unstated timeouts, missing test data, or rule refs.",
  },
  {
    category: "Requirement Quality",
    icon: Sparkles,
    description: "Evaluates clarity, testability, and structural completeness of business rules.",
  },
  {
    category: "Ambiguous Requirements",
    icon: AlertTriangle,
    description: "Catches vague statements ('should be easy', 'fast') that cannot be verified.",
  },
  {
    category: "Execution Integrity",
    icon: Activity,
    description: "Inspects live execution evidence, failure explanations, defect tracking, and status consistency.",
  },
];

export function ValidationSection() {
  // Read session snapshot
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

  const [selectedSource, setSelectedSource] = useState<"live" | "demo" | null>(
    null
  );
  const activeSource = selectedSource ?? (hasLiveSession ? "live" : "demo");

  // Run functional validation engine on current live session data
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

  const currentIssues: ValidationIssue[] = useMemo(() => {
    if (activeSource === "live" && liveReport) {
      return liveReport.issues;
    }
    return DEMO_ISSUES;
  }, [activeSource, liveReport]);

  const entityStats: ValidationEntityStats = useMemo(() => {
    if (activeSource === "live" && liveReport) {
      return liveReport.entityStats;
    }
    return {
      testCasesEvaluated: suite?.testCases?.length || 6,
      scenariosEvaluated: scn?.length || 6,
      requirementsEvaluated: 1,
      executionsEvaluated: Object.keys(executions || {}).length || 6,
      defectsEvaluated: defects?.length || 1,
    };
  }, [activeSource, liveReport, suite, scn, executions, defects]);

  const [severityFilter, setSeverityFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  const filteredIssues = useMemo(() => {
    return currentIssues.filter((issue) => {
      const issueSeverityUpper = issue.severity.toUpperCase();
      const matchesSeverity =
        severityFilter === "All" ||
        issueSeverityUpper === severityFilter.toUpperCase() ||
        issue.severity === severityFilter;
      const matchesCategory =
        categoryFilter === "All" || issue.category === categoryFilter;
      return matchesSeverity && matchesCategory;
    });
  }, [currentIssues, severityFilter, categoryFilter]);

  const counts = useMemo(() => {
    let critical = 0;
    let warning = 0;
    let info = 0;
    currentIssues.forEach((i) => {
      const s = i.severity.toUpperCase();
      if (s === "CRITICAL") critical++;
      else if (s === "WARNING") warning++;
      else if (s === "INFO") info++;
    });
    return { critical, warning, info, total: currentIssues.length };
  }, [currentIssues]);

  return (
    <div className="space-y-6">
      {/* Source Selector Tab Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2">
          {hasLiveSession && (
            <button
              type="button"
              onClick={() => setSelectedSource("live")}
              className={cn(
                "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2",
                activeSource === "live"
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              )}
            >
              <span className="w-2 h-2 rounded-full bg-current" />
              <span>
                Active Session Suite ({suite?.testCases?.length || 0} Cases)
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setSelectedSource("demo")}
            className={cn(
              "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2",
              activeSource === "demo"
                ? "bg-slate-750 text-white border border-slate-650"
                : "text-slate-400 hover:text-white"
            )}
          >
            <span>Demo Blueprint Rules</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-400 px-2">
          {activeSource === "live" ? (
            <span className="text-emerald-400 font-medium">
              Live deterministic validation over active session test cases & execution data
            </span>
          ) : (
            <span className="text-amber-400/90 font-medium">
              Reference sample quality gate
            </span>
          )}
        </div>
      </div>

      {/* Live Validation Engine Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Total Findings
          </span>
          <span className="text-2xl font-bold font-mono text-white">
            {counts.total}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-rose-500/20">
          <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 block mb-1">
            Critical (CRITICAL)
          </span>
          <span className="text-2xl font-bold font-mono text-rose-400">
            {counts.critical}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-500/20">
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block mb-1">
            Warnings (WARNING)
          </span>
          <span className="text-2xl font-bold font-mono text-amber-400">
            {counts.warning}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-sky-500/20">
          <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 block mb-1">
            Advisories (INFO)
          </span>
          <span className="text-2xl font-bold font-mono text-sky-400">
            {counts.info}
          </span>
        </div>
      </div>

      {/* Validation Scope & Entity Counts Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 text-xs font-mono">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Test Cases</span>
          <span className="text-sm font-bold text-amber-400">{entityStats.testCasesEvaluated}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Scenarios</span>
          <span className="text-sm font-bold text-emerald-400">{entityStats.scenariosEvaluated}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Requirements</span>
          <span className="text-sm font-bold text-sky-400">{entityStats.requirementsEvaluated}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Executions</span>
          <span className="text-sm font-bold text-violet-400">{entityStats.executionsEvaluated}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Defects Logged</span>
          <span className="text-sm font-bold text-rose-400">{entityStats.defectsEvaluated}</span>
        </div>
      </div>

      {/* Quality Gate Status Notice */}
      <div
        className={cn(
          "p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs",
          counts.critical === 0
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            : "bg-rose-500/10 border-rose-500/30 text-rose-300"
        )}
      >
        <div className="flex items-center gap-2.5">
          {counts.critical === 0 ? (
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <div>
            <strong>
              {counts.critical === 0
                ? "Quality Gate Passed: No Blocking Critical Issues"
                : `Quality Gate Warning: ${counts.critical} Critical issue(s) require remediation`}
            </strong>
            <p className="text-[11px] opacity-80 mt-0.5">
              {activeSource === "live"
                ? `Engine evaluated 8 deterministic rules against ${suite?.testCases?.length || 0} test cases and ${Object.keys(executions || {}).length} execution records.`
                : "Deterministic quality rules demonstrated on standard specification matrix."}
            </p>
          </div>
        </div>

        <Link
          href="/execution"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 hover:text-white text-xs font-semibold shrink-0 cursor-pointer"
        >
          <span>Open Execution</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-300">
            <span className="text-[11px] text-slate-400">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-transparent border-none text-slate-200 focus:outline-hidden text-xs cursor-pointer font-medium"
            >
              <option value="All" className="bg-slate-900">All Severities</option>
              <option value="Critical" className="bg-slate-900">CRITICAL</option>
              <option value="Warning" className="bg-slate-900">WARNING</option>
              <option value="Info" className="bg-slate-900">INFO</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-300">
            <span className="text-[11px] text-slate-400">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent border-none text-slate-200 focus:outline-hidden text-xs cursor-pointer font-medium"
            >
              <option value="All" className="bg-slate-900">All Categories</option>
              <option value="Duplicate Detection" className="bg-slate-900">Duplicate Detection</option>
              <option value="Incomplete Test Cases" className="bg-slate-900">Incomplete Test Cases</option>
              <option value="Missing Information" className="bg-slate-900">Missing Information</option>
              <option value="Requirement Quality" className="bg-slate-900">Requirement Quality</option>
              <option value="Ambiguous Requirements" className="bg-slate-900">Ambiguous Requirements</option>
              <option value="Execution Integrity" className="bg-slate-900">Execution Integrity</option>
            </select>
          </div>
        </div>

        <span className="text-[11px] font-mono text-slate-400">
          Showing {filteredIssues.length} of {currentIssues.length} findings
        </span>
      </div>

      {/* Findings Grid by Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {CATEGORY_META.map((meta) => {
          const Icon = meta.icon;
          const items = filteredIssues.filter(
            (issue) => issue.category === meta.category
          );

          return (
            <div
              key={meta.category}
              className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-800/80 text-amber-400 border border-slate-700/60">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-white">
                      {meta.category}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {items.length} {items.length === 1 ? "finding" : "findings"}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  {meta.description}
                </p>

                {/* Findings List */}
                <div className="space-y-3">
                  {items.length === 0 ? (
                    <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-850 text-center text-xs text-slate-400">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1 opacity-70" />
                      <span>Zero issues identified</span>
                    </div>
                  ) : (
                    items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800/90 space-y-2 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-mono text-[10px] text-amber-400 font-bold truncate max-w-[150px]">
                            {item.targetRef}
                          </span>
                          <StatusBadge status={item.severity.toUpperCase() as "CRITICAL" | "WARNING" | "INFO"} />
                        </div>
                        <h4 className="font-semibold text-slate-100">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          {item.description}
                        </p>

                        {/* Linked Entities (Requirement, Scenario, Test Case, Defect) */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {item.testCaseId && (
                            <Link
                              href={`/execution?id=${encodeURIComponent(item.testCaseId)}`}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-750 text-[10px] font-mono text-amber-400 hover:border-amber-500/50 hover:text-amber-300 transition-colors"
                              title="Open Test Case in Execution Cockpit"
                            >
                              <span className="text-slate-500">TC:</span>
                              <span className="font-bold">{item.testCaseId}</span>
                            </Link>
                          )}
                          {item.scenarioId && (
                            <Link
                              href={`/traceability?search=${encodeURIComponent(item.scenarioId)}`}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-750 text-[10px] font-mono text-emerald-400 hover:border-emerald-500/50 hover:text-emerald-300 transition-colors"
                              title="View Scenario in Traceability"
                            >
                              <span className="text-slate-500">SCN:</span>
                              <span className="font-bold">{item.scenarioId}</span>
                            </Link>
                          )}
                          {item.requirementId && (
                            <Link
                              href="/requirements"
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-750 text-[10px] font-mono text-sky-400 hover:border-sky-500/50 hover:text-sky-300 transition-colors"
                              title="View Requirement Workspace"
                            >
                              <span className="text-slate-500">REQ:</span>
                              <span className="font-bold">{item.requirementId}</span>
                            </Link>
                          )}
                          {item.defectId && (
                            <Link
                              href="/execution"
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-950/40 border border-rose-800/60 text-[10px] font-mono text-rose-300 hover:border-rose-500/60 transition-colors"
                              title="View Defect in Execution Cockpit"
                            >
                              <Bug className="w-2.5 h-2.5" />
                              <span>{item.defectId}</span>
                            </Link>
                          )}
                        </div>

                        {item.suggestedFix && (
                          <div className="pt-2 border-t border-slate-850 text-[11px] text-amber-300/90 font-mono">
                            <strong className="text-slate-400 font-normal">
                              Remediation:
                            </strong>{" "}
                            {item.suggestedFix}
                          </div>
                        )}

                        {item.linkHref && (
                          <div className="pt-1 flex justify-end">
                            <Link
                              href={item.linkHref}
                              className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400/80 hover:text-amber-300 transition-colors"
                            >
                              <span>Open Entity</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </Link>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Deterministic Quality Rule</span>
                <span className="text-amber-400/80">Automated Gate</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
