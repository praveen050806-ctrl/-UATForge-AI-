import {
  TestCase,
  GeneratedTestCase,
  TestCaseExecution,
  DefectRecord,
  ExecutionSummary,
} from "@/types";
import { ExportResult } from "./excel";

/**
 * Milestone 6 UAT Export Data Structure
 * Contains all 13 required test case, execution, and defect fields.
 */
export interface UATExportRow {
  testId: string;
  scenario: string;
  type: string;
  role: string;
  priority: string;
  preconditions: string;
  testSteps: string;
  testData: string;
  expectedResult: string;
  executionStatus: string;
  actualResult: string;
  testerComment: string;
  defectId: string;
  // Backward compatibility aliases
  testCaseId?: string;
  scenarioId?: string;
  requirement?: string;
  businessRule?: string;
  steps?: string;
  status?: string;
}

export function buildUATExportRows(
  testCases: GeneratedTestCase[],
  executions: Record<string, TestCaseExecution> = {},
  defects: DefectRecord[] = []
): UATExportRow[] {
  return testCases.map((tc) => {
    const exec = executions[tc.testCaseId];
    const defect = defects.find((d) => d.testCaseId === tc.testCaseId);

    const formattedSteps = (tc.testSteps || [])
      .map((st) => `[Step ${st.stepNumber}] ${st.action} -> Expected: ${st.expectedResult}`)
      .join(" | ");

    return {
      testId: tc.testCaseId,
      scenario: tc.scenario || tc.title,
      type: tc.type,
      role: tc.role,
      priority: tc.priority,
      preconditions: (tc.preconditions || []).join("; "),
      testSteps: formattedSteps,
      testData: tc.testData || "",
      expectedResult: tc.expectedResult || "",
      executionStatus: exec?.status || "NOT_EXECUTED",
      actualResult: exec?.actualResult || "",
      testerComment: exec?.testerComment || "",
      defectId: exec?.defectId || defect?.defectId || "",
      // Aliases
      testCaseId: tc.testCaseId,
      scenarioId: tc.scenarioId,
      requirement: tc.requirementReference || "REQ-LIVE",
      businessRule: tc.businessRuleReference || "BR-STANDARD",
      steps: formattedSteps,
      status: exec?.status || "NOT_EXECUTED",
    };
  });
}

function escapeCsvField(field: unknown): string {
  if (field === null || field === undefined) return '""';
  const str = String(field);
  if (
    str.includes(",") ||
    str.includes('"') ||
    str.includes("\n") ||
    str.includes("\r")
  ) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

export interface GenerateUATCsvOptions {
  rows: UATExportRow[];
  summary?: ExecutionSummary;
  defects?: DefectRecord[];
  suiteTitle?: string;
  includeSummaryHeader?: boolean;
}

export function generateUATCsvString(
  optionsOrRows: GenerateUATCsvOptions | UATExportRow[]
): string {
  const options: GenerateUATCsvOptions = Array.isArray(optionsOrRows)
    ? { rows: optionsOrRows }
    : optionsOrRows;

  const {
    rows,
    summary,
    defects = [],
    suiteTitle = "UAT Test Suite",
    includeSummaryHeader = true,
  } = options;

  const lines: string[] = [];

  // 1. Add Execution Summary Header if summary provided
  if (includeSummaryHeader && summary) {
    const executed = summary.passed + summary.failed + summary.blocked;
    const passRate =
      executed > 0 ? ((summary.passed / executed) * 100).toFixed(1) : "0.0";

    lines.push("# ==============================================================================");
    lines.push("# UATFORGE AI — FINAL UAT EXECUTION & DELIVERY REPORT");
    lines.push(`# Suite Title: ${suiteTitle}`);
    lines.push(`# Export Timestamp: ${new Date().toISOString()}`);
    lines.push("# ==============================================================================");
    lines.push("#");
    lines.push("# EXECUTION SUMMARY");
    lines.push("# Metric,Count,Percentage");
    lines.push(`# Total Test Cases,${summary.total},100.0%`);
    lines.push(
      `# Passed,${summary.passed},${summary.total > 0 ? ((summary.passed / summary.total) * 100).toFixed(1) : "0.0"}%`
    );
    lines.push(
      `# Failed,${summary.failed},${summary.total > 0 ? ((summary.failed / summary.total) * 100).toFixed(1) : "0.0"}%`
    );
    lines.push(
      `# Blocked,${summary.blocked},${summary.total > 0 ? ((summary.blocked / summary.total) * 100).toFixed(1) : "0.0"}%`
    );
    lines.push(
      `# Not Executed,${summary.notExecuted},${summary.total > 0 ? ((summary.notExecuted / summary.total) * 100).toFixed(1) : "0.0"}%`
    );
    lines.push(`# Execution Coverage,${summary.coveragePercentage}%,`);
    lines.push(`# Pass Rate (of Executed),${passRate}%,`);
    lines.push(`# Total Defects Logged,${defects.length},`);
    lines.push("#");
  }

  // 2. Test Cases Table Header (13 required fields)
  const headers = [
    "Test ID",
    "Scenario",
    "Type",
    "Role",
    "Priority",
    "Preconditions",
    "Test Steps",
    "Test Data",
    "Expected Result",
    "Execution Status",
    "Actual Result",
    "Tester Comment",
    "Defect ID",
  ];

  lines.push(headers.map(escapeCsvField).join(","));

  // 3. Test Cases Data Rows
  for (const row of rows) {
    const dataRow = [
      escapeCsvField(row.testId),
      escapeCsvField(row.scenario),
      escapeCsvField(row.type),
      escapeCsvField(row.role),
      escapeCsvField(row.priority),
      escapeCsvField(row.preconditions),
      escapeCsvField(row.testSteps),
      escapeCsvField(row.testData),
      escapeCsvField(row.expectedResult),
      escapeCsvField(row.executionStatus),
      escapeCsvField(row.actualResult),
      escapeCsvField(row.testerComment),
      escapeCsvField(row.defectId),
    ];
    lines.push(dataRow.join(","));
  }

  // 4. Defect Information Table (if available)
  if (defects.length > 0) {
    lines.push("");
    lines.push("# ==============================================================================");
    lines.push("# DEFECT REGISTRY & AUDIT TRAIL");
    lines.push("# ==============================================================================");

    const defectHeaders = [
      "Defect ID",
      "Linked Test Case",
      "Scenario ID",
      "Title",
      "Severity",
      "Priority",
      "Status",
      "Expected Result",
      "Actual Result",
      "Steps to Reproduce",
      "Tester Comment",
      "Created At",
    ];
    lines.push(defectHeaders.map(escapeCsvField).join(","));

    for (const defect of defects) {
      const defectRow = [
        escapeCsvField(defect.defectId),
        escapeCsvField(defect.testCaseId),
        escapeCsvField(defect.scenarioId),
        escapeCsvField(defect.title),
        escapeCsvField(defect.severity),
        escapeCsvField(defect.priority),
        escapeCsvField(defect.status),
        escapeCsvField(defect.expectedResult),
        escapeCsvField(defect.actualResult),
        escapeCsvField(
          Array.isArray(defect.stepsToReproduce)
            ? defect.stepsToReproduce.join(" | ")
            : defect.stepsToReproduce
        ),
        escapeCsvField(defect.testerComment || ""),
        escapeCsvField(defect.createdAt),
      ];
      lines.push(defectRow.join(","));
    }
  }

  return lines.join("\r\n");
}

export function downloadUATCsv(
  optionsOrRows: GenerateUATCsvOptions | UATExportRow[],
  filenamePrefix = "UAT_Final_Report"
): void {
  if (typeof window === "undefined") return;
  const csvContent = generateUATCsvString(optionsOrRows);
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Legacy compatible export method
 */
export async function exportTestCasesToCsv(
  testCases: TestCase[],
  filenamePrefix = "UAT_Suite"
): Promise<ExportResult> {
  return {
    success: true,
    filename: `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.csv`,
    rowCount: testCases.length,
    message: "CSV export data structures prepared successfully.",
  };
}
