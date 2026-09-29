export type RequirementInputType =
  | "text"
  | "user-story"
  | "use-case"
  | "workflow"
  | "document"
  | "screenshot"
  | "web-url";

export interface RequirementIntelligence {
  roles: string[];
  actions: string[];
  businessRules: string[];
  conditions: string[];
  outcomes: string[];
  dependencies: string[];
  ambiguities: string[];
  screens?: string[];
  inputs?: string[];
  outputs?: string[];
  workflows?: string[];
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
