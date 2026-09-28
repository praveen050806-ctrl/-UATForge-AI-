import React from "react";
import { SectionCard } from "@/components/ui/SectionCard";
import { ScenarioBadge } from "@/components/ui/ScenarioBadge";

export function ScenarioDistributionCard() {
  const distribution = [
    { type: "Positive" as const, count: 54, pct: 45, color: "bg-emerald-500" },
    { type: "Negative" as const, count: 32, pct: 27, color: "bg-rose-500" },
    { type: "Boundary" as const, count: 20, pct: 17, color: "bg-amber-500" },
    { type: "Role-Based" as const, count: 14, pct: 11, color: "bg-indigo-500" },
  ];

  return (
    <SectionCard
      title="Scenario Distribution"
      description="Breakdown of synthesized UAT testing archetypes."
      badge="Sample Distribution"
    >
      <div className="space-y-3.5">
        {distribution.map((item) => (
          <div key={item.type} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <ScenarioBadge type={item.type} />
              <div className="flex items-center gap-2 font-mono text-slate-300">
                <span className="font-bold">{item.count} cases</span>
                <span className="text-slate-400">({item.pct}%)</span>
              </div>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full ${item.color}`}
                style={{ width: `${item.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
