import { ScenarioType } from "./scenario";

export type TestCasePriority = "Critical" | "High" | "Medium" | "Low";
export type TestCaseStatus = "Ready" | "In Review" | "Draft" | "Approved";

export interface TestStep {
  stepNumber: number;
  action: string;
  expectedResult: string;
}

export interface GeneratedTestCase {
  testCaseId: string;
  scenarioId: string;
  title: string;
  scenario: string;
  type: ScenarioType;
  role: string;
  priority: TestCasePriority;
  preconditions: string[];
  testSteps: TestStep[];
  testData: string;
  expectedResult: string;
  requirementReference: string;
  businessRuleReference: string;
}

export interface TestCaseGenerationSummary {
  total: number;
  positive: number;
  negative: number;
  boundary: number;
  roleBased: number;
}

export interface TestCaseGenerationResult {
  testCases: GeneratedTestCase[];
  summary: TestCaseGenerationSummary;
  meta: {
    model: string;
    generatedAt: string;
    testCaseCount: number;
  };
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
  testData?: string;
  requirementReference?: string;
  businessRuleReference?: string;
}

