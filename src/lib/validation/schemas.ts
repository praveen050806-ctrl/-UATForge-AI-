import { z } from "zod";

export const RequirementInputTypeSchema = z.enum([
  "text",
  "user-story",
  "workflow",
  "document",
]);

export const RequirementSchema = z.object({
  id: z.string().min(1, "Requirement ID is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  inputType: RequirementInputTypeSchema,
  rawContent: z.string().min(10, "Requirement content must be at least 10 characters"),
  documentFileName: z.string().optional(),
  status: z.enum(["draft", "parsed", "validated"]).default("draft"),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const ScenarioTypeSchema = z.enum([
  "Positive",
  "Negative",
  "Boundary",
  "Role-Based",
]);

export const ScenarioSchema = z.object({
  id: z.string().min(1),
  requirementId: z.string().min(1),
  title: z.string().min(3),
  description: z.string().min(5),
  type: ScenarioTypeSchema,
  actorRole: z.string().min(1),
  businessRuleIds: z.array(z.string()),
  createdAt: z.string().datetime(),
});

export const TestStepSchema = z.object({
  stepNumber: z.number().int().positive(),
  action: z.string().min(3),
  expectedResult: z.string().min(3),
});

export const TestCaseSchema = z.object({
  id: z.string().min(1),
  scenarioId: z.string().min(1),
  requirementId: z.string().min(1),
  title: z.string().min(3),
  scenario: z.string().min(3),
  type: ScenarioTypeSchema,
  role: z.string().min(1),
  priority: z.enum(["Critical", "High", "Medium", "Low"]),
  status: z.enum(["Ready", "In Review", "Draft", "Approved"]),
  preconditions: z.array(z.string()),
  steps: z.array(TestStepSchema),
  expectedOutcome: z.string().min(3),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const ValidationIssueSchema = z.object({
  id: z.string().min(1),
  category: z.enum([
    "Duplicate Detection",
    "Incomplete Test Cases",
    "Missing Information",
    "Requirement Quality",
    "Ambiguous Requirements",
  ]),
  severity: z.enum(["Critical", "Warning", "Info"]),
  title: z.string().min(3),
  description: z.string().min(5),
  targetRef: z.string().min(1),
  suggestedFix: z.string().optional(),
});
