"use client";

import React, { useState, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  Bug,
  Search,
  Clock,
  PlayCircle,
  ExternalLink,
  Edit3,
  ShieldCheck,
} from "lucide-react";
import {
  DefectRecord,
  DefectStatus,
} from "@/types";
import {
  getAllDefects,
  updateDefectStatus,
  saveDefect,
  subscribeToUATSession,
} from "@/lib/session/uat-session";
import { DefectModal } from "@/components/execution/DefectModal";
import { cn } from "@/lib/utils";

export function DefectsWorkspace() {
  const sessionData = useSyncExternalStore(
    subscribeToUATSession,
    () => {
      const defects = getAllDefects();
      return JSON.stringify({ defects });
    },
    () => null
  );

  const { defects } = useMemo(() => {
    if (!sessionData) return { defects: [] as DefectRecord[] };
    try {
      return JSON.parse(sessionData) as {
        defects: DefectRecord[];
      };
    } catch {
      return { defects: [] as DefectRecord[] };
    }
  }, [sessionData]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [severityFilter, setSeverityFilter] = useState<string>("All");

  // Editing state for DefectModal
  const [editingDefect, setEditingDefect] = useState<DefectRecord | null>(null);

  // Compute metrics
  const counts = useMemo(() => {
    let open = 0;
    let inReview = 0;
    let resolved = 0;

    defects.forEach((d) => {
      if (d.status === "OPEN") open++;
      else if (d.status === "IN_REVIEW") inReview++;
      else if (d.status === "RESOLVED") resolved++;
    });

    return {
      total: defects.length,
      open,
      inReview,
      resolved,
    };
  }, [defects]);

  const filteredDefects = useMemo(() => {
    return defects.filter((d) => {
      const matchesSearch =
        search.trim() === "" ||
        d.defectId.toLowerCase().includes(search.toLowerCase()) ||
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.testCaseId.toLowerCase().includes(search.toLowerCase()) ||
        d.scenarioId.toLowerCase().includes(search.toLowerCase()) ||
        d.actualResult.toLowerCase().includes(search.toLowerCase()) ||
        d.expectedResult.toLowerCase().includes(search.toLowerCase()) ||
        d.testerComment.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || d.status === statusFilter;

      const matchesSeverity =
        severityFilter === "All" || d.severity === severityFilter;

      return matchesSearch && matchesStatus && matchesSeverity;
    });
  }, [defects, search, statusFilter, severityFilter]);

  const handleStatusChange = (defectId: string, newStatus: DefectStatus) => {
    updateDefectStatus(defectId, newStatus);
  };

  const handleSaveEditedDefect = (updated: DefectRecord) => {
    saveDefect(updated);
    setEditingDefect(null);
  };

  return (
    <div className="space-y-6">
      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Total Logged Defects
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {counts.total}
            </span>
            <span className="text-xs font-mono text-slate-400">tickets</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-rose-500/20">
          <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 block mb-1">
            OPEN Defects
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-400">
              {counts.open}
            </span>
            <span className="text-xs font-mono text-rose-300/70">blocking</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-500/20">
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block mb-1">
            IN_REVIEW Defects
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-400">
              {counts.inReview}
            </span>
            <span className="text-xs font-mono text-amber-300/70">in triage</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-500/20">
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block mb-1">
            RESOLVED Defects
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {counts.resolved}
            </span>
            <span className="text-xs font-mono text-emerald-300/70">re-test ready</span>
          </div>
        </div>
      </div>

      {/* Workflow Guidance Banner */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start sm:items-center gap-2.5">
          <Bug className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 sm:mt-0" />
          <div>
            <strong className="text-slate-200">
              Human-Initiated UAT Defect Lifecycle
            </strong>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Defects are reported exclusively by human testers upon observing test failures in the Cockpit.
              Creating a defect resolves validation warnings and maintains audit traceability.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/execution"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Open Execution Cockpit</span>
          </Link>
          <Link
            href="/validation"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>View Validation Gate</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search defect ID, title, test case, actual result, or remarks..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:border-rose-500/60 focus:ring-1 focus:ring-rose-500/30 transition-all font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-300">
            <span className="text-[11px] text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none text-slate-200 focus:outline-hidden text-xs cursor-pointer font-medium"
            >
              <option value="All" className="bg-slate-900">All Statuses</option>
              <option value="OPEN" className="bg-slate-900">OPEN</option>
              <option value="IN_REVIEW" className="bg-slate-900">IN_REVIEW</option>
              <option value="RESOLVED" className="bg-slate-900">RESOLVED</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-300">
            <span className="text-[11px] text-slate-400">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-transparent border-none text-slate-200 focus:outline-hidden text-xs cursor-pointer font-medium"
            >
              <option value="All" className="bg-slate-900">All Severities</option>
              <option value="CRITICAL" className="bg-slate-900">CRITICAL</option>
              <option value="HIGH" className="bg-slate-900">HIGH</option>
              <option value="MEDIUM" className="bg-slate-900">MEDIUM</option>
              <option value="LOW" className="bg-slate-900">LOW</option>
            </select>
          </div>
        </div>
      </div>

      {/* Defects Data Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4 font-semibold">Defect ID</th>
                <th className="py-3 px-4 font-semibold">Linked Test Case</th>
                <th className="py-3 px-4 font-semibold">Defect Summary</th>
                <th className="py-3 px-4 font-semibold">Severity</th>
                <th className="py-3 px-4 font-semibold">Priority</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Created Time</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredDefects.map((defect) => (
                <tr
                  key={defect.defectId}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  {/* Defect ID */}
                  <td className="py-3.5 px-4 font-mono font-bold text-rose-400 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <Bug className="w-3.5 h-3.5 text-rose-400/80" />
                      <span>{defect.defectId}</span>
                    </div>
                  </td>

                  {/* Linked Test Case */}
                  <td className="py-3.5 px-4 font-mono">
                    <Link
                      href={`/execution?id=${encodeURIComponent(defect.testCaseId)}`}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-950 border border-slate-800 text-amber-400 hover:text-amber-300 hover:border-amber-500/50 transition-colors font-bold text-xs"
                      title="Open in Execution Cockpit"
                    >
                      <PlayCircle className="w-3 h-3" />
                      <span>{defect.testCaseId}</span>
                    </Link>
                    <span className="text-[10px] text-slate-400 block mt-0.5 truncate max-w-[130px]">
                      {defect.scenarioId}
                    </span>
                  </td>

                  {/* Title & Observed deviation */}
                  <td className="py-3.5 px-4 text-slate-200 max-w-[280px]">
                    <div className="font-semibold text-white text-xs truncate">
                      {defect.title}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 font-mono">
                      <span className="text-rose-400">Actual:</span> {defect.actualResult}
                    </p>
                  </td>

                  {/* Severity */}
                  <td className="py-3.5 px-4">
                    <span
                      className={cn(
                        "inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase",
                        defect.severity === "CRITICAL" && "bg-rose-500/20 text-rose-300 border border-rose-500/30",
                        defect.severity === "HIGH" && "bg-amber-500/20 text-amber-300 border border-amber-500/30",
                        defect.severity === "MEDIUM" && "bg-sky-500/20 text-sky-300 border border-sky-500/30",
                        defect.severity === "LOW" && "bg-slate-800 text-slate-300 border border-slate-700"
                      )}
                    >
                      {defect.severity}
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="py-3.5 px-4 text-slate-300 font-mono text-xs">
                    {defect.priority}
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3.5 px-4">
                    <select
                      value={defect.status}
                      onChange={(e) =>
                        handleStatusChange(defect.defectId, e.target.value as DefectStatus)
                      }
                      className={cn(
                        "rounded px-2.5 py-1 text-xs font-mono font-bold focus:outline-hidden cursor-pointer border transition-colors",
                        defect.status === "OPEN" && "bg-rose-950/60 border-rose-800/80 text-rose-300",
                        defect.status === "IN_REVIEW" && "bg-amber-950/60 border-amber-800/80 text-amber-300",
                        defect.status === "RESOLVED" && "bg-emerald-950/60 border-emerald-800/80 text-emerald-300"
                      )}
                    >
                      <option value="OPEN" className="bg-slate-900 text-rose-400">OPEN</option>
                      <option value="IN_REVIEW" className="bg-slate-900 text-amber-400">IN_REVIEW</option>
                      <option value="RESOLVED" className="bg-slate-900 text-emerald-400">RESOLVED</option>
                    </select>
                  </td>

                  {/* Created Time */}
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] shrink-0">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{new Date(defect.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(defect.createdAt).toLocaleTimeString()}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right shrink-0">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingDefect(defect)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Edit Defect Details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <Link
                        href={`/execution?id=${encodeURIComponent(defect.testCaseId)}`}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                        title="Open Test Case in Cockpit"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredDefects.length === 0 && (
          <div className="py-16 text-center text-xs text-slate-400 space-y-3">
            <Bug className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="space-y-1">
              <p className="font-semibold text-slate-200 text-sm">
                {defects.length === 0 ? "No Defects Logged in Session" : "No Defects Matching Filter"}
              </p>
              <p className="text-slate-400 max-w-md mx-auto text-xs">
                {defects.length === 0
                  ? "When a UAT test case execution produces an unexpected result, mark it FAIL and click 'Create Defect' to register the failure."
                  : "Try clearing search or adjusting status and severity filters."}
              </p>
            </div>
            {defects.length === 0 && (
              <div className="pt-2">
                <Link
                  href="/execution"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Go to Execution Cockpit</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Table Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-[11px] font-mono text-slate-400 px-4">
          <span>
            Showing {filteredDefects.length} of {defects.length} defect tickets
          </span>
          <span className="text-rose-400/90 font-medium">Session Storage Managed</span>
        </div>
      </div>

      {/* Edit Defect Modal if triggered */}
      {editingDefect && (
        <DefectModal
          testCaseId={editingDefect.testCaseId}
          scenarioId={editingDefect.scenarioId}
          testCaseTitle={editingDefect.title}
          priority={editingDefect.priority}
          expectedResult={editingDefect.expectedResult}
          actualResult={editingDefect.actualResult}
          steps={
            editingDefect.stepsToReproduce.map((s, idx) => ({
              stepNumber: idx + 1,
              action: s,
            }))
          }
          testerComment={editingDefect.testerComment}
          existingDefectsCount={defects.length}
          existingDefect={editingDefect}
          onClose={() => setEditingDefect(null)}
          onSave={handleSaveEditedDefect}
        />
      )}
    </div>
  );
}
