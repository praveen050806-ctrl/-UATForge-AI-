import React from "react";
import {
  Users,
  Play,
  Scale,
  Sliders,
  CheckCircle,
  Network,
  AlertTriangle,
  Cpu,
} from "lucide-react";
import { SectionCard } from "@/components/ui/SectionCard";

export function RequirementIntelligencePlaceholder() {
  const intelligenceSections = [
    {
      title: "Roles",
      icon: Users,
      description: "Actors, user types, and system entities.",
      items: [
        "Employee (Submitter)",
        "Manager (Tier 1 Approver)",
        "Finance (Tier 2 Approver & Payer)",
        "Admin (Tier 3 Approver)",
      ],
      tag: "Actors",
    },
    {
      title: "Actions",
      icon: Play,
      description: "Interactive operations initiated by actors or systems.",
      items: [
        "Submit expense claim",
        "Approve claim (Manager / Finance / Admin)",
        "Reject claim for missing receipt",
        "Disburse payment & send notification",
      ],
      tag: "Operations",
    },
    {
      title: "Business Rules",
      icon: Scale,
      description: "Governance constraints, approval tiers, and validation limits.",
      items: [
        "Expense ≤ ₹10,000 requires manager approval only",
        "Expense ₹10,001 - ₹50,000 requires manager + finance approval",
        "Expense > ₹50,000 requires manager + finance + admin approval",
        "Missing receipts mandate immediate rejection",
      ],
      tag: "Rules",
    },
    {
      title: "Conditions",
      icon: Sliders,
      description: "State prerequisites and conditional decision branches.",
      items: [
        "Amount ≤ 10,000 vs 10,001 - 50,000 vs > 50,000",
        "Receipt attached == true vs false",
        "All required tier approvals granted",
      ],
      tag: "Conditions",
    },
    {
      title: "Outcomes",
      icon: CheckCircle,
      description: "Expected state transitions, disbursements, and artifacts.",
      items: [
        "Expense status updated to 'Approved' or 'Rejected'",
        "Payment processed by finance department",
        "Confirmation notification sent to employee",
      ],
      tag: "Outcomes",
    },
    {
      title: "Dependencies",
      icon: Network,
      description: "External systems, payment services, and databases.",
      items: [
        "Finance ERP / Payment Disbursement Gateway",
        "Employee Notification Service (Email/Push)",
        "Receipt Document Vault",
      ],
      tag: "Dependencies",
    },
    {
      title: "Ambiguities",
      icon: AlertTriangle,
      description: "Vague terms, missing SLA limits, or unstated edge cases.",
      items: [
        "Payment processing turnaround SLA after approval not stated",
        "Employee notification channel (SMS, Email, Push) unspecified",
        "Appeal or resubmission process for rejected claims unstated",
      ],
      tag: "Ambiguities",
    },
  ];

  return (
    <SectionCard
      title="Extraction Architecture Blueprint"
      description="Preview of the 7 structured domain categories extracted by the Google Gemini engine."
      badge="Intelligence Blueprint"
      action={
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
          <Cpu className="w-3.5 h-3.5 text-amber-400" />
          <span>Google Gemini: Active Engine</span>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {intelligenceSections.map((sec) => {
          const Icon = sec.icon;
          return (
            <div
              key={sec.title}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-amber-500/30 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-amber-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-semibold text-white">
                    {sec.title}
                  </h4>
                </div>
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400">
                  {sec.tag}
                </span>
              </div>

              <p className="text-xs text-slate-400">{sec.description}</p>

              <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-850 space-y-1.5">
                {sec.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-1.5 text-[11px] text-slate-300 font-mono"
                  >
                    <span className="text-amber-400/80 text-[10px] mt-0.5">
                      ▸
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
