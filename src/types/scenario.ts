export type ScenarioType = "Positive" | "Negative" | "Boundary" | "Role-Based";

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
