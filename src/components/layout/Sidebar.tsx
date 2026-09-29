"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  ListChecks,
  ShieldCheck,
  PlayCircle,
  Bug,
  GitMerge,
  Download,
  Sparkles,
  Menu,
  X,
  Layers,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    badge: undefined,
  },
  {
    name: "Requirements",
    href: "/requirements",
    icon: FileText,
    badge: "Input",
  },
  {
    name: "Test Suites",
    href: "/test-suites",
    icon: ListChecks,
    badge: undefined,
  },
  {
    name: "Execution",
    href: "/execution",
    icon: PlayCircle,
    badge: "UAT Live",
  },
  {
    name: "Validation",
    href: "/validation",
    icon: ShieldCheck,
    badge: "Quality",
  },
  {
    name: "Defects",
    href: "/defects",
    icon: Bug,
    badge: "Workflow",
  },
  {
    name: "Traceability",
    href: "/traceability",
    icon: GitMerge,
    badge: undefined,
  },
  {
    name: "Exports",
    href: "/exports",
    icon: Download,
    badge: undefined,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Hamburger Toggle Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 text-white z-40 sticky top-0">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white">
              UATForge<span className="text-amber-400">.AI</span>
            </span>
          </div>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="group flex items-start gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white">
                  UATForge
                </span>
                <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5">
                From Business Requirements to Ready-to-Execute UAT
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Platform Workflow
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group relative",
                  isActive
                    ? "bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/30 shadow-xs"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/80"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive
                        ? "text-amber-400"
                        : "text-slate-400 group-hover:text-slate-200"
                    )}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute right-2 text-amber-400">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Product Principle & Status Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800/80 text-[11px] space-y-1.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Core Principle
            </div>
            <p className="text-slate-300 font-medium leading-relaxed">
              AI generates.
              <br />
              Validation checks.
              <br />
              Human approves.
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-slate-400 px-1">
            <span>Milestone 5</span>
            <span className="text-emerald-400 font-medium">UAT Engine Active</span>
          </div>
        </div>
      </aside>
    </>
  );
}
