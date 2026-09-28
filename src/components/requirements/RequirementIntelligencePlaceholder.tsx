import React from "react";
import {
  Users,
  Play,
  Scale,
  Sliders,
  CheckCircle,
  Network,
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
        "Enterprise User (End User)",
        "Identity Provider (IdP)",
        "System Security Daemon",
      ],
      tag: "Extracted Archetypes",
    },
    {
      title: "Actions",
      icon: Play,
      description: "Interactive operations initiated by actors.",
      items: [
        "Request MFA enrollment",
        "Scan TOTP QR / enter manual key",
        "Submit 6-digit verification token",
        "Confirm backup code storage",
      ],
      tag: "Operation Sequence",
    },
    {
      title: "Business Rules",
      icon: Scale,
      description: "Governance constraints and validation policies.",
      items: [
        "RFC 6238 TOTP specification compliance",
        "Token validity window strictly 30 seconds",
        "Enforce 3 consecutive failed attempts lockout (5 min)",
        "Must acknowledge emergency backup code generation",
      ],
      tag: "Governing Logic",
    },
    {
      title: "Conditions",
      icon: Sliders,
      description: "State prerequisites and conditional branches.",
      items: [
        "User authenticated into active session",
        "MFA not currently fully configured",
        "Account not currently in lockout state",
      ],
      tag: "State Prerequisites",
    },
    {
      title: "Outcomes",
      icon: CheckCircle,
      description: "Expected state transitions and artifacts.",
      items: [
        "MFA status updated to 'active'",
        "10 one-time recovery codes generated & persisted",
        "Audit log entry written with client IP and timestamp",
      ],
      tag: "Deterministic Results",
    },
    {
      title: "Dependencies",
      icon: Network,
      description: "External systems, APIs, and microservices.",
      items: [
        "Auth0 / Okta / SAML Session Service",
        "SMS Gateway (Twilio / AWS SNS)",
        "Encrypted Vault Secret Storage",
      ],
      tag: "Integration Points",
    },
  ];

  return (
    <SectionCard
      title="Requirement Intelligence"
      description="Structured business domain concepts extracted by the AI engine."
      badge="Extraction Blueprint"
      action={
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
          <Cpu className="w-3.5 h-3.5 text-amber-400" />
          <span>Gemini Entity Extraction: Next Milestone</span>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

              <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-850 space-y-1.5">
                {sec.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-xs text-slate-300 font-mono"
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
