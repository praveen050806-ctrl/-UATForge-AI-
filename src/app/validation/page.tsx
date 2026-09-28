import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { ValidationSection } from "@/components/validation/ValidationSection";
import { Info } from "lucide-react";

export default function ValidationPage() {
  return (
    <AppShell>
      <PageHeader
        title="UAT Quality Validation"
        subtitle="Automated inspection engine evaluating test case completeness, duplicate assertions, and requirement ambiguity."
        badge="Stage 4: Validation"
      />

      {/* Structural Notice */}
      <div className="mb-6 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-1">
        <div className="flex items-center gap-2 text-amber-400 font-semibold font-mono text-xs">
          <Info className="w-4 h-4" />
          <span>Automated Quality Gate Blueprint</span>
        </div>
        <p className="text-slate-400">
          This module will perform deterministic rules-based and semantic validation on generated UAT cases
          and raw requirements. The categories and cards below demonstrate the quality gate checks
          that will be applied during active runs.
        </p>
      </div>

      <ValidationSection />
    </AppShell>
  );
}
