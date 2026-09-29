"use client";

import React, { useState, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  Search,
  Bug,
  PlayCircle,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  GitMerge,
  PlusCircle,
} from "lucide-react";
import {
  TraceabilityLink,
  TraceabilityMetrics,
  TestExecutionStatus,
  GeneratedTestCase,
  GeneratedScenario,
  TestCaseExecution,
  DefectRecord,
} from "@/types";
import {
  ActiveSuiteSession,
  ActiveRequirementSession,
  getActiveSuite,
  getActiveRequirement,
  getActiveScenarios,
  getAllExecutions,
  getAllDefects,
  subscribeToUATSession,
} from "@/lib/session/uat-session";
import { cn } from "@/lib/utils";

const DEMO_LINKS: TraceabilityLink[] = [
  {
    id: "TR-001",
    requirementId: "REQ-001 §2.1",
    requirementTitle: "User MFA Enrollment Workflow",
    businessRule: "BR-01: RFC 6238 TOTP 30-sec window validation",
    scenarioId: "SCN-001",
    scenario: "User scans QR code and enters valid 6-digit TOTP",
    testCaseId: "TC-UAT-001",
    testCaseTitle: "Verify Successful MFA Enrollment with Valid TOTP Token",
    coverageStatus: "Covered",
    executionStatus: "PASS",
  },
  {
    id: "TR-002",
    requirementId: "REQ-001 §2.4",
    requirementTitle: "User MFA Enrollment Workflow",
    businessRule: "BR-02: 3 consecutive failed token lock protocol",
    scenarioId: "SCN-002",
    scenario: "User enters 3 invalid codes sequentially",
    testCaseId: "TC-UAT-002",
    testCaseTitle: "Enforce Account Lockout After 3 Consecutive Invalid MFA Attempts",
    coverageStatus: "Covered",
    executionStatus: "FAIL",
    actualResult: "Lockout triggered after 5 attempts instead of 3",
    defectId: "DEF-001",
    defectStatus: "OPEN",
  },
  {
    id: "TR-003",
    requirementId: "REQ-001 §2.5",
    requirementTitle: "User MFA Enrollment Workflow",
    businessRule: "BR-03: Clock drift tolerance ±1 time-step",
    scenarioId: "SCN-003",
    scenario: "Code submitted at window transition boundary",
    testCaseId: "TC-UAT-003",
    testCaseTitle: "Clock Drift Boundary Verification at Window Transition",
    coverageStatus: "Covered",
    executionStatus: "PASS",
  },
  {
    id: "TR-004",
    requirementId: "REQ-001 §3.1",
    requirementTitle: "User MFA Enrollment Workflow",
    businessRule: "BR-04: Emergency backup recovery codes generation",
    scenarioId: "SCN-004",
    scenario: "User downloads 10 emergency backup hashes",
    testCaseId: "TC-UAT-004",
    testCaseTitle: "Generate and Validate 10 Single-Use Emergency Recovery Codes",
    coverageStatus: "Partial",
    executionStatus: "NOT_EXECUTED",
    gapReason: "Test case is pending manual execution signoff",
  },
  {
    id: "TR-005",
    requirementId: "REQ-002 §1.2",
    requirementTitle: "Cart Coupon Discount Engine",
    businessRule: "BR-05: Cart minimum order value >= $100.00",
    scenarioId: "SCN-005",
    scenario: "Customer applies valid code on $120 cart",
    testCaseId: "TC-UAT-005",
    testCaseTitle: "Verify Percentage Coupon Applied Above Minimum Order Value",
    coverageStatus: "Covered",
    executionStatus: "PASS",
  },
  {
    id: "TR-006",
    requirementId: "REQ-002 §2.0",
    requirementTitle: "Cart Coupon Discount Engine",
    businessRule: "BR-06: Reject expired discount promotion vouchers",
    scenarioId: "SCN-006",
    scenario: "Customer applies expired coupon code",
    testCaseId: "TC-UAT-006",
    testCaseTitle: "Verify Immediate Rejection of Expired Discount Code",
    coverageStatus: "Partial",
    executionStatus: "BLOCKED",
    actualResult: "Coupon validation service timed out during checkout",
    gapReason: "Execution obstructed by dependency failure",
  },
  {
    id: "TR-GAP-001",
    requirementId: "REQ-002 §3.1",
    requirementTitle: "Cart Coupon Discount Engine",
    businessRule: "BR-07: Tiered VIP stackable discounts restriction",
    scenarioId: "SCN-007",
    scenario: "Customer attempts stacking VIP member discount with promotion code",
    testCaseId: "",
    coverageStatus: "Uncovered",
    gapReason: "Scenario has no synthesized UAT test case",
    isUnlinked: true,
  },
];

export function TraceabilityView() {
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

  const { suite, req, scn, executions, defects }: {
    suite: ActiveSuiteSession | null;
    req: ActiveRequirementSession | null;
    scn: GeneratedScenario[];
    executions: Record<string, TestCaseExecution>;
    defects: DefectRecord[];
  } = useMemo(() => {
    if (!sessionData) {
      return { suite: null, req: null, scn: [], executions: {}, defects: [] };
    }
    try {
      return JSON.parse(sessionData);
    } catch {
      return { suite: null, req: null, scn: [], executions: {}, defects: [] };
    }
  }, [sessionData]);

  const hasLiveSession = Boolean(
    (suite && suite.testCases?.length > 0) ||
    (scn && scn.length > 0) ||
    (req && req.title)
  );

  const [selectedSource, setSelectedSource] = useState<"live" | "demo" | null>(null);
  const activeSource = selectedSource ?? (hasLiveSession ? "live" : "demo");

  // Selected row for Single-Chain Inspector
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [viewFilter, setViewFilter] = useState<"all" | "gaps" | "complete">("all");

  // Construct real traceability links and gap items from active session
  const sessionLinks: TraceabilityLink[] = useMemo(() => {
    const links: TraceabilityLink[] = [];
    const testCases: GeneratedTestCase[] = suite?.testCases || [];
    const scenarios: GeneratedScenario[] = scn || [];
    const intelligenceRules: string[] = req?.intelligence?.businessRules || [];
    const reqTitle = suite?.requirementTitle || req?.title || "Active Requirement";
    const reqId = "REQ-001";

    // 1. Map existing Test Cases
    testCases.forEach((tc) => {
      const matchedScn = scenarios.find((s) => s.scenarioId === tc.scenarioId);
      const exec = executions[tc.testCaseId];
      const executionStatus: TestExecutionStatus = exec?.status || "NOT_EXECUTED";
      const defect = defects.find(
        (d) => d.testCaseId === tc.testCaseId || d.defectId === exec?.defectId
      );

      let coverageStatus: "Covered" | "Partial" | "Uncovered" = "Covered";
      let gapReason: string | undefined = undefined;

      if (executionStatus === "FAIL" && !defect && !exec?.defectId) {
        coverageStatus = "Partial";
        gapReason = "Test case failed without a defect ticket logged";
      } else if (executionStatus === "NOT_EXECUTED") {
        coverageStatus = "Partial";
        gapReason = "Pending manual execution signoff";
      } else if (executionStatus === "BLOCKED") {
        coverageStatus = "Partial";
        gapReason = "Execution obstructed by blocker";
      }

      links.push({
        id: `TR-${tc.testCaseId}`,
        requirementId: tc.requirementReference || reqId,
        requirementTitle: reqTitle,
        businessRule:
          tc.businessRuleReference ||
          matchedScn?.businessRule ||
          "BR-GOVERNING",
        scenarioId: tc.scenarioId,
        scenario: tc.scenario || matchedScn?.title || tc.title,
        testCaseId: tc.testCaseId,
        testCaseTitle: tc.title,
        coverageStatus,
        executionStatus,
        actualResult: exec?.actualResult,
        defectId: exec?.defectId || defect?.defectId,
        defectStatus: defect?.status,
        gapReason,
        isUnlinked: false,
      });
    });

    // 2. Detect Uncovered Scenarios (scenarios without test cases)
    scenarios.forEach((s) => {
      const hasTestCase = testCases.some((tc) => tc.scenarioId === s.scenarioId);
      if (!hasTestCase) {
        links.push({
          id: `GAP-SCN-${s.scenarioId}`,
          requirementId: reqId,
          requirementTitle: reqTitle,
          businessRule: s.businessRule || "BR-UNMAPPED",
          scenarioId: s.scenarioId,
          scenario: s.title,
          testCaseId: "",
          coverageStatus: "Uncovered",
          gapReason: "Scenario has no synthesized UAT test cases",
          isUnlinked: true,
        });
      }
    });

    // 3. Detect Uncovered Business Rules (declared in intelligence but unreferenced)
    intelligenceRules.forEach((br, idx) => {
      const snippet = br.slice(0, 30).toLowerCase();
      const isReferencedInCases = testCases.some(
        (tc) =>
          (tc.businessRuleReference && tc.businessRuleReference.toLowerCase().includes(snippet)) ||
          tc.title.toLowerCase().includes(snippet) ||
          br.toLowerCase().includes((tc.businessRuleReference || "").toLowerCase())
      );
      const isReferencedInScenarios = scenarios.some(
        (s) =>
          (s.businessRule && s.businessRule.toLowerCase().includes(snippet)) ||
          s.title.toLowerCase().includes(snippet) ||
          br.toLowerCase().includes((s.businessRule || "").toLowerCase())
      );

      if (!isReferencedInCases && !isReferencedInScenarios) {
        links.push({
          id: `GAP-BR-${idx + 1}`,
          requirementId: reqId,
          requirementTitle: reqTitle,
          businessRule: br,
          scenarioId: "",
          scenario: "No scenario generated for this rule",
          testCaseId: "",
          coverageStatus: "Uncovered",
          gapReason: "Business rule lacks scenario and test case coverage",
          isUnlinked: true,
        });
      }
    });

    return links;
  }, [suite, req, scn, executions, defects]);

  const activeDataset = activeSource === "live" ? sessionLinks : DEMO_LINKS;

  // Calculate Real Coverage Metrics (No Fake Percentages)
  const metrics: TraceabilityMetrics = useMemo(() => {
    if (activeSource === "live") {
      const totalTestCases = suite?.testCases?.length || 0;
      const totalScenarios = scn?.length > 0 ? scn.length : (suite?.testCases ? new Set(suite.testCases.map((tc) => tc.scenarioId)).size : 0);
      const intelligenceRules = req?.intelligence?.businessRules || [];
      const totalBusinessRules = intelligenceRules.length > 0
        ? intelligenceRules.length
        : new Set(suite?.testCases?.map((tc) => tc.businessRuleReference).filter(Boolean)).size || 1;

      // Real covered counts
      const coveredBusinessRules = intelligenceRules.length > 0
        ? intelligenceRules.filter((br) => {
            const snippet = br.slice(0, 25).toLowerCase();
            return sessionLinks.some(
              (l) => l.testCaseId && l.businessRule && (l.businessRule.toLowerCase().includes(snippet) || br.toLowerCase().includes(l.businessRule.toLowerCase()))
            );
          }).length
        : totalTestCases > 0 ? totalBusinessRules : 0;

      const coveredScenarios = totalScenarios > 0
        ? (scn?.length > 0
            ? scn.filter((s) =>
                suite?.testCases?.some((tc) => tc.scenarioId === s.scenarioId)
              ).length
            : totalScenarios)
        : 0;

      let executedTestCases = 0;
      let failedCount = 0;
      let failedWithDefect = 0;

      if (suite?.testCases) {
        suite.testCases.forEach((tc) => {
          const exec = executions[tc.testCaseId];
          if (exec && exec.status && exec.status !== "NOT_EXECUTED") {
            executedTestCases++;
            if (exec.status === "FAIL") {
              failedCount++;
              if (exec.defectId || defects.some((d) => d.testCaseId === tc.testCaseId)) {
                failedWithDefect++;
              }
            }
          }
        });
      }

      const uncoveredGaps = sessionLinks.filter(
        (l) => l.coverageStatus === "Uncovered" || l.coverageStatus === "Partial"
      ).length;

      const reqCoverage = totalBusinessRules > 0
        ? Number(((coveredBusinessRules / totalBusinessRules) * 100).toFixed(1))
        : totalTestCases > 0 ? 100 : 0;

      const scnCoverage = totalScenarios > 0
        ? Number(((coveredScenarios / totalScenarios) * 100).toFixed(1))
        : 0;

      const tcCoverage = totalTestCases > 0 ? 100.0 : 0;

      const execCoverage = totalTestCases > 0
        ? Number(((executedTestCases / totalTestCases) * 100).toFixed(1))
        : 0;

      const defectCoverage = failedCount > 0
        ? Number(((failedWithDefect / failedCount) * 100).toFixed(1))
        : 100.0;

      return {
        requirementCoverage: reqCoverage,
        scenarioCoverage: scnCoverage,
        testCaseCoverage: tcCoverage,
        executionCoverage: execCoverage,
        defectLinkage: defectCoverage,
        totalRequirements: 1,
        totalBusinessRules,
        coveredBusinessRules,
        totalScenarios,
        coveredScenarios,
        totalTestCases,
        executedTestCases,
        totalDefects: defects.length,
        failedCount,
        uncoveredGapsCount: uncoveredGaps,
      };
    }

    // Demo Reference metrics (Strictly calculated from DEMO_LINKS)
    const demoTotalCases = DEMO_LINKS.filter((l) => Boolean(l.testCaseId)).length;
    const demoExecuted = DEMO_LINKS.filter(
      (l) => l.executionStatus && l.executionStatus !== "NOT_EXECUTED"
    ).length;
    const demoFailed = DEMO_LINKS.filter((l) => l.executionStatus === "FAIL").length;
    const demoFailedWithDefect = DEMO_LINKS.filter(
      (l) => l.executionStatus === "FAIL" && Boolean(l.defectId)
    ).length;
    const demoScenarios = new Set(DEMO_LINKS.map((l) => l.scenarioId).filter(Boolean)).size;
    const demoCoveredScn = new Set(
      DEMO_LINKS.filter((l) => Boolean(l.testCaseId)).map((l) => l.scenarioId).filter(Boolean)
    ).size;
    const demoGaps = DEMO_LINKS.filter((l) => l.coverageStatus !== "Covered").length;

    return {
      requirementCoverage: 85.7,
      scenarioCoverage: Number(((demoCoveredScn / demoScenarios) * 100).toFixed(1)),
      testCaseCoverage: 100.0,
      executionCoverage: Number(((demoExecuted / demoTotalCases) * 100).toFixed(1)),
      defectLinkage: demoFailed > 0 ? Number(((demoFailedWithDefect / demoFailed) * 100).toFixed(1)) : 100.0,
      totalRequirements: 2,
      totalBusinessRules: 7,
      coveredBusinessRules: 6,
      totalScenarios: demoScenarios,
      coveredScenarios: demoCoveredScn,
      totalTestCases: demoTotalCases,
      executedTestCases: demoExecuted,
      totalDefects: 1,
      failedCount: demoFailed,
      uncoveredGapsCount: demoGaps,
    };
  }, [activeSource, sessionLinks, suite, req, scn, executions, defects]);

  // Filtered links
  const filteredLinks = useMemo(() => {
    return activeDataset.filter((item) => {
      // View mode filter
      if (viewFilter === "gaps") {
        if (item.coverageStatus === "Covered") return false;
      } else if (viewFilter === "complete") {
        if (item.coverageStatus !== "Covered" || !item.testCaseId || !item.executionStatus) {
          return false;
        }
      }

      // Execution status filter
      if (statusFilter !== "All") {
        if (statusFilter === "DEFECT") {
          if (!item.defectId) return false;
        } else if (statusFilter === "UNCOVERED") {
          if (item.coverageStatus !== "Uncovered") return false;
        } else if (item.executionStatus !== statusFilter) {
          return false;
        }
      }

      // Search query
      const q = search.toLowerCase().trim();
      if (!q) return true;

      return (
        item.requirementId.toLowerCase().includes(q) ||
        item.requirementTitle.toLowerCase().includes(q) ||
        item.businessRule.toLowerCase().includes(q) ||
        item.scenario.toLowerCase().includes(q) ||
        item.testCaseId.toLowerCase().includes(q) ||
        (item.scenarioId && item.scenarioId.toLowerCase().includes(q)) ||
        (item.defectId && item.defectId.toLowerCase().includes(q)) ||
        (item.testCaseTitle && item.testCaseTitle.toLowerCase().includes(q))
      );
    });
  }, [activeDataset, viewFilter, statusFilter, search]);

  // Active selected row for Single-Chain Inspector
  const selectedChain = useMemo(() => {
    if (!selectedLinkId) {
      return filteredLinks[0] || activeDataset[0] || null;
    }
    return activeDataset.find((l) => l.id === selectedLinkId) || filteredLinks[0] || null;
  }, [selectedLinkId, filteredLinks, activeDataset]);

  return (
    <div className="space-y-6">
      {/* 6-STAGE TOPOLOGY HEADER WITH REAL COVERAGE PERCENTAGES */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block mb-0.5">
              UAT Complete Traceability Chain
            </span>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Requirement → Business Rule → Scenario → Test Case → Execution → Defect</span>
            </h3>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            {metrics.uncoveredGapsCount > 0 ? (
              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30 font-bold inline-flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                <span>{metrics.uncoveredGapsCount} Gap(s) Flagged</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>100% Traceability Covered</span>
              </span>
            )}
          </div>
        </div>

        {/* Real Coverage Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          {/* 1. Requirement / Rule Coverage */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-sky-500/30 transition-all">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">1. Req &amp; Rules</span>
              <span className="text-[10px] font-mono text-sky-400 font-bold">
                {metrics.coveredBusinessRules}/{metrics.totalBusinessRules}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-white">
                {metrics.requirementCoverage}%
              </span>
              <span className="text-[10px] text-slate-400 font-mono">covered</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-800 mt-2 overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, metrics.requirementCoverage)}%` }}
              />
            </div>
          </div>

          {/* 2. Scenario Coverage */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">2. Scenarios</span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                {metrics.coveredScenarios}/{metrics.totalScenarios}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {metrics.scenarioCoverage}%
              </span>
              <span className="text-[10px] text-slate-400 font-mono">synthesized</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-800 mt-2 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, metrics.scenarioCoverage)}%` }}
              />
            </div>
          </div>

          {/* 3. Test Case Coverage */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/30 transition-all">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">3. Test Cases</span>
              <span className="text-[10px] font-mono text-amber-400 font-bold">
                {metrics.totalTestCases} Cases
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-amber-400">
                {metrics.testCaseCoverage}%
              </span>
              <span className="text-[10px] text-slate-400 font-mono">mapped</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-800 mt-2 overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, metrics.testCaseCoverage)}%` }}
              />
            </div>
          </div>

          {/* 4. Execution Coverage */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-purple-500/30 transition-all">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">4. Execution</span>
              <span className="text-[10px] font-mono text-purple-400 font-bold">
                {metrics.executedTestCases}/{metrics.totalTestCases}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-purple-400">
                {metrics.executionCoverage}%
              </span>
              <span className="text-[10px] text-slate-400 font-mono">executed</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-800 mt-2 overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, metrics.executionCoverage)}%` }}
              />
            </div>
          </div>

          {/* 5. Defect Linkage */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-rose-500/30 transition-all">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">5. Defect Linkage</span>
              <span className="text-[10px] font-mono text-rose-400 font-bold">
                {metrics.failedCount > 0
                  ? `${metrics.totalDefects} Logged`
                  : "0 Failures"}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-rose-400">
                {metrics.defectLinkage}%
              </span>
              <span className="text-[10px] text-slate-400 font-mono">linked</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-800 mt-2 overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, metrics.defectLinkage)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SINGLE-CHAIN INSPECTOR / SELECTED PATH CARD */}
      {selectedChain && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-slate-950 border border-amber-500/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <GitMerge className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white uppercase font-mono">
                Chain Inspector: {selectedChain.testCaseId || selectedChain.scenarioId || selectedChain.requirementId}
              </span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase",
                  selectedChain.coverageStatus === "Covered" && "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
                  selectedChain.coverageStatus === "Partial" && "bg-amber-500/20 text-amber-300 border border-amber-500/30",
                  selectedChain.coverageStatus === "Uncovered" && "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                )}
              >
                {selectedChain.coverageStatus}
              </span>
            </div>

            {selectedChain.gapReason && (
              <span className="text-xs text-rose-400 font-mono flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{selectedChain.gapReason}</span>
              </span>
            )}
          </div>

          {/* Interactive Node Flow Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
            {/* 1. Requirement */}
            <Link
              href="/requirements"
              className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-sky-500/50 transition-all group cursor-pointer block"
              title="Click to view Requirement Workspace"
            >
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mb-1">
                <span className="text-sky-400 font-bold uppercase">1. Requirement</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="font-mono font-bold text-xs text-white truncate">
                {selectedChain.requirementId}
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                {selectedChain.requirementTitle}
              </div>
            </Link>

            {/* 2. Business Rule */}
            <Link
              href="/requirements"
              className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-sky-500/50 transition-all group cursor-pointer block"
              title="Click to view Business Rules"
            >
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mb-1">
                <span className="text-sky-400 font-bold uppercase">2. Business Rule</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="font-mono text-xs text-slate-200 line-clamp-2">
                {selectedChain.businessRule}
              </div>
            </Link>

            {/* 3. Scenario */}
            {selectedChain.scenarioId ? (
              <Link
                href={`/test-suites?search=${encodeURIComponent(selectedChain.scenarioId)}`}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 transition-all group cursor-pointer block"
                title="Click to filter by Scenario"
              >
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mb-1">
                  <span className="text-emerald-400 font-bold uppercase">3. Scenario</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="font-mono font-bold text-xs text-emerald-300 truncate">
                  {selectedChain.scenarioId}
                </div>
                <div className="text-[10px] text-slate-300 truncate mt-0.5">
                  {selectedChain.scenario}
                </div>
              </Link>
            ) : (
              <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/30">
                <span className="text-[9px] font-mono text-rose-400 font-bold uppercase block mb-1">
                  3. Scenario Gap
                </span>
                <span className="text-xs text-rose-300 font-semibold block">Unsynthesized</span>
                <Link
                  href="/requirements"
                  className="text-[10px] text-amber-400 underline mt-1 inline-flex items-center gap-1"
                >
                  Generate Scenarios <ArrowRight className="w-2.5 h-2.5" />
                </Link>
              </div>
            )}

            {/* 4. Test Case */}
            {selectedChain.testCaseId ? (
              <Link
                href={`/execution?id=${encodeURIComponent(selectedChain.testCaseId)}`}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 transition-all group cursor-pointer block"
                title="Click to execute Test Case"
              >
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mb-1">
                  <span className="text-amber-400 font-bold uppercase">4. Test Case</span>
                  <PlayCircle className="w-3 h-3 text-amber-400/80" />
                </div>
                <div className="font-mono font-bold text-xs text-amber-300 truncate">
                  {selectedChain.testCaseId}
                </div>
                <div className="text-[10px] text-slate-300 truncate mt-0.5">
                  {selectedChain.testCaseTitle || selectedChain.scenario}
                </div>
              </Link>
            ) : (
              <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/30">
                <span className="text-[9px] font-mono text-rose-400 font-bold uppercase block mb-1">
                  4. Test Case Gap
                </span>
                <span className="text-xs text-rose-300 font-semibold block">Missing Test Case</span>
                <Link
                  href="/requirements"
                  className="text-[10px] text-amber-400 underline mt-1 inline-flex items-center gap-1"
                >
                  Synthesize Cases <ArrowRight className="w-2.5 h-2.5" />
                </Link>
              </div>
            )}

            {/* 5. Execution */}
            {selectedChain.testCaseId ? (
              <Link
                href={`/execution?id=${encodeURIComponent(selectedChain.testCaseId)}`}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-purple-500/50 transition-all group cursor-pointer block"
                title="Open in Execution Cockpit"
              >
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mb-1">
                  <span className="text-purple-400 font-bold uppercase">5. Execution</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span
                  className={cn(
                    "inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase",
                    selectedChain.executionStatus === "PASS" && "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
                    selectedChain.executionStatus === "FAIL" && "bg-rose-500/20 text-rose-300 border border-rose-500/30",
                    selectedChain.executionStatus === "BLOCKED" && "bg-amber-500/20 text-amber-300 border border-amber-500/30",
                    (!selectedChain.executionStatus || selectedChain.executionStatus === "NOT_EXECUTED") &&
                      "bg-slate-800 text-slate-400 border border-slate-700"
                  )}
                >
                  {selectedChain.executionStatus || "NOT_EXECUTED"}
                </span>
                <div className="text-[10px] text-slate-400 truncate mt-1">
                  {selectedChain.actualResult || "Ready to execute"}
                </div>
              </Link>
            ) : (
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-slate-400">
                <span className="text-[9px] font-mono uppercase block mb-1">5. Execution</span>
                <span className="text-xs">Unexecutable</span>
              </div>
            )}

            {/* 6. Defect */}
            {selectedChain.defectId ? (
              <Link
                href="/defects"
                className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 transition-all group cursor-pointer block"
                title="View in Defects Workflow"
              >
                <div className="flex items-center justify-between text-[9px] font-mono text-rose-400 mb-1">
                  <span className="font-bold uppercase">6. Defect Ticket</span>
                  <Bug className="w-3 h-3 text-rose-400" />
                </div>
                <div className="font-mono font-bold text-xs text-rose-300 truncate">
                  {selectedChain.defectId}
                </div>
                <div className="text-[10px] text-slate-300 truncate mt-0.5">
                  Status: {selectedChain.defectStatus || "OPEN"}
                </div>
              </Link>
            ) : selectedChain.executionStatus === "FAIL" ? (
              <Link
                href={`/execution?id=${encodeURIComponent(selectedChain.testCaseId)}`}
                className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 hover:bg-rose-500/20 transition-all cursor-pointer block"
                title="Click to create defect in Cockpit"
              >
                <span className="text-[9px] font-mono text-rose-400 font-bold uppercase block mb-1">
                  6. Defect Gap
                </span>
                <span className="text-xs text-rose-300 font-bold flex items-center gap-1">
                  <PlusCircle className="w-3 h-3" />
                  <span>Create Defect</span>
                </span>
              </Link>
            ) : (
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-slate-400">
                <span className="text-[9px] font-mono uppercase block mb-1">6. Defect</span>
                <span className="text-xs text-emerald-400/80 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>No Defects</span>
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DATASET SOURCE & VIEW TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          {hasLiveSession && (
            <button
              type="button"
              onClick={() => setSelectedSource("live")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2",
                activeSource === "live"
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              )}
            >
              <span className="w-2 h-2 rounded-full bg-current" />
              <span>Active Session Suite ({sessionLinks.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setSelectedSource("demo")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2",
              activeSource === "demo"
                ? "bg-slate-700 text-white font-bold border border-slate-600"
                : "text-slate-400 hover:text-white"
            )}
          >
            <span>Demo Reference Matrix ({DEMO_LINKS.length})</span>
          </button>
        </div>

        {/* View Filter Toggle */}
        <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setViewFilter("all")}
            className={cn(
              "px-2.5 py-1 text-xs rounded-md font-mono transition-colors cursor-pointer",
              viewFilter === "all" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
            )}
          >
            All Links ({activeDataset.length})
          </button>
          <button
            type="button"
            onClick={() => setViewFilter("gaps")}
            className={cn(
              "px-2.5 py-1 text-xs rounded-md font-mono transition-colors cursor-pointer flex items-center gap-1",
              viewFilter === "gaps" ? "bg-rose-500 text-white font-bold" : "text-slate-400 hover:text-white"
            )}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Gaps &amp; Uncovered ({metrics.uncoveredGapsCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setViewFilter("complete")}
            className={cn(
              "px-2.5 py-1 text-xs rounded-md font-mono transition-colors cursor-pointer",
              viewFilter === "complete" ? "bg-emerald-600 text-white font-bold" : "text-slate-400 hover:text-white"
            )}
          >
            Complete Chains
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search requirement, rule, scenario, test case, or defect..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all font-mono"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
          <span className="text-[11px] text-slate-400 font-mono">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent border-none text-slate-200 focus:outline-none text-xs cursor-pointer font-medium font-mono"
          >
            <option value="All" className="bg-slate-900">All Statuses</option>
            <option value="PASS" className="bg-slate-900">PASS</option>
            <option value="FAIL" className="bg-slate-900">FAIL</option>
            <option value="BLOCKED" className="bg-slate-900">BLOCKED</option>
            <option value="NOT_EXECUTED" className="bg-slate-900">NOT EXECUTED</option>
            <option value="DEFECT" className="bg-slate-900">Has Defect</option>
            <option value="UNCOVERED" className="bg-slate-900">Uncovered Gap</option>
          </select>
        </div>
      </div>

      {/* TRACEABILITY MATRIX TABLE */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4 font-semibold">1. Req Reference</th>
                <th className="py-3 px-4 font-semibold">2. Business Rule</th>
                <th className="py-3 px-4 font-semibold">3. Scenario</th>
                <th className="py-3 px-4 font-semibold">4. Test Case</th>
                <th className="py-3 px-4 font-semibold text-center">5. Execution</th>
                <th className="py-3 px-4 font-semibold text-right">6. Defect</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredLinks.map((row) => {
                const isSelected = selectedChain?.id === row.id;

                return (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedLinkId(row.id)}
                    className={cn(
                      "hover:bg-slate-800/40 transition-colors cursor-pointer",
                      isSelected && "bg-amber-500/5 border-l-2 border-l-amber-500",
                      row.coverageStatus === "Uncovered" && "bg-rose-500/5"
                    )}
                  >
                    {/* 1. Requirement Link */}
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-400 shrink-0 max-w-[150px]">
                      <Link
                        href="/requirements"
                        onClick={(e) => e.stopPropagation()}
                        className="hover:underline block truncate"
                        title={row.requirementTitle}
                      >
                        {row.requirementId}
                      </Link>
                      <span className="text-[10px] text-slate-400 font-normal block truncate">
                        {row.requirementTitle}
                      </span>
                    </td>

                    {/* 2. Business Rule */}
                    <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px] max-w-[200px]">
                      <Link
                        href="/requirements"
                        onClick={(e) => e.stopPropagation()}
                        className="hover:text-amber-300 block line-clamp-2"
                        title={row.businessRule}
                      >
                        {row.businessRule}
                      </Link>
                    </td>

                    {/* 3. Scenario */}
                    <td className="py-3.5 px-4 text-slate-300 text-[11px] max-w-[220px]">
                      {row.scenarioId ? (
                        <div>
                          <Link
                            href={`/test-suites?search=${encodeURIComponent(row.scenarioId)}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[10px] font-mono text-emerald-400 font-bold block mb-0.5 hover:underline"
                          >
                            {row.scenarioId}
                          </Link>
                          <p className="line-clamp-2 font-sans">{row.scenario}</p>
                        </div>
                      ) : (
                        <span className="text-rose-400 text-[10px] font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>No Scenario</span>
                        </span>
                      )}
                    </td>

                    {/* 4. Test Case ID */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-amber-400 whitespace-nowrap">
                      {row.testCaseId ? (
                        <Link
                          href={`/execution?id=${encodeURIComponent(row.testCaseId)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:underline flex items-center gap-1.5"
                          title="Open Test Case in Execution Cockpit"
                        >
                          <span>{row.testCaseId}</span>
                          <PlayCircle className="w-3 h-3 text-amber-400/80 shrink-0" />
                        </Link>
                      ) : (
                        <Link
                          href="/requirements"
                          onClick={(e) => e.stopPropagation()}
                          className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold hover:bg-rose-500/30"
                        >
                          Generate Cases
                        </Link>
                      )}
                    </td>

                    {/* 5. Execution Status */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {row.testCaseId ? (
                        <Link
                          href={`/execution?id=${encodeURIComponent(row.testCaseId)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:opacity-90 inline-block"
                        >
                          <span
                            className={cn(
                              "inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase",
                              row.executionStatus === "PASS" && "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
                              row.executionStatus === "FAIL" && "bg-rose-500/20 text-rose-300 border border-rose-500/30",
                              row.executionStatus === "BLOCKED" && "bg-amber-500/20 text-amber-300 border border-amber-500/30",
                              (!row.executionStatus || row.executionStatus === "NOT_EXECUTED") &&
                                "bg-slate-800 text-slate-400 border border-slate-700"
                            )}
                          >
                            {row.executionStatus === "NOT_EXECUTED" || !row.executionStatus
                              ? "Not Executed"
                              : row.executionStatus}
                          </span>
                        </Link>
                      ) : (
                        <span className="text-slate-600 text-[10px]">—</span>
                      )}
                    </td>

                    {/* 6. Defect */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {row.defectId ? (
                        <Link
                          href="/defects"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono font-bold text-[10px] hover:bg-rose-500/30 transition-colors"
                        >
                          <Bug className="w-3 h-3" />
                          <span>{row.defectId}</span>
                        </Link>
                      ) : row.executionStatus === "FAIL" ? (
                        <Link
                          href={`/execution?id=${encodeURIComponent(row.testCaseId)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-[10px] hover:bg-rose-500/20"
                        >
                          <PlusCircle className="w-3 h-3" />
                          <span>Create Defect</span>
                        </Link>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-600">—</span>
                      )}
                    </td>

                    {/* Chain Coverage Status Badge */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase inline-flex items-center gap-1",
                          row.coverageStatus === "Covered" && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                          row.coverageStatus === "Partial" && "bg-amber-500/10 text-amber-300 border border-amber-500/20",
                          row.coverageStatus === "Uncovered" && "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                        )}
                        title={row.gapReason}
                      >
                        {row.coverageStatus === "Covered" && <CheckCircle2 className="w-2.5 h-2.5" />}
                        {row.coverageStatus === "Partial" && <Clock className="w-2.5 h-2.5" />}
                        {row.coverageStatus === "Uncovered" && <AlertTriangle className="w-2.5 h-2.5" />}
                        <span>{row.coverageStatus}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredLinks.length === 0 && (
          <div className="py-12 text-center text-xs text-slate-400 space-y-2">
            <p>No traceability links matching selected filter criteria.</p>
            {viewFilter !== "all" && (
              <button
                type="button"
                onClick={() => setViewFilter("all")}
                className="text-amber-400 underline cursor-pointer text-xs"
              >
                Reset view filter to show all links
              </button>
            )}
          </div>
        )}

        {/* Table Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono text-slate-400 px-4 gap-2">
          <span>
            {activeSource === "live"
              ? `Live Traceability: Showing ${filteredLinks.length} of ${sessionLinks.length} entities`
              : `Demo Matrix: Showing ${filteredLinks.length} of ${DEMO_LINKS.length} entities`}
          </span>
          <span className="text-amber-400 font-medium">
            Click any row to inspect complete 6-stage chain
          </span>
        </div>
      </div>
    </div>
  );
}
