"use client";

import React, { useState } from "react";
import {
  FileText,
  BookOpen,
  GitBranch,
  UploadCloud,
  Sparkles,
  FileCheck,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { RequirementInputType } from "@/types";
import { cn } from "@/lib/utils";

interface RequirementInputFormProps {
  onSubmit: (params: {
    title: string;
    content: string;
    inputType: RequirementInputType;
    documentFileName?: string;
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
  const [validationError, setValidationError] = useState<string | null>(null);

  const inputTypeOptions: {
    id: RequirementInputType;
    label: string;
    icon: React.ElementType;
    hint: string;
  }[] = [
    {
      id: "text",
      label: "Text Requirement",
      icon: FileText,
      hint: "Raw functional requirement statements and specifications.",
    },
    {
      id: "user-story",
      label: "User Story",
      icon: BookOpen,
      hint: "Agile story format (As a..., I want..., So that...) with acceptance criteria.",
    },
    {
      id: "workflow",
      label: "Workflow Description",
      icon: GitBranch,
      hint: "Step-by-step business process flow with decision branches.",
    },
    {
      id: "document",
      label: "Document Upload",
      icon: UploadCloud,
      hint: "Upload PRD, BRD, PDF or Word business documents.",
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
    });
  };

  const handleLoadSample = (sample: typeof SAMPLE_EXPENSE_CLAIM) => {
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
            ★ Milestone 2 Example: Expense Claim
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleLoadSample(SAMPLE_MFA)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-mono transition-colors cursor-pointer disabled:opacity-50"
          >
            MFA Enrollment Story
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => {
              setTitle("");
              setContent("");
              setUploadedFile(null);
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
          Input Format
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
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
            Requirement Title
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
          placeholder="e.g., Employee Expense Reimbursement & Multi-Tier Approval"
          className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all font-medium disabled:opacity-50"
        />
      </div>

      {/* Conditional: Document Upload Area */}
      {inputType === "document" && (
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Upload Specification Document
          </label>
          <div className="p-8 border-2 border-dashed border-slate-800 hover:border-amber-500/40 rounded-xl bg-slate-900/40 text-center transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-200">
              Drag & drop PRD / BRD documents
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Supports PDF, DOCX, Markdown, and TXT. Enter or paste the parsed text content in the workspace below.
            </p>
            <div className="mt-4">
              <button
                type="button"
                disabled={isLoading}
                onClick={() =>
                  setUploadedFile("expense_reimbursement_spec_v1.0.docx")
                }
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                Attach Reference Document
              </button>
            </div>
            {uploadedFile && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono">
                <FileCheck className="w-3.5 h-3.5" />
                <span>Attached: {uploadedFile}</span>
              </div>
            )}
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
            Specification / Story Content
          </label>
          <span className="text-[10px] text-slate-400 font-mono">
            {content.length} characters
          </span>
        </div>
        <textarea
          id="requirement-body"
          rows={9}
          disabled={isLoading}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste full business requirement, workflow steps, or user story criteria..."
          className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all font-mono leading-relaxed disabled:opacity-50"
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
              <span>Analyzing Requirement...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>Understand Requirement</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
