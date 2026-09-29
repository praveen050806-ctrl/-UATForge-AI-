import { NextRequest, NextResponse } from "next/server";
import { GenerateScenariosRequestSchema } from "@/lib/validation/schemas";
import {
  generateScenarios,
  GenerateScenariosResult,
} from "@/lib/ai/scenario-generation";
import {
  GeminiConfigError,
  GeminiValidationError,
  GeminiResponseError,
  GeminiApiError,
} from "@/lib/ai/requirement-understanding";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON in request payload.",
          code: "INVALID_JSON",
        },
        { status: 400 }
      );
    }

    // Validate request schema
    const validation = GenerateScenariosRequestSchema.safeParse(body);
    if (!validation.success) {
      const issueMessages = validation.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
      return NextResponse.json(
        {
          success: false,
          error: `Validation error: ${issueMessages}`,
          code: "VALIDATION_FAILED",
        },
        { status: 400 }
      );
    }

    const { requirementTitle, requirementContent, intelligence } = validation.data;

    // Call server-side Gemini scenario generation service
    const result: GenerateScenariosResult = await generateScenarios({
      requirementTitle,
      requirementContent,
      intelligence,
    });

    return NextResponse.json({
      success: true,
      data: {
        scenarios: result.scenarios,
        summary: result.summary,
      },
      meta: result.meta,
    });
  } catch (error: unknown) {
    if (error instanceof GeminiConfigError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: "GEMINI_API_KEY_NOT_CONFIGURED",
          details:
            "Create a .env.local file in the project root with GEMINI_API_KEY=your_key_here to enable live AI scenario generation.",
        },
        { status: 503 }
      );
    }

    if (error instanceof GeminiValidationError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: "INVALID_SCENARIO_INPUT",
        },
        { status: 400 }
      );
    }

    if (error instanceof GeminiResponseError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: "MALFORMED_AI_RESPONSE",
        },
        { status: 502 }
      );
    }

    if (error instanceof GeminiApiError) {
      const message = error.message.toLowerCase();
      // Handle temporary 503 / UNAVAILABLE in a controlled retryable manner
      const isUnavailable =
        message.includes("503") ||
        message.includes("unavailable") ||
        message.includes("overloaded");

      return NextResponse.json(
        {
          success: false,
          error: isUnavailable
            ? "Gemini API is temporarily unavailable or overloaded. Please retry in a few moments."
            : error.message,
          code: isUnavailable ? "GEMINI_SERVICE_UNAVAILABLE" : "GEMINI_API_ERROR",
          retryable: isUnavailable,
        },
        { status: isUnavailable ? 503 : 502 }
      );
    }

    const genericMessage =
      error instanceof Error ? error.message : "An unexpected server error occurred.";
    return NextResponse.json(
      {
        success: false,
        error: genericMessage,
        code: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
