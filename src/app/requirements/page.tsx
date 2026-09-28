import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { RequirementInputForm } from "@/components/requirements/RequirementInputForm";
import { RequirementIntelligencePlaceholder } from "@/components/requirements/RequirementIntelligencePlaceholder";
import { SectionCard } from "@/components/ui/SectionCard";


export default function RequirementsPage() {
  return (
    <AppShell>
      <PageHeader
        title="Requirement Workspace"
        subtitle="Ingest business requirements, user stories, or specification documents for UAT decomposition."
        badge="Stage 1: Ingestion"
      />

      <div className="space-y-8">
        {/* Requirement Input Form Section */}
        <SectionCard
          title="Provide Requirement"
          description="Enter raw functional specifications or upload requirement documentation."
          badge="Interactive Form"
        >
          <RequirementInputForm />
        </SectionCard>

        {/* Requirement Intelligence Concepts Area */}
        <RequirementIntelligencePlaceholder />
      </div>
    </AppShell>
  );
}
