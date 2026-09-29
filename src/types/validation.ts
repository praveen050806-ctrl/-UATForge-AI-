export type ValidationSeverity =
  | "Critical"
  | "Warning"
  | "Info"
  | "CRITICAL"
  | "WARNING"
  | "INFO";

export type ValidationCategory =
  | "Duplicate Detection"
  | "Incomplete Test Cases"
  | "Missing Information"
  | "Requirement Quality"
  | "Ambiguous Requirements"
  | "Execution Integrity";

export interface ValidationIssue {
  id: string;
  category: ValidationCategory;
  severity: ValidationSeverity;
  title: string;
  description: string;
  targetRef: string; // e.g., "TC-UAT-004" or "REQ-002"
  suggestedFix?: string;
  requirementId?: string;
  scenarioId?: string;
  testCaseId?: string;
  defectId?: string;
  linkHref?: string;
}

export interface ValidationCategorySummary {
  category: ValidationCategory;
  count: number;
  critical: number;
  warning: number;
  info: number;
}

export interface ValidationEntityStats {
  testCasesEvaluated: number;
  scenariosEvaluated: number;
  requirementsEvaluated: number;
  executionsEvaluated: number;
  defectsEvaluated: number;
}

export interface ValidationSummaryReport {
  issues: ValidationIssue[];
  totalIssues: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  evaluatedAt: string;
  categorySummaries: ValidationCategorySummary[];
  entityStats: ValidationEntityStats;
}

