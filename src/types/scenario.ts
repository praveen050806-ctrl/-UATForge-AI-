export type ScenarioType = "Positive" | "Negative" | "Boundary" | "Role-Based";

export type ScenarioPriority = "Critical" | "High" | "Medium" | "Low";

export interface GeneratedScenario {
  scenarioId: string;
  title: string;
  description: string;
  type: ScenarioType;
  role: string;
  businessRule: string;
  preconditions: string[];
  testData: string;
  expectedOutcome: string;
  priority: ScenarioPriority;
  requirementReference: string;
}

export interface ScenarioGenerationSummary {
  total: number;
  positive: number;
  negative: number;
  boundary: number;
  roleBased: number;
}

export interface ScenarioGenerationResult {
  scenarios: GeneratedScenario[];
  summary: ScenarioGenerationSummary;
}

// Retain legacy/minimal Scenario interface for compatibility
export interface Scenario {
  id: string;
  requirementId: string;
  title: string;
  description: string;
  type: ScenarioType;
  actorRole: string;
  businessRuleIds: string[];
  createdAt: string;
}
