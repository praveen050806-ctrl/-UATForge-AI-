"use client";

import React, { useState } from "react";
import { X, AlertTriangle, Bug, CheckCircle } from "lucide-react";
import { DefectRecord, DefectSeverity, TestCasePriority, DefectStatus } from "@/types";

interface DefectModalProps {
  testCaseId: string;
  scenarioId: string;
  testCaseTitle: string;
  priority?: TestCasePriority;
  expectedResult: string;
  actualResult: string;
  steps: { stepNumber: number; action: string; actualResult?: string }[];
  testerComment?: string;
  existingDefectsCount: number;
  existingDefect?: DefectRecord | null;
  onClose: () => void;
  onSave: (defect: DefectRecord) => void;
}

export function DefectModal({
  testCaseId,
  scenarioId,
  testCaseTitle,
  priority: initialPriority = "High",
  expectedResult,
  actualResult,
  steps,
  testerComment = "",
  existingDefectsCount,
  existingDefect = null,
  onClose,
  onSave,
}: DefectModalProps) {
  const defaultDefectId =
    existingDefect?.defectId ||
    `DEF-${String(existingDefectsCount + 1).padStart(3, "0")}`;

  const defaultSeverity: DefectSeverity =
    existingDefect?.severity ||
    (initialPriority === "Critical"
      ? "CRITICAL"
      : initialPriority === "High"
      ? "HIGH"
      : "MEDIUM");

  const [defectId] = useState(defaultDefectId);
  const [title, setTitle] = useState(
    existingDefect?.title || `[UAT Failure] ${testCaseTitle}`
  );
  const [severity, setSeverity] = useState<DefectSeverity>(defaultSeverity);
  const [priority, setPriority] = useState<TestCasePriority>(
    existingDefect?.priority || initialPriority
  );
  const [status, setStatus] = useState<DefectStatus>(
    existingDefect?.status || "OPEN"
  );
  const [expected, setExpected] = useState(
    existingDefect?.expectedResult || expectedResult
  );
  const [actual, setActual] = useState(
    existingDefect?.actualResult ||
      actualResult ||
      "Observed behavior deviates from expected acceptance criteria."
  );
  const [comment, setComment] = useState(
    existingDefect?.testerComment || testerComment
  );

  const defaultStepsToReproduce =
    existingDefect?.stepsToReproduce && existingDefect.stepsToReproduce.length > 0
      ? existingDefect.stepsToReproduce
      : steps.map(
          (s) =>
            `Step ${s.stepNumber}: ${s.action}${
              s.actualResult ? ` -> Observed: ${s.actualResult}` : ""
            }`
        );

  const [stepsToReproduceText, setStepsToReproduceText] = useState(
    defaultStepsToReproduce.join("\n")
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stepsArray = stepsToReproduceText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const record: DefectRecord = {
      defectId,
      testCaseId,
      scenarioId,
      title: title.trim(),
      severity,
      priority,
      status,
      expectedResult: expected.trim(),
      actualResult: actual.trim(),
      stepsToReproduce:
        stepsArray.length > 0 ? stepsArray : defaultStepsToReproduce,
      testerComment: comment.trim(),
      createdAt: existingDefect?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(record);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative my-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <Bug className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-rose-400">
                {defectId}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {existingDefect ? "Edit Defect Record" : "Create Defect"}
              </span>
              <span className="text-[10px] font-mono text-sky-400">
                Source: {testCaseId}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              {existingDefect ? "Update Defect Ticket" : "Create UAT Defect Ticket"}
            </h3>
            <p className="text-xs text-slate-400">
              Pre-filled from actual observed test case execution. Editable human action.
            </p>
          </div>
        </div>

        {/* Notification callout */}
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>
            This defect links directly to <strong>{testCaseId}</strong>. Recording this defect ensures
            traceability and resolves the missing defect warning in UAT Quality Validation.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Defect Title */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Defect Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-rose-500/60 font-medium"
            />
          </div>

          {/* Severity, Priority, Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Severity
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as DefectSeverity)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-hidden font-mono cursor-pointer"
              >
                <option value="CRITICAL">CRITICAL — Blocking Operation</option>
                <option value="HIGH">HIGH — Major Functional Failure</option>
                <option value="MEDIUM">MEDIUM — Incorrect Processing</option>
                <option value="LOW">LOW — Minor Cosmetic / Wording</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TestCasePriority)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-hidden font-mono cursor-pointer"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Defect Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DefectStatus)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-hidden font-mono cursor-pointer font-bold"
              >
                <option value="OPEN">OPEN</option>
                <option value="IN_REVIEW">IN_REVIEW</option>
                <option value="RESOLVED">RESOLVED</option>
              </select>
            </div>
          </div>

          {/* Expected vs Actual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                Expected Result (Pre-filled from Acceptance Criteria)
              </label>
              <textarea
                rows={3}
                required
                value={expected}
                onChange={(e) => setExpected(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-emerald-200 text-xs font-mono leading-relaxed focus:outline-hidden focus:border-emerald-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-semibold">
                Actual Result (Observed by Tester)
              </label>
              <textarea
                rows={3}
                required
                value={actual}
                onChange={(e) => setActual(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-rose-200 text-xs font-mono leading-relaxed focus:outline-hidden focus:border-rose-500/50"
              />
            </div>
          </div>

          {/* Steps to Reproduce */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Steps to Reproduce (1 per line)
            </label>
            <textarea
              rows={4}
              value={stepsToReproduceText}
              onChange={(e) => setStepsToReproduceText(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono leading-relaxed focus:outline-hidden focus:border-rose-500/50"
            />
          </div>

          {/* Tester Comment */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Tester Remarks / Environment Notes
            </label>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Occurred on build #420 staging, auth token valid."
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-hidden focus:border-rose-500/50"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <span className="text-[11px] font-mono text-slate-400">
              Stored in browser session
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-600/30"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{existingDefect ? "Save Changes" : "Create Defect"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
