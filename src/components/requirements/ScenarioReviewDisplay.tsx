"use client";

import React, { useState, useMemo } from "react";
import {
  CheckCircle,
  AlertOctagon,
  Scale,
  Users,
  Search,
  Filter,
  Copy,
  Check,
  Clock,
  Sparkles,
  Database,
} from "lucide-react";
import {
  GeneratedScenario,
  ScenarioType,
  ScenarioPriority,
  ScenarioGenerationSummary,
} from "@/types";
import { SectionCard } from "@/components/ui/SectionCard";

interface ScenarioReviewDisplayProps {
  scenarios: GeneratedScenario[];
  summary: ScenarioGenerationSummary;
  meta?: {
    model?: string;
    generatedAt?: string;
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
  ScenarioPriority,
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

export function ScenarioReviewDisplay({
  scenarios,
  summary,
  meta,
  requirementTitle,
  onRegenerate,
}: ScenarioReviewDisplayProps) {
  const [selectedType, setSelectedType] = useState<ScenarioType | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(scenarios, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter scenarios based on category tab & search query
  const filteredScenarios = useMemo(() => {
    return scenarios.filter((scenario) => {
      const matchesType =
        selectedType === "All" || scenario.type === selectedType;

      if (!matchesType) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        scenario.scenarioId.toLowerCase().includes(q) ||
        scenario.title.toLowerCase().includes(q) ||
        scenario.description.toLowerCase().includes(q) ||
        scenario.role.toLowerCase().includes(q) ||
        scenario.businessRule.toLowerCase().includes(q) ||
        scenario.expectedOutcome.toLowerCase().includes(q) ||
        scenario.testData.toLowerCase().includes(q)
      );
    });
  }, [scenarios, selectedType, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Stage Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-500/10 via-slate-900 to-emerald-500/10 border border-sky-500/30 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold uppercase tracking-wider">
              Stage 2: Scenario Review
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Traceable to: &ldquo;{requirementTitle}&rdquo;
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Generated UAT Scenario Suite
          </h2>
          <p className="text-xs text-slate-400">
            Validated by runtime Zod guardrails and derived strictly from Requirement Intelligence business rules.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
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
          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 text-xs font-semibold border border-sky-500/30 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Regenerate</span>
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
              ? "bg-slate-800/90 border-sky-500/50 shadow-md shadow-sky-500/10"
              : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">All Scenarios</span>
            <Database className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">
            {summary.total}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Total Suite Count</p>
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
                ? "bg-sky-500 text-slate-950 shadow-sm"
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
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, title, role, rule..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
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

      {/* Scenario List */}
      <SectionCard
        title={`UAT Scenarios (${filteredScenarios.length} displayed)`}
        description={`Showing ${selectedType} scenarios. Each scenario is mapped to governing business rules and ready for test case elaboration.`}
        badge="Live AI Intelligence"
      >
        {filteredScenarios.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-850 space-y-2">
            <Filter className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-semibold text-white">No matching scenarios found</h4>
            <p className="text-xs text-slate-400">
              Try adjusting your category filter or search query.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredScenarios.map((scenario) => {
              const typeCfg = TYPE_CONFIG[scenario.type] || TYPE_CONFIG.Positive;
              const priorityCfg =
                PRIORITY_CONFIG[scenario.priority] || PRIORITY_CONFIG.Medium;
              const TypeIcon = typeCfg.icon;

              return (
                <div
                  key={scenario.scenarioId}
                  className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
                >
                  {/* Scenario Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Scenario ID */}
                        <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-sky-300">
                          {scenario.scenarioId}
                        </span>

                        {/* Category Badge */}
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md border ${typeCfg.badgeBg} ${typeCfg.badgeBorder} ${typeCfg.badgeText}`}
                        >
                          <TypeIcon className="w-3 h-3" />
                          <span>{scenario.type}</span>
                        </span>

                        {/* Priority Badge */}
                        <span
                          className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md border ${priorityCfg.bg} ${priorityCfg.border} ${priorityCfg.text}`}
                        >
                          {scenario.priority} Priority
                        </span>

                        {/* Role Badge */}
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300">
                          Role: <span className="text-white font-semibold">{scenario.role}</span>
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white tracking-tight">
                        {scenario.title}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {scenario.description}
                  </p>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {/* Preconditions */}
                    <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-850 space-y-1.5">
                      <div className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Preconditions</span>
                      </div>
                      {scenario.preconditions && scenario.preconditions.length > 0 ? (
                        <ul className="space-y-1">
                          {scenario.preconditions.map((pre, i) => (
                            <li
                              key={i}
                              className="text-xs text-slate-300 flex items-start gap-1.5"
                            >
                              <span className="text-sky-400 text-[10px] mt-0.5 shrink-0">
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
                      <p className="text-xs text-slate-200 font-mono bg-slate-900/90 p-2 rounded border border-slate-800">
                        {scenario.testData || "Standard valid inputs"}
                      </p>
                    </div>
                  </div>

                  {/* Expected Outcome */}
                  <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/25 space-y-1">
                    <div className="text-[11px] font-mono font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle className="w-3 h-3" />
                      <span>Expected Business Outcome</span>
                    </div>
                    <p className="text-xs text-emerald-200 leading-relaxed font-mono">
                      {scenario.expectedOutcome}
                    </p>
                  </div>

                  {/* Traceability Footer */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
                    <div className="flex items-center gap-1.5 truncate">
                      <Scale className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="text-slate-400">Rule:</span>
                      <span className="text-slate-300 truncate">
                        {scenario.businessRule}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 text-slate-400">
                      <span>Ref:</span>
                      <span className="text-sky-300 truncate max-w-[200px]">
                        {scenario.requirementReference}
                      </span>
                    </div>
                  </div>
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
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-sky-400">
              Model: {meta.model || "gemini-3.8-flash"}
            </span>
            {meta.generatedAt && (
              <span>
                Generated at {new Date(meta.generatedAt).toLocaleTimeString()} UTC
              </span>
            )}
          </div>
          <span className="text-emerald-400 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Traceability Verified (Requirement → Business Rule → Scenario)</span>
          </span>
        </div>
      )}
    </div>
  );
}
