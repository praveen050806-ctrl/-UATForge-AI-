"use client";

import React, { useState, useMemo, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  RotateCcw,
  Search,
  Copy,
  Check,
  Bug,
  UploadCloud,
  PlayCircle,
} from "lucide-react";
import {
  GeneratedTestCase,
  TestCaseExecution,
  TestStepExecution,
  TestExecutionStatus,
  DefectRecord,
  DefectStatus,
} from "@/types";
import {
  ActiveSuiteSession,
  getActiveSuite,
  getAllExecutions,
  getExecutionForTestCase,
  saveExecution,
  resetExecution,
  getAllDefects,
  saveDefect,
  updateDefectStatus,
  calculateExecutionMetrics,
  subscribeToUATSession,
} from "@/lib/session/uat-session";
import { ScenarioBadge } from "@/components/ui/ScenarioBadge";
import { DefectModal } from "./DefectModal";
import { DefectLogDrawer } from "./DefectLogDrawer";
import { DefectsWorkspace } from "@/components/defects/DefectsWorkspace";
import { cn } from "@/lib/utils";

// Baseline Demo cases if user arrives without running Stage 3 first
const FALLBACK_DEMO_CASES: GeneratedTestCase[] = [
  {
    testCaseId: "TC-BND-001",
    scenarioId: "SCN-BND-001",
    title: "Exact ₹10,000 Tier 1 Single-Approval Boundary Limit",
    scenario: "Employee submits claim of exactly ₹10,000 with valid receipt attached",
    type: "Boundary",
    role: "Manager",
    priority: "High",
    preconditions: [
      "Employee user has authenticated access",
      "Valid PDF receipt document attached to claim",
      "Manager role credentials available for review",
    ],
    testSteps: [
      {
        stepNumber: 1,
        action: "Log in as Employee and submit expense claim for ₹10,000 with receipt",
        expectedResult: "Claim status updates to 'Pending Manager Approval'",
      },
      {
        stepNumber: 2,
        action: "Log in as Manager and open claim review dashboard",
        expectedResult: "Claim appears in Pending list with single-tier approval action enabled",
      },
      {
        stepNumber: 3,
        action: "Click 'Approve Claim' as Manager",
        expectedResult: "Claim transitions directly to Finance Processing without requiring Finance Director signoff",
      },
    ],
    testData: "Claim Amount: ₹10,000.00 | Category: Travel | Receipt: receipt_taxi.pdf",
    expectedResult: "Claim is approved by manager solely and moves directly to payment queue.",
    requirementReference: "REQ-EXPENSE-01 §2.1",
    businessRuleReference: "BR-01: Expenses <= ₹10,000 require manager approval only",
  },
  {
    testCaseId: "TC-NEG-001",
    scenarioId: "SCN-NEG-001",
    title: "Mandatory Rejection of Expense Claim Lacking Receipt",
    scenario: "Employee attempts to submit ₹4,500 meal expense without mandatory receipt",
    type: "Negative",
    role: "Employee",
    priority: "Critical",
    preconditions: [
      "Employee is in Expense Submission wizard",
      "No receipt attachment uploaded",
    ],
    testSteps: [
      {
        stepNumber: 1,
        action: "Input claim amount ₹4,500 and leave receipt file empty",
        expectedResult: "Form displays warning 'Receipt attachment required'",
      },
      {
        stepNumber: 2,
        action: "Attempt to force submit claim without attachment",
        expectedResult: "Submission blocked with error: 'Claim rejected: Receipt mandatory per company policy'",
      },
    ],
    testData: "Claim Amount: ₹4,500.00 | Receipt: None",
    expectedResult: "System rejects submission and enforces receipt upload rule.",
    requirementReference: "REQ-EXPENSE-01 §3.4",
    businessRuleReference: "BR-03: Expenses without receipt must be rejected",
  },
  {
    testCaseId: "TC-POS-001",
    scenarioId: "SCN-POS-001",
    title: "Multi-Tier Approval for ₹25,000 Expense Workflow",
    scenario: "Claim of ₹25,000 sequentially approved by Manager and Finance",
    type: "Positive",
    role: "Finance Officer",
    priority: "Critical",
    preconditions: [
      "Claim ₹25,000 submitted with receipt",
      "Manager has signed off initial approval tier",
    ],
    testSteps: [
      {
        stepNumber: 1,
        action: "Open claim review as Finance Officer",
        expectedResult: "Claim status displays 'Pending Finance Approval'",
      },
      {
        stepNumber: 2,
        action: "Review receipt audit trail and click 'Authorize Disbursement'",
        expectedResult: "Claim status changes to 'Approved & Queued for Payment'",
      },
      {
        stepNumber: 3,
        action: "Verify employee notification dispatched",
        expectedResult: "Employee receives email audit alert: 'Expense Claim Approved'",
      },
    ],
    testData: "Claim Amount: ₹25,000.00 | Approvers: Manager, Finance",
    expectedResult: "Sequential two-tier approval completes successfully with automated employee notification.",
    requirementReference: "REQ-EXPENSE-01 §2.2",
    businessRuleReference: "BR-02: Expenses ₹10,001-₹50,000 require Manager and Finance approval",
  },
];

interface ExecutionCockpitFormProps {
  testCase: GeneratedTestCase;
  execution: TestCaseExecution;
  existingDefect?: DefectRecord | null;
  onSaveExecution: (execution: TestCaseExecution) => void;
  onResetExecution: () => void;
  onOpenDefectModal: (actual: string, steps: { stepNumber: number; action: string; actualResult?: string }[]) => void;
}

function ExecutionCockpitForm({
  testCase,
  execution,
  existingDefect = null,
  onSaveExecution,
  onResetExecution,
  onOpenDefectModal,
}: ExecutionCockpitFormProps) {
  const [stepActuals, setStepActuals] = useState<Record<number, string>>(() => {
    const map: Record<number, string> = {};
    testCase.testSteps.forEach((st) => {
      const match = execution.stepResults?.find((r) => r.stepNumber === st.stepNumber);
      map[st.stepNumber] = match?.actualResult || "";
    });
    return map;
  });

  const [stepStatuses, setStepStatuses] = useState<Record<number, TestExecutionStatus>>(() => {
    const map: Record<number, TestExecutionStatus> = {};
    testCase.testSteps.forEach((st) => {
      const match = execution.stepResults?.find((r) => r.stepNumber === st.stepNumber);
      map[st.stepNumber] = match?.status || "NOT_EXECUTED";
    });
    return map;
  });

  const [overallActual, setOverallActual] = useState<string>(execution.actualResult || "");
  const [testerComment, setTesterComment] = useState<string>(execution.testerComment || "");
  const [evidenceNote, setEvidenceNote] = useState<string>(execution.evidenceNote || "");
  const [evidenceFile, setEvidenceFile] = useState<string | null>(null);
  const [copiedTestData, setCopiedTestData] = useState(false);

  const handleStepActualChange = (stepNumber: number, val: string) => {
    setStepActuals((prev) => ({ ...prev, [stepNumber]: val }));
  };

  const handleStepStatusChange = (stepNumber: number, status: TestExecutionStatus) => {
    setStepStatuses((prev) => ({ ...prev, [stepNumber]: status }));
  };

  const handleSetOverallStatus = (newStatus: TestExecutionStatus) => {
    const stepResults: TestStepExecution[] = testCase.testSteps.map((st) => ({
      stepNumber: st.stepNumber,
      actualResult: stepActuals[st.stepNumber] || "",
      status: stepStatuses[st.stepNumber] || newStatus,
    }));

    const finalActual =
      overallActual.trim() ||
      (newStatus === "PASS"
        ? `Verified against expected: ${testCase.expectedResult}`
        : newStatus === "FAIL"
        ? `Failed: Observed deviation during execution step validation.`
        : newStatus === "BLOCKED"
        ? `Blocked: Execution obstructed by environmental or prerequisite dependencies.`
        : "");

    const record: TestCaseExecution = {
      testCaseId: testCase.testCaseId,
      scenarioId: testCase.scenarioId,
      status: newStatus,
      stepResults,
      actualResult: finalActual,
      testerComment: testerComment.trim() || undefined,
      executedAt: new Date().toISOString(),
      evidenceNote: evidenceNote.trim() || (evidenceFile ? `Attached: ${evidenceFile}` : undefined),
      defectId: execution.defectId,
    };

    onSaveExecution(record);
    setOverallActual(finalActual);

    if (newStatus === "FAIL" && !execution.defectId) {
      onOpenDefectModal(
        finalActual,
        testCase.testSteps.map((st) => ({
          stepNumber: st.stepNumber,
          action: st.action,
          actualResult: stepActuals[st.stepNumber],
        }))
      );
    }
  };

  const handleAutoSave = () => {
    const stepResults: TestStepExecution[] = testCase.testSteps.map((st) => ({
      stepNumber: st.stepNumber,
      actualResult: stepActuals[st.stepNumber] || "",
      status: stepStatuses[st.stepNumber] || execution.status || "NOT_EXECUTED",
    }));

    onSaveExecution({
      testCaseId: testCase.testCaseId,
      scenarioId: testCase.scenarioId,
      status: execution.status || "NOT_EXECUTED",
      stepResults,
      actualResult: overallActual,
      testerComment: testerComment.trim() || undefined,
      executedAt: execution.executedAt || new Date().toISOString(),
      evidenceNote: evidenceNote.trim() || (evidenceFile ? `Attached: ${evidenceFile}` : undefined),
      defectId: execution.defectId,
    });
  };

  const handleCopyTestData = () => {
    if (!testCase.testData) return;
    navigator.clipboard.writeText(testCase.testData);
    setCopiedTestData(true);
    setTimeout(() => setCopiedTestData(false), 2000);
  };

  return (
    <>
      {/* Cockpit Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-amber-400">
              {testCase.testCaseId}
            </span>
            <ScenarioBadge type={testCase.type} />
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Role: {testCase.role}
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Priority: {testCase.priority}
            </span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            {testCase.title}
          </h2>
          <p className="text-xs text-slate-300">{testCase.scenario}</p>
        </div>

        <div className="shrink-0 flex sm:flex-col items-end gap-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">
            Execution State
          </span>
          <span
            className={cn(
              "text-xs font-mono font-bold px-3 py-1 rounded-lg uppercase",
              execution.status === "PASS" &&
                "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40",
              execution.status === "FAIL" &&
                "bg-rose-500/20 text-rose-300 border border-rose-500/40",
              execution.status === "BLOCKED" &&
                "bg-amber-500/20 text-amber-300 border border-amber-500/40",
              execution.status === "NOT_EXECUTED" &&
                "bg-slate-800 text-slate-300 border border-slate-700"
            )}
          >
            {execution.status === "NOT_EXECUTED" ? "NOT EXECUTED" : execution.status}
          </span>
          {execution.executedAt && (
            <span className="text-[10px] font-mono text-slate-400">
              at {new Date(execution.executedAt).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Traceability references bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono p-3 rounded-xl bg-slate-950/80 border border-slate-800">
        <div className="truncate">
          <span className="text-slate-400">Governing Rule:</span>{" "}
          <span className="text-slate-200">
            {testCase.businessRuleReference || "BR-STANDARD"}
          </span>
        </div>
        <div className="truncate">
          <span className="text-slate-400">Requirement Ref:</span>{" "}
          <span className="text-sky-300">
            {testCase.requirementReference || "REQ-LIVE"}
          </span>
        </div>
      </div>

      {/* Preconditions */}
      <div className="space-y-1.5">
        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
          Preconditions
        </h4>
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/90 text-xs text-slate-300 space-y-1">
          {testCase.preconditions?.map((pre, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-amber-400 font-mono">✓</span>
              <span>{pre}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Test Data */}
      {testCase.testData && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Test Data / Input Payload
            </h4>
            <button
              type="button"
              onClick={handleCopyTestData}
              className="text-[11px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              {copiedTestData ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Payload</span>
                </>
              )}
            </button>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-slate-200 break-words">
            {testCase.testData}
          </div>
        </div>
      )}

      {/* Interactive Step-by-Step Execution Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Step-by-Step Verification ({testCase.testSteps.length} Steps)
          </h4>
          <span className="text-[11px] font-mono text-slate-400">
            Record observed behavior per step
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-3 w-4/12">Action</th>
                  <th className="py-2.5 px-3 w-4/12 text-emerald-400">
                    Expected Result (AI)
                  </th>
                  <th className="py-2.5 px-3 w-4/12 text-amber-400">
                    Actual Result (Tester)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-855">
                {testCase.testSteps.map((st) => (
                  <tr key={st.stepNumber} className="hover:bg-slate-900/30">
                    <td className="py-3 px-3 text-center font-mono font-bold text-amber-400 align-top">
                      {st.stepNumber}
                    </td>
                    <td className="py-3 px-3 text-slate-200 leading-relaxed align-top">
                      {st.action}
                    </td>
                    <td className="py-3 px-3 text-emerald-300 font-mono text-[11px] leading-relaxed align-top bg-emerald-500/[0.02]">
                      {st.expectedResult}
                    </td>
                    <td className="py-2.5 px-3 align-top space-y-1.5">
                      <input
                        type="text"
                        value={stepActuals[st.stepNumber] || ""}
                        onChange={(e) =>
                          handleStepActualChange(st.stepNumber, e.target.value)
                        }
                        placeholder="Enter observed step outcome..."
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-amber-500/50"
                      />

                      <div className="flex items-center gap-1">
                        {(["PASS", "FAIL", "BLOCKED"] as TestExecutionStatus[]).map(
                          (btnStatus) => {
                            const isCurrent = stepStatuses[st.stepNumber] === btnStatus;
                            return (
                              <button
                                key={btnStatus}
                                type="button"
                                onClick={() =>
                                  handleStepStatusChange(st.stepNumber, btnStatus)
                                }
                                className={cn(
                                  "px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer transition-colors",
                                  isCurrent && btnStatus === "PASS" && "bg-emerald-500 text-slate-950",
                                  isCurrent && btnStatus === "FAIL" && "bg-rose-500 text-white",
                                  isCurrent && btnStatus === "BLOCKED" && "bg-amber-500 text-slate-950",
                                  !isCurrent && "bg-slate-850 hover:bg-slate-800 text-slate-400"
                                )}
                              >
                                {btnStatus}
                              </button>
                            );
                          }
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Terminal Expected vs Terminal Actual Result */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* AI Expected */}
        <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 font-semibold uppercase">
            <span>Expected Result</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
              AI Generated
            </span>
          </div>
          <p className="text-xs text-emerald-200 font-mono leading-relaxed pt-1">
            {testCase.expectedResult}
          </p>
        </div>

        {/* Tester Actual */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-amber-400 font-semibold uppercase">
            <span>Actual Result</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
              Tester Observed
            </span>
          </div>
          <textarea
            rows={2}
            value={overallActual}
            onChange={(e) => setOverallActual(e.target.value)}
            onBlur={handleAutoSave}
            placeholder="Enter terminal observed result during actual execution..."
            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-amber-500/50"
          />
        </div>
      </div>

      {/* Tester Comments & Evidence Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Tester Comments / Observations
          </label>
          <input
            type="text"
            value={testerComment}
            onChange={(e) => setTesterComment(e.target.value)}
            onBlur={handleAutoSave}
            placeholder="e.g. Verified on build #420 staging, auth token valid."
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-amber-500/50 font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
            <span>Evidence Note / Attachment</span>
            <span className="text-[10px] text-slate-500 font-normal">Optional</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={evidenceNote}
              onChange={(e) => setEvidenceNote(e.target.value)}
              onBlur={handleAutoSave}
              placeholder="e.g. Screenshot_42.png or server log ref #918"
              className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-amber-500/50 font-mono"
            />
            <label className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-mono border border-slate-700 cursor-pointer flex items-center gap-1.5 shrink-0">
              <UploadCloud className="w-3.5 h-3.5" />
              <span>{evidenceFile ? "Attached" : "Attach"}</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setEvidenceFile(file.name);
                    if (!evidenceNote) setEvidenceNote(`Attached: ${file.name}`);
                  }
                }}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Potential Defect Indicator if Failed */}
      {execution.status === "FAIL" && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-2.5">
            <Bug className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <div className="text-xs font-bold text-rose-300">
                {existingDefect ? `Linked Defect: ${existingDefect.defectId}` : "Test Marked FAIL"}
              </div>
              <div className="text-[11px] text-rose-400/90 font-mono">
                {existingDefect
                  ? `Status: ${existingDefect.status} | Severity: ${existingDefect.severity} | Priority: ${existingDefect.priority}`
                  : "No defect record logged yet for this failure."}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              onOpenDefectModal(
                overallActual,
                testCase.testSteps.map((st) => ({
                  stepNumber: st.stepNumber,
                  action: st.action,
                  actualResult: stepActuals[st.stepNumber],
                }))
              )
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-md shadow-rose-600/30 shrink-0"
          >
            <Bug className="w-4 h-4" />
            <span>{existingDefect ? `Edit Defect (${existingDefect.defectId})` : "Create Defect"}</span>
          </button>
        </div>
      )}

      {/* Execution Action Bar */}
      <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Manual UAT Engine • Click status to register human signoff</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleSetOverallStatus("PASS")}
            className={cn(
              "inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-sm",
              execution.status === "PASS"
                ? "bg-emerald-500 text-slate-950 ring-2 ring-emerald-400"
                : "bg-emerald-600 hover:bg-emerald-500 text-white"
            )}
          >
            <CheckCircle className="w-4 h-4" />
            <span>PASS</span>
          </button>

          <button
            type="button"
            onClick={() => handleSetOverallStatus("FAIL")}
            className={cn(
              "inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-sm",
              execution.status === "FAIL"
                ? "bg-rose-500 text-white ring-2 ring-rose-400"
                : "bg-rose-600 hover:bg-rose-500 text-white"
            )}
          >
            <XCircle className="w-4 h-4" />
            <span>FAIL</span>
          </button>

          {execution.status === "FAIL" && (
            <button
              type="button"
              onClick={() =>
                onOpenDefectModal(
                  overallActual,
                  testCase.testSteps.map((st) => ({
                    stepNumber: st.stepNumber,
                    action: st.action,
                    actualResult: stepActuals[st.stepNumber],
                  }))
                )
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all cursor-pointer shadow-md shadow-rose-600/30"
            >
              <Bug className="w-4 h-4" />
              <span>{existingDefect ? "Edit Defect" : "Create Defect"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSetOverallStatus("BLOCKED")}
            className={cn(
              "inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-sm",
              execution.status === "BLOCKED"
                ? "bg-amber-500 text-slate-950 ring-2 ring-amber-400"
                : "bg-amber-600 hover:bg-amber-500 text-white"
            )}
          >
            <AlertCircle className="w-4 h-4" />
            <span>BLOCKED</span>
          </button>

          {execution.status !== "NOT_EXECUTED" && (
            <button
              type="button"
              onClick={onResetExecution}
              className="inline-flex items-center gap-1 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white font-mono text-xs cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export function UATExecutionWorkspace() {
  const searchParams = useSearchParams();
  const requestedId = searchParams.get("id");

  // Subscribe to session state
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
    if (!sessionData) {
      return { suite: null, executions: {}, defects: [] };
    }
    try {
      return JSON.parse(sessionData);
    } catch {
      return { suite: null, executions: {}, defects: [] };
    }
  }, [sessionData]);

  const isUsingLiveSuite = Boolean(suite && suite.testCases?.length > 0);
  const currentCases: GeneratedTestCase[] = useMemo(() => {
    if (suite && suite.testCases?.length > 0) {
      return suite.testCases;
    }
    return FALLBACK_DEMO_CASES;
  }, [suite]);

  // View tabs
  const [activeTab, setActiveTab] = useState<"execution" | "defects">("execution");

  // Selected test case state (no effect needed)
  const [userSelectedId, setUserSelectedId] = useState<string | null>(null);

  const activeTestCase = useMemo(() => {
    if (userSelectedId) {
      const found = currentCases.find((c) => c.testCaseId === userSelectedId);
      if (found) return found;
    }
    if (requestedId) {
      const match = currentCases.find((c) => c.testCaseId === requestedId);
      if (match) return match;
    }
    return currentCases[0];
  }, [currentCases, userSelectedId, requestedId]);

  // Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");

  // Modals state
  const [isDefectModalOpen, setIsDefectModalOpen] = useState(false);
  const [isDefectLogOpen, setIsDefectLogOpen] = useState(false);
  const [defectModalData, setDefectModalData] = useState<{
    actual: string;
    steps: { stepNumber: number; action: string; actualResult?: string }[];
  } | null>(null);

  // Derived current execution for active testcase
  const currentExecution: TestCaseExecution = useMemo(() => {
    if (!activeTestCase) {
      return {
        testCaseId: "",
        scenarioId: "",
        status: "NOT_EXECUTED",
        stepResults: [],
        actualResult: "",
      };
    }
    const saved = executions[activeTestCase.testCaseId];
    if (saved) return saved;

    return {
      testCaseId: activeTestCase.testCaseId,
      scenarioId: activeTestCase.scenarioId,
      status: "NOT_EXECUTED",
      stepResults: activeTestCase.testSteps.map((st) => ({
        stepNumber: st.stepNumber,
        actualResult: "",
        status: "NOT_EXECUTED",
      })),
      actualResult: "",
      testerComment: "",
      evidenceNote: "",
    };
  }, [activeTestCase, executions]);

  // Filtered test cases for left selector list
  const filteredCases = useMemo(() => {
    return currentCases.filter((tc) => {
      const exec = executions[tc.testCaseId];
      const status: TestExecutionStatus = exec?.status || "NOT_EXECUTED";

      const matchesSearch =
        search.trim() === "" ||
        tc.testCaseId.toLowerCase().includes(search.toLowerCase()) ||
        tc.title.toLowerCase().includes(search.toLowerCase()) ||
        tc.scenario.toLowerCase().includes(search.toLowerCase()) ||
        tc.role.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || status === statusFilter;

      const matchesType =
        typeFilter === "All" || tc.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [currentCases, executions, search, statusFilter, typeFilter]);

  // Live Metrics
  const metrics = useMemo(() => {
    return calculateExecutionMetrics(
      currentCases.map((c) => c.testCaseId),
      executions
    );
  }, [currentCases, executions]);

  const handleSaveExecution = (record: TestCaseExecution) => {
    saveExecution(record);
  };

  const handleResetExecution = () => {
    if (!activeTestCase) return;
    resetExecution(activeTestCase.testCaseId);
  };

  const handleOpenDefectModal = (
    actual: string,
    steps: { stepNumber: number; action: string; actualResult?: string }[]
  ) => {
    setDefectModalData({ actual, steps });
    setIsDefectModalOpen(true);
  };

  const handleSaveDefect = (defect: DefectRecord) => {
    saveDefect(defect);
    setIsDefectModalOpen(false);

    if (activeTestCase) {
      const existing = getExecutionForTestCase(activeTestCase.testCaseId);
      if (existing) {
        saveExecution({
          ...existing,
          defectId: defect.defectId,
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Session State Clear Labeling Banner */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-slate-300">
            <strong className="text-white font-mono">UAT Execution Cockpit:</strong>{" "}
            {isUsingLiveSuite
              ? `Running against active session suite for "${suite?.requirementTitle}".`
              : "Showing demo structural suite. Generate your own suite in Requirements Workspace to run live UAT."}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[11px] font-mono text-amber-400/90 font-medium">
            Session data — not persisted to database
          </span>
          <button
            type="button"
            onClick={() => setIsDefectLogOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold cursor-pointer transition-colors"
          >
            <Bug className="w-3.5 h-3.5 text-rose-400" />
            <span>Reported Defects ({defects.length})</span>
          </button>
        </div>
      </div>

      {/* Real Calculated Metrics KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Total Cases</span>
          <span className="text-xl font-bold font-mono text-white">{metrics.total}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] font-mono text-emerald-400 block uppercase">Passed</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-emerald-400">{metrics.passed}</span>
            <span className="text-[11px] text-slate-400 font-mono">
              ({metrics.total > 0 ? ((metrics.passed / metrics.total) * 100).toFixed(0) : 0}%)
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] font-mono text-rose-400 block uppercase">Failed</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-rose-400">{metrics.failed}</span>
            <span className="text-[11px] text-slate-400 font-mono">
              ({metrics.total > 0 ? ((metrics.failed / metrics.total) * 100).toFixed(0) : 0}%)
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] font-mono text-amber-400 block uppercase">Blocked</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-amber-400">{metrics.blocked}</span>
            <span className="text-[11px] text-slate-400 font-mono">
              ({metrics.total > 0 ? ((metrics.blocked / metrics.total) * 100).toFixed(0) : 0}%)
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Not Executed</span>
          <span className="text-xl font-bold font-mono text-slate-300">{metrics.notExecuted}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-500/10 via-slate-900/60 to-slate-900/60 border border-amber-500/30">
          <span className="text-[10px] font-mono text-amber-400 block uppercase">Execution Rate</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-amber-300">
              {metrics.coveragePercentage}%
            </span>
            <span className="text-[10px] text-slate-400">complete</span>
          </div>
        </div>
      </div>

      {/* Tab Switcher: Cockpit vs Defect Registry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("execution")}
            className={cn(
              "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2",
              activeTab === "execution"
                ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-white"
            )}
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Test Execution Cockpit ({currentCases.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("defects")}
            className={cn(
              "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2",
              activeTab === "defects"
                ? "bg-rose-600 text-white font-bold shadow-sm"
                : "text-slate-400 hover:text-white"
            )}
          >
            <Bug className="w-3.5 h-3.5" />
            <span>Defects Workflow & Registry ({defects.length})</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-400 px-2">
          {activeTab === "execution" ? (
            <span className="text-amber-400/90 font-medium">Manual Execution Mode</span>
          ) : (
            <span className="text-rose-400/90 font-medium">Defect Triage & Resolution Mode</span>
          )}
        </div>
      </div>

      {activeTab === "defects" ? (
        <DefectsWorkspace />
      ) : (
        /* Main 2-Pane Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Test Case Selector List */}
        <div className="lg:col-span-4 rounded-2xl bg-slate-900/60 border border-slate-800 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Test Cases ({filteredCases.length})
            </h3>
            <span className="text-[11px] font-mono text-amber-400 font-bold">
              {metrics.total - metrics.notExecuted} / {metrics.total} Done
            </span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search test ID or keyword..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-amber-500/50"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:outline-hidden cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="NOT_EXECUTED">Not Executed</option>
              <option value="PASS">PASS</option>
              <option value="FAIL">FAIL</option>
              <option value="BLOCKED">BLOCKED</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:outline-hidden cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Positive">Positive</option>
              <option value="Negative">Negative</option>
              <option value="Boundary">Boundary</option>
              <option value="Role-Based">Role-Based</option>
            </select>
          </div>

          {/* Test Case Cards List */}
          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {filteredCases.map((tc) => {
              const exec = executions[tc.testCaseId];
              const st: TestExecutionStatus = exec?.status || "NOT_EXECUTED";
              const isSelected = tc.testCaseId === activeTestCase?.testCaseId;

              return (
                <button
                  key={tc.testCaseId}
                  type="button"
                  onClick={() => setUserSelectedId(tc.testCaseId)}
                  className={cn(
                    "w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2",
                    isSelected
                      ? "bg-slate-800/90 border-amber-500/50 shadow-md shadow-amber-500/5"
                      : "bg-slate-950/70 border-slate-855 hover:border-slate-750 hover:bg-slate-900/50"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-mono text-xs font-bold text-amber-400">
                      {tc.testCaseId}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase",
                        st === "PASS" && "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
                        st === "FAIL" && "bg-rose-500/20 text-rose-300 border border-rose-500/30",
                        st === "BLOCKED" && "bg-amber-500/20 text-amber-300 border border-amber-500/30",
                        st === "NOT_EXECUTED" && "bg-slate-800 text-slate-400 border border-slate-700"
                      )}
                    >
                      {st === "NOT_EXECUTED" ? "Not Executed" : st}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-slate-200 line-clamp-2">
                    {tc.title}
                  </p>

                  {/* Defect Indicator for Failed Cases */}
                  {st === "FAIL" && (
                    <div className="flex items-center gap-1.5 pt-0.5">
                      {exec?.defectId || defects.some((d) => d.testCaseId === tc.testCaseId) ? (
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold border border-rose-500/30 flex items-center gap-1">
                          <Bug className="w-2.5 h-2.5" />
                          <span>
                            {exec?.defectId ||
                              defects.find((d) => d.testCaseId === tc.testCaseId)?.defectId}
                          </span>
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-[10px] flex items-center gap-1">
                          <Bug className="w-2.5 h-2.5" />
                          <span>Create Defect</span>
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-855/80">
                    <span className="text-slate-400">{tc.type}</span>
                    <span className="text-slate-400 truncate max-w-[120px]">{tc.role}</span>
                  </div>
                </button>
              );
            })}

            {filteredCases.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">
                No test cases match filter.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Execution Cockpit */}
        <div className="lg:col-span-8 rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-6">
          {activeTestCase ? (
            <ExecutionCockpitForm
              key={activeTestCase.testCaseId}
              testCase={activeTestCase}
              execution={currentExecution}
              existingDefect={
                defects.find((d) => d.testCaseId === activeTestCase.testCaseId) || null
              }
              onSaveExecution={handleSaveExecution}
              onResetExecution={handleResetExecution}
              onOpenDefectModal={handleOpenDefectModal}
            />
          ) : (
            <div className="py-20 text-center text-slate-400 text-xs">
              No test case selected.
            </div>
          )}
        </div>
      </div>
      )}

      {/* Defect Creation Modal */}
      {isDefectModalOpen && activeTestCase && (
        <DefectModal
          testCaseId={activeTestCase.testCaseId}
          scenarioId={activeTestCase.scenarioId}
          testCaseTitle={activeTestCase.title}
          priority={activeTestCase.priority}
          expectedResult={activeTestCase.expectedResult}
          actualResult={
            defectModalData?.actual ||
            currentExecution.actualResult ||
            "Observed unexpected deviation during manual verification."
          }
          steps={
            defectModalData?.steps ||
            activeTestCase.testSteps.map((st) => ({
              stepNumber: st.stepNumber,
              action: st.action,
            }))
          }
          testerComment={currentExecution.testerComment}
          existingDefectsCount={defects.length}
          existingDefect={
            defects.find((d) => d.testCaseId === activeTestCase.testCaseId) || null
          }
          onClose={() => setIsDefectModalOpen(false)}
          onSave={handleSaveDefect}
        />
      )}

      {/* Defect Log Drawer */}
      {isDefectLogOpen && (
        <DefectLogDrawer
          defects={defects}
          onClose={() => setIsDefectLogOpen(false)}
          onUpdateStatus={(id: string, st: DefectStatus) => updateDefectStatus(id, st)}
        />
      )}
    </div>
  );
}
