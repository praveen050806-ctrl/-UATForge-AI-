import { TestExecutionStatus } from "./execution";

export type CoverageStatus = "Covered" | "Partial" | "Uncovered";

export interface TraceabilityLink {
  id: string;
  requirementId: string;
  requirementTitle: string;
  businessRule: string;
  scenarioId?: string;
  scenario: string;
  testCaseId: string;
  coverageStatus: CoverageStatus;
  executionStatus?: TestExecutionStatus;
  actualResult?: string;
  defectId?: string;
  defectStatus?: string;
  testCaseTitle?: string;
  gapReason?: string;
  isUnlinked?: boolean;
}

export interface TraceabilityMetrics {
  requirementCoverage: number;
  scenarioCoverage: number;
  testCaseCoverage: number;
  executionCoverage: number;
  defectLinkage: number;
  totalRequirements: number;
  totalBusinessRules: number;
  coveredBusinessRules: number;
  totalScenarios: number;
  coveredScenarios: number;
  totalTestCases: number;
  executedTestCases: number;
  totalDefects: number;
  failedCount: number;
  uncoveredGapsCount: number;
}
