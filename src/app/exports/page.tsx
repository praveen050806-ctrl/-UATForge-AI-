"use client";

import React, { useState, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  FileSpreadsheet,
  FileText,
  Download,
  Layers,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Bug,
  Search,
  Check,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import {
  ActiveSuiteSession,
  getActiveSuite,
  getAllExecutions,
  getAllDefects,
  calculateExecutionMetrics,
  subscribeToUATSession,
} from "@/lib/session/uat-session";
import { TestCaseExecution, DefectRecord } from "@/types";
import { buildUATExportRows, downloadUATCsv } from "@/lib/export/csv";
import { downloadUATExcel } from "@/lib/export/excel";
import { cn } from "@/lib/utils";

export default function ExportsPage() {
  const [toastNotice, setToastNotice] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const sessionData = useSyncExternalStore(
    subscribeToUATSession,
    () => {
      const suite = getActiveSuite();
      const executions = getAllExecutions();
      const defects = getAllDefects();
      return JSON.stringify({ suite, executions, defects });
    },
    () => null
  );

  const { suite, executions, defects }: {
    suite: ActiveSuiteSession | null;
    executions: Record<string, TestCaseExecution>;
    defects: DefectRecord[];
  } = useMemo(() => {
    if (!sessionData) return { suite: null, executions: {}, defects: [] };
    try {
      return JSON.parse(sessionData);
    } catch {
      return { suite: null, executions: {}, defects: [] };
    }
  }, [sessionData]);

  const hasLiveSession = Boolean(suite && suite.testCases && suite.testCases.length > 0);

  // Compute real execution metrics from session data only
  const metrics = useMemo(() => {
    if (!hasLiveSession || !suite?.testCases) {
      return {
        total: 0,
        notExecuted: 0,
        passed: 0,
        failed: 0,
        blocked: 0,
        coveragePercentage: 0,
      };
    }
    return calculateExecutionMetrics(
      suite.testCases.map((tc) => tc.testCaseId),
      executions
    );
  }, [hasLiveSession, suite, executions]);

  const executedCount = metrics.passed + metrics.failed + metrics.blocked;
  const passRate =
    executedCount > 0 ? ((metrics.passed / executedCount) * 100).toFixed(1) : "0.0";

  const openDefectsCount = defects.filter((d) => d.status === "OPEN").length;
  const inReviewDefectsCount = defects.filter((d) => d.status === "IN_REVIEW").length;
  const resolvedDefectsCount = defects.filter((d) => d.status === "RESOLVED").length;
  const criticalDefectsCount = defects.filter((d) => d.severity === "CRITICAL").length;

  // Real suite details
  const suiteTitle = suite?.requirementTitle || "UAT Test Suite";
  const suiteCasesCount = suite?.testCases?.length || 0;
  const lastUpdated = suite?.timestamp
    ? new Date(suite.timestamp).toLocaleString()
    : "Current Session";

  // Filter test cases for interactive preview table
  const filteredCases = useMemo(() => {
    if (!suite?.testCases) return [];
    return suite.testCases.filter((tc) => {
      const exec = executions[tc.testCaseId];
      const status = exec?.status || "NOT_EXECUTED";
      const defect = defects.find((d) => d.testCaseId === tc.testCaseId);

      const matchesStatus =
        statusFilter === "All" || status === statusFilter;

      const q = searchFilter.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        tc.testCaseId.toLowerCase().includes(q) ||
        (tc.scenario || tc.title).toLowerCase().includes(q) ||
        tc.role.toLowerCase().includes(q) ||
        (exec?.defectId || defect?.defectId || "").toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [suite, executions, defects, statusFilter, searchFilter]);

  const handleExportExcel = () => {
    if (!hasLiveSession || !suite?.testCases) return;
    const cleanTitle = suiteTitle.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30);
    downloadUATExcel(
      {
        testCases: suite.testCases,
        executions,
        defects,
        summary: metrics,
        suiteTitle,
      },
      `UATForge_Final_Report_${cleanTitle}`
    );
    setToastNotice(
      `Excel report generated with ${suite.testCases.length} test cases, execution summary, and ${defects.length} defect(s).`
    );
    setTimeout(() => setToastNotice(null), 5000);
  };

  const handleExportCsv = () => {
    if (!hasLiveSession || !suite?.testCases) return;
    const rows = buildUATExportRows(suite.testCases, executions, defects);
    const cleanTitle = suiteTitle.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30);
    downloadUATCsv(
      {
        rows,
        summary: metrics,
        defects,
        suiteTitle,
        includeSummaryHeader: true,
      },
      `UATForge_Final_Report_${cleanTitle}`
    );
    setToastNotice(
      `CSV deliverable generated with all 13 audit fields, execution summary, and defect details.`
    );
    setTimeout(() => setToastNotice(null), 5000);
  };

  return (
    <AppShell>
      <PageHeader
        title="Export & Final UAT Report"
        subtitle="Produce certified test suite deliverables and executive audit reports formatted for signoff."
        badge="Stage 6: Delivery"
      />

      {/* Toast Notification */}
      {toastNotice && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-emerald-300 text-xs font-mono animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastNotice(null)}
            className="text-emerald-400 hover:text-emerald-200 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Real Session Deliverable Overview Card */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                  Active Deliverable Suite
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {lastUpdated}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">
                {suiteTitle}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {hasLiveSession
                  ? `Derived from active session with ${suiteCasesCount} generated test cases and ${defects.length} logged defect(s).`
                  : "No active test cases generated in current session. Generate test cases in Stage 3 to export real UAT deliverables."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono text-slate-300 border-t lg:border-t-0 lg:border-l border-slate-800 pt-4 lg:pt-0 lg:pl-6">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Total Cases</span>
              <span className="text-xl font-bold font-mono text-white">
                {suiteCasesCount}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Execution</span>
              <span className="text-xl font-bold font-mono text-amber-400">
                {metrics.coveragePercentage}%
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Pass Rate</span>
              <span className="text-xl font-bold font-mono text-emerald-400">
                {passRate}%
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Defects</span>
              <span className="text-xl font-bold font-mono text-rose-400">
                {defects.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* No Session Alert */}
      {!hasLiveSession && (
        <div className="mb-8 p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
          <h4 className="text-sm font-bold text-white">No Active UAT Test Suite Found</h4>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            Exports require real session data. Please ingest requirements in Stage 1, generate scenarios in Stage 2, and produce test cases in Stage 3 to create exportable deliverables.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/requirements"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors"
            >
              <span>Ingest Requirements</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/test-suites"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-200 font-semibold text-xs hover:bg-slate-700 transition-colors border border-slate-700"
            >
              <span>View Test Suites</span>
            </Link>
          </div>
        </div>
      )}

      {/* Export Format Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Excel Card */}
        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/30 transition-all flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                EXCEL WORKBOOK (.XLS)
              </span>
            </div>

            <div>
              <h4 className="text-base font-bold text-white">
                Microsoft Excel Multi-Tab Workbook
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Structured multi-sheet deliverable including executive summary metrics,
                complete 13-field test cases with color-coded status styling, and defect registry audit.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1.5 text-xs text-slate-300 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Target:</span>
                <span>Executive Signoff / Stakeholders</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Worksheets:</span>
                <span>Execution Summary, Test Cases, Defect Registry</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Real Data:</span>
                <span>{suiteCasesCount} cases, {defects.length} defect(s)</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportExcel}
            disabled={!hasLiveSession}
            className={cn(
              "w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs transition-colors cursor-pointer",
              hasLiveSession
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/20"
                : "bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700"
            )}
          >
            <Download className="w-4 h-4" />
            <span>Export Excel (.xls)</span>
          </button>
        </div>

        {/* CSV Card */}
        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/30 transition-all flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                STANDARD CSV
              </span>
            </div>

            <div>
              <h4 className="text-base font-bold text-white">
                Standard RFC-4180 CSV
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Comma-separated deliverable with execution summary header, all 13 audit fields
                (Test ID, Scenario, Type, Role, Priority, Steps, Status, Defect ID), and defect registry.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1.5 text-xs text-slate-300 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Target:</span>
                <span>Jira Xray / TestRail / Azure DevOps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Encoding:</span>
                <span>UTF-8 with BOM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Columns:</span>
                <span>13 Required Fields + Defect Trail</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={!hasLiveSession}
            className={cn(
              "w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs transition-colors cursor-pointer",
              hasLiveSession
                ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm shadow-amber-500/20"
                : "bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700"
            )}
          >
            <Download className="w-4 h-4" />
            <span>Download UAT CSV</span>
          </button>
        </div>
      </div>

      {/* FINAL UAT REPORT EXECUTIVE DASHBOARD & PREVIEW */}
      {hasLiveSession && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Final UAT Execution Report</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  Verified Real Session
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit trail and signoff readiness evaluation across all executed test scenarios.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportExcel}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-mono text-xs border border-emerald-500/30 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Excel (.xls)</span>
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-mono text-xs border border-amber-500/30 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          {/* Execution Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Total Cases</span>
              <span className="text-2xl font-bold font-mono text-white mt-1 block">
                {metrics.total}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">100% scope</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-500/20">
              <span className="text-[10px] font-mono text-emerald-400 block uppercase">Passed</span>
              <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">
                {metrics.passed}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {metrics.total > 0 ? ((metrics.passed / metrics.total) * 100).toFixed(0) : 0}% of suite
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-rose-500/20">
              <span className="text-[10px] font-mono text-rose-400 block uppercase">Failed</span>
              <span className="text-2xl font-bold font-mono text-rose-400 mt-1 block">
                {metrics.failed}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {metrics.total > 0 ? ((metrics.failed / metrics.total) * 100).toFixed(0) : 0}% of suite
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-500/20">
              <span className="text-[10px] font-mono text-amber-400 block uppercase">Blocked</span>
              <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">
                {metrics.blocked}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {metrics.total > 0 ? ((metrics.blocked / metrics.total) * 100).toFixed(0) : 0}% of suite
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Not Executed</span>
              <span className="text-2xl font-bold font-mono text-slate-300 mt-1 block">
                {metrics.notExecuted}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {metrics.total > 0 ? ((metrics.notExecuted / metrics.total) * 100).toFixed(0) : 0}% pending
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-rose-500/30">
              <span className="text-[10px] font-mono text-rose-400 block uppercase">Logged Defects</span>
              <span className="text-2xl font-bold font-mono text-rose-400 mt-1 block">
                {defects.length}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {openDefectsCount} Open / {inReviewDefectsCount} Review / {resolvedDefectsCount} Resolved
              </span>
            </div>
          </div>

          {/* Release Signoff Assessment Banner */}
          <div className={cn(
            "p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono",
            metrics.notExecuted > 0
              ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
              : metrics.failed > 0 && criticalDefectsCount > 0
              ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
              : metrics.failed > 0
              ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
          )}>
            <div className="flex items-center gap-3">
              {metrics.notExecuted > 0 ? (
                <Clock className="w-5 h-5 text-amber-400 shrink-0" />
              ) : metrics.failed > 0 && criticalDefectsCount > 0 ? (
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              ) : metrics.failed > 0 ? (
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
              <div>
                <span className="font-bold block uppercase">
                  {metrics.notExecuted > 0
                    ? `Signoff Blocked: ${metrics.notExecuted} Test Cases Pending Execution`
                    : metrics.failed > 0 && criticalDefectsCount > 0
                    ? `Signoff Blocked: ${criticalDefectsCount} Critical Defect(s) Active`
                    : metrics.failed > 0
                    ? `Conditional Signoff: ${metrics.failed} Deviation(s) Logged`
                    : "Ready for Production Signoff: 100% Tests Passed"}
                </span>
                <span className="text-[11px] text-slate-400">
                  {metrics.notExecuted > 0
                    ? "Complete remaining test cases in Stage 5 Execution Cockpit before final certification."
                    : metrics.failed > 0
                    ? "Review and resolve logged defects with engineering prior to release signoff."
                    : "Zero critical defects and all executed test cases verified against expected criteria."}
                </span>
              </div>
            </div>

            <Link
              href="/execution"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-semibold text-xs hover:border-amber-500/40 w-fit shrink-0"
            >
              <span>Execution Cockpit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Test Cases Data Table with Search & Status Filter */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase font-mono">
                  Test Case Deliverable Table ({filteredCases.length})
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search ID, Scenario, Role..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-500/50 w-48 sm:w-60"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono focus:outline-none focus:border-amber-500/50"
                >
                  <option value="All">All Statuses</option>
                  <option value="PASS">PASS</option>
                  <option value="FAIL">FAIL</option>
                  <option value="BLOCKED">BLOCKED</option>
                  <option value="NOT_EXECUTED">NOT_EXECUTED</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Test ID</th>
                    <th className="py-3 px-4">Scenario</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Execution Status</th>
                    <th className="py-3 px-4">Actual Result</th>
                    <th className="py-3 px-4">Tester Comment</th>
                    <th className="py-3 px-4">Defect ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-855/60 font-mono">
                  {filteredCases.map((tc) => {
                    const exec = executions[tc.testCaseId];
                    const status = exec?.status || "NOT_EXECUTED";
                    const defect = defects.find((d) => d.testCaseId === tc.testCaseId);
                    const defectId = exec?.defectId || defect?.defectId;

                    return (
                      <tr key={tc.testCaseId} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-bold text-amber-400 whitespace-nowrap">
                          {tc.testCaseId}
                        </td>
                        <td className="py-3 px-4 text-slate-200 font-sans max-w-xs truncate" title={tc.scenario || tc.title}>
                          {tc.scenario || tc.title}
                        </td>
                        <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                          {tc.role}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-[10px] font-bold",
                            tc.priority === "Critical" ? "bg-rose-500/20 text-rose-300" :
                            tc.priority === "High" ? "bg-amber-500/20 text-amber-300" :
                            tc.priority === "Medium" ? "bg-sky-500/20 text-sky-300" :
                            "bg-slate-800 text-slate-400"
                          )}>
                            {tc.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1",
                            status === "PASS" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                            status === "FAIL" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" :
                            status === "BLOCKED" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                            "bg-slate-800/80 text-slate-400 border border-slate-700/60"
                          )}>
                            {status === "PASS" && <CheckCircle2 className="w-2.5 h-2.5" />}
                            {status === "FAIL" && <XCircle className="w-2.5 h-2.5" />}
                            {status === "BLOCKED" && <AlertCircle className="w-2.5 h-2.5" />}
                            {status === "NOT_EXECUTED" && <Clock className="w-2.5 h-2.5" />}
                            <span>{status}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 max-w-xs truncate font-sans" title={exec?.actualResult || "—"}>
                          {exec?.actualResult || "—"}
                        </td>
                        <td className="py-3 px-4 text-slate-400 max-w-xs truncate font-sans" title={exec?.testerComment || "—"}>
                          {exec?.testerComment || "—"}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {defectId ? (
                            <Link
                              href="/defects"
                              className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold flex items-center gap-1 hover:bg-rose-500/30 w-fit"
                            >
                              <Bug className="w-2.5 h-2.5" />
                              <span>{defectId}</span>
                            </Link>
                          ) : (
                            <span className="text-slate-400 text-[10px]">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {filteredCases.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                        No test cases match filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
