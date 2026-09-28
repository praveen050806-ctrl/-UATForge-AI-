import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { TestSuitesTable } from "@/components/test-suites/TestSuitesTable";
import { SectionCard } from "@/components/ui/SectionCard";
import { Download, Plus } from "lucide-react";

export default function TestSuitesPage() {
  return (
    <AppShell>
      <PageHeader
        title="UAT Test Suites"
        subtitle="Manage, review, and filter generated user acceptance test cases across test archetypes."
        badge="Stage 3: Test Suite"
        actions={
          <div className="flex items-center gap-2.5">
            <Link
              href="/exports"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Suite</span>
            </Link>
            <Link
              href="/requirements"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Suite</span>
            </Link>
          </div>
        }
      />

      {/* Notice Banner */}
      <div className="mb-6 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-center justify-between gap-4">
        <p>
          <strong className="text-amber-400 font-mono">Curated Demonstration Suite:</strong>{" "}
          Showing sample multi-archetype test cases (Positive, Negative, Boundary, Role-Based)
          demonstrating column structure and modal drill-down.
        </p>
      </div>

      <SectionCard
        title="Active UAT Cases"
        description="Comprehensive acceptance testing scenarios ready for human signoff and execution."
        badge="Structured Table"
      >
        <TestSuitesTable />
      </SectionCard>
    </AppShell>
  );
}
