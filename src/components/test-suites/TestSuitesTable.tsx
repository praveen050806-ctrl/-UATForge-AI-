"use client";

import React, { useState, useMemo } from "react";
import { Search, Eye, X, Loader2, Sparkles, FilterX } from "lucide-react";
import { TestCase } from "@/types";
import { ScenarioBadge } from "@/components/ui/ScenarioBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

const DEMO_TEST_CASES: TestCase[] = [
  {
    id: "TC-UAT-001",
    scenarioId: "SCN-001",
    requirementId: "REQ-001",
    title: "Verify Successful MFA Enrollment with Valid TOTP Token",
    scenario: "User scans QR code and enters valid 6-digit TOTP within 30-second window",
    type: "Positive",
    role: "Enterprise User",
    priority: "Critical",
    status: "Ready",
    preconditions: [
      "User is authenticated into their dashboard account",
      "User has not yet enrolled an MFA authenticator device",
    ],
    steps: [
      {
        stepNumber: 1,
        action: "Navigate to Account Settings > Security > Multi-Factor Authentication",
        expectedResult: "MFA enrollment wizard opens showing QR code and manual key",
      },
      {
        stepNumber: 2,
        action: "Scan QR code with Google Authenticator / Authy app",
        expectedResult: "App generates a 6-digit dynamic rolling passcode",
      },
      {
        stepNumber: 3,
        action: "Enter the generated 6-digit code and click 'Verify & Activate'",
        expectedResult: "System validates token against RFC 6238 server time window",
      },
      {
        stepNumber: 4,
        action: "Save displayed 10 emergency backup recovery codes and check acknowledgment box",
        expectedResult: "Setup completes; user status changes to MFA Active",
      },
    ],
    expectedOutcome: "Account MFA status transitions to 'Active', and confirmation email audit notice is dispatched.",
    createdAt: "2026-09-28T18:00:00Z",
    updatedAt: "2026-09-28T18:30:00Z",
  },
  {
    id: "TC-UAT-002",
    scenarioId: "SCN-002",
    requirementId: "REQ-001",
    title: "Enforce Account Lockout After 3 Consecutive Invalid MFA Token Attempts",
    scenario: "User inputs three consecutive invalid or expired verification codes",
    type: "Negative",
    role: "Enterprise User",
    priority: "Critical",
    status: "Approved",
    preconditions: [
      "User has reached the MFA token verification challenge screen",
      "Failed attempts counter is currently at 0",
    ],
    steps: [
      {
        stepNumber: 1,
        action: "Input invalid code '000000' and submit",
        expectedResult: "Error displayed: 'Invalid authentication token (Attempt 1 of 3)'",
      },
      {
        stepNumber: 2,
        action: "Input invalid code '999999' and submit",
        expectedResult: "Error displayed: 'Invalid authentication token (Attempt 2 of 3)'",
      },
      {
        stepNumber: 3,
        action: "Input invalid code '123456' and submit",
        expectedResult: "Rate limiter triggers security lockout protocol",
      },
    ],
    expectedOutcome: "Enrollment session locks for 5 minutes. Audit security event logged.",
    createdAt: "2026-09-28T18:05:00Z",
    updatedAt: "2026-09-28T18:35:00Z",
  },
  {
    id: "TC-UAT-003",
    scenarioId: "SCN-003",
    requirementId: "REQ-001",
    title: "Accept Valid TOTP Code at Boundary Edge (T-1s and T+29s)",
    scenario: "User submits TOTP token at the absolute edge of the 30-second RFC window",
    type: "Boundary",
    role: "Enterprise User",
    priority: "High",
    status: "Ready",
    preconditions: [
      "MFA setup QR code has been generated",
      "Server clock NTP synchronized",
    ],
    steps: [
      {
        stepNumber: 1,
        action: "Wait until TOTP token has 1 second remaining on countdown timer and submit",
        expectedResult: "Token accepted within valid skew margin",
      },
    ],
    expectedOutcome: "Verification succeeds without false expiry rejection.",
    createdAt: "2026-09-28T18:10:00Z",
    updatedAt: "2026-09-28T18:40:00Z",
  },
  {
    id: "TC-UAT-004",
    scenarioId: "SCN-004",
    requirementId: "REQ-001",
    title: "Security Admin Forced MFA Reset Capability",
    scenario: "Admin revokes enrolled MFA token for locked out staff member",
    type: "Role-Based",
    role: "Security Administrator",
    priority: "Medium",
    status: "In Review",
    preconditions: [
      "Target user has active MFA device enrolled",
      "Admin is logged in with SEC_ADMIN role permissions",
    ],
    steps: [
      {
        stepNumber: 1,
        action: "Open Admin Console > User Directory > Select Target User",
        expectedResult: "User management panel displays enrolled authentication devices",
      },
      {
        stepNumber: 2,
        action: "Click 'Reset MFA Configuration' and enter reason code",
        expectedResult: "Confirmation modal prompts for admin re-authentication",
      },
    ],
    expectedOutcome: "Target user MFA tokens invalidated. User forced to re-enroll upon next login.",
    createdAt: "2026-09-28T18:15:00Z",
    updatedAt: "2026-09-28T18:45:00Z",
  },
  {
    id: "TC-UAT-005",
    scenarioId: "SCN-005",
    requirementId: "REQ-002",
    title: "Apply Valid Tier-1 Discount Coupon on Cart Total Exceeding $100",
    scenario: "Customer applies promotional code 'SUMMER20' on eligible items",
    type: "Positive",
    role: "E-Commerce Customer",
    priority: "High",
    status: "Ready",
    preconditions: [
      "Cart subtotal is greater than $100.00",
      "Promo code 'SUMMER20' is active in promotion service",
    ],
    steps: [
      {
        stepNumber: 1,
        action: "Enter 'SUMMER20' into coupon input and click 'Apply'",
        expectedResult: "Subtotal recalculates with 20% discount reflected",
      },
    ],
    expectedOutcome: "Order total discounted by exact promotional calculation.",
    createdAt: "2026-09-28T18:20:00Z",
    updatedAt: "2026-09-28T18:50:00Z",
  },
  {
    id: "TC-UAT-006",
    scenarioId: "SCN-006",
    requirementId: "REQ-002",
    title: "Reject Expired Discount Code with Clear Actionable Notification",
    scenario: "Customer attempts to redeem discount code past termination date",
    type: "Negative",
    role: "E-Commerce Customer",
    priority: "Medium",
    status: "Draft",
    preconditions: [
      "Cart contains eligible merchandise",
      "Promo code 'WINTER10' ended on 2026-01-01",
    ],
    steps: [
      {
        stepNumber: 1,
        action: "Submit expired coupon code 'WINTER10'",
        expectedResult: "Inline validation error: 'This promotional code expired on Jan 1, 2026'",
      },
    ],
    expectedOutcome: "Coupon rejected, cart totals remain unchanged, no discount applied.",
    createdAt: "2026-09-28T18:25:00Z",
    updatedAt: "2026-09-28T18:55:00Z",
  },
];

export function TestSuitesTable() {
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);

  const handleSimulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 600);
  };

  const filteredCases = useMemo(() => {
    return DEMO_TEST_CASES.filter((tc) => {
      const matchesSearch =
        search.trim() === "" ||
        tc.id.toLowerCase().includes(search.toLowerCase()) ||
        tc.title.toLowerCase().includes(search.toLowerCase()) ||
        tc.scenario.toLowerCase().includes(search.toLowerCase()) ||
        tc.role.toLowerCase().includes(search.toLowerCase());

      const matchesPriority =
        priorityFilter === "All" || tc.priority === priorityFilter;

      const matchesType = typeFilter === "All" || tc.type === typeFilter;

      const matchesStatus = statusFilter === "All" || tc.status === statusFilter;

      return matchesSearch && matchesPriority && matchesType && matchesStatus;
    });
  }, [search, priorityFilter, typeFilter, statusFilter]);

  return (
    <div className="space-y-4">
      {/* Demo Data Notice */}
      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 font-mono flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Demo Data: Structural demonstration cases for testing matrix & schema preview.</span>
        </div>
        <button
          type="button"
          onClick={handleSimulateLoading}
          disabled={isLoading}
          className="px-2.5 py-1 text-[11px] rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          )}
          <span>{isLoading ? "Refreshing..." : "Simulate Loading"}</span>
        </button>
      </div>

      {/* Controls Bar: Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search test ID, scenario, or role..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Priority Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
            <span className="text-[11px] text-slate-400 font-mono">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent border-none text-slate-200 focus:outline-hidden text-xs cursor-pointer font-medium"
            >
              <option value="All" className="bg-slate-900">All</option>
              <option value="Critical" className="bg-slate-900">Critical</option>
              <option value="High" className="bg-slate-900">High</option>
              <option value="Medium" className="bg-slate-900">Medium</option>
              <option value="Low" className="bg-slate-900">Low</option>
            </select>
          </div>

          {/* Scenario Type Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
            <span className="text-[11px] text-slate-400 font-mono">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent border-none text-slate-200 focus:outline-hidden text-xs cursor-pointer font-medium"
            >
              <option value="All" className="bg-slate-900">All Types</option>
              <option value="Positive" className="bg-slate-900">Positive</option>
              <option value="Negative" className="bg-slate-900">Negative</option>
              <option value="Boundary" className="bg-slate-900">Boundary</option>
              <option value="Role-Based" className="bg-slate-900">Role-Based</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
            <span className="text-[11px] text-slate-400 font-mono">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none text-slate-200 focus:outline-hidden text-xs cursor-pointer font-medium"
            >
              <option value="All" className="bg-slate-900">All Statuses</option>
              <option value="Ready" className="bg-slate-900">Ready</option>
              <option value="Approved" className="bg-slate-900">Approved</option>
              <option value="In Review" className="bg-slate-900">In Review</option>
              <option value="Draft" className="bg-slate-900">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4 font-semibold">Test ID</th>
                <th className="py-3 px-4 font-semibold">Scenario</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Priority</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-4">
                      <div className="h-4 w-20 bg-slate-800 rounded" />
                    </td>
                    <td className="py-4 px-4 space-y-1.5">
                      <div className="h-4 w-64 bg-slate-800 rounded" />
                      <div className="h-3 w-40 bg-slate-850 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-5 w-16 bg-slate-800 rounded-full" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-24 bg-slate-800 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-16 bg-slate-800 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-5 w-16 bg-slate-800 rounded-full" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="h-7 w-14 bg-slate-800 rounded-lg ml-auto" />
                    </td>
                  </tr>
                ))
              ) : (
                filteredCases.map((tc) => (
                  <tr
                    key={tc.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      {tc.id}
                    </td>
                    <td className="py-3.5 px-4 max-w-md">
                      <p className="font-semibold text-slate-100">{tc.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {tc.scenario}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <ScenarioBadge type={tc.type} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                      {tc.role}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 font-medium",
                          tc.priority === "Critical" && "text-rose-400",
                          tc.priority === "High" && "text-amber-400",
                          tc.priority === "Medium" && "text-sky-400",
                          tc.priority === "Low" && "text-slate-400"
                        )}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {tc.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={tc.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedTestCase(tc)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 border border-slate-700/80 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Empty Filter State */}
        {!isLoading && filteredCases.length === 0 && (
          <div className="p-6">
            <EmptyState
              icon={FilterX}
              badge="Filter Result"
              title="No Matching Test Cases"
              description="No test cases match the currently applied keywords or filters. Clear search or reset filters to review the full suite."
              actionText="Reset All Filters"
              onAction={() => {
                setSearch("");
                setPriorityFilter("All");
                setTypeFilter("All");
                setStatusFilter("All");
              }}
            />
          </div>
        )}

        {/* Table Footer info */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-[11px] font-mono text-slate-400 px-4">
          <span>
            Showing {filteredCases.length} of {DEMO_TEST_CASES.length} sample cases
          </span>
          <span className="text-amber-400/90 font-medium">
            Demo Structural Dataset
          </span>
        </div>
      </div>

      {/* View Test Case Interactive Modal */}
      {selectedTestCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedTestCase(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-xs font-bold text-amber-400">
                {selectedTestCase.id}
              </span>
              <ScenarioBadge type={selectedTestCase.type} />
              <StatusBadge status={selectedTestCase.status} />
            </div>

            <h3 className="text-lg font-bold text-white">
              {selectedTestCase.title}
            </h3>

            <p className="text-xs text-slate-300 mt-1">
              {selectedTestCase.scenario}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-mono p-3 rounded-lg bg-slate-950/80 border border-slate-800">
              <div>
                <span className="text-slate-400">Target Role:</span>{" "}
                <span className="text-slate-200">{selectedTestCase.role}</span>
              </div>
              <div>
                <span className="text-slate-400">Priority:</span>{" "}
                <span className="text-slate-200">{selectedTestCase.priority}</span>
              </div>
            </div>

            {/* Preconditions */}
            <div className="mt-4 space-y-1.5">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Preconditions
              </h4>
              <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 bg-slate-950/50 p-3 rounded-lg border border-slate-800/80">
                {selectedTestCase.preconditions.map((pre, i) => (
                  <li key={i}>{pre}</li>
                ))}
              </ul>
            </div>

            {/* Execution Steps */}
            <div className="mt-4 space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Execution Steps
              </h4>
              <div className="space-y-2">
                {selectedTestCase.steps.map((st) => (
                  <div
                    key={st.stepNumber}
                    className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs space-y-1"
                  >
                    <div className="flex items-center gap-2 font-mono font-bold text-amber-400">
                      <span>Step {st.stepNumber}</span>
                    </div>
                    <p className="text-slate-200">
                      <strong className="text-slate-400 font-normal">Action:</strong>{" "}
                      {st.action}
                    </p>
                    <p className="text-emerald-300/90">
                      <strong className="text-slate-400 font-normal">Expected:</strong>{" "}
                      {st.expectedResult}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Expected Outcome */}
            <div className="mt-4 p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/30 text-xs text-emerald-300">
              <strong className="font-semibold block mb-0.5">
                Terminal Expected Outcome:
              </strong>
              {selectedTestCase.expectedOutcome}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTestCase(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
