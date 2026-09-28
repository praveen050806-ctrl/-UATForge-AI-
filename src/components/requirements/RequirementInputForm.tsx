"use client";

import React, { useState } from "react";
import {
  FileText,
  BookOpen,
  GitBranch,
  UploadCloud,
  Sparkles,
  Info,
  X,
  FileCheck,
} from "lucide-react";
import { RequirementInputType } from "@/types";
import { cn } from "@/lib/utils";

interface RequirementInputFormProps {
  onUnderstandClick?: () => void;
}

export function RequirementInputForm({}: RequirementInputFormProps) {
  const [title, setTitle] = useState(
    "User Multi-Factor Authentication (MFA) Enrollment Workflow"
  );
  const [inputType, setInputType] = useState<RequirementInputType>("user-story");
  const [content, setContent] = useState(
    `As a registered enterprise user,
I want to enroll an Authenticator App (TOTP) or SMS number as my secondary MFA factor,
So that my account credentials and sensitive financial workflows remain protected.

Acceptance Criteria / Workflow Details:
1. When navigating to Security Settings, user is prompted to 'Set up Authenticator'.
2. The system generates a QR code containing an RFC 6238 compatible secret key, along with an alphanumeric manual entry code.
3. User must submit a valid 6-digit TOTP token generated within the current 30-second window.
4. If the code fails 3 times sequentially, lock the enrollment session for 5 minutes.
5. On successful token verification, display 10 one-time emergency backup recovery codes (each 8 characters alphanumeric).
6. User must check 'I have saved my backup codes' before the 'Complete MFA Setup' button activates.`
  );
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);

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

  return (
    <div className="space-y-6">
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
                onClick={() => setInputType(opt.id)}
                className={cn(
                  "p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between h-24",
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
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., User Multi-Factor Authentication (MFA) Enrollment"
          className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all font-medium"
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
              Supports PDF, DOCX, Markdown, and TXT (Max 25MB). File parsing will
              be connected in an upcoming milestone.
            </p>
            <div className="mt-4">
              <button
                type="button"
                onClick={() =>
                  setUploadedFile("enterprise_mfa_spec_v2.4.docx")
                }
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              >
                Choose Sample Document
              </button>
            </div>
            {uploadedFile && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono">
                <FileCheck className="w-3.5 h-3.5" />
                <span>Selected: {uploadedFile}</span>
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
          rows={10}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste full business requirement, workflow steps, or user story criteria..."
          className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all font-mono leading-relaxed"
        />
      </div>

      {/* Primary Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Stage 01: Requirement Analysis & Decomposition</span>
        </div>

        <button
          type="button"
          onClick={() => setShowAiModal(true)}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-all shadow-md shadow-amber-500/20 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 fill-slate-950" />
          <span>Understand Requirement</span>
        </button>
      </div>

      {/* Controlled Placeholder Modal (Explaining Gemini API Deferred) */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAiModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 w-fit mb-4">
              <Sparkles className="w-6 h-6" />
            </div>

            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Milestone 1B Gate
            </span>

            <h3 className="text-lg font-bold text-white mt-2">
              AI Requirement Understanding
            </h3>

            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              AI requirement understanding will be connected in the next
              milestone.
            </p>

            <div className="mt-4 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
              <div className="font-semibold text-slate-200">
                Architecture Roadmap:
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>Gemini API structured extraction prompt</li>
                <li>Zod schema verification of extracted entities</li>
                <li>MongoDB persistence for versioned requirements</li>
              </ul>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
