import { TestCasePriority } from "./test-case";

export type DefectStatus = "OPEN" | "IN_REVIEW" | "RESOLVED";

export type DefectSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface DefectRecord {
  defectId: string;
  testCaseId: string;
  scenarioId: string;
  title: string;
  severity: DefectSeverity;
  priority: TestCasePriority;
  expectedResult: string;
  actualResult: string;
  stepsToReproduce: string[];
  testerComment: string;
  status: DefectStatus;
  createdAt: string;
  updatedAt?: string;
}

