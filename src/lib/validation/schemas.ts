import { z } from "zod";

export const RequirementInputTypeSchema = z.enum([
  "text",
  "user-story",
  "use-case",
  "workflow",
  "document",
  "screenshot",
  "web-url",
]);

export const RequirementIntelligenceSchema = z.object({
  roles: z.array(z.string()).default([]),
  actions: z.array(z.string()).default([]),
  businessRules: z.array(z.string()).default([]),
  conditions: z.array(z.string()).default([]),
  outcomes: z.array(z.string()).default([]),
  dependencies: z.array(z.string()).default([]),
  ambiguities: z.array(z.string()).default([]),
  screens: z.array(z.string()).default([]),
  inputs: z.array(z.string()).default([]),
  outputs: z.array(z.string()).default([]),
  workflows: z.array(z.string()).default([]),
});

export const UnderstandRequirementRequestSchema = z.object({
  title: z.string().min(1, "Requirement title is required"),
  content: z.string().min(5, "Requirement content must be at least 5 characters"),
  inputType: RequirementInputTypeSchema.optional().default("text"),
  documentFileName: z.string().optional(),
  targetUrl: z.string().optional(),
  screenshotFileName: z.string().optional(),
});

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

export const ScenarioPrioritySchema = z.enum([
  "Critical",
  "High",
  "Medium",
  "Low",
]);

export const GeneratedScenarioSchema = z.object({
  scenarioId: z.string().min(1, "scenarioId is required"),
  title: z.string().min(3, "title must be at least 3 characters"),
  description: z.string().min(5, "description must be at least 5 characters"),
  type: ScenarioTypeSchema,
  role: z.string().min(1, "role is required"),
  businessRule: z.string().min(1, "businessRule is required"),
  preconditions: z.array(z.string()).default([]),
  testData: z.string().default(""),
  expectedOutcome: z.string().min(1, "expectedOutcome is required"),
  priority: ScenarioPrioritySchema,
  requirementReference: z.string().min(1, "requirementReference is required"),
});

export const GenerateScenariosRequestSchema = z.object({
  requirementTitle: z.string().min(1, "requirementTitle is required"),
  requirementContent: z.string().min(5, "requirementContent must be at least 5 characters"),
  intelligence: RequirementIntelligenceSchema,
});

export const GenerateScenariosResponseSchema = z.object({
  scenarios: z.array(GeneratedScenarioSchema).min(1, "At least one scenario must be generated"),
});

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

export const TestCasePrioritySchema = z.enum([
  "Critical",
  "High",
  "Medium",
  "Low",
]);

export const TestStepSchema = z.object({
  stepNumber: z.number().int().positive({ message: "stepNumber must be a positive integer" }),
  action: z.string().min(1, { message: "action must be non-empty" }),
  expectedResult: z.string().min(1, { message: "expectedResult must be non-empty" }),
});

export const GeneratedTestCaseSchema = z.object({
  testCaseId: z.string().min(1, { message: "testCaseId must be non-empty" }),
  scenarioId: z.string().min(1, { message: "scenarioId must be non-empty" }),
  title: z.string().min(3, { message: "title must be meaningful" }),
  scenario: z.string().min(1, { message: "scenario must be non-empty" }),
  type: ScenarioTypeSchema,
  role: z.string().min(1, { message: "role must be non-empty" }),
  priority: TestCasePrioritySchema,
  preconditions: z.array(z.string()).default([]),
  testSteps: z.array(TestStepSchema).min(1, { message: "testSteps must contain at least one step" }),
  testData: z.string().default(""),
  expectedResult: z.string().min(1, { message: "expectedResult must be present" }),
  requirementReference: z.string().min(1, { message: "requirementReference must be present" }),
  businessRuleReference: z.string().min(1, { message: "businessRuleReference must be present" }),
});

export const GenerateTestCasesRequestSchema = z.object({
  requirementTitle: z.string().min(1, { message: "requirementTitle is required" }),
  requirementContent: z.string().min(5, { message: "requirementContent must be at least 5 characters" }),
  intelligence: RequirementIntelligenceSchema.optional(),
  scenarios: z.array(GeneratedScenarioSchema).min(1, { message: "At least one scenario must be provided" }),
});

export const GenerateTestCasesResponseSchema = z.object({
  testCases: z.array(GeneratedTestCaseSchema).min(1, { message: "At least one test case must be generated" }),
});

export const TestCaseSchema = z.object({
  id: z.string().min(1),
  scenarioId: z.string().min(1),
  requirementId: z.string().min(1),
  title: z.string().min(3),
  scenario: z.string().min(3),
  type: ScenarioTypeSchema,
  role: z.string().min(1),
  priority: TestCasePrioritySchema,
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
    "Execution Integrity",
  ]),
  severity: z.enum(["Critical", "Warning", "Info", "CRITICAL", "WARNING", "INFO"]),
  title: z.string().min(3),
  description: z.string().min(5),
  targetRef: z.string().min(1),
  suggestedFix: z.string().optional(),
  requirementId: z.string().optional(),
  scenarioId: z.string().optional(),
  testCaseId: z.string().optional(),
  defectId: z.string().optional(),
  linkHref: z.string().optional(),
});


export const TestExecutionStatusSchema = z.enum([
  "NOT_EXECUTED",
  "PASS",
  "FAIL",
  "BLOCKED",
]);

export const TestStepExecutionSchema = z.object({
  stepNumber: z.number().int().positive({ message: "stepNumber must be a positive integer" }),
  actualResult: z.string().default(""),
  status: TestExecutionStatusSchema,
});

export const TestCaseExecutionSchema = z.object({
  testCaseId: z.string().min(1, { message: "testCaseId must be non-empty" }),
  scenarioId: z.string().min(1, { message: "scenarioId must be non-empty" }),
  status: TestExecutionStatusSchema,
  stepResults: z.array(TestStepExecutionSchema),
  actualResult: z.string().default(""),
  testerComment: z.string().optional(),
  executedAt: z.string().optional(),
  evidenceNote: z.string().optional(),
  defectId: z.string().optional(),
});

export const DefectStatusSchema = z.enum(["OPEN", "IN_REVIEW", "RESOLVED"]);

export const DefectSeveritySchema = z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]);

export const DefectRecordSchema = z.object({
  defectId: z.string().min(1, { message: "defectId is required" }),
  testCaseId: z.string().min(1, { message: "testCaseId is required" }),
  scenarioId: z.string().min(1, { message: "scenarioId is required" }),
  title: z.string().min(1, { message: "Defect title is required" }),
  severity: DefectSeveritySchema,
  priority: TestCasePrioritySchema,
  expectedResult: z.string(),
  actualResult: z.string(),
  stepsToReproduce: z.array(z.string()),
  testerComment: z.string(),
  status: DefectStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

