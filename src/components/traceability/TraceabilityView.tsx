"use client";

import React, { useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { TraceabilityLink } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";

const DEMO_LINKS: TraceabilityLink[] = [
  {
    id: "TR-001",
    requirementId: "REQ-001",
    requirementTitle: "User MFA Enrollment Workflow",
    businessRule: "BR-01: RFC 6238 TOTP 30-sec window validation",
    scenario: "SCN-01: User enters valid 6-digit TOTP token",
    testCaseId: "TC-UAT-001",
    coverageStatus: "Covered",
  },
  {
    id: "TR-002",
    requirementId: "REQ-001",
    requirementTitle: "User MFA Enrollment Workflow",
    businessRule: "BR-02: 3 consecutive failed token lock protocol",
    scenario: "SCN-02: User enters 3 invalid codes sequentially",
    testCaseId: "TC-UAT-002",
    coverageStatus: "Covered",
  },
  {
    id: "TR-003",
    requirementId: "REQ-001",
    requirementTitle: "User MFA Enrollment Workflow",
    businessRule: "BR-03: Clock drift tolerance ±1 time-step",
    scenario: "SCN-03: Code submitted at window transition boundary",
    testCaseId: "TC-UAT-003",
    coverageStatus: "Covered",
  },
  {
    id: "TR-004",
    requirementId: "REQ-001",
    requirementTitle: "User MFA Enrollment Workflow",
    businessRule: "BR-04: Emergency backup recovery codes generation",
    scenario: "SCN-04: User downloads 10 emergency backup hashes",
    testCaseId: "TC-UAT-004",
    coverageStatus: "Covered",
  },
  {
    id: "TR-005",
    requirementId: "REQ-002",
    requirementTitle: "Cart Coupon Discount Engine",
    businessRule: "BR-05: Cart minimum order value ≥ $100.00",
    scenario: "SCN-05: Customer applies valid code on $120 cart",
    testCaseId: "TC-UAT-005",
    coverageStatus: "Covered",
  },
  {
    id: "TR-006",
    requirementId: "REQ-002",
    requirementTitle: "Cart Coupon Discount Engine",
    businessRule: "BR-06: Reject expired discount promotion vouchers",
    scenario: "SCN-06: Customer applies expired coupon code",
    testCaseId: "TC-UAT-006",
    coverageStatus: "Covered",
  },
  {
    id: "TR-007",
    requirementId: "REQ-002",
    requirementTitle: "Cart Coupon Discount Engine",
    businessRule: "BR-07: Single coupon application per checkout session",
    scenario: "SCN-07: Customer attempts stacking multiple promotional codes",
    testCaseId: "TC-UAT-007 (Draft)",
    coverageStatus: "Partial",
  },
  {
    id: "TR-008",
    requirementId: "REQ-003",
    requirementTitle: "SAML 2.0 Enterprise SSO Integration",
    businessRule: "BR-08: Signature validation against IdP certificate",
    scenario: "SCN-08: Inbound SAML assertion signature validation",
    testCaseId: "Pending Synthesis",
    coverageStatus: "Uncovered",
  },
];

export function TraceabilityView() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const filteredLinks = DEMO_LINKS.filter((item) => {
    const matchesSearch =
      search.trim() === "" ||
      item.requirementId.toLowerCase().includes(search.toLowerCase()) ||
      item.requirementTitle.toLowerCase().includes(search.toLowerCase()) ||
      item.businessRule.toLowerCase().includes(search.toLowerCase()) ||
      item.scenario.toLowerCase().includes(search.toLowerCase()) ||
      item.testCaseId.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || item.coverageStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Visual Hierarchy Flowchart Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
            Traceability Chain Topology
          </div>
          <div className="text-xs font-mono font-bold text-slate-300">
            Requirement <span className="text-amber-400">→</span> Business Rule <span className="text-amber-400">→</span> Scenario <span className="text-amber-400">→</span> Test Case
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:flex-1 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
            <span className="text-[10px] font-mono text-slate-400 block mb-0.5">
              STAGE 01
            </span>
            <span className="text-xs font-bold text-white">Requirement</span>
            <p className="text-[10px] text-slate-400 mt-0.5">Business Needs</p>
          </div>

          <div className="text-slate-500 py-1 sm:py-0">
            <ArrowRight className="w-4 h-4 text-amber-500/70 rotate-90 sm:rotate-0" />
          </div>

          <div className="w-full sm:flex-1 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
            <span className="text-[10px] font-mono text-slate-400 block mb-0.5">
              STAGE 02
            </span>
            <span className="text-xs font-bold text-white">Business Rule</span>
            <p className="text-[10px] text-slate-400 mt-0.5">Governing Logic</p>
          </div>

          <div className="text-slate-500 py-1 sm:py-0">
            <ArrowRight className="w-4 h-4 text-amber-500/70 rotate-90 sm:rotate-0" />
          </div>

          <div className="w-full sm:flex-1 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
            <span className="text-[10px] font-mono text-slate-400 block mb-0.5">
              STAGE 03
            </span>
            <span className="text-xs font-bold text-white">Scenario</span>
            <p className="text-[10px] text-slate-400 mt-0.5">User Journey</p>
          </div>

          <div className="text-slate-500 py-1 sm:py-0">
            <ArrowRight className="w-4 h-4 text-amber-500/70 rotate-90 sm:rotate-0" />
          </div>

          <div className="w-full sm:flex-1 p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/30 text-center shadow-xs">
            <span className="text-[10px] font-mono text-amber-400 block mb-0.5">
              STAGE 04
            </span>
            <span className="text-xs font-bold text-white">Test Case</span>
            <p className="text-[10px] text-slate-400 mt-0.5">Executable Steps</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search requirement, rule, scenario, or test case ID..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
          <span className="text-[11px] text-slate-400 font-mono">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent border-none text-slate-200 focus:outline-hidden text-xs cursor-pointer font-medium"
          >
            <option value="All" className="bg-slate-900">All Statuses</option>
            <option value="Covered" className="bg-slate-900">Covered</option>
            <option value="Partial" className="bg-slate-900">Partial</option>
            <option value="Uncovered" className="bg-slate-900">Uncovered</option>
          </select>
        </div>
      </div>

      {/* Traceability Matrix Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4 font-semibold">Req ID</th>
                <th className="py-3 px-4 font-semibold">Requirement</th>
                <th className="py-3 px-4 font-semibold">Business Rule</th>
                <th className="py-3 px-4 font-semibold">Scenario</th>
                <th className="py-3 px-4 font-semibold">Test Case ID</th>
                <th className="py-3 px-4 font-semibold text-right">Coverage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLinks.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-400 shrink-0">
                    {row.requirementId}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-200 max-w-[200px]">
                    {row.requirementTitle}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px] max-w-[220px]">
                    {row.businessRule}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 text-[11px] max-w-[220px]">
                    {row.scenario}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-300">
                    {row.testCaseId}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <StatusBadge status={row.coverageStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLinks.length === 0 && (
          <div className="py-10 text-center text-xs text-slate-400">
            No traceability links matching search criteria.
          </div>
        )}

        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-[11px] font-mono text-slate-400 px-4">
          <span>Sample Bidirectional Traceability Chain</span>
          <span className="text-amber-400/90 font-medium">Verified Links</span>
        </div>
      </div>
    </div>
  );
}
