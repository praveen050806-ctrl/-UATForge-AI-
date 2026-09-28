export type CoverageStatus = "Covered" | "Partial" | "Uncovered";

export interface TraceabilityLink {
  id: string;
  requirementId: string;
  requirementTitle: string;
  businessRule: string;
  scenario: string;
  testCaseId: string;
  coverageStatus: CoverageStatus;
}
