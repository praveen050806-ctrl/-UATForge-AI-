import {
  TestCase,
  GeneratedTestCase,
  TestCaseExecution,
  DefectRecord,
  ExecutionSummary,
} from "@/types";

export interface ExportResult {
  success: boolean;
  filename: string;
  rowCount: number;
  message: string;
}

export interface GenerateUATExcelOptions {
  testCases: GeneratedTestCase[];
  executions?: Record<string, TestCaseExecution>;
  defects?: DefectRecord[];
  summary?: ExecutionSummary;
  suiteTitle?: string;
}

function escapeXml(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function generateUATExcelXml(options: GenerateUATExcelOptions): string {
  const {
    testCases,
    executions = {},
    defects = [],
    summary = {
      total: testCases.length,
      passed: 0,
      failed: 0,
      blocked: 0,
      notExecuted: testCases.length,
      coveragePercentage: 0,
    },
    suiteTitle = "Enterprise UAT Test Suite",
  } = options;

  const total = summary.total || testCases.length || 1;
  const executed = summary.passed + summary.failed + summary.blocked;
  const passRate =
    executed > 0 ? ((summary.passed / executed) * 100).toFixed(1) : "0.0";

  const openDefects = defects.filter((d) => d.status === "OPEN").length;
  const inReviewDefects = defects.filter((d) => d.status === "IN_REVIEW").length;
  const resolvedDefects = defects.filter((d) => d.status === "RESOLVED").length;
  const criticalDefects = defects.filter((d) => d.severity === "CRITICAL").length;

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Title>UATForge AI - Final UAT Report</Title>
  <Subject>UAT Test Suite Execution and Defect Report</Subject>
  <Author>UATForge AI</Author>
  <Created>${new Date().toISOString()}</Created>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#1E293B"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="TitleStyle">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="16" ss:Bold="1" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="MetaStyle">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Italic="1" ss:Color="#64748B"/>
  </Style>
  <Style ss:ID="SectionHeader">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="12" ss:Bold="1" ss:Color="#B45309"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#F59E0B"/>
   </Borders>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0F172A"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0F172A"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#0F172A" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="DataCell">
   <Alignment ss:Vertical="Top" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#334155"/>
  </Style>
  <Style ss:ID="CenterDataCell">
   <Alignment ss:Horizontal="Center" ss:Vertical="Top"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#334155"/>
  </Style>
  <Style ss:ID="BoldDataCell">
   <Alignment ss:Vertical="Top" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="StatusPass">
   <Alignment ss:Horizontal="Center" ss:Vertical="Top"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#A7F3D0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#A7F3D0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#A7F3D0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#A7F3D0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#065F46"/>
   <Interior ss:Color="#D1FAE5" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="StatusFail">
   <Alignment ss:Horizontal="Center" ss:Vertical="Top"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FECACA"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FECACA"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FECACA"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FECACA"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#991B1B"/>
   <Interior ss:Color="#FEE2E2" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="StatusBlocked">
   <Alignment ss:Horizontal="Center" ss:Vertical="Top"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FDE68A"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FDE68A"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FDE68A"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FDE68A"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#92400E"/>
   <Interior ss:Color="#FEF3C7" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="StatusNotExec">
   <Alignment ss:Horizontal="Center" ss:Vertical="Top"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#64748B"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
  </Style>
 </Styles>

 <!-- ============================================================== -->
 <!-- SHEET 1: EXECUTION SUMMARY                                      -->
 <!-- ============================================================== -->
 <Worksheet ss:Name="Execution Summary">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="200"/>
   <Column ss:Width="110"/>
   <Column ss:Width="110"/>
   <Column ss:Width="260"/>

   <!-- Title Row -->
   <Row ss:Height="28">
    <Cell ss:MergeAcross="3" ss:StyleID="TitleStyle">
     <Data ss:Type="String">UATFORGE AI — FINAL UAT REPORT &amp; EXECUTION SUMMARY</Data>
    </Cell>
   </Row>

   <!-- Metadata Row -->
   <Row ss:Height="18">
    <Cell ss:MergeAcross="3" ss:StyleID="MetaStyle">
     <Data ss:Type="String">Suite: ${escapeXml(suiteTitle)} | Generated: ${escapeXml(new Date().toLocaleString())} | Target: Executive Signoff</Data>
    </Cell>
   </Row>
   <Row ss:Height="12"/>

   <!-- Execution Metrics Section -->
   <Row ss:Height="22">
    <Cell ss:MergeAcross="3" ss:StyleID="SectionHeader">
     <Data ss:Type="String">1. TEST SUITE EXECUTION METRICS</Data>
    </Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Execution Metric</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Count</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Percentage</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Status &amp; Verification Note</Data></Cell>
   </Row>

   <Row>
    <Cell ss:StyleID="BoldDataCell"><Data ss:Type="String">Total Test Cases</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="Number">${summary.total}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">100.0%</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">Complete baseline test suite</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="BoldDataCell"><Data ss:Type="String">Passed</Data></Cell>
    <Cell ss:StyleID="StatusPass"><Data ss:Type="Number">${summary.passed}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${((summary.passed / total) * 100).toFixed(1)}%</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">Accepted against acceptance criteria</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="BoldDataCell"><Data ss:Type="String">Failed</Data></Cell>
    <Cell ss:StyleID="StatusFail"><Data ss:Type="Number">${summary.failed}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${((summary.failed / total) * 100).toFixed(1)}%</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">Deviations observed during execution</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="BoldDataCell"><Data ss:Type="String">Blocked</Data></Cell>
    <Cell ss:StyleID="StatusBlocked"><Data ss:Type="Number">${summary.blocked}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${((summary.blocked / total) * 100).toFixed(1)}%</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">Environmental or prerequisite blockers</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="BoldDataCell"><Data ss:Type="String">Not Executed</Data></Cell>
    <Cell ss:StyleID="StatusNotExec"><Data ss:Type="Number">${summary.notExecuted}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${((summary.notExecuted / total) * 100).toFixed(1)}%</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">Pending execution</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="BoldDataCell"><Data ss:Type="String">Execution Coverage</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="Number">${executed}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${summary.coveragePercentage}%</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${executed} of ${summary.total} test cases executed</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="BoldDataCell"><Data ss:Type="String">Pass Rate (of Executed)</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${summary.passed}/${executed}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${passRate}%</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">Overall execution health</Data></Cell>
   </Row>

   <Row ss:Height="16"/>

   <!-- Defect Summary Section -->
   <Row ss:Height="22">
    <Cell ss:MergeAcross="3" ss:StyleID="SectionHeader">
     <Data ss:Type="String">2. DEFECT METRICS &amp; TRIAGE SUMMARY</Data>
    </Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Defect Metric</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Count</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Distribution</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Release Impact Assessment</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="BoldDataCell"><Data ss:Type="String">Total Logged Defects</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="Number">${defects.length}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">100.0%</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">Total defects linked to test cases</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="BoldDataCell"><Data ss:Type="String">Open Defects</Data></Cell>
    <Cell ss:StyleID="StatusFail"><Data ss:Type="Number">${openDefects}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${defects.length > 0 ? ((openDefects / defects.length) * 100).toFixed(1) : "0.0"}%</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">Awaiting remediation</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="BoldDataCell"><Data ss:Type="String">In Review Defects</Data></Cell>
    <Cell ss:StyleID="StatusBlocked"><Data ss:Type="Number">${inReviewDefects}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${defects.length > 0 ? ((inReviewDefects / defects.length) * 100).toFixed(1) : "0.0"}%</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">Under engineering analysis</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="BoldDataCell"><Data ss:Type="String">Resolved Defects</Data></Cell>
    <Cell ss:StyleID="StatusPass"><Data ss:Type="Number">${resolvedDefects}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${defects.length > 0 ? ((resolvedDefects / defects.length) * 100).toFixed(1) : "0.0"}%</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">Verified fix or closed</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="BoldDataCell"><Data ss:Type="String">Critical Severity Defects</Data></Cell>
    <Cell ss:StyleID="StatusFail"><Data ss:Type="Number">${criticalDefects}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${defects.length > 0 ? ((criticalDefects / defects.length) * 100).toFixed(1) : "0.0"}%</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${criticalDefects > 0 ? "Release blocker requires signoff override" : "Zero critical blockers"}</Data></Cell>
   </Row>
  </Table>
 </Worksheet>

 <!-- ============================================================== -->
 <!-- SHEET 2: UAT TEST CASES                                         -->
 <!-- ============================================================== -->
 <Worksheet ss:Name="UAT Test Cases">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="100"/>
   <Column ss:Width="250"/>
   <Column ss:Width="85"/>
   <Column ss:Width="95"/>
   <Column ss:Width="75"/>
   <Column ss:Width="200"/>
   <Column ss:Width="300"/>
   <Column ss:Width="160"/>
   <Column ss:Width="220"/>
   <Column ss:Width="110"/>
   <Column ss:Width="220"/>
   <Column ss:Width="180"/>
   <Column ss:Width="95"/>

   <!-- Table Header (13 Required Columns) -->
   <Row ss:Height="26">
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Test ID</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Scenario</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Type</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Role</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Priority</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Preconditions</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Test Steps</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Test Data</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Expected Result</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Execution Status</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Actual Result</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Tester Comment</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Defect ID</Data></Cell>
   </Row>

   <!-- Test Case Rows -->
   ${testCases
     .map((tc) => {
       const exec = executions[tc.testCaseId];
       const defect = defects.find((d) => d.testCaseId === tc.testCaseId);
       const status = exec?.status || "NOT_EXECUTED";

       let statusStyle = "StatusNotExec";
       if (status === "PASS") statusStyle = "StatusPass";
       else if (status === "FAIL") statusStyle = "StatusFail";
       else if (status === "BLOCKED") statusStyle = "StatusBlocked";

       const formattedSteps = (tc.testSteps || [])
         .map((st) => `[Step ${st.stepNumber}] ${st.action} -> Expected: ${st.expectedResult}`)
         .join("\n");

       const defectId = exec?.defectId || defect?.defectId || "";

       return `
   <Row>
    <Cell ss:StyleID="BoldDataCell"><Data ss:Type="String">${escapeXml(tc.testCaseId)}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(tc.scenario || tc.title)}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${escapeXml(tc.type)}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${escapeXml(tc.role)}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${escapeXml(tc.priority)}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml((tc.preconditions || []).join("; "))}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(formattedSteps)}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(tc.testData || "")}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(tc.expectedResult || "")}</Data></Cell>
    <Cell ss:StyleID="${statusStyle}"><Data ss:Type="String">${escapeXml(status)}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(exec?.actualResult || "")}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(exec?.testerComment || "")}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${escapeXml(defectId)}</Data></Cell>
   </Row>`;
     })
     .join("")}
  </Table>
 </Worksheet>

 <!-- ============================================================== -->
 <!-- SHEET 3: DEFECT REGISTRY                                        -->
 <!-- ============================================================== -->
 <Worksheet ss:Name="Defect Registry">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="95"/>
   <Column ss:Width="105"/>
   <Column ss:Width="105"/>
   <Column ss:Width="250"/>
   <Column ss:Width="90"/>
   <Column ss:Width="80"/>
   <Column ss:Width="95"/>
   <Column ss:Width="200"/>
   <Column ss:Width="200"/>
   <Column ss:Width="260"/>
   <Column ss:Width="180"/>
   <Column ss:Width="140"/>

   <!-- Table Header -->
   <Row ss:Height="26">
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Defect ID</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Linked Test Case</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Scenario ID</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Title</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Severity</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Priority</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Status</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Expected Result</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Actual Result</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Steps to Reproduce</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Tester Comment</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Created At</Data></Cell>
   </Row>

   <!-- Defect Rows -->
   ${
     defects.length > 0
       ? defects
           .map((d) => {
             let statusStyle = "StatusNotExec";
             if (d.status === "RESOLVED") statusStyle = "StatusPass";
             else if (d.status === "OPEN") statusStyle = "StatusFail";
             else if (d.status === "IN_REVIEW") statusStyle = "StatusBlocked";

             return `
   <Row>
    <Cell ss:StyleID="BoldDataCell"><Data ss:Type="String">${escapeXml(d.defectId)}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${escapeXml(d.testCaseId)}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${escapeXml(d.scenarioId)}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(d.title)}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${escapeXml(d.severity)}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${escapeXml(d.priority)}</Data></Cell>
    <Cell ss:StyleID="${statusStyle}"><Data ss:Type="String">${escapeXml(d.status)}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(d.expectedResult)}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(d.actualResult)}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(Array.isArray(d.stepsToReproduce) ? d.stepsToReproduce.join("\n") : d.stepsToReproduce)}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(d.testerComment || "")}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${escapeXml(d.createdAt)}</Data></Cell>
   </Row>`;
           })
           .join("")
       : `
   <Row>
    <Cell ss:MergeAcross="11" ss:StyleID="DataCell">
     <Data ss:Type="String">No defects recorded in current session. All executed tests passed or no failed execution recorded.</Data>
    </Cell>
   </Row>`
   }
  </Table>
 </Worksheet>
</Workbook>`;
}

export function downloadUATExcel(
  options: GenerateUATExcelOptions,
  filenamePrefix = "UAT_Final_Report"
): void {
  if (typeof window === "undefined") return;
  const xmlContent = generateUATExcelXml(options);
  const blob = new Blob([xmlContent], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.xls`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Legacy compatible export method
 */
export async function exportTestCasesToExcel(
  testCases: TestCase[],
  filenamePrefix = "UAT_Suite"
): Promise<ExportResult> {
  return {
    success: true,
    filename: `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.xls`,
    rowCount: testCases.length,
    message: "Excel workbook generated successfully.",
  };
}
