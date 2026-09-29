"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { RequirementInputForm } from "@/components/requirements/RequirementInputForm";
import { RequirementIntelligencePlaceholder } from "@/components/requirements/RequirementIntelligencePlaceholder";
import { RequirementIntelligenceDisplay } from "@/components/requirements/RequirementIntelligenceDisplay";
import { RequirementAnalysisLoading } from "@/components/requirements/RequirementAnalysisLoading";
import { RequirementAnalysisError } from "@/components/requirements/RequirementAnalysisError";
import { ScenarioGenerationLoading } from "@/components/requirements/ScenarioGenerationLoading";
import { ScenarioGenerationError } from "@/components/requirements/ScenarioGenerationError";
import { ScenarioReviewDisplay } from "@/components/requirements/ScenarioReviewDisplay";
import { SectionCard } from "@/components/ui/SectionCard";
import {
  RequirementIntelligence,
  RequirementInputType,
  GeneratedScenario,
  ScenarioGenerationSummary,
} from "@/types";

export default function RequirementsPage() {
  // Stage 1: Requirement Intelligence State
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

  // Stage 2: Scenario Generation State
  const [scenarioStatus, setScenarioStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [scenarios, setScenarios] = useState<GeneratedScenario[] | null>(null);
  const [scenarioSummary, setScenarioSummary] =
    useState<ScenarioGenerationSummary | null>(null);
  const [scenarioMeta, setScenarioMeta] = useState<{
    model?: string;
    generatedAt?: string;
  } | null>(null);
  const [scenarioError, setScenarioError] = useState<{
    message: string;
    code?: string;
    details?: string;
    retryable?: boolean;
  } | null>(null);

  // Ingestion / Understanding Handler
  const handleUnderstand = async (params: {
    title: string;
    content: string;
    inputType: RequirementInputType;
    documentFileName?: string;
  }) => {
    setStatus("loading");
    setError(null);
    setSourceRequirement(params);
    // Reset scenario state when new requirement is ingested
    setScenarioStatus("idle");
    setScenarios(null);
    setScenarioSummary(null);
    setScenarioError(null);

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

  // Scenario Generation Handler
  const handleGenerateScenarios = async () => {
    if (!sourceRequirement || !intelligence) return;

    setScenarioStatus("loading");
    setScenarioError(null);

    try {
      const response = await fetch("/api/scenarios/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requirementTitle: sourceRequirement.title,
          requirementContent: sourceRequirement.content,
          intelligence,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setScenarioStatus("error");
        setScenarioError({
          message: result.error || "Failed to generate scenarios with Gemini.",
          code: result.code || "REQUEST_FAILED",
          details: result.details,
          retryable: result.retryable,
        });
        return;
      }

      setScenarios(result.data.scenarios);
      setScenarioSummary(result.data.summary);
      setScenarioMeta(result.meta);
      setScenarioStatus("success");
    } catch (err: unknown) {
      setScenarioStatus("error");
      const msg =
        err instanceof Error
          ? err.message
          : "Network error occurred while connecting to the scenario generation service.";
      setScenarioError({
        message: msg,
        code: "NETWORK_ERROR",
        details: "Ensure your Next.js application server is running and reachable.",
      });
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setError(null);
    setScenarioStatus("idle");
    setScenarios(null);
    setScenarioSummary(null);
    setScenarioError(null);
  };

  return (
    <AppShell>
      <PageHeader
        title="Requirement Workspace"
        subtitle="Ingest business requirements, user stories, or specification documents for UAT decomposition via Google Gemini."
        badge={
          scenarioStatus === "success"
            ? "Stage 2: Scenario Suite Active"
            : status === "success"
            ? "Stage 1: Intelligence Ready"
            : "Stage 1: Ingestion & Intelligence"
        }
      />

      <div className="space-y-8">
        {/* Stage 1 Error State Banner */}
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

        {/* Stage 1 Loading State */}
        {status === "loading" && <RequirementAnalysisLoading />}

        {/* Stage 1 Success State: Display AI-Generated Intelligence */}
        {status === "success" && intelligence && sourceRequirement && (
          <RequirementIntelligenceDisplay
            intelligence={intelligence}
            meta={meta || undefined}
            sourceRequirement={sourceRequirement}
            onReset={handleReset}
            onGenerateScenarios={handleGenerateScenarios}
            isGeneratingScenarios={scenarioStatus === "loading"}
            hasScenariosGenerated={scenarioStatus === "success"}
          />
        )}

        {/* Stage 2 Error State */}
        {scenarioStatus === "error" && scenarioError && (
          <ScenarioGenerationError
            error={scenarioError}
            onRetry={handleGenerateScenarios}
            onDismiss={() => setScenarioError(null)}
          />
        )}

        {/* Stage 2 Loading State */}
        {scenarioStatus === "loading" && <ScenarioGenerationLoading />}

        {/* Stage 2 Success State: Display Generated Scenarios Suite */}
        {scenarioStatus === "success" &&
          scenarios &&
          scenarioSummary &&
          sourceRequirement && (
            <ScenarioReviewDisplay
              scenarios={scenarios}
              summary={scenarioSummary}
              meta={scenarioMeta || undefined}
              requirementTitle={sourceRequirement.title}
              onRegenerate={handleGenerateScenarios}
            />
          )}

        {/* Default / Input Workspace (Before analysis or during reset) */}
        {status !== "loading" && status !== "success" && (
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
        )}
      </div>
    </AppShell>
  );
}
