import React from "react";
import {
  Copy,
  FileQuestion,
  HelpCircle,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ValidationCategory, ValidationSeverity } from "@/types";

interface ValidationItem {
  id: string;
  category: ValidationCategory;
  severity: ValidationSeverity;
  title: string;
  description: string;
  targetRef: string;
  suggestedFix?: string;
}

const DEMO_FINDINGS: Record<ValidationCategory, ValidationItem[]> = {
  "Duplicate Detection": [
    {
      id: "DUP-001",
      category: "Duplicate Detection",
      severity: "Warning",
      title: "High step overlap between TC-UAT-001 and TC-UAT-014",
      description: "Both test cases verify initial TOTP QR scanning without distinct variance in preconditions or expected outcomes.",
      targetRef: "TC-UAT-001 / TC-UAT-014",
      suggestedFix: "Merge into single parameterized scenario or parameterize device OS variations.",
    },
  ],
  "Incomplete Test Cases": [
    {
      id: "INC-001",
      category: "Incomplete Test Cases",
      severity: "Critical",
      title: "Missing terminal assertion in TC-UAT-008",
      description: "Step 4 contains an action to 'Submit order payment' but does not specify database or UI expected results.",
      targetRef: "TC-UAT-008",
      suggestedFix: "Define exact HTTP 200 response, order state 'CONFIRMED', and email receipt dispatch.",
    },
  ],
  "Missing Information": [
    {
      id: "MIS-001",
      category: "Missing Information",
      severity: "Warning",
      title: "Undefined session timeout interval in REQ-001",
      description: "MFA enrollment lockout duration is defined (5 min), but idle window before QR token invalidation is omitted.",
      targetRef: "REQ-001 §3.2",
      suggestedFix: "Specify standard 10-minute idle session timeout threshold.",
    },
  ],
  "Requirement Quality": [
    {
      id: "QUA-001",
      category: "Requirement Quality",
      severity: "Info",
      title: "Requirement meets IEEE 830 acceptance criteria standards",
      description: "Story demonstrates clear role definition, testable acceptance rules, and unambiguous outcomes.",
      targetRef: "REQ-001",
      suggestedFix: "No modifications required.",
    },
  ],
  "Ambiguous Requirements": [
    {
      id: "AMB-001",
      category: "Ambiguous Requirements",
      severity: "Critical",
      title: "Subjective SLA constraint 'system should be fast'",
      description: "Specification mentions 'fast response time under high load' without specifying P95 latency in milliseconds.",
      targetRef: "REQ-002 §4.1",
      suggestedFix: "Quantify constraint to 'P95 response time < 450ms under 2,500 concurrent connections'.",
    },
  ],
};

const CATEGORY_META: {
  category: ValidationCategory;
  icon: React.ElementType;
  description: string;
}[] = [
  {
    category: "Duplicate Detection",
    icon: Copy,
    description: "Identifies redundant test cases and duplicated assertions across suites.",
  },
  {
    category: "Incomplete Test Cases",
    icon: FileQuestion,
    description: "Detects missing steps, omitted assertions, or blank expected outcomes.",
  },
  {
    category: "Missing Information",
    icon: HelpCircle,
    description: "Highlights gaps in specifications such as unstated timeouts or error codes.",
  },
  {
    category: "Requirement Quality",
    icon: Sparkles,
    description: "Evaluates clarity, testability, and structural completeness of business rules.",
  },
  {
    category: "Ambiguous Requirements",
    icon: AlertTriangle,
    description: "Catches vague statements ('should be easy', 'fast') that cannot be verified.",
  },
];

export function ValidationSection() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {CATEGORY_META.map((meta) => {
          const Icon = meta.icon;
          const items = DEMO_FINDINGS[meta.category] || [];

          return (
            <div
              key={meta.category}
              className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-800/80 text-amber-400 border border-slate-700/60">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-white">
                      {meta.category}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {items.length} {items.length === 1 ? "rule" : "rules"}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  {meta.description}
                </p>

                {/* Findings List */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800/90 space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono text-[10px] text-amber-400 font-bold">
                          {item.targetRef}
                        </span>
                        <StatusBadge status={item.severity} />
                      </div>
                      <h4 className="font-semibold text-slate-100">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        {item.description}
                      </p>

                      {item.suggestedFix && (
                        <div className="pt-2 border-t border-slate-850 text-[11px] text-amber-300/90 font-mono">
                          <strong className="text-slate-400 font-normal">
                            Recommendation:
                          </strong>{" "}
                          {item.suggestedFix}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Deterministic Quality Rule</span>
                <span className="text-amber-400/80">Automated Gate</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
