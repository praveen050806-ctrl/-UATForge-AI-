import { GoogleGenAI } from "@google/genai";
import { Requirement, RequirementIntelligence } from "@/types";
import { RequirementIntelligenceSchema } from "@/lib/validation/schemas";

export interface UnderstandRequirementParams {
  title: string;
  inputType?: Requirement["inputType"];
  content: string;
  documentFileName?: string;
}

export interface UnderstandRequirementResult {
  intelligence: RequirementIntelligence;
  meta: {
    model: string;
    extractedAt: string;
    itemCounts: {
      roles: number;
      actions: number;
      businessRules: number;
      conditions: number;
      outcomes: number;
      dependencies: number;
      ambiguities: number;
    };
  };
}

export class GeminiConfigError extends Error {
  constructor(message = "Gemini API key is not configured. Please set GEMINI_API_KEY in your .env.local file.") {
    super(message);
    this.name = "GeminiConfigError";
  }
}

export class GeminiValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiValidationError";
  }
}

export class GeminiResponseError extends Error {
  constructor(message: string, public readonly rawText?: string) {
    super(message);
    this.name = "GeminiResponseError";
  }
}

export class GeminiApiError extends Error {
  constructor(message: string, public readonly originalError?: unknown) {
    super(message);
    this.name = "GeminiApiError";
  }
}

const SYSTEM_INSTRUCTION = `You are the Requirement Intelligence Extraction Engine for UATForge AI, an enterprise UAT (User Acceptance Testing) engineering platform.
Your task is to analyze the provided business requirement, user story, or workflow specification, and decompose it into structured domain intelligence.

You must extract exactly seven categories into a JSON object:
1. "roles": Array of user types, actors, personas, and system entities (e.g., "Employee", "Manager", "Finance Approver", "Admin", "Payment Gateway").
2. "actions": Array of concrete operations, operations, and activities initiated by actors or systems (e.g., "Submits expense claim", "Uploads receipt", "Approves expense", "Processes payment").
3. "businessRules": Array of explicit governing rules, thresholds, constraints, limits, and validation policies (e.g., "Expenses ≤ ₹10,000 require manager approval only", "Expenses between ₹10,001 and ₹50,000 require manager and finance approval", "Missing receipt mandates claim rejection").
4. "conditions": Array of state prerequisites, trigger conditions, and if-then conditional criteria (e.g., "Expense amount ≤ ₹10,000", "Receipt attached to claim", "Prior approval granted").
5. "outcomes": Array of observable state transitions, messages, financial disbursements, notifications, and results (e.g., "Payment processed by finance", "Notification sent to employee", "Claim marked as rejected").
6. "dependencies": Array of external systems, databases, services, or integration points (e.g., "Finance Payment System", "Notification Service", "Receipt Document Store").
7. "ambiguities": Array of vague statements, undefined SLAs/thresholds, missing edge cases, or unclear workflows (e.g., "Payment processing turnaround time not specified", "Notification channel unspecified", "No appeal process defined for rejected claims").

CRITICAL GOVERNANCE RULES:
- Do NOT silently invent or hallucinate information that is not stated or directly implied by the requirement text.
- If information is missing, vague, or subjective, do NOT fabricate facts; record the question or ambiguity in the "ambiguities" array.
- Every entry in each array must be a clear, concise string.
- You must return ONLY a valid JSON object matching the expected schema.`;

/**
 * Server-side service to analyze business requirements and extract
 * structured intelligence using Google Gemini API.
 */
export async function understandRequirement(
  params: UnderstandRequirementParams
): Promise<UnderstandRequirementResult> {
  const { title, content, inputType = "text" } = params;

  // 1. Validate inputs
  if (!content || content.trim().length === 0) {
    throw new GeminiValidationError("Requirement content cannot be empty.");
  }
  if (!title || title.trim().length === 0) {
    throw new GeminiValidationError("Requirement title cannot be empty.");
  }

  // 2. Check for API key (NEVER print or leak this key)
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey || apiKey.trim().length === 0 || apiKey === "your_gemini_api_key_here") {
    throw new GeminiConfigError();
  }

  const modelName = process.env.GEMINI_MODEL || "gemini-3.8-flash";

  // 3. Construct prompt
  const userPrompt = `REQUIREMENT TITLE: ${title.trim()}
INPUT FORMAT: ${inputType}

CONTENT TO ANALYZE:
"""
${content.trim()}
"""

Extract the structured Requirement Intelligence JSON with:
{
  "roles": [],
  "actions": [],
  "businessRules": [],
  "conditions": [],
  "outcomes": [],
  "dependencies": [],
  "ambiguities": []
}`;

  // 4. Initialize Gemini client
  const ai = new GoogleGenAI({ apiKey });

  let responseText: string | undefined;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.1, // Deterministic extraction
      },
    });

    responseText = response.text;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    // Sanitize any potential accidental key exposure in error strings
    const sanitized = errorMessage.replace(/key=[a-zA-Z0-9_-]+/g, "key=***");
    throw new GeminiApiError(`Gemini API call failed: ${sanitized}`, error);
  }

  if (!responseText || responseText.trim().length === 0) {
    throw new GeminiResponseError("Gemini returned an empty response.");
  }

  // 5. Parse JSON
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(responseText.trim());
  } catch (err: unknown) {
    void err;
    throw new GeminiResponseError(
      "Gemini response could not be parsed as valid JSON.",
      responseText
    );
  }

  // 6. Validate against Zod schema
  const validationResult = RequirementIntelligenceSchema.safeParse(parsedJson);
  if (!validationResult.success) {
    const errors = validationResult.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join(", ");
    throw new GeminiResponseError(
      `Gemini response does not conform to RequirementIntelligence schema: ${errors}`,
      responseText
    );
  }

  const intelligence: RequirementIntelligence = validationResult.data;

  return {
    intelligence,
    meta: {
      model: modelName,
      extractedAt: new Date().toISOString(),
      itemCounts: {
        roles: intelligence.roles.length,
        actions: intelligence.actions.length,
        businessRules: intelligence.businessRules.length,
        conditions: intelligence.conditions.length,
        outcomes: intelligence.outcomes.length,
        dependencies: intelligence.dependencies.length,
        ambiguities: intelligence.ambiguities.length,
      },
    },
  };
}
