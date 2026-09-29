import React from "react";
import { SectionCard } from "@/components/ui/SectionCard";
import { ScenarioBadge } from "@/components/ui/ScenarioBadge";
import { ScenarioType } from "@/types";

interface ScenarioDistributionCardProps {
  counts?: {
    positive: number;
    negative: number;
    boundary: number;
    roleBased: number;
    total: number;
  };
  isLive?: boolean;
}

export function ScenarioDistributionCard({
  counts,
  isLive = false,
}: ScenarioDistributionCardProps) {
  const total = counts?.total || 120;
  const pCount = counts?.positive ?? 54;
  const nCount = counts?.negative ?? 32;
  const bCount = counts?.boundary ?? 20;
  const rCount = counts?.roleBased ?? 14;

  const distribution: {
    type: ScenarioType;
    count: number;
    pct: number;
    color: string;
  }[] = [
    {
      type: "Positive",
      count: pCount,
      pct: total > 0 ? Number(((pCount / total) * 100).toFixed(0)) : 0,
      color: "bg-emerald-500",
    },
    {
      type: "Negative",
      count: nCount,
      pct: total > 0 ? Number(((nCount / total) * 100).toFixed(0)) : 0,
      color: "bg-rose-500",
    },
    {
      type: "Boundary",
      count: bCount,
      pct: total > 0 ? Number(((bCount / total) * 100).toFixed(0)) : 0,
      color: "bg-amber-500",
    },
    {
      type: "Role-Based",
      count: rCount,
      pct: total > 0 ? Number(((rCount / total) * 100).toFixed(0)) : 0,
      color: "bg-indigo-500",
    },
  ];

  return (
    <SectionCard
      title="Scenario Archetype Distribution"
      description="Breakdown of synthesized UAT testing archetypes."
      badge={isLive ? "Live Session Data" : "Sample Distribution"}
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
                className={`h-full rounded-full ${item.color} transition-all duration-500`}
                style={{ width: `${item.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
