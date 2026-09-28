import React from "react";
import Link from "next/link";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ArrowUpRight } from "lucide-react";

export function ValidationSummaryCard() {
  const issues = [
    {
      id: "VAL-01",
      category: "Duplicate Detection",
      title: "Potential duplicate: TC-UAT-004 overlaps with TC-UAT-012",
      severity: "Warning" as const,
    },
    {
      id: "VAL-02",
      category: "Missing Information",
      title: "Expected timeout threshold undefined in REQ-002",
      severity: "Critical" as const,
    },
    {
      id: "VAL-03",
      category: "Requirement Quality",
      title: "Ambiguous phrase 'system should be fast' in REQ-003",
      severity: "Info" as const,
    },
  ];

  return (
    <SectionCard
      title="Validation Summary"
      description="Automated UAT suite health inspection issues."
      badge="Sample Issues"
      action={
        <Link
          href="/validation"
          className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      <div className="space-y-3">
        {issues.map((issue) => (
          <div
            key={issue.id}
            className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-400">
                  {issue.category}
                </span>
                <StatusBadge status={issue.severity} />
              </div>
              <p className="text-xs text-slate-200 font-medium">{issue.title}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
