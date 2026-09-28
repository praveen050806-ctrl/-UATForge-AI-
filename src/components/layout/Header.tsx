"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, ShieldAlert, Cpu } from "lucide-react";

export function Header() {
  const pathname = usePathname();

  const getSectionTitle = () => {
    switch (pathname) {
      case "/dashboard":
        return "Dashboard Overview";
      case "/requirements":
        return "Requirement Workspace";
      case "/test-suites":
        return "UAT Test Suites";
      case "/validation":
        return "Quality Validation";
      case "/traceability":
        return "Requirement Traceability";
      case "/exports":
        return "Test Suite Exports";
      default:
        return "Enterprise Platform";
    }
  };

  return (
    <header className="h-16 px-6 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
      {/* Left Title / Breadcrumbs */}
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
          <span className="text-slate-400 font-mono text-xs">UATForge</span>
          <span className="text-slate-600">/</span>
          <span className="text-amber-400 font-medium">{getSectionTitle()}</span>
        </h1>
      </div>

      {/* Right Actions & Status */}
      <div className="flex items-center gap-3">
        {/* System State Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-amber-400" />
          <span>Gemini AI:</span>
          <span className="text-amber-400 font-semibold">Active Engine</span>
        </div>

        {/* Demo Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-mono text-amber-300">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Demo Data Mode</span>
        </div>

        {/* Quick Action */}
        <Link
          href="/requirements"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Requirement</span>
        </Link>
      </div>
    </header>
  );
}
