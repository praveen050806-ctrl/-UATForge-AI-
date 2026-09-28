import React from "react";
import Link from "next/link";
import { FileText, ArrowUpRight, Clock } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SectionCard } from "@/components/ui/SectionCard";

const DEMO_REQUIREMENTS = [
  {
    id: "REQ-001",
    title: "User Multi-Factor Authentication (MFA) Enrollment",
    type: "user-story",
    casesCount: 8,
    status: "validated" as const,
    updatedAt: "10 mins ago",
  },
  {
    id: "REQ-002",
    title: "Checkout Cart Discount Code Validation Engine",
    type: "workflow",
    casesCount: 12,
    status: "parsed" as const,
    updatedAt: "1 hour ago",
  },
  {
    id: "REQ-003",
    title: "Enterprise SSO SAML 2.0 Integration Callback",
    type: "text",
    casesCount: 6,
    status: "draft" as const,
    updatedAt: "Yesterday",
  },
];

export function RecentRequirements() {
  return (
    <SectionCard
      title="Recent Requirements"
      description="Business requirements staged for UAT test case synthesis."
      badge="Sample Data"
      action={
        <Link
          href="/requirements"
          className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition-colors"
        >
          <span>All Requirements</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      <div className="space-y-3">
        {DEMO_REQUIREMENTS.map((req) => (
          <div
            key={req.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition-all gap-3"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-amber-400 shrink-0 mt-0.5">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {req.id}
                  </span>
                  <StatusBadge status={req.status} />
                </div>
                <h4 className="text-sm font-semibold text-slate-200 mt-1">
                  {req.title}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400 shrink-0 self-end sm:self-center font-mono">
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                {req.casesCount} test cases
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <Clock className="w-3 h-3" />
                {req.updatedAt}
              </span>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
