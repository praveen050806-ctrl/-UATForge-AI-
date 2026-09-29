import { GoogleGenAI } from "@google/genai";
import {
  GeneratedScenario,
  RequirementIntelligence,
  ScenarioGenerationSummary,
} from "@/types";
import { GenerateScenariosResponseSchema } from "@/lib/validation/schemas";
import {
  GeminiConfigError,
  GeminiValidationError,
  GeminiResponseError,
  GeminiApiError,
} from "@/lib/ai/requirement-understanding";

export interface GenerateScenariosParams {
  requirementTitle: string;
  requirementContent: string;
  intelligence: RequirementIntelligence;
}

export interface GenerateScenariosResult {
  scenarios: GeneratedScenario[];
  summary: ScenarioGenerationSummary;
  meta: {
    model: string;
    generatedAt: string;
    scenarioCounts: ScenarioGenerationSummary;
  };
}

const SYSTEM_INSTRUCTION = `You are the UAT Scenario Generation Engine for UATForge AI, an enterprise User Acceptance Testing platform.
Your task is to generate comprehensive, structured UAT scenarios from business requirements and extracted Requirement Intelligence.

CRITICAL GOVERNANCE RULES:
1. Generate User Acceptance Testing (UAT) scenarios, NOT unit tests or implementation code.
2. Use ONLY information supported by the supplied requirement text and extracted intelligence (roles, actions, business rules, conditions, outcomes).
3. Do NOT invent unstated rules, thresholds, or system behaviors. If something is missing or unclear, respect stated constraints and do not fabricate assumptions.
4. Each scenario must be concrete, independently understandable, and suitable for future conversion into step-by-step UAT test cases.
5. Avoid duplicate or redundant scenarios.
6. Return a valid JSON object matching the requested schema exactly.

YOU MUST GENERATE SCENARIOS ACROSS EXACTLY THESE FOUR CATEGORIES:
1. "Positive":
   - Normal, valid end-to-end business flows that should succeed under standard operating conditions.
2. "Negative":
   - Invalid, rejected, prohibited, missing-data, or failure-condition flows (e.g. missing receipts, unauthorized attempts, invalid states).
3. "Boundary":
   - Edge-value, threshold, and limit scenarios derived specifically and strictly from the stated numeric or state boundaries in the business rules (e.g. exact lower bound, upper bound, off-by-one boundary values).
4. "Role-Based":
   - Scenarios highlighting the specific responsibilities, approvals, permissions, handoffs, and verification activities of each distinct role identified.

EACH SCENARIO MUST INCLUDE:
- "scenarioId": Unique identifier prefixed by category code (e.g. "SCN-POS-001", "SCN-NEG-001", "SCN-BND-001", "SCN-ROL-001").
- "title": Clear, concise business scenario title.
- "description": Detailed summary of what business situation is being verified and why.
- "type": Exactly one of "Positive", "Negative", "Boundary", "Role-Based".
- "role": Primary actor or role executing or being verified in this scenario (must match an identified role).
- "businessRule": Explicit governing business rule or policy that this scenario validates.
- "preconditions": Array of prerequisite conditions that must be true before the scenario begins.
- "testData": Specific business data, inputs, or payload used for this scenario (e.g. "Claim amount: ₹10,000, Receipt attached: Yes, Category: Travel").
- "expectedOutcome": Precise expected business outcome or state transition.
- "priority": Exactly one of "Critical", "High", "Medium", "Low".
- "requirementReference": Title or reference to the governing requirement clause.

Output must be ONLY a valid JSON object matching:
{
  "scenarios": [
    {
      "scenarioId": "SCN-POS-001",
      "title": "...",
      "description": "...",
      "type": "Positive",
      "role": "...",
      "businessRule": "...",
      "preconditions": ["..."],
      "testData": "...",
      "expectedOutcome": "...",
      "priority": "High",
      "requirementReference": "..."
    }
  ]
}`;

/**
 * Server-side service to generate structured UAT scenarios from requirement
 * intelligence using Google Gemini API.
 */
export async function generateScenarios(
  params: GenerateScenariosParams
): Promise<GenerateScenariosResult> {
  const { requirementTitle, requirementContent, intelligence } = params;

  // 1. Validate inputs
  if (!requirementTitle || requirementTitle.trim().length === 0) {
    throw new GeminiValidationError("Requirement title cannot be empty.");
  }
  if (!requirementContent || requirementContent.trim().length < 5) {
    throw new GeminiValidationError(
      "Requirement content must be at least 5 characters."
    );
  }
  if (!intelligence || !Array.isArray(intelligence.businessRules)) {
    throw new GeminiValidationError(
      "Valid Requirement Intelligence with business rules is required."
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
  const userPrompt = `REQUIREMENT TITLE:
${requirementTitle.trim()}

REQUIREMENT SPECIFICATION:
"""
${requirementContent.trim()}
"""

STRUCTURED REQUIREMENT INTELLIGENCE:
- Identified Roles: ${JSON.stringify(intelligence.roles)}
- Actions: ${JSON.stringify(intelligence.actions)}
- Governing Business Rules & Thresholds: ${JSON.stringify(intelligence.businessRules)}
- State Conditions & Branches: ${JSON.stringify(intelligence.conditions)}
- Expected Outcomes: ${JSON.stringify(intelligence.outcomes)}
- System Dependencies: ${JSON.stringify(intelligence.dependencies)}
- Identified Ambiguities (Do NOT invent unstated facts): ${JSON.stringify(intelligence.ambiguities)}

TASK:
Generate a comprehensive suite of structured UAT scenarios derived strictly from the above intelligence.
Ensure balanced coverage across:
1. Positive Scenarios (Valid end-to-end paths)
2. Negative Scenarios (Rejection, invalid conditions, missing data)
3. Boundary Scenarios (Numeric boundaries and edge thresholds derived explicitly from stated business rules)
4. Role-Based Scenarios (Role-specific permissions, responsibilities, and approvals)

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
  const validationResult = GenerateScenariosResponseSchema.safeParse(parsedJson);
  if (!validationResult.success) {
    const errors = validationResult.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join(", ");
    throw new GeminiResponseError(
      `Gemini response does not conform to GenerateScenarios schema: ${errors}`,
      responseText
    );
  }

  const scenarios: GeneratedScenario[] = validationResult.data.scenarios;

  // 7. Calculate summary counts
  const positive = scenarios.filter((s) => s.type === "Positive").length;
  const negative = scenarios.filter((s) => s.type === "Negative").length;
  const boundary = scenarios.filter((s) => s.type === "Boundary").length;
  const roleBased = scenarios.filter((s) => s.type === "Role-Based").length;

  const summary: ScenarioGenerationSummary = {
    total: scenarios.length,
    positive,
    negative,
    boundary,
    roleBased,
  };

  return {
    scenarios,
    summary,
    meta: {
      model: usedModel,
      generatedAt: new Date().toISOString(),
      scenarioCounts: summary,
    },
  };
}
