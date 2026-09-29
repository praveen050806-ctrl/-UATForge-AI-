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
Your task is to analyze the provided business requirement, user story, structured or natural-language use case, or workflow specification, and decompose it into structured domain intelligence.

You must extract exactly seven categories into a JSON object:
1. "roles": Array of user types, actors (primary, secondary, or supporting actors in use cases), personas, and system entities (e.g., "Customer", "Manager", "Finance Approver", "Admin", "Payment Gateway").
2. "actions": Array of concrete operations, flow steps, and activities initiated by actors or systems (e.g., "Selects order to cancel", "Validates order dispatch status", "Calculates refund amount", "Submits payment refund").
3. "businessRules": Array of explicit governing rules, thresholds, constraints, limits, and validation policies (e.g., "Orders older than 24 hours cannot be cancelled via self-service", "Customized merchandise is non-cancellable once manufacturing starts", "Missing receipt mandates claim rejection").
4. "conditions": Array of state prerequisites, use case preconditions, alternative flow triggers, and if-then conditional criteria (e.g., "Order status is Processing or Pending Shipment", "Order placed within last 24 hours", "Payment Gateway refund call times out").
5. "outcomes": Array of observable state transitions, use case postconditions, messages, notifications, and results (e.g., "Order marked as Cancelled", "Inventory restored", "Confirmation email with refund reference sent").
6. "dependencies": Array of external systems, secondary actors, payment gateways, databases, services, or integration points (e.g., "Payment Gateway", "Inventory Management System", "Notification Service").
7. "ambiguities": Array of vague statements, undefined turnaround times/SLAs, unhandled exception paths, or unclear workflows (e.g., "Customer communication channel for offline review unspecified", "Turnaround time for bank credit undefined", "Dispute resolution mechanism omitted").

CRITICAL GOVERNANCE RULES:
- Do NOT silently invent or hallucinate information that is not stated or directly implied by the requirement or use case text.
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

  const preferredModel = process.env.GEMINI_MODEL || "gemini-3.5-flash";
  const candidateModels = [
    preferredModel,
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.8-flash",
  ].filter((m, i, arr) => arr.indexOf(m) === i);

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
          temperature: 0.1, // Deterministic extraction
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
      model: usedModel,
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
