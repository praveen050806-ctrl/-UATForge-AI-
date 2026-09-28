import { NextRequest, NextResponse } from "next/server";
import { UnderstandRequirementRequestSchema } from "@/lib/validation/schemas";
import {
  understandRequirement,
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
    const validation = UnderstandRequirementRequestSchema.safeParse(body);
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

    const { title, content, inputType, documentFileName } = validation.data;

    // Call server-side Gemini service
    const result = await understandRequirement({
      title,
      content,
      inputType,
      documentFileName,
    });

    return NextResponse.json({
      success: true,
      data: result.intelligence,
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
            "Create a .env.local file in the project root with GEMINI_API_KEY=your_key_here to enable live AI requirement analysis.",
        },
        { status: 503 }
      );
    }

    if (error instanceof GeminiValidationError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: "INVALID_REQUIREMENT_INPUT",
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
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: "GEMINI_API_ERROR",
        },
        { status: 502 }
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
