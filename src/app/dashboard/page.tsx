import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/ui/KpiCard";
import { RecentRequirements } from "@/components/dashboard/RecentRequirements";
import { TestCoverageCard } from "@/components/dashboard/TestCoverageCard";
import { ScenarioDistributionCard } from "@/components/dashboard/ScenarioDistributionCard";
import { ValidationSummaryCard } from "@/components/dashboard/ValidationSummaryCard";
import {
  FileText,
  ListChecks,
  CheckCircle,
  AlertOctagon,
  Maximize2,
  ShieldAlert,
  Plus,
  ArrowRight,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <AppShell>
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        subtitle="Understand your UAT coverage at a glance."
        badge="Executive Overview"
        actions={
          <Link
            href="/requirements"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Test Suite</span>
          </Link>
        }
      />

      {/* Demo Notification Notice */}
      <div className="mb-6 p-3.5 rounded-xl bg-slate-900/80 border border-amber-500/20 text-xs text-slate-300 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <p>
            <strong className="text-amber-400 font-mono">Prototype Shell Active:</strong>{" "}
            Metrics and tables below contain curated structural sample data for
            reviewing layout hierarchy before live pipeline integration.
          </p>
        </div>
        <Link
          href="/requirements"
          className="text-amber-400 hover:text-amber-300 font-semibold shrink-0 flex items-center gap-1"
        >
          <span>Workspace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 6 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <KpiCard
          title="Total Requirements"
          value="14"
          subtitle="4 in progress this cycle"
          icon={FileText}
          accentColor="slate"
        />
        <KpiCard
          title="Total Test Cases"
          value="120"
          subtitle="Generated across all suites"
          icon={ListChecks}
          accentColor="gold"
        />
        <KpiCard
          title="Positive"
          value="54"
          subtitle="Happy path workflows"
          icon={CheckCircle}
          accentColor="emerald"
        />
        <KpiCard
          title="Negative"
          value="32"
          subtitle="Error & denial paths"
          icon={AlertOctagon}
          accentColor="rose"
        />
        <KpiCard
          title="Boundary"
          value="20"
          subtitle="Limits & threshold cases"
          icon={Maximize2}
          accentColor="indigo"
        />
        <KpiCard
          title="Validation Issues"
          value="6"
          subtitle="Needs review before signoff"
          icon={ShieldAlert}
          accentColor="rose"
        />
      </div>

      {/* Main Grid: Coverage & Distribution & Recent Requirements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <RecentRequirements />
        </div>
        <div>
          <TestCoverageCard />
        </div>
      </div>

      {/* Secondary Grid: Scenario Distribution & Validation Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScenarioDistributionCard />
        <ValidationSummaryCard />
      </div>
    </AppShell>
  );
}
