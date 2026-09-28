import { Requirement, RequirementIntelligence } from "@/types";

export interface UnderstandRequirementParams {
  title: string;
  inputType: Requirement["inputType"];
  content: string;
  documentFileName?: string;
}

export interface UnderstandRequirementResult {
  intelligence: RequirementIntelligence;
  confidenceScore: number;
  extractedAt: string;
}

/**
 * AI Requirement Understanding Service Abstraction
 * 
 * NOTE: This is an architectural placeholder for Milestone 1B.
 * Gemini API integration will be implemented in a subsequent milestone.
 * No real API calls or keys are configured here.
 */
export async function understandRequirement(
  _params: UnderstandRequirementParams
): Promise<UnderstandRequirementResult> {
  void _params;
  throw new Error(
    "AI requirement understanding is not implemented in Milestone 1B. Gemini service will be connected in Milestone 2."
  );
}
