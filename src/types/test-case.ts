import { ScenarioType } from "./scenario";

export type TestCasePriority = "Critical" | "High" | "Medium" | "Low";
export type TestCaseStatus = "Ready" | "In Review" | "Draft" | "Approved";

export interface TestStep {
  stepNumber: number;
  action: string;
  expectedResult: string;
}

export interface TestCase {
  id: string; // e.g., "TC-UAT-001"
  scenarioId: string;
  requirementId: string;
  title: string;
  scenario: string;
  type: ScenarioType;
  role: string;
  priority: TestCasePriority;
  status: TestCaseStatus;
  preconditions: string[];
  steps: TestStep[];
  expectedOutcome: string;
  createdAt: string;
  updatedAt: string;
}
