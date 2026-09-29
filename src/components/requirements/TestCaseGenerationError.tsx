"use client";

import React from "react";
import { AlertCircle, Key, RefreshCw, XCircle } from "lucide-react";

interface TestCaseGenerationErrorProps {
  error: {
    message: string;
    code?: string;
    details?: string;
    retryable?: boolean;
  };
  onRetry: () => void;
  onDismiss: () => void;
}

export function TestCaseGenerationError({
  error,
  onRetry,
  onDismiss,
}: TestCaseGenerationErrorProps) {
  const isKeyMissing =
    error.code === "GEMINI_API_KEY_NOT_CONFIGURED" ||
    error.message.toLowerCase().includes("api key");

  const isRateLimitedOrUnavailable =
    error.code === "GEMINI_SERVICE_UNAVAILABLE" ||
    error.message.toLowerCase().includes("rate limit") ||
    error.message.toLowerCase().includes("temporarily unavailable") ||
    error.message.toLowerCase().includes("overloaded");

  return (
    <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 backdrop-blur-md space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
            {isKeyMissing ? (
              <Key className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400">
                {isKeyMissing
                  ? "Gemini API Configuration Required"
                  : isRateLimitedOrUnavailable
                  ? "Gemini Capacity / Rate Limit Notice"
                  : "Test Case Generation Error"}
              </span>
              {error.code && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300">
                  {error.code}
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-white">{error.message}</h3>
            {error.details && (
              <p className="text-xs text-rose-200/80 leading-relaxed font-mono">
                {error.details}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
          aria-label="Dismiss error"
        >
          ✕
        </button>
      </div>

      {/* Helpful Setup Instructions when API key is missing */}
      {isKeyMissing && (
        <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-300 space-y-2.5">
          <div className="flex items-center gap-2 text-amber-400 font-semibold font-mono text-[11px]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>How to Configure Google Gemini API:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1.5 font-mono text-[11px] text-slate-400">
            <li>
              Create a file named{" "}
              <code className="text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                .env.local
              </code>{" "}
              in the repository root.
            </li>
            <li>
              Add your Google Gemini API key:
              <pre className="mt-1 p-2 rounded bg-slate-900 border border-slate-800 text-amber-300 text-[11px]">
                GEMINI_API_KEY=your_actual_gemini_api_key_here
              </pre>
            </li>
            <li>
              Restart your Next.js development server to load the environment variable.
            </li>
          </ol>
          <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800/80">
            Note: Per platform integrity standards, UATForge AI never creates
            fabricated test cases when Gemini is unavailable or unconfigured.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onDismiss}
          className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
        >
          Dismiss
        </button>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Generation</span>
        </button>
      </div>
    </div>
  );
}
