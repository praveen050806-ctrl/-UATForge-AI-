"use client";

import React from "react";
import Link from "next/link";
import { X, Bug, PlayCircle } from "lucide-react";
import { DefectRecord, DefectStatus } from "@/types";
import { cn } from "@/lib/utils";

interface DefectLogDrawerProps {
  defects: DefectRecord[];
  onClose: () => void;
  onUpdateStatus: (defectId: string, status: DefectStatus) => void;
}

export function DefectLogDrawer({
  defects,
  onClose,
  onUpdateStatus,
}: DefectLogDrawerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-xl h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/25">
                <Bug className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Reported Potential Defects
                </h3>
                <p className="text-xs text-slate-400">
                  {defects.length} defect {defects.length === 1 ? "record" : "records"} logged during this execution session.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          {defects.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400 space-y-2">
              <Bug className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="font-semibold text-slate-300">No Defects Logged</p>
              <p className="text-slate-400 max-w-xs mx-auto">
                When a test case execution fails, use the &ldquo;Create Defect&rdquo; option to document the failure.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {defects.map((def) => (
                <div
                  key={def.defectId}
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-rose-400">
                        {def.defectId}
                      </span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase",
                          def.severity === "CRITICAL" && "bg-rose-500/20 text-rose-300 border border-rose-500/30",
                          def.severity === "HIGH" && "bg-amber-500/20 text-amber-300 border border-amber-500/30",
                          def.severity === "MEDIUM" && "bg-sky-500/20 text-sky-300 border border-sky-500/30",
                          def.severity === "LOW" && "bg-slate-800 text-slate-300 border border-slate-700"
                        )}
                      >
                        {def.severity}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-slate-400">Status:</span>
                      <select
                        value={def.status}
                        onChange={(e) =>
                          onUpdateStatus(def.defectId, e.target.value as DefectStatus)
                        }
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-[11px] font-mono font-bold text-slate-200 focus:outline-hidden cursor-pointer"
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="IN_REVIEW">IN_REVIEW</option>
                        <option value="RESOLVED">RESOLVED</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-100 text-xs">{def.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-mono flex items-center gap-1.5">
                      <span>Linked Test:</span>
                      <Link
                        href={`/execution?id=${encodeURIComponent(def.testCaseId)}`}
                        onClick={onClose}
                        className="text-amber-400 hover:text-amber-300 hover:underline font-bold inline-flex items-center gap-1"
                      >
                        <PlayCircle className="w-3 h-3 text-amber-400" />
                        <span>{def.testCaseId}</span>
                      </Link>
                      <span>| Scenario: <span className="text-sky-300">{def.scenarioId}</span></span>
                    </p>
                  </div>

                  {/* Expected vs Actual */}
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-850 space-y-1.5 text-[11px] font-mono">
                    <div>
                      <span className="text-emerald-400 block font-semibold">Expected:</span>
                      <span className="text-slate-300">{def.expectedResult}</span>
                    </div>
                    <div>
                      <span className="text-rose-400 block font-semibold">Actual:</span>
                      <span className="text-slate-300">{def.actualResult}</span>
                    </div>
                  </div>

                  {def.testerComment && (
                    <div className="text-[11px] text-slate-400 font-mono">
                      <strong className="text-slate-400">Remarks:</strong> {def.testerComment}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Priority: {def.priority}</span>
                    <span>Logged at {new Date(def.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 transition-colors cursor-pointer"
          >
            Close Defect Log
          </button>
        </div>
      </div>
    </div>
  );
}
