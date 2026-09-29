export type TestExecutionStatus = "NOT_EXECUTED" | "PASS" | "FAIL" | "BLOCKED";

export interface TestStepExecution {
  stepNumber: number;
  actualResult: string;
  status: TestExecutionStatus;
}

export interface TestCaseExecution {
  testCaseId: string;
  scenarioId: string;
  status: TestExecutionStatus;
  stepResults: TestStepExecution[];
  actualResult: string;
  testerComment?: string;
  executedAt?: string;
  evidenceNote?: string;
  defectId?: string;
}

export interface ExecutionSummary {
  total: number;
  notExecuted: number;
  passed: number;
  failed: number;
  blocked: number;
  coveragePercentage: number;
}
