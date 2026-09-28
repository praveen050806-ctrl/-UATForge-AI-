export type RequirementInputType =
  | "text"
  | "user-story"
  | "workflow"
  | "document";

export interface RequirementIntelligence {
  roles: string[];
  actions: string[];
  businessRules: string[];
  conditions: string[];
  outcomes: string[];
  dependencies: string[];
  ambiguities: string[];
}

export interface Requirement {
  id: string;
  title: string;
  inputType: RequirementInputType;
  rawContent: string;
  documentFileName?: string;
  status: "draft" | "parsed" | "validated";
  intelligence?: RequirementIntelligence;
  createdAt: string;
  updatedAt: string;
}
