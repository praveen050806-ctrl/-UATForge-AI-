import React, { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { UATExecutionWorkspace } from "@/components/execution/UATExecutionWorkspace";
import { Loader2 } from "lucide-react";

export default function ExecutionPage() {
  return (
    <AppShell>
      <PageHeader
        title="UAT Execution Cockpit"
        subtitle="Manually execute generated acceptance tests, record observed step evidence, register human signoffs, and log potential defects."
        badge="Stage 5: Live Execution"
      />

      <Suspense
        fallback={
          <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
            <span>Loading UAT Execution Cockpit...</span>
          </div>
        }
      >
        <UATExecutionWorkspace />
      </Suspense>
    </AppShell>
  );
}
