import { TestCase } from "@/types";
import { ExportResult } from "./excel";

/**
 * CSV Export Service Placeholder
 * 
 * Generates RFC-4180 compliant CSV files for UAT test suites.
 * Implementation will be connected in a subsequent milestone.
 */
export async function exportTestCasesToCsv(
  _testCases: TestCase[],
  _filenamePrefix = "UAT_Suite"
): Promise<ExportResult> {
  void _testCases;
  void _filenamePrefix;
  return {
    success: false,
    filename: `${_filenamePrefix}_draft.csv`,
    rowCount: _testCases.length,
    message: "CSV generation engine is scheduled for future milestone.",
  };
}
