"use client";

import React, { useState } from "react";
import {
  BookOpen,
  GitBranch,
  UploadCloud,
  Sparkles,
  FileCheck,
  RotateCcw,
  Loader2,
  Image as ImageIcon,
  Globe,
  Info,
  ListOrdered,
  FileText,
} from "lucide-react";
import { RequirementInputType } from "@/types";
import { cn } from "@/lib/utils";

interface RequirementInputFormProps {
  onSubmit: (params: {
    title: string;
    content: string;
    inputType: RequirementInputType;
    documentFileName?: string;
    targetUrl?: string;
    screenshotFileName?: string;
  }) => void;
  isLoading?: boolean;
  initialValues?: {
    title: string;
    content: string;
    inputType: RequirementInputType;
  };
}

const SAMPLE_EXPENSE_CLAIM = {
  title: "Employee Expense Reimbursement & Multi-Tier Approval Workflow",
  inputType: "workflow" as RequirementInputType,
  content: `An employee submits an expense claim. If the expense is ₹10,000 or less, the manager can approve it. Expenses between ₹10,001 and ₹50,000 require manager and finance approval. Expenses above ₹50,000 require manager, finance and admin approval. If the employee does not provide a receipt, the expense must be rejected. After approval, finance processes the payment and the employee receives a notification.`,
};

const SAMPLE_USE_CASE = {
  title: "UC-001: Customer Self-Service Order Cancellation & Refund",
  inputType: "use-case" as RequirementInputType,
  content: `Use Case: Customer Order Cancellation & Refund Processing
Primary Actor: Registered Customer
Secondary Actors: Customer Support Agent, Warehouse Fulfillment System, Payment Gateway

Preconditions:
- Customer is authenticated and logged into the portal.
- Order is in 'Pending' or 'Processing' status and placed within the last 2 hours.
- Payment has been successfully captured.

Basic Flow (Main Success Scenario):
1. Customer navigates to Order History and selects the active order.
2. Customer clicks 'Request Cancellation' and selects a cancellation reason.
3. System verifies order status and confirms eligibility with the warehouse API.
4. System calculates refund amount according to applied coupon and shipping rules.
5. System processes full refund to original payment method and cancels fulfillment.
6. System sends cancellation confirmation email and SMS notification to customer.

Alternative & Exception Flows:
- 3a. Order already dispatched to courier: System blocks instant cancellation, informs customer, and generates a return label request instead.
- 5a. Payment gateway timeout: System transitions order to 'Cancellation Pending' and queues automated retry every 15 minutes.

Business Rules:
- Orders older than 2 hours cannot be cancelled via self-service portal.
- Orders paid via Gift Card must refund back to Gift Card balance immediately.
- If shipping fee was waived by promotional code, deductions must not apply.

Postconditions:
- Order status updated to 'Cancelled'.
- Payment refund receipt issued with transaction reference.`,
};

const SAMPLE_MFA = {
  title: "User Multi-Factor Authentication (MFA) Enrollment Workflow",
  inputType: "user-story" as RequirementInputType,
  content: `As a registered enterprise user,
I want to enroll an Authenticator App (TOTP) or SMS number as my secondary MFA factor,
So that my account credentials and sensitive financial workflows remain protected.

Acceptance Criteria / Workflow Details:
1. When navigating to Security Settings, user is prompted to 'Set up Authenticator'.
2. The system generates a QR code containing an RFC 6238 compatible secret key, along with an alphanumeric manual entry code.
3. User must submit a valid 6-digit TOTP token generated within the current 30-second window.
4. If the code fails 3 times sequentially, lock the enrollment session for 5 minutes.
5. On successful token verification, display 10 one-time emergency backup recovery codes (each 8 characters alphanumeric).
6. User must check 'I have saved my backup codes' before the 'Complete MFA Setup' button activates.`,
};

const SAMPLE_URL_TARGET = {
  title: "Customer Support Escalation & Ticket Resolution Portal",
  inputType: "web-url" as RequirementInputType,
  targetUrl: "https://internal-desk.corp.local/tickets",
  content: `Target Application: Customer Support Escalation Portal (/tickets)
Roles: Support Agent, Tier 2 Specialist, Support Manager

Workflow & Business Rules:
1. Support Agent creates a ticket with severity 'Standard' or 'Urgent'.
2. If ticket is 'Urgent' and unassigned for 15 minutes, system auto-escalates to Tier 2 Specialist queue.
3. Tier 2 Specialist investigates and can resolve or reassign back to Agent with notes.
4. If a ticket requires customer financial compensation exceeding $250, Support Manager approval is required before closing.
5. All resolution comments must be non-empty before 'Mark as Resolved' can be submitted.`,
};

export function RequirementInputForm({
  onSubmit,
  isLoading = false,
  initialValues,
}: RequirementInputFormProps) {
  const [title, setTitle] = useState(
    initialValues?.title || SAMPLE_EXPENSE_CLAIM.title
  );
  const [inputType, setInputType] = useState<RequirementInputType>(
    initialValues?.inputType || SAMPLE_EXPENSE_CLAIM.inputType
  );
  const [content, setContent] = useState(
    initialValues?.content || SAMPLE_EXPENSE_CLAIM.content
  );
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [targetUrl, setTargetUrl] = useState<string>("https://app.enterprise.internal");
  const [screenshotName, setScreenshotName] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const inputTypeOptions: {
    id: RequirementInputType;
    label: string;
    icon: React.ElementType;
    hint: string;
  }[] = [
    {
      id: "text",
      label: "Text",
      icon: FileText,
      hint: "Freeform specifications and acceptance criteria.",
    },
    {
      id: "user-story",
      label: "User Story",
      icon: BookOpen,
      hint: "Agile user story format with acceptance criteria.",
    },
    {
      id: "use-case",
      label: "Use Case",
      icon: ListOrdered,
      hint: "Actors, preconditions, basic flow & alternate paths.",
    },
    {
      id: "workflow",
      label: "Workflow",
      icon: GitBranch,
      hint: "Step-by-step business process with decision branches.",
    },
    {
      id: "document",
      label: "Document",
      icon: UploadCloud,
      hint: "Upload PRD, BRD, PDF or Word business documents.",
    },
    {
      id: "screenshot",
      label: "UI Screenshot",
      icon: ImageIcon,
      hint: "Attach UI screenshots of forms, screens, or modal states.",
    },
    {
      id: "web-url",
      label: "Web App URL",
      icon: Globe,
      hint: "Target application URL with structured workflow specification.",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!title.trim()) {
      setValidationError("Please enter a requirement title.");
      return;
    }
    if (!content.trim()) {
      setValidationError("Please enter requirement or workflow content.");
      return;
    }
    if (content.trim().length < 10) {
      setValidationError("Requirement content must be at least 10 characters long.");
      return;
    }

    onSubmit({
      title: title.trim(),
      content: content.trim(),
      inputType,
      documentFileName: uploadedFile || undefined,
      targetUrl: inputType === "web-url" ? targetUrl.trim() : undefined,
      screenshotFileName: inputType === "screenshot" ? screenshotName || undefined : undefined,
    });
  };

  const handleLoadSample = (sample: {
    title: string;
    inputType: RequirementInputType;
    content: string;
  }) => {
    setTitle(sample.title);
    setInputType(sample.inputType);
    setContent(sample.content);
    setValidationError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sample Quick-Fill Pill Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-xs">
        <span className="text-slate-400 font-mono text-[11px]">
          Quick Presets:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleLoadSample(SAMPLE_EXPENSE_CLAIM)}
            className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-mono transition-colors cursor-pointer disabled:opacity-50"
          >
            ★ Hackathon Target: Expense Reimbursement
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleLoadSample(SAMPLE_USE_CASE)}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono transition-colors cursor-pointer disabled:opacity-50"
          >
            ★ Use Case: Order Cancellation & Refund
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleLoadSample(SAMPLE_MFA)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-[11px] font-mono transition-colors cursor-pointer disabled:opacity-50"
          >
            MFA Enrollment Story
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => {
              setTitle(SAMPLE_URL_TARGET.title);
              setInputType(SAMPLE_URL_TARGET.inputType);
              setTargetUrl(SAMPLE_URL_TARGET.targetUrl);
              setContent(SAMPLE_URL_TARGET.content);
              setValidationError(null);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-sky-300 border border-slate-700 text-[11px] font-mono transition-colors cursor-pointer disabled:opacity-50"
          >
            Web App Target URL
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => {
              setTitle("");
              setContent("");
              setUploadedFile(null);
              setScreenshotName(null);
            }}
            className="px-2 py-1 rounded-lg hover:bg-slate-800 text-slate-400 text-[11px] flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Input Type Selector Pills */}
      <div className="space-y-2">
        <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
          Application Evidence & Input Type
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {inputTypeOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = inputType === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                disabled={isLoading}
                onClick={() => setInputType(opt.id)}
                className={cn(
                  "p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between h-24 disabled:opacity-50",
                  isSelected
                    ? "bg-amber-500/10 border-amber-500/40 text-white shadow-xs"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className={cn(
                      "p-1.5 rounded-lg border",
                      isSelected
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-100">
                    {opt.label}
                  </div>
                  <div className="text-[10px] text-slate-400 line-clamp-1">
                    {opt.hint}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Requirement Title Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="requirement-title"
            className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold"
          >
            {inputType === "use-case"
              ? "Use Case Title / Identifier"
              : "Application / Requirement Title"}
          </label>
          <span className="text-[10px] text-slate-400 font-mono">
            {title.length} characters
          </span>
        </div>
        <input
          id="requirement-title"
          type="text"
          disabled={isLoading}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={
            inputType === "use-case"
              ? "e.g., UC-001: Customer Self-Service Order Cancellation & Refund"
              : "e.g., Employee Expense Reimbursement & Multi-Tier Approval"
          }
          className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all font-medium disabled:opacity-50"
        />
      </div>

      {/* Conditional: Use Case Guidance Banner */}
      {inputType === "use-case" && (
        <div className="flex items-start gap-2.5 text-xs text-amber-300 bg-amber-500/10 p-3 rounded-lg border border-amber-500/25">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong>Use Case Specification:</strong> Paste your structured or natural-language use case below including actors, preconditions, basic flow, alternate / exception flows, and business rules. The existing AI engine will extract requirement intelligence and generate UAT scenarios.
          </div>
        </div>
      )}

      {/* Conditional: Document Upload Area */}
      {inputType === "document" && (
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Upload Specification Document
          </label>
          <div className="p-6 border-2 border-dashed border-slate-800 hover:border-amber-500/40 rounded-xl bg-slate-900/40 text-center transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto mb-2">
              <UploadCloud className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-semibold text-slate-200">
              Drag & drop PRD / BRD documents
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
              Supports PDF, DOCX, Markdown, and TXT. Enter or verify parsed text below.
            </p>
            <div className="mt-3">
              <button
                type="button"
                disabled={isLoading}
                onClick={() =>
                  setUploadedFile("expense_reimbursement_spec_v1.0.docx")
                }
                className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                Attach Reference Document
              </button>
            </div>
            {uploadedFile && (
              <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono">
                <FileCheck className="w-3.5 h-3.5" />
                <span>Attached: {uploadedFile}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conditional: Screenshot Evidence Area */}
      {inputType === "screenshot" && (
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Upload UI Screenshot / Visual Evidence
          </label>
          <div className="p-6 border-2 border-dashed border-slate-800 hover:border-amber-500/40 rounded-xl bg-slate-900/40 text-center transition-colors">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center mx-auto mb-2">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-semibold text-slate-200">
              Attach Application UI Screenshot
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
              Supports PNG, JPG, and WebP. Enter the visible screens, inputs, and button actions in the workspace below.
            </p>
            <div className="mt-3">
              <label className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer inline-flex items-center gap-1.5">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Select Screenshot File</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setScreenshotName(f.name);
                  }}
                />
              </label>
            </div>
            {screenshotName && (
              <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-mono">
                <FileCheck className="w-3.5 h-3.5" />
                <span>Selected: {screenshotName}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conditional: Web Application URL Area */}
      {inputType === "web-url" && (
        <div className="space-y-3 p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-start gap-2.5 text-xs text-sky-300 bg-sky-500/10 p-3 rounded-lg border border-sky-500/25">
            <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <strong>Controlled Application Target:</strong> Blind web crawling is unreliable for complex authenticated applications. Provide the target URL and specify the screens, inputs, and business rules below to normalize into Application Intelligence.
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Target Web Application URL
            </label>
            <div className="flex items-center gap-2">
              <div className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-500">
                https://
              </div>
              <input
                type="text"
                value={targetUrl.replace(/^https?:\/\//, "")}
                onChange={(e) => setTargetUrl(`https://${e.target.value}`)}
                placeholder="app.internal.domain/portal"
                className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-amber-500/50"
              />
            </div>
          </div>
        </div>
      )}

      {/* Requirement Content Text Area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="requirement-body"
            className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold"
          >
            {inputType === "use-case"
              ? "Use Case Specification (Actors, Preconditions, Basic Flow, Alternate Flows)"
              : "Specification / Workflow / Screen Logic"}
          </label>
          <span className="text-[10px] text-slate-400 font-mono">
            {content.length} characters
          </span>
        </div>
        <textarea
          id="requirement-body"
          rows={10}
          disabled={isLoading}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            inputType === "use-case"
              ? `Paste your structured or natural-language use case here...

Example format:
Use Case: Customer Order Cancellation & Refund
Primary Actor: Registered Customer
Secondary Actors: Customer Support Agent, Warehouse System, Payment Gateway

Preconditions:
- Customer is authenticated and logged in.
- Order status is 'Pending' or 'Processing' and placed within 2 hours.

Basic Flow:
1. Customer navigates to Order History and clicks 'Cancel Order'.
2. System requests cancellation reason from dropdown list.
3. Customer selects reason and submits cancellation request.
4. System verifies order status and eligibility with fulfillment API.
5. System triggers full refund via payment gateway and halts warehouse dispatch.
6. System sends cancellation confirmation email and SMS to customer.

Alternative & Exception Flows:
- 4a. Order already dispatched: System blocks cancellation and offers return upon delivery.
- 5a. Payment gateway timeout: System transitions order to 'Cancellation Pending' and retries.

Business Rules:
- Cancellations allowed only within 2 hours of placement.
- Orders paid via Gift Card must refund back to Gift Card balance immediately.

Postconditions:
- Order status updated to 'Cancelled'.
- Refund transaction record created.`
              : "Paste full business requirement, workflow steps, or user story criteria..."
          }
          className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all font-mono leading-relaxed disabled:opacity-50"
        />
      </div>

      {/* Inline Form Validation Error */}
      {validationError && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
          ⚠ {validationError}
        </div>
      )}

      {/* Primary Action Button Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
        <div className="text-xs text-slate-400 font-mono">
          Stage 01: Requirement Analysis & Extraction via Google Gemini
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>
                {inputType === "use-case"
                  ? "Analyzing Use Case..."
                  : "Analyzing Requirement..."}
              </span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>
                {inputType === "use-case"
                  ? "Understand Use Case"
                  : "Understand Requirement"}
              </span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
