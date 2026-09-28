"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  FileSpreadsheet,
  FileText,
  Download,
  Layers,
  CheckCircle2,
  X,
} from "lucide-react";

export default function ExportsPage() {
  const [activeExportNotice, setActiveExportNotice] = useState<string | null>(
    null
  );

  const suiteDetails = {
    name: "Enterprise Authentication & Checkout UAT Suite",
    casesCount: 120,
    lastUpdated: "2026-09-28 20:30 UTC",
    exportStatus: "Ready for Packaging",
    requirementsCovered: "14 Requirements",
  };

  return (
    <AppShell>
      <PageHeader
        title="Export Test Suite"
        subtitle="Produce certified test suite deliverables formatted for executive signoff and test management tooling."
        badge="Stage 6: Delivery"
      />

      {/* Test Suite Summary Card */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
                Active Deliverable Suite
              </span>
              <h3 className="text-lg font-bold text-white">
                {suiteDetails.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Encompasses {suiteDetails.requirementsCovered} with comprehensive
                Positive, Negative, Boundary, and Role scenarios.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-mono text-slate-300 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-6">
            <div>
              <span className="text-slate-400 block text-[10px]">TOTAL CASES</span>
              <span className="text-lg font-bold text-amber-400">
                {suiteDetails.casesCount}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">STATUS</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {suiteDetails.exportStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Export Format Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Excel Card */}
        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/30 transition-all flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                .XLSX FORMAT
              </span>
            </div>

            <div>
              <h4 className="text-base font-bold text-white">
                Microsoft Excel Workbook
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Structured multi-tab spreadsheet including executive summary,
                traceability matrix, and detailed step-by-step test execution tables
                with signoff columns.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Export functionality coming in the next milestone.</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1.5 text-xs text-slate-300 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Target:</span>
                <span>Executive Signoff / Stakeholders</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Styling:</span>
                <span>Formatted Headers & Borders</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tabs:</span>
                <span>Summary, Test Cases, Traceability</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveExportNotice("Excel")}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 font-semibold text-xs transition-colors cursor-pointer border border-slate-700"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel (.xlsx)</span>
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
                .CSV FORMAT
              </span>
            </div>

            <div>
              <h4 className="text-base font-bold text-white">
                Standard RFC-4180 CSV
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Comma-separated values optimized for direct bulk import into Jira
                Xray, Zephyr Enterprise, Azure DevOps Test Plans, and TestRail.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Export functionality coming in the next milestone.</span>
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
                <span className="text-slate-400">Schema:</span>
                <span>Standard Test Management Columns</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveExportNotice("CSV")}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 font-semibold text-xs transition-colors cursor-pointer border border-slate-700"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Controlled "Coming in next milestone" Modal */}
      {activeExportNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setActiveExportNotice(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 w-fit mb-4">
              <Download className="w-6 h-6" />
            </div>

            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Milestone 1B Gate
            </span>

            <h3 className="text-lg font-bold text-white mt-2">
              {activeExportNotice} Export Engine
            </h3>

            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Export generation is coming in the next milestone. Real file download
              streaming will be connected once the live test suite pipeline is
              established.
            </p>

            <div className="mt-4 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400">
              <div className="font-semibold text-slate-200 mb-1">
                Planned Features:
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                <li>Automated spreadsheet formatting with styled headers</li>
                <li>Jira / TestRail mapped field serialization</li>
                <li>Instant client-side blob download trigger</li>
              </ul>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveExportNotice(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
