import { GoogleGenAI } from "@google/genai";
import {
  GeneratedScenario,
  GeneratedTestCase,
  RequirementIntelligence,
  TestCaseGenerationSummary,
  TestCaseGenerationResult,
} from "@/types";
import { GenerateTestCasesResponseSchema } from "@/lib/validation/schemas";
import {
  GeminiConfigError,
  GeminiValidationError,
  GeminiResponseError,
  GeminiApiError,
} from "@/lib/ai/requirement-understanding";

export interface GenerateTestCasesParams {
  requirementTitle: string;
  requirementContent: string;
  scenarios: GeneratedScenario[];
  intelligence?: RequirementIntelligence;
}

export type { TestCaseGenerationResult };

const SYSTEM_INSTRUCTION = `You are the UAT Test Case Generation Engine for UATForge AI, an enterprise User Acceptance Testing platform.
Your task is to transform structured UAT scenarios into detailed, execution-ready, step-by-step UAT test cases.

CRITICAL GOVERNANCE RULES:
1. Generate execution-ready UAT test cases suitable for human QA testers, business analysts, or business users to execute in an acceptance test environment.
2. For each supplied scenario, generate a corresponding detailed UAT test case.
3. Every test case MUST contain sequential, observable, testable testSteps.
4. Test steps must NEVER be a single narrative paragraph. Every test step MUST be an object with:
   - "stepNumber": integer starting at 1 (1, 2, 3...)
   - "action": concrete, observable physical or UI action taken by the actor (e.g. "Navigate to Expense Submission form", "Enter expense amount ₹10,000", "Attach receipt PDF and click Submit").
   - "expectedResult": immediate observable system response or verification state for that specific step (e.g. "Form displays submitted claim status as 'Pending Manager Approval'").
5. EVERY test step MUST have its own non-empty "expectedResult".
6. PRESERVE the scenario's attributes faithfully:
   - "scenarioId": Must match the scenario's scenarioId exactly.
   - "type": Must match the scenario's type ("Positive", "Negative", "Boundary", or "Role-Based").
   - "role": Must match the scenario's identified role.
   - "priority": Must match or appropriately reflect the scenario's priority ("Critical", "High", "Medium", "Low").
   - "requirementReference": Must retain the scenario's requirementReference.
   - "businessRuleReference": Must retain the scenario's businessRule.
   - "expectedResult": Must reflect the terminal business outcome expected from the scenario.
   - "testData": Must use the scenario's testData, expanded with specific concrete inputs where helpful.
   - "preconditions": Array of prerequisite setup conditions (e.g. accounts created, permissions assigned, initial state).
7. TEST CASE ID: Generate a unique ID prefixed by type (e.g. "TC-POS-001", "TC-NEG-001", "TC-BND-001", "TC-ROL-001", or corresponding to the scenario ID).
8. NO FABRICATION: Do NOT invent unstated business rules, fictional limits, or unsupported permissions.
9. AMBIGUITY HANDLING: If an action relies on an ambiguous or unstated system behavior, state in the preconditions or step that confirmation with stakeholders is required rather than hallucinating system mechanics.
10. Return ONLY a valid JSON object matching the requested schema.

Output must be ONLY a valid JSON object matching:
{
  "testCases": [
    {
      "testCaseId": "TC-POS-001",
      "scenarioId": "SCN-POS-001",
      "title": "Verify standard claim submission and manager approval",
      "scenario": "Employee submits valid expense under limit with receipt",
      "type": "Positive",
      "role": "Employee",
      "priority": "High",
      "preconditions": [
        "Employee has an active corporate account",
        "Expense management portal is accessible"
      ],
      "testSteps": [
        {
          "stepNumber": 1,
          "action": "Log in to portal as Employee and open 'New Expense Claim'",
          "expectedResult": "Expense submission form is displayed with employee details pre-populated"
        },
        {
          "stepNumber": 2,
          "action": "Fill claim amount ₹5,000, category 'Travel', and upload valid receipt file",
          "expectedResult": "Receipt file is attached and preview is visible"
        },
        {
          "stepNumber": 3,
          "action": "Click 'Submit Claim'",
          "expectedResult": "Claim is submitted successfully with reference ID and status 'Pending Manager Review'"
        }
      ],
      "testData": "Amount: ₹5,000, Category: Travel, Receipt: Valid PDF attached",
      "expectedResult": "Claim status transitions to Pending Manager Review and audit log entry created",
      "requirementReference": "Section 2.1 Expense Submission",
      "businessRuleReference": "Expenses ≤ ₹10,000 require manager approval only"
    }
  ]
}`;

/**
 * Server-side service to generate detailed execution-ready UAT test cases
 * from UAT scenarios using Google Gemini.
 */
export async function generateTestCases(
  params: GenerateTestCasesParams
): Promise<TestCaseGenerationResult> {
  const { requirementTitle, requirementContent, scenarios, intelligence } = params;

  // 1. Validate inputs
  if (!requirementTitle || requirementTitle.trim().length === 0) {
    throw new GeminiValidationError("Requirement title cannot be empty.");
  }
  if (!requirementContent || requirementContent.trim().length < 5) {
    throw new GeminiValidationError(
      "Requirement content must be at least 5 characters."
    );
  }
  if (!Array.isArray(scenarios) || scenarios.length === 0) {
    throw new GeminiValidationError(
      "At least one UAT scenario is required to generate test cases."
    );
  }

  // 2. Check for API key (server-side only, never leak this key)
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey || apiKey.trim().length === 0 || apiKey === "your_gemini_api_key_here") {
    throw new GeminiConfigError();
  }

  const preferredModel = process.env.GEMINI_MODEL || "gemini-3.5-flash";
  const candidateModels = [
    preferredModel,
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.8-flash",
  ].filter((m, i, arr) => arr.indexOf(m) === i);

  // 3. Construct prompt
  const scenariosPayload = scenarios.map((s, idx) => ({
    scenarioIndex: idx + 1,
    scenarioId: s.scenarioId,
    title: s.title,
    description: s.description,
    type: s.type,
    role: s.role,
    businessRule: s.businessRule,
    preconditions: s.preconditions,
    testData: s.testData,
    expectedOutcome: s.expectedOutcome,
    priority: s.priority,
    requirementReference: s.requirementReference,
  }));

  const userPrompt = `REQUIREMENT TITLE:
${requirementTitle.trim()}

REQUIREMENT SPECIFICATION:
"""
${requirementContent.trim()}
"""

${
  intelligence
    ? `REQUIREMENT CONTEXT:
- Governing Business Rules: ${JSON.stringify(intelligence.businessRules)}
- Known Ambiguities (Do not invent unstated behaviors): ${JSON.stringify(
        intelligence.ambiguities
      )}`
    : ""
}

INPUT UAT SCENARIOS TO CONVERT INTO DETAILED TEST CASES:
${JSON.stringify(scenariosPayload, null, 2)}

TASK:
For each supplied UAT scenario above, generate a complete, execution-ready UAT test case.
Each test case must include:
1. "testCaseId": Unique ID prefixed by category (e.g. "TC-POS-001", "TC-NEG-001", "TC-BND-001", "TC-ROL-001")
2. "scenarioId": The exact matching scenarioId from the input
3. "title": Clear, descriptive test case title
4. "scenario": Concise description of what is being tested
5. "type": Must match the scenario's type ("Positive", "Negative", "Boundary", "Role-Based")
6. "role": Actor performing or verified in the test
7. "priority": "Critical", "High", "Medium", or "Low"
8. "preconditions": Array of setup conditions
9. "testSteps": Array of sequential steps. Each step MUST have:
   - "stepNumber": integer starting from 1
   - "action": concrete physical/UI action
   - "expectedResult": observable result for that step
10. "testData": Concrete test data inputs
11. "expectedResult": Terminal business outcome
12. "requirementReference": Retain from scenario
13. "businessRuleReference": Retain from scenario

Return ONLY valid JSON matching the schema.`;

  // 4. Initialize Gemini client with 60s timeout for enterprise network reliability
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { timeout: 60000 },
  });

  let responseText: string | undefined;
  let lastError: unknown;
  let usedModel = preferredModel;

  for (const modelToTry of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: modelToTry,
        contents: userPrompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      responseText = response.text;
      usedModel = modelToTry;
      if (responseText && responseText.trim().length > 0) {
        break;
      }
    } catch (error: unknown) {
      lastError = error;
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isRetryable =
        errorMessage.includes("503") ||
        errorMessage.includes("429") ||
        errorMessage.includes("high demand") ||
        errorMessage.includes("RESOURCE_EXHAUSTED");
      if (!isRetryable) {
        const sanitized = errorMessage.replace(/key=[a-zA-Z0-9_-]+/g, "key=***");
        throw new GeminiApiError(`Gemini API call failed: ${sanitized}`, error);
      }
    }
  }

  if (!responseText || responseText.trim().length === 0) {
    const errorMsg = lastError instanceof Error ? lastError.message : String(lastError);
    const sanitized = errorMsg.replace(/key=[a-zA-Z0-9_-]+/g, "key=***");
    throw new GeminiApiError(`Gemini API call failed across all candidate models: ${sanitized}`, lastError);
  }

  // 5. Parse JSON using safe balanced-brace extractor for robust handling of extra LLM tokens
  let parsedJson: unknown;
  try {
    let cleaned = responseText.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    }
    try {
      parsedJson = JSON.parse(cleaned);
    } catch {
      const firstBrace = cleaned.indexOf("{");
      if (firstBrace !== -1) {
        let openBraces = 0;
        let inString = false;
        let isEscaped = false;
        for (let i = firstBrace; i < cleaned.length; i++) {
          const char = cleaned[i];
          if (char === '"' && !isEscaped) {
            inString = !inString;
          } else if (!inString) {
            if (char === "{") openBraces++;
            else if (char === "}") {
              openBraces--;
              if (openBraces === 0) {
                const candidate = cleaned.slice(firstBrace, i + 1);
                parsedJson = JSON.parse(candidate);
                break;
              }
            }
          }
          isEscaped = char === "\\" && !isEscaped;
        }
      }
      if (!parsedJson) {
        throw new Error("Unable to locate valid balanced JSON object");
      }
    }
  } catch (err: unknown) {
    void err;
    throw new GeminiResponseError(
      "Gemini response could not be parsed as valid JSON.",
      responseText
    );
  }

  // 6. Validate against Zod schema
  const validationResult = GenerateTestCasesResponseSchema.safeParse(parsedJson);
  if (!validationResult.success) {
    const errors = validationResult.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join(", ");
    throw new GeminiResponseError(
      `Gemini response does not conform to GenerateTestCases schema: ${errors}`,
      responseText
    );
  }

  const testCases: GeneratedTestCase[] = validationResult.data.testCases;

  // 7. Calculate summary counts
  const positive = testCases.filter((tc) => tc.type === "Positive").length;
  const negative = testCases.filter((tc) => tc.type === "Negative").length;
  const boundary = testCases.filter((tc) => tc.type === "Boundary").length;
  const roleBased = testCases.filter((tc) => tc.type === "Role-Based").length;

  const summary: TestCaseGenerationSummary = {
    total: testCases.length,
    positive,
    negative,
    boundary,
    roleBased,
  };

  return {
    testCases,
    summary,
    meta: {
      model: usedModel,
      generatedAt: new Date().toISOString(),
      testCaseCount: testCases.length,
    },
  };
}
