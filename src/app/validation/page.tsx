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
          <span>Automated Quality Gate Engine</span>
        </div>
        <p className="text-slate-400">
          This engine executes deterministic quality gate validation across active session requirements,
          scenarios, test cases, and live execution data. It detects missing steps, omitted expected results,
          missing test data, uncovered scenarios, duplicate test cases, ambiguous requirements, and execution anomalies.
        </p>
      </div>

      <ValidationSection />
    </AppShell>
  );
}
