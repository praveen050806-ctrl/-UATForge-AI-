import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { DefectsWorkspace } from "@/components/defects/DefectsWorkspace";

export default function DefectsPage() {
  return (
    <AppShell>
      <PageHeader
        title="UAT Defect Registry"
        subtitle="Manage, triage, and track reported defects linked to UAT test case executions."
        badge="Stage 5B: Defect Workflow"
      />
      <DefectsWorkspace />
    </AppShell>
  );
}
