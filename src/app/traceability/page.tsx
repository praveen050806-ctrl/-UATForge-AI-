import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { TraceabilityView } from "@/components/traceability/TraceabilityView";


export default function TraceabilityPage() {
  return (
    <AppShell>
      <PageHeader
        title="Requirement Traceability"
        subtitle="End-to-end auditability linking business requirements to governing rules, user scenarios, and executable test cases."
        badge="Stage 5: Traceability"
      />

      <TraceabilityView />
    </AppShell>
  );
}
