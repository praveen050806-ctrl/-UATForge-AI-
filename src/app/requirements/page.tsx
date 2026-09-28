"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { RequirementInputForm } from "@/components/requirements/RequirementInputForm";
import { RequirementIntelligencePlaceholder } from "@/components/requirements/RequirementIntelligencePlaceholder";
import { RequirementIntelligenceDisplay } from "@/components/requirements/RequirementIntelligenceDisplay";
import { RequirementAnalysisLoading } from "@/components/requirements/RequirementAnalysisLoading";
import { RequirementAnalysisError } from "@/components/requirements/RequirementAnalysisError";
import { SectionCard } from "@/components/ui/SectionCard";
import { RequirementIntelligence, RequirementInputType } from "@/types";

export default function RequirementsPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [intelligence, setIntelligence] =
    useState<RequirementIntelligence | null>(null);
  const [meta, setMeta] = useState<{
    model?: string;
    extractedAt?: string;
  } | null>(null);
  const [sourceRequirement, setSourceRequirement] = useState<{
    title: string;
    content: string;
    inputType: RequirementInputType;
    documentFileName?: string;
  } | null>(null);
  const [error, setError] = useState<{
    message: string;
    code?: string;
    details?: string;
  } | null>(null);

  const handleUnderstand = async (params: {
    title: string;
    content: string;
    inputType: RequirementInputType;
    documentFileName?: string;
  }) => {
    setStatus("loading");
    setError(null);
    setSourceRequirement(params);

    try {
      const response = await fetch("/api/requirements/understand", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setStatus("error");
        setError({
          message:
            result.error ||
            "Failed to extract requirement intelligence from Gemini.",
          code: result.code || "REQUEST_FAILED",
          details: result.details,
        });
        return;
      }

      setIntelligence(result.data);
      setMeta(result.meta);
      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      const msg =
        err instanceof Error
          ? err.message
          : "Network error occurred while connecting to the requirement understanding service.";
      setError({
        message: msg,
        code: "NETWORK_ERROR",
        details: "Ensure your Next.js application server is running and reachable.",
      });
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setError(null);
  };

  return (
    <AppShell>
      <PageHeader
        title="Requirement Workspace"
        subtitle="Ingest business requirements, user stories, or specification documents for UAT decomposition via Google Gemini."
        badge="Stage 1: Ingestion & Intelligence"
      />

      <div className="space-y-8">
        {/* Error State Banner */}
        {status === "error" && error && (
          <RequirementAnalysisError
            error={error}
            onRetry={() => {
              if (sourceRequirement) {
                handleUnderstand(sourceRequirement);
              }
            }}
            onDismiss={() => setError(null)}
          />
        )}

        {/* Loading State during active Gemini analysis */}
        {status === "loading" && <RequirementAnalysisLoading />}

        {/* Successful Analysis State: Display AI-Generated Intelligence */}
        {status === "success" && intelligence && sourceRequirement ? (
          <RequirementIntelligenceDisplay
            intelligence={intelligence}
            meta={meta || undefined}
            sourceRequirement={sourceRequirement}
            onReset={handleReset}
          />
        ) : (
          /* Default / Input Workspace (Before analysis or during error) */
          status !== "loading" && (
            <>
              <SectionCard
                title="Provide Requirement"
                description="Enter functional specifications, user stories, or workflow definitions for Gemini domain decomposition."
                badge="Interactive Form"
              >
                <RequirementInputForm
                  onSubmit={handleUnderstand}
                  isLoading={false}
                  initialValues={sourceRequirement || undefined}
                />
              </SectionCard>

              {/* Extraction Architecture Blueprint */}
              <RequirementIntelligencePlaceholder />
            </>
          )
        )}
      </div>
    </AppShell>
  );
}
