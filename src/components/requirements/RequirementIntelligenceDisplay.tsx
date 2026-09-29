"use client";

import React from "react";
import {
  Users,
  Play,
  Scale,
  Sliders,
  CheckCircle,
  Network,
  AlertTriangle,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  FileText,
  Clock,
  Check,
  Copy,
} from "lucide-react";
import { RequirementIntelligence } from "@/types";
import { SectionCard } from "@/components/ui/SectionCard";

interface RequirementIntelligenceDisplayProps {
  intelligence: RequirementIntelligence;
  meta?: {
    model?: string;
    extractedAt?: string;
  };
  sourceRequirement: {
    title: string;
    content: string;
    inputType: string;
  };
  onReset: () => void;
  onGenerateScenarios?: () => void;
  isGeneratingScenarios?: boolean;
  hasScenariosGenerated?: boolean;
}

export function RequirementIntelligenceDisplay({
  intelligence,
  meta,
  sourceRequirement,
  onReset,
  onGenerateScenarios,
  isGeneratingScenarios = false,
  hasScenariosGenerated = false,
}: RequirementIntelligenceDisplayProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(intelligence, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sections = [
    {
      title: "Roles",
      icon: Users,
      color: "text-amber-400",
      badgeColor: "bg-amber-500/10 border-amber-500/30 text-amber-300",
      description: "Actors, personas, and system entities involved in the workflow.",
      items: intelligence.roles,
      emptyMessage: "No explicit roles or actors detected.",
    },
    {
      title: "Actions",
      icon: Play,
      color: "text-sky-400",
      badgeColor: "bg-sky-500/10 border-sky-500/30 text-sky-300",
      description: "Concrete operations and activities executed by actors.",
      items: intelligence.actions,
      emptyMessage: "No explicit actions detected.",
    },
    {
      title: "Business Rules",
      icon: Scale,
      color: "text-emerald-400",
      badgeColor: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
      description: "Governing policies, numeric thresholds, constraints, and approval tiers.",
      items: intelligence.businessRules,
      emptyMessage: "No explicit business rules detected.",
    },
    {
      title: "Conditions",
      icon: Sliders,
      color: "text-indigo-400",
      badgeColor: "bg-indigo-500/10 border-indigo-500/30 text-indigo-300",
      description: "Prerequisites, state requirements, and decision branching criteria.",
      items: intelligence.conditions,
      emptyMessage: "No conditional branches detected.",
    },
    {
      title: "Outcomes",
      icon: CheckCircle,
      color: "text-teal-400",
      badgeColor: "bg-teal-500/10 border-teal-500/30 text-teal-300",
      description: "Deterministic state transitions, notifications, and terminal states.",
      items: intelligence.outcomes,
      emptyMessage: "No explicit outcomes detected.",
    },
    {
      title: "Dependencies",
      icon: Network,
      color: "text-violet-400",
      badgeColor: "bg-violet-500/10 border-violet-500/30 text-violet-300",
      description: "External systems, APIs, notification gateways, and databases.",
      items: intelligence.dependencies,
      emptyMessage: "No external dependencies detected.",
    },
  ];

  const totalEntities =
    intelligence.roles.length +
    intelligence.actions.length +
    intelligence.businessRules.length +
    intelligence.conditions.length +
    intelligence.outcomes.length +
    intelligence.dependencies.length;

  return (
    <div className="space-y-6">
      {/* Distinction Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0 shadow-md shadow-amber-500/10">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                AI-Generated Requirement Intelligence
              </span>
              {meta?.model && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {meta.model}
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">
              Structured Extraction Complete
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Decomposed into {totalEntities} structured elements across 6 core domain categories.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-end md:self-center">
          <button
            type="button"
            onClick={handleCopyJson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors cursor-pointer border border-slate-700"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy JSON</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Edit Input</span>
          </button>

          {onGenerateScenarios && (
            <button
              type="button"
              onClick={onGenerateScenarios}
              disabled={isGeneratingScenarios}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition-all shadow-sm shadow-sky-500/20 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{hasScenariosGenerated ? "Regenerate Scenarios" : "Generate UAT Scenarios"}</span>
            </button>
          )}
        </div>
      </div>

      {/* User-Provided Source Requirement Box (Clear Distinction) */}
      <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-xs space-y-2">
        <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span className="uppercase tracking-wider font-semibold text-slate-300">
              User-Provided Source Requirement (Input)
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
            Format: {sourceRequirement.inputType}
          </span>
        </div>
        <h3 className="font-semibold text-sm text-slate-100">
          {sourceRequirement.title}
        </h3>
        <p className="text-slate-400 text-xs font-mono bg-slate-900/60 p-3 rounded-lg border border-slate-850 leading-relaxed whitespace-pre-wrap">
          {sourceRequirement.content}
        </p>
      </div>

      {/* Ambiguities Section (Highlighted Quality Callout) */}
      {intelligence.ambiguities && intelligence.ambiguities.length > 0 ? (
        <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/30 text-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <h4 className="font-bold text-sm">
                Ambiguities & Specification Gaps Detected ({intelligence.ambiguities.length})
              </h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Needs Business Clarification
            </span>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed">
            The AI engine identified ambiguous phrasing, unstated thresholds, or missing edge cases in the requirement.
            Resolving these will prevent defective UAT test synthesis:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
            {intelligence.ambiguities.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-900/90 border border-amber-500/20 text-slate-200 font-mono text-xs"
              >
                <span className="text-amber-400 font-bold shrink-0 mt-0.5">⚠</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs flex items-center justify-between text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Zero Ambiguities: Requirement specification contains unambiguous deterministic rules.</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 uppercase">Clear Spec</span>
        </div>
      )}

      {/* 6 Structured Intelligence Cards */}
      <SectionCard
        title="Extracted Domain Entities"
        description="Structured domain knowledge validated by Zod schema and ready for UAT scenario formulation."
        badge="AI Intelligence Matrix"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((sec) => {
            const Icon = sec.icon;
            return (
              <div
                key={sec.title}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg bg-slate-900 border border-slate-800 ${sec.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-white">{sec.title}</h4>
                    </div>
                    <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${sec.badgeColor}`}>
                      {sec.items.length}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mb-3">{sec.description}</p>

                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-850 space-y-2 max-h-64 overflow-y-auto">
                    {sec.items.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">{sec.emptyMessage}</p>
                    ) : (
                      sec.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 text-xs text-slate-200 font-mono leading-relaxed"
                        >
                          <span className={`${sec.color} text-[10px] mt-0.5 shrink-0`}>▸</span>
                          <span>{item}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Structured Artifact</span>
                  <span className="text-amber-400/80">Verified</span>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Stage 2 Callout Banner */}
      {onGenerateScenarios && !hasScenariosGenerated && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-500/15 via-slate-900 to-indigo-500/15 border border-sky-500/30 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xl">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold uppercase tracking-wider">
                Stage 2: Scenario Generation
              </span>
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                <Check className="w-3 h-3" /> Intelligence Verified
              </span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Ready to Generate UAT Scenarios
            </h3>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Google Gemini will synthesize structured test scenarios across 4 key categories: Positive paths, Negative failure conditions, exact Boundary thresholds, and Role-Based permissions.
            </p>
          </div>

          <button
            type="button"
            onClick={onGenerateScenarios}
            disabled={isGeneratingScenarios}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-sky-500/25 cursor-pointer shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate UAT Scenarios</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Footer Timestamp & Model */}
      {meta?.extractedAt && (
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-2">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Extracted at {new Date(meta.extractedAt).toLocaleTimeString()} UTC</span>
          </div>
          <span>Status: Verified by Zod Runtime Schema</span>
        </div>
      )}
    </div>
  );
}
