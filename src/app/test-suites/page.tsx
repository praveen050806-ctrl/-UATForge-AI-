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
