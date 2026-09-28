import React from "react";
import Link from "next/link";
import {
  FileText,
  BrainCircuit,
  ListChecks,
  ShieldCheck,
  UserCheck,
  Download,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight,
  GitMerge,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  const pipelineSteps = [
    {
      step: "01",
      name: "Requirement",
      icon: FileText,
      desc: "Paste user stories, workflows, or upload business specs.",
    },
    {
      step: "02",
      name: "Understand",
      icon: BrainCircuit,
      desc: "Extract actors, business rules, conditions, and outcomes.",
    },
    {
      step: "03",
      name: "Generate",
      icon: ListChecks,
      desc: "Produce Positive, Negative, Boundary, & Role scenarios.",
    },
    {
      step: "04",
      name: "Validate",
      icon: ShieldCheck,
      desc: "Deterministic quality checks for duplicates & omissions.",
    },
    {
      step: "05",
      name: "Review",
      icon: UserCheck,
      desc: "Human-in-the-loop editing, regeneration, and signoff.",
    },
    {
      step: "06",
      name: "Deliver",
      icon: Download,
      desc: "Export formatted Excel, CSV, or sync to Jira/ALM.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Navigation */}
      <header className="h-16 px-6 sm:px-10 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-lg tracking-tight text-white">
              UATForge
            </span>
            <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              AI
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-xs font-medium text-slate-400 hover:text-slate-100 transition-colors hidden sm:block"
          >
            Dashboard
          </Link>
          <Link
            href="/requirements"
            className="text-xs font-medium text-slate-400 hover:text-slate-100 transition-colors hidden sm:block"
          >
            Requirements
          </Link>
          <Link
            href="/test-suites"
            className="text-xs font-medium text-slate-400 hover:text-slate-100 transition-colors hidden sm:block"
          >
            Test Suites
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm"
          >
            <span>Open Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center">
        {/* Hero Section */}
        <section className="relative px-6 pt-16 pb-20 md:pt-24 md:pb-28 max-w-6xl mx-auto text-center">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-mono mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered UAT Engineering Platform</span>
          </div>

          {/* Title & Tagline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
            From Business Requirements to{" "}
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              Ready-to-Execute UAT.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Convert business requirements and workflows into structured,
            validated, and editable UAT test suites.
          </p>

          {/* Workflow Sequence Banner */}
          <div className="mt-8 max-w-3xl mx-auto">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg backdrop-blur-md">
              <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold mb-2.5">
                End-to-End Workflow
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold font-mono text-slate-200">
                <span className="px-2.5 py-1 rounded-lg bg-slate-850 border border-slate-700/80 text-white">Requirement</span>
                <span className="text-amber-400">→</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-850 border border-slate-700/80 text-white">Understand</span>
                <span className="text-amber-400">→</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-850 border border-slate-700/80 text-white">Generate</span>
                <span className="text-amber-400">→</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-850 border border-slate-700/80 text-white">Validate</span>
                <span className="text-amber-400">→</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-850 border border-slate-700/80 text-white">Review</span>
                <span className="text-amber-400">→</span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300">Deliver</span>
              </div>
            </div>
          </div>

          {/* Prominent Core Product Principle */}
          <div className="mt-4 max-w-2xl mx-auto">
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/90 border border-amber-500/30 shadow-xl shadow-amber-500/5 backdrop-blur-md">
              <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold mb-2">
                Core Governance Formula
              </div>
              <div className="text-sm sm:text-base font-bold text-white font-mono flex items-center justify-center flex-wrap gap-2">
                <span className="text-amber-300">AI generates</span>
                <span className="text-slate-500">→</span>
                <span className="text-sky-300">Validation checks</span>
                <span className="text-slate-500">→</span>
                <span className="text-emerald-300">Human approves</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/requirements"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-lg shadow-amber-500/25 group cursor-pointer"
            >
              <span>Create Test Suite</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors cursor-pointer"
            >
              <BarChart3 className="w-4 h-4 text-slate-400" />
              <span>Open Dashboard</span>
            </Link>
          </div>
        </section>

        {/* Product Pipeline Section */}
        <section className="px-6 py-16 border-t border-slate-800/80 bg-slate-950/40">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
                End-to-End Pipeline
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                How UATForge AI Works
              </h2>
              <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto">
                A disciplined, multi-stage engineering pipeline from raw business
                stories to audit-ready test suites.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pipelineSteps.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.step}
                    className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/30 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono font-bold text-amber-400/80">
                        STEP {s.step}
                      </span>
                      <div className="p-2 rounded-lg bg-slate-800/80 text-amber-400 border border-slate-700/60 group-hover:scale-105 transition-transform">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="text-base font-semibold text-white">
                      {s.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Value Proposition Highlights */}
        <section className="px-6 py-16 border-t border-slate-800/80">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <div className="p-2.5 w-fit rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">
                Multi-Type Coverage
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Automatically generate Positive, Negative, Boundary, and
                Role-Based scenarios with explicit step preconditions and expected
                outcomes.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <div className="p-2.5 w-fit rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">
                Automated Quality Gate
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Deterministic validation detects duplicate cases, ambiguous
                wording, and missing preconditions before test execution begins.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <div className="p-2.5 w-fit rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-4">
                <GitMerge className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">
                Bidirectional Traceability
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Verify that every business rule is backed by at least one scenario
                and every test case traces cleanly back to its source requirement.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-slate-800/80 bg-slate-950 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300">UATForge AI</span>
          <span>— Enterprise UAT Platform</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
          <span>Milestone 1B Shell</span>
          <span>•</span>
          <Link href="/dashboard" className="text-amber-400/90 hover:underline">
            Dashboard
          </Link>
          <span>•</span>
          <Link href="/requirements" className="text-amber-400/90 hover:underline">
            Requirements
          </Link>
        </div>
      </footer>
    </div>
  );
}
