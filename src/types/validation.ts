export type ValidationSeverity = "Critical" | "Warning" | "Info";

export type ValidationCategory =
  | "Duplicate Detection"
  | "Incomplete Test Cases"
  | "Missing Information"
  | "Requirement Quality"
  | "Ambiguous Requirements";

export interface ValidationIssue {
  id: string;
  category: ValidationCategory;
  severity: ValidationSeverity;
  title: string;
  description: string;
  targetRef: string; // e.g., "TC-UAT-004" or "REQ-002"
  suggestedFix?: string;
}
