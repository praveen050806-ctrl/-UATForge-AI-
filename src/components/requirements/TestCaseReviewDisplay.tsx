"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  CheckCircle,
  AlertOctagon,
  Scale,
  Users,
  Search,
  Filter,
  Copy,
  Check,
  Sparkles,
  Database,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  ExternalLink,
  ShieldAlert,
  PlayCircle,
} from "lucide-react";
import {
  GeneratedTestCase,
  ScenarioType,
  TestCasePriority,
  TestCaseGenerationSummary,
} from "@/types";
import { SectionCard } from "@/components/ui/SectionCard";

interface TestCaseReviewDisplayProps {
  testCases: GeneratedTestCase[];
  summary: TestCaseGenerationSummary;
  meta?: {
    model?: string;
    generatedAt?: string;
    testCaseCount?: number;
  };
  requirementTitle: string;
  onRegenerate?: () => void;
}

const TYPE_CONFIG: Record<
  ScenarioType,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;
    description: string;
  }
> = {
  Positive: {
    label: "Positive",
    icon: CheckCircle,
    color: "text-emerald-400",
    badgeBg: "bg-emerald-500/10",
    badgeBorder: "border-emerald-500/30",
    badgeText: "text-emerald-300",
    description: "Valid standard business execution flows.",
  },
  Negative: {
    label: "Negative",
    icon: AlertOctagon,
    color: "text-rose-400",
    badgeBg: "bg-rose-500/10",
    badgeBorder: "border-rose-500/30",
    badgeText: "text-rose-300",
    description: "Failure conditions, missing data, and rejection flows.",
  },
  Boundary: {
    label: "Boundary",
    icon: Scale,
    color: "text-amber-400",
    badgeBg: "bg-amber-500/10",
    badgeBorder: "border-amber-500/30",
    badgeText: "text-amber-300",
    description: "Explicit threshold limits and edge states.",
  },
  "Role-Based": {
    label: "Role-Based",
    icon: Users,
    color: "text-sky-400",
    badgeBg: "bg-sky-500/10",
    badgeBorder: "border-sky-500/30",
    badgeText: "text-sky-300",
    description: "Actor responsibilities, authorization, and handoffs.",
  },
};

const PRIORITY_CONFIG: Record<
  TestCasePriority,
  { bg: string; text: string; border: string }
> = {
  Critical: {
    bg: "bg-red-500/15",
    text: "text-red-300",
    border: "border-red-500/40",
  },
  High: {
    bg: "bg-amber-500/15",
    text: "text-amber-300",
    border: "border-amber-500/40",
  },
  Medium: {
    bg: "bg-blue-500/15",
    text: "text-blue-300",
    border: "border-blue-500/40",
  },
  Low: {
    bg: "bg-slate-500/15",
    text: "text-slate-300",
    border: "border-slate-500/40",
  },
};

export function TestCaseReviewDisplay({
  testCases,
  summary,
  meta,
  requirementTitle,
  onRegenerate,
}: TestCaseReviewDisplayProps) {
  const [selectedType, setSelectedType] = useState<ScenarioType | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  // Set of testCaseIds that are currently collapsed (default: all expanded)
  const [collapsedCaseIds, setCollapsedCaseIds] = useState<Set<string>>(
    new Set()
  );

  const toggleCollapse = (id: string) => {
    setCollapsedCaseIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    setCollapsedCaseIds(new Set());
  };

  const handleCollapseAll = () => {
    setCollapsedCaseIds(new Set(testCases.map((tc) => tc.testCaseId)));
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(testCases, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter test cases based on category tab & search query
  const filteredCases = useMemo(() => {
    return testCases.filter((tc) => {
      const matchesType = selectedType === "All" || tc.type === selectedType;
      if (!matchesType) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        tc.testCaseId.toLowerCase().includes(q) ||
        tc.scenarioId.toLowerCase().includes(q) ||
        tc.title.toLowerCase().includes(q) ||
        tc.scenario.toLowerCase().includes(q) ||
        tc.role.toLowerCase().includes(q) ||
        tc.requirementReference.toLowerCase().includes(q) ||
        tc.businessRuleReference.toLowerCase().includes(q) ||
        tc.testSteps.some(
          (step) =>
            step.action.toLowerCase().includes(q) ||
            step.expectedResult.toLowerCase().includes(q)
        )
      );
    });
  }, [testCases, selectedType, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Stage Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-slate-900 to-sky-500/10 border border-emerald-500/30 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold uppercase tracking-wider">
              Stage 3: UAT Test Case Suite
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Source: &ldquo;{requirementTitle}&rdquo;
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-400" />
            <span>Execution-Ready UAT Test Cases</span>
          </h2>
          <p className="text-xs text-slate-300">
            Sequential, observable test steps with step-level expected results and strict traceability back to requirements and business rules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={collapsedCaseIds.size > 0 ? handleExpandAll : handleCollapseAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-mono border border-slate-700 transition-colors cursor-pointer"
          >
            {collapsedCaseIds.size > 0 ? (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Expand All</span>
              </>
            ) : (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Collapse All</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopyJson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-mono border border-slate-700 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied JSON</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy JSON</span>
              </>
            )}
          </button>

          <Link
            href="/execution"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-sm shadow-amber-500/20"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Execute UAT Suite</span>
          </Link>

          <Link
            href="/test-suites"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View in Test Suites</span>
          </Link>

          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 text-xs font-semibold border border-sky-500/30 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Regenerate Cases</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div
          onClick={() => setSelectedType("All")}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            selectedType === "All"
              ? "bg-slate-800/90 border-emerald-500/50 shadow-md shadow-emerald-500/10"
              : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">All Cases</span>
            <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">
            {summary.total}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Execution Suite Total</p>
        </div>

        {(["Positive", "Negative", "Boundary", "Role-Based"] as ScenarioType[]).map(
          (type) => {
            const config = TYPE_CONFIG[type];
            const Icon = config.icon;
            const count =
              type === "Positive"
                ? summary.positive
                : type === "Negative"
                ? summary.negative
                : type === "Boundary"
                ? summary.boundary
                : summary.roleBased;
            const isSelected = selectedType === type;

            return (
              <div
                key={type}
                onClick={() => setSelectedType(type)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? `bg-slate-800/90 ${config.badgeBorder} shadow-md`
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">
                    {config.label}
                  </span>
                  <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                </div>
                <div className={`text-2xl font-bold mt-1 font-mono ${config.color}`}>
                  {count}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                  {config.description}
                </p>
              </div>
            );
          }
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 overflow-x-auto">
          <button
            type="button"
            onClick={() => setSelectedType("All")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              selectedType === "All"
                ? "bg-emerald-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All ({summary.total})
          </button>
          {(["Positive", "Negative", "Boundary", "Role-Based"] as ScenarioType[]).map(
            (type) => {
              const count =
                type === "Positive"
                  ? summary.positive
                  : type === "Negative"
                  ? summary.negative
                  : type === "Boundary"
                  ? summary.boundary
                  : summary.roleBased;
              const isSelected = selectedType === type;

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? "bg-slate-750 text-white border border-slate-650"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {type} ({count})
                </button>
              );
            }
          )}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ID, title, role, scenario, step..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Test Cases List */}
      <SectionCard
        title={`UAT Test Cases (${filteredCases.length} displayed)`}
        description={`Showing ${selectedType} test cases with sequential observable steps, individual expected results, and test data.`}
        badge="Stage 3 Real Gemini Engine"
      >
        {filteredCases.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-850 space-y-2">
            <Filter className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-semibold text-white">No matching test cases found</h4>
            <p className="text-xs text-slate-400">
              Try adjusting your category filter or search query.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredCases.map((tc) => {
              const typeCfg = TYPE_CONFIG[tc.type] || TYPE_CONFIG.Positive;
              const priorityCfg =
                PRIORITY_CONFIG[tc.priority] || PRIORITY_CONFIG.Medium;
              const TypeIcon = typeCfg.icon;
              const isCollapsed = collapsedCaseIds.has(tc.testCaseId);

              return (
                <div
                  key={tc.testCaseId}
                  className="rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all overflow-hidden"
                >
                  {/* Test Case Header Banner */}
                  <div
                    onClick={() => toggleCollapse(tc.testCaseId)}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer bg-slate-950/40 hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Test Case ID */}
                        <span className="text-[12px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                          {tc.testCaseId}
                        </span>

                        {/* Linked Scenario ID */}
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-sky-300">
                          Scenario: <span className="font-semibold">{tc.scenarioId}</span>
                        </span>

                        {/* Category Badge */}
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md border ${typeCfg.badgeBg} ${typeCfg.badgeBorder} ${typeCfg.badgeText}`}
                        >
                          <TypeIcon className="w-3 h-3" />
                          <span>{tc.type}</span>
                        </span>

                        {/* Priority Badge */}
                        <span
                          className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md border ${priorityCfg.bg} ${priorityCfg.border} ${priorityCfg.text}`}
                        >
                          {tc.priority} Priority
                        </span>

                        {/* Role Badge */}
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300">
                          Role: <span className="text-white font-semibold">{tc.role}</span>
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white tracking-tight">
                        {tc.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {tc.scenario}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <span className="text-xs font-mono text-slate-400">
                        {tc.testSteps.length} Steps
                      </span>
                      <button
                        type="button"
                        className="p-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white"
                        aria-label={isCollapsed ? "Expand test case" : "Collapse test case"}
                      >
                        {isCollapsed ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronUp className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Details Area */}
                  {!isCollapsed && (
                    <div className="p-4 sm:p-5 border-t border-slate-800/80 space-y-4">
                      {/* Preconditions & Test Data Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Preconditions */}
                        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-850 space-y-1.5">
                          <div className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <ShieldAlert className="w-3 h-3 text-slate-400" />
                            <span>Preconditions</span>
                          </div>
                          {tc.preconditions && tc.preconditions.length > 0 ? (
                            <ul className="space-y-1">
                              {tc.preconditions.map((pre, i) => (
                                <li
                                  key={i}
                                  className="text-xs text-slate-300 flex items-start gap-1.5"
                                >
                                  <span className="text-emerald-400 text-[10px] mt-0.5 shrink-0">
                                    •
                                  </span>
                                  <span>{pre}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-slate-400 italic">None specified</p>
                          )}
                        </div>

                        {/* Test Data */}
                        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-850 space-y-1.5">
                          <div className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Database className="w-3 h-3 text-slate-400" />
                            <span>Test Data / Payload</span>
                          </div>
                          <p className="text-xs text-slate-200 font-mono bg-slate-900/90 p-2 rounded border border-slate-800 break-words">
                            {tc.testData || "Standard valid inputs"}
                          </p>
                        </div>
                      </div>

                      {/* Structured Test Steps Table */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                            Sequential Execution Steps ({tc.testSteps.length})
                          </h4>
                          <span className="text-[11px] font-mono text-emerald-400">
                            Observable Step-Level Verification
                          </span>
                        </div>

                        <div className="rounded-lg border border-slate-800 bg-slate-950/60 overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                                  <th className="py-2.5 px-3 w-12 text-center font-semibold">
                                    #
                                  </th>
                                  <th className="py-2.5 px-4 font-semibold w-1/2">
                                    Observable Action
                                  </th>
                                  <th className="py-2.5 px-4 font-semibold w-1/2">
                                    Expected Result
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-850 text-xs">
                                {tc.testSteps.map((step) => (
                                  <tr
                                    key={step.stepNumber}
                                    className="hover:bg-slate-900/40 transition-colors"
                                  >
                                    <td className="py-3 px-3 text-center font-mono font-bold text-emerald-400 align-top">
                                      <span className="inline-block w-6 h-6 rounded-full bg-slate-800 text-[11px] leading-6 border border-slate-700">
                                        {step.stepNumber}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 text-slate-200 leading-relaxed align-top">
                                      {step.action}
                                    </td>
                                    <td className="py-3 px-4 text-emerald-300/95 leading-relaxed align-top font-mono text-[11px] bg-emerald-500/[0.02]">
                                      {step.expectedResult}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      {/* Terminal Expected Result */}
                      <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                        <div className="text-[11px] font-mono font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Terminal Test Case Expected Result</span>
                        </div>
                        <p className="text-xs text-emerald-200 leading-relaxed font-mono">
                          {tc.expectedResult}
                        </p>
                      </div>

                      {/* Traceability Footer */}
                      <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
                        <div className="flex items-center gap-1.5 truncate">
                          <Scale className="w-3 h-3 text-amber-400 shrink-0" />
                          <span className="text-slate-400">Rule:</span>
                          <span className="text-slate-300 truncate">
                            {tc.businessRuleReference}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 text-slate-400">
                          <div className="flex items-center gap-1">
                            <span>Ref:</span>
                            <span className="text-sky-300 truncate max-w-[200px]">
                              {tc.requirementReference}
                            </span>
                          </div>
                          <span className="text-slate-600">|</span>
                          <span className="text-emerald-400">
                            Scenario: {tc.scenarioId}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* Model & Traceability Verification Footer */}
      {meta && (
        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-400 px-2 gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400">
              Model: {meta.model || "gemini-3.8-flash"}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-sky-400">
              Total Test Cases: {testCases.length}
            </span>
            {meta.generatedAt && (
              <span>
                Generated at {new Date(meta.generatedAt).toLocaleTimeString()} UTC
              </span>
            )}
          </div>
          <span className="text-emerald-400 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Strict Traceability Chain (Requirement → Business Rule → Scenario → Test Case)</span>
          </span>
        </div>
      )}
    </div>
  );
}
