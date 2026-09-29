"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, CheckCircle2, Loader2, ListChecks } from "lucide-react";

const STAGES = [
  "Submitting UAT scenarios to Gemini test case engine...",
  "Decomposing scenario preconditions and actor requirements...",
  "Generating sequential, human-executable action steps...",
  "Establishing observable expected results for every individual step...",
  "Synthesizing concrete test data payloads and boundary values...",
  "Preserving end-to-end traceability (Requirement → Rule → Scenario → Test Case)...",
  "Validating test case structure with runtime Zod guardrails...",
];

export function TestCaseGenerationLoading() {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStage((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 1100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 rounded-2xl bg-slate-900/80 border border-emerald-500/30 backdrop-blur-md shadow-xl text-center space-y-6">
      {/* Central Visual Pulsing Ring */}
      <div className="relative w-20 h-20 mx-auto">
        <div className="absolute inset-0 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 animate-ping opacity-30" />
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-slate-900 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/10">
          <ListChecks className="w-9 h-9 text-emerald-400 animate-pulse" />
        </div>
      </div>

      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Stage 3: Gemini UAT Test Case Generation</span>
        </div>
        <h3 className="text-xl font-bold text-white">
          Synthesizing Execution-Ready UAT Test Cases
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          Google Gemini is transforming each scenario into detailed test cases with sequential observable actions, step-level expected results, and test data.
        </p>
      </div>

      {/* Dynamic Animated Stages */}
      <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-left text-xs font-mono">
        {STAGES.map((stageText, idx) => {
          const isDone = idx < currentStage;
          const isCurrent = idx === currentStage;
          return (
            <div
              key={idx}
              className={`flex items-center gap-2.5 transition-opacity duration-300 ${
                isDone
                  ? "text-emerald-400"
                  : isCurrent
                  ? "text-emerald-300 font-semibold"
                  : "text-slate-600"
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400 shrink-0" />
              ) : (
                <span className="w-3.5 h-3.5 rounded-full border border-slate-700 shrink-0" />
              )}
              <span>{stageText}</span>
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="max-w-md mx-auto h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-sky-400 transition-all duration-500 ease-out"
          style={{ width: `${((currentStage + 1) / STAGES.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
