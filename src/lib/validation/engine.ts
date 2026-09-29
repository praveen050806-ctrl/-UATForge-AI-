import {
  GeneratedTestCase,
  GeneratedScenario,
  RequirementIntelligence,
  ValidationIssue,
  ValidationSummaryReport,
  ValidationCategorySummary,
  ValidationEntityStats,
  ValidationCategory,
  TestCaseExecution,
  DefectRecord,
  TraceabilityLink,
} from "@/types";

export interface ValidationEngineInput {
  requirementId?: string;
  requirementTitle?: string;
  requirementContent?: string;
  intelligence?: RequirementIntelligence | null;
  scenarios?: GeneratedScenario[];
  testCases?: GeneratedTestCase[];
  executions?: Record<string, TestCaseExecution>;
  defects?: DefectRecord[];
  traceabilityLinks?: TraceabilityLink[];
}

const VAGUE_TERMS = [
  { term: "fast", metric: "Define specific P95 response time limit (e.g. < 500ms)" },
  { term: "user-friendly", metric: "Specify explicit accessibility and layout heuristic criteria" },
  { term: "easy", metric: "Define observable maximum step count or completion time" },
  { term: "robust", metric: "Specify error recovery and fault tolerance parameters" },
  { term: "scalable", metric: "Quantify concurrent users and peak transaction throughput" },
  { term: "seamless", metric: "Specify explicit authentication handoff or session migration protocol" },
  { term: "as soon as possible", metric: "Define maximum allowable async queue SLA in seconds/minutes" },
  { term: "promptly", metric: "Specify explicit latency or dispatch SLA window" },
  { term: "minimal latency", metric: "Define precise millisecond SLA threshold (e.g. < 250ms)" },
  { term: "secure", metric: "Specify cryptographic cipher standards, token lifespan, and TLS requirements" },
  { term: "intuitive", metric: "Define user task completion rate without prior training (e.g. > 90%)" },
  { term: "efficient", metric: "Quantify CPU/memory footprint limits or execution time constraints" },
  { term: "high quality", metric: "Define objective defect threshold and code coverage standards" },
];

const DATA_INPUT_KEYWORDS = [
  "enter",
  "input",
  "type",
  "select",
  "fill",
  "amount",
  "submit",
  "pay",
  "upload",
  "password",
  "code",
  "token",
  "credentials",
  "query",
  "search",
  "coupon",
  "card",
  "date",
  "email",
  "login",
  "form",
  "value",
];

const VALIDATION_CATEGORIES: ValidationCategory[] = [
  "Duplicate Detection",
  "Incomplete Test Cases",
  "Missing Information",
  "Requirement Quality",
  "Ambiguous Requirements",
  "Execution Integrity",
];

export function runUATValidationEngine(
  input: ValidationEngineInput
): ValidationSummaryReport {
  const issues: ValidationIssue[] = [];
  const testCases = input.testCases || [];
  const scenarios = input.scenarios || [];
  const executions = input.executions || {};
  const defects = input.defects || [];
  const intelligence = input.intelligence;
  const rawContent = input.requirementContent || "";
  const reqTitle = input.requirementTitle || "";
  const reqId = input.requirementId || "REQ-001";
  let issueCounter = 1;

  const nextId = (prefix: string) => {
    const id = `${prefix}-${String(issueCounter).padStart(3, "0")}`;
    issueCounter++;
    return id;
  };

  // -------------------------------------------------------------------------
  // Rule 1: Duplicate Detection
  // -------------------------------------------------------------------------
  // A) Duplicate Titles
  const titleMap = new Map<string, string[]>();
  testCases.forEach((tc) => {
    const normalized = tc.title.trim().toLowerCase();
    const existing = titleMap.get(normalized) || [];
    existing.push(tc.testCaseId);
    titleMap.set(normalized, existing);
  });

  titleMap.forEach((ids, title) => {
    if (ids.length > 1) {
      const firstTc = testCases.find((tc) => tc.testCaseId === ids[0]);
      issues.push({
        id: nextId("DUP"),
        category: "Duplicate Detection",
        severity: "Warning",
        title: `Duplicate Test Case Title Detected`,
        description: `Multiple test cases share identical title "${title}": [${ids.join(", ")}].`,
        targetRef: ids.join(" / "),
        suggestedFix: "Differentiate test scenario variations or merge duplicate cases into one parameterized verification.",
        testCaseId: ids[0],
        scenarioId: firstTc?.scenarioId,
        requirementId: firstTc?.requirementReference || reqId,
        linkHref: `/test-suites?search=${encodeURIComponent(ids[0])}`,
      });
    }
  });

  // B) Step sequence overlap
  for (let i = 0; i < testCases.length; i++) {
    for (let j = i + 1; j < testCases.length; j++) {
      const tcA = testCases[i];
      const tcB = testCases[j];
      if (
        tcA.testSteps &&
        tcB.testSteps &&
        tcA.testSteps.length > 0 &&
        tcA.testSteps.length === tcB.testSteps.length &&
        tcA.testSteps.every((s, idx) => s.action.trim().toLowerCase() === tcB.testSteps[idx]?.action.trim().toLowerCase())
      ) {
        issues.push({
          id: nextId("DUP"),
          category: "Duplicate Detection",
          severity: "Warning",
          title: `Identical Step Sequences between ${tcA.testCaseId} and ${tcB.testCaseId}`,
          description: `Both test cases execute identical sequential actions. One may be redundant or missing unique assertion targets.`,
          targetRef: `${tcA.testCaseId} / ${tcB.testCaseId}`,
          suggestedFix: "Verify if preconditions or expected outcomes differentiate them, or consolidate into one scenario.",
          testCaseId: tcA.testCaseId,
          scenarioId: tcA.scenarioId,
          requirementId: tcA.requirementReference || reqId,
          linkHref: `/test-suites?search=${encodeURIComponent(tcA.testCaseId)}`,
        });
      }
    }
  }

  // C) Duplicate scenario and identical expected result
  for (let i = 0; i < testCases.length; i++) {
    for (let j = i + 1; j < testCases.length; j++) {
      const tcA = testCases[i];
      const tcB = testCases[j];
      if (
        tcA.scenarioId &&
        tcA.scenarioId === tcB.scenarioId &&
        tcA.expectedResult.trim().toLowerCase() === tcB.expectedResult.trim().toLowerCase()
      ) {
        issues.push({
          id: nextId("DUP"),
          category: "Duplicate Detection",
          severity: "Warning",
          title: `Redundant Verification for Scenario ${tcA.scenarioId}`,
          description: `Test cases ${tcA.testCaseId} and ${tcB.testCaseId} target the same scenario with identical terminal assertions.`,
          targetRef: `${tcA.testCaseId} / ${tcB.testCaseId}`,
          suggestedFix: "Consolidate redundant assertions or diversify test case to cover alternative data paths.",
          testCaseId: tcA.testCaseId,
          scenarioId: tcA.scenarioId,
          requirementId: tcA.requirementReference || reqId,
          linkHref: `/test-suites?search=${encodeURIComponent(tcA.testCaseId)}`,
        });
      }
    }
  }

  // -------------------------------------------------------------------------
  // Rule 2: Incomplete Test Cases (Missing Steps, Zero Steps, Blank Actions)
  // -------------------------------------------------------------------------
  testCases.forEach((tc) => {
    // Zero execution steps
    if (!tc.testSteps || tc.testSteps.length === 0) {
      issues.push({
        id: nextId("INC"),
        category: "Incomplete Test Cases",
        severity: "Critical",
        title: `Test Case ${tc.testCaseId} Has Zero Execution Steps`,
        description: `Test case "${tc.title}" cannot be executed because no sequential steps are defined.`,
        targetRef: tc.testCaseId,
        suggestedFix: "Provide observable step actions with step-level expected results.",
        testCaseId: tc.testCaseId,
        scenarioId: tc.scenarioId,
        requirementId: tc.requirementReference || reqId,
        linkHref: `/test-suites?search=${encodeURIComponent(tc.testCaseId)}`,
      });
    } else {
      // Step with blank action
      tc.testSteps.forEach((st) => {
        if (!st.action || st.action.trim() === "") {
          issues.push({
            id: nextId("INC"),
            category: "Incomplete Test Cases",
            severity: "Critical",
            title: `Missing Step Action: ${tc.testCaseId} Step #${st.stepNumber}`,
            description: `Step #${st.stepNumber} has no action instructions defined for tester execution.`,
            targetRef: `${tc.testCaseId}#Step${st.stepNumber}`,
            suggestedFix: "Specify the user interaction or input operation to execute.",
            testCaseId: tc.testCaseId,
            scenarioId: tc.scenarioId,
            requirementId: tc.requirementReference || reqId,
            linkHref: `/test-suites?search=${encodeURIComponent(tc.testCaseId)}`,
          });
        }
      });
    }

    // Brief/Ambiguous title
    if (tc.title.trim().length < 10) {
      issues.push({
        id: nextId("INC"),
        category: "Incomplete Test Cases",
        severity: "Warning",
        title: `Brief / Ambiguous Title in ${tc.testCaseId}`,
        description: `Test title "${tc.title}" is shorter than 10 characters and may lack adequate descriptive context.`,
        targetRef: tc.testCaseId,
        suggestedFix: "Provide a descriptive title clearly stating action and outcome.",
        testCaseId: tc.testCaseId,
        scenarioId: tc.scenarioId,
        requirementId: tc.requirementReference || reqId,
        linkHref: `/test-suites?search=${encodeURIComponent(tc.testCaseId)}`,
      });
    }

    // Preconditions check
    if (!tc.preconditions || tc.preconditions.length === 0) {
      issues.push({
        id: nextId("INC"),
        category: "Incomplete Test Cases",
        severity: "Info",
        title: `No Preconditions Defined in ${tc.testCaseId}`,
        description: `Test case "${tc.title}" does not declare initial prerequisites or account state requirements.`,
        targetRef: tc.testCaseId,
        suggestedFix: "List required preconditions (e.g., user logged in, permissions assigned).",
        testCaseId: tc.testCaseId,
        scenarioId: tc.scenarioId,
        requirementId: tc.requirementReference || reqId,
        linkHref: `/test-suites?search=${encodeURIComponent(tc.testCaseId)}`,
      });
    }
  });

  // -------------------------------------------------------------------------
  // Rule 3: Scenarios without Test Cases
  // -------------------------------------------------------------------------
  if (scenarios.length > 0) {
    scenarios.forEach((sc) => {
      const isCovered = testCases.some(
        (tc) =>
          tc.scenarioId === sc.scenarioId ||
          (tc.scenario && tc.scenario.trim().toLowerCase() === sc.title.trim().toLowerCase())
      );
      if (!isCovered) {
        issues.push({
          id: nextId("SCN"),
          category: "Incomplete Test Cases",
          severity: sc.type === "Positive" ? "Critical" : "Warning",
          title: `Scenario ${sc.scenarioId} Has No Executable Test Case`,
          description: `Scenario "${sc.title}" (${sc.type}) was synthesized but lacks a corresponding executable test case in the current suite.`,
          targetRef: sc.scenarioId,
          suggestedFix: "Synthesize executable test steps for this scenario in the Test Suite Generator.",
          scenarioId: sc.scenarioId,
          requirementId: sc.requirementReference || reqId,
          linkHref: `/requirements#scenarios`,
        });
      }
    });
  }

  // -------------------------------------------------------------------------
  // Rule 4: Missing Information (Expected Results & Test Data)
  // -------------------------------------------------------------------------
  testCases.forEach((tc) => {
    // A) Missing terminal expected result
    if (!tc.expectedResult || tc.expectedResult.trim() === "") {
      issues.push({
        id: nextId("MIS"),
        category: "Missing Information",
        severity: "Critical",
        title: `Missing Terminal Expected Result in ${tc.testCaseId}`,
        description: `Test case "${tc.title}" lacks a defined final expected outcome for tester signoff.`,
        targetRef: tc.testCaseId,
        suggestedFix: "Define unambiguous terminal system outcome and UI state.",
        testCaseId: tc.testCaseId,
        scenarioId: tc.scenarioId,
        requirementId: tc.requirementReference || reqId,
        linkHref: `/test-suites?search=${encodeURIComponent(tc.testCaseId)}`,
      });
    }

    // B) Missing step-level expected results
    tc.testSteps?.forEach((st) => {
      if (!st.expectedResult || st.expectedResult.trim() === "") {
        issues.push({
          id: nextId("MIS"),
          category: "Missing Information",
          severity: "Critical",
          title: `Missing Step Expected Result: ${tc.testCaseId} Step #${st.stepNumber}`,
          description: `Action "${st.action}" does not specify what the tester should observe upon execution.`,
          targetRef: `${tc.testCaseId}#Step${st.stepNumber}`,
          suggestedFix: "Add observable visual or system feedback expectation for this step.",
          testCaseId: tc.testCaseId,
          scenarioId: tc.scenarioId,
          requirementId: tc.requirementReference || reqId,
          linkHref: `/test-suites?search=${encodeURIComponent(tc.testCaseId)}`,
        });
      }
    });

    // C) Missing test data where required
    const isTestDataEmpty =
      !tc.testData ||
      tc.testData.trim() === "" ||
      tc.testData.toLowerCase() === "n/a" ||
      tc.testData.toLowerCase() === "none" ||
      tc.testData.trim() === "-";

    if (isTestDataEmpty) {
      if (tc.type === "Boundary") {
        issues.push({
          id: nextId("MIS"),
          category: "Missing Information",
          severity: "Critical",
          title: `Missing Boundary Test Data in ${tc.testCaseId}`,
          description: `Boundary test case "${tc.title}" requires explicit threshold values, limits, or boundary values to verify edge conditions.`,
          targetRef: tc.testCaseId,
          suggestedFix: "Provide explicit boundary threshold values (e.g. min, max, off-by-one boundary limits).",
          testCaseId: tc.testCaseId,
          scenarioId: tc.scenarioId,
          requirementId: tc.requirementReference || reqId,
          linkHref: `/test-suites?search=${encodeURIComponent(tc.testCaseId)}`,
        });
      } else {
        const requiresData = tc.testSteps?.some((st) =>
          DATA_INPUT_KEYWORDS.some((kw) => st.action.toLowerCase().includes(kw))
        );

        if (requiresData) {
          issues.push({
            id: nextId("MIS"),
            category: "Missing Information",
            severity: "Warning",
            title: `Omitted Input Test Data in ${tc.testCaseId}`,
            description: `Step actions in "${tc.title}" require user data entry, but no concrete test data or payload parameters were supplied.`,
            targetRef: tc.testCaseId,
            suggestedFix: "Specify concrete input values (credentials, monetary values, codes, formats) to ensure repeatable UAT.",
            testCaseId: tc.testCaseId,
            scenarioId: tc.scenarioId,
            requirementId: tc.requirementReference || reqId,
            linkHref: `/test-suites?search=${encodeURIComponent(tc.testCaseId)}`,
          });
        } else {
          issues.push({
            id: nextId("MIS"),
            category: "Missing Information",
            severity: "Warning",
            title: `Omitted Test Data / Input Payload in ${tc.testCaseId}`,
            description: `Test case "${tc.title}" does not specify concrete input data values or payload parameters.`,
            targetRef: tc.testCaseId,
            suggestedFix: "Provide exact values (e.g. monetary amounts, dates, credentials, codes) to ensure repeatable UAT.",
            testCaseId: tc.testCaseId,
            scenarioId: tc.scenarioId,
            requirementId: tc.requirementReference || reqId,
            linkHref: `/test-suites?search=${encodeURIComponent(tc.testCaseId)}`,
          });
        }
      }
    }

    // D) Traceability identifiers
    if (!tc.requirementReference || tc.requirementReference.trim() === "") {
      issues.push({
        id: nextId("MIS"),
        category: "Missing Information",
        severity: "Critical",
        title: `Missing Requirement Traceability in ${tc.testCaseId}`,
        description: `Test case "${tc.title}" has no requirement reference, breaking audit compliance.`,
        targetRef: tc.testCaseId,
        suggestedFix: "Bind test case to its source requirement specification ID.",
        testCaseId: tc.testCaseId,
        scenarioId: tc.scenarioId,
        linkHref: `/test-suites?search=${encodeURIComponent(tc.testCaseId)}`,
      });
    }

    if (!tc.scenarioId || tc.scenarioId.trim() === "") {
      issues.push({
        id: nextId("MIS"),
        category: "Missing Information",
        severity: "Critical",
        title: `Missing Parent Scenario Link in ${tc.testCaseId}`,
        description: `Test case "${tc.title}" lacks a scenario identifier link.`,
        targetRef: tc.testCaseId,
        suggestedFix: "Map test case to its parent scenario ID (e.g., SCN-001).",
        testCaseId: tc.testCaseId,
        requirementId: tc.requirementReference || reqId,
        linkHref: `/test-suites?search=${encodeURIComponent(tc.testCaseId)}`,
      });
    } else if (
      scenarios.length > 0 &&
      !scenarios.some((sc) => sc.scenarioId === tc.scenarioId)
    ) {
      issues.push({
        id: nextId("MIS"),
        category: "Missing Information",
        severity: "Critical",
        title: `Broken Scenario Link in ${tc.testCaseId}`,
        description: `Test case links to scenario "${tc.scenarioId}", but no such scenario exists in the active scenario registry.`,
        targetRef: `${tc.testCaseId} -> ${tc.scenarioId}`,
        suggestedFix: "Re-link test case to an existing scenario or re-synthesize test scenarios.",
        testCaseId: tc.testCaseId,
        scenarioId: tc.scenarioId,
        requirementId: tc.requirementReference || reqId,
        linkHref: `/test-suites?search=${encodeURIComponent(tc.testCaseId)}`,
      });
    }

    if (!tc.businessRuleReference || tc.businessRuleReference.trim() === "") {
      issues.push({
        id: nextId("MIS"),
        category: "Missing Information",
        severity: "Warning",
        title: `Missing Business Rule Reference in ${tc.testCaseId}`,
        description: `Test case "${tc.title}" does not link to a specific governing business rule.`,
        targetRef: tc.testCaseId,
        suggestedFix: "Specify the governing business rule or policy clause being verified.",
        testCaseId: tc.testCaseId,
        scenarioId: tc.scenarioId,
        requirementId: tc.requirementReference || reqId,
        linkHref: `/test-suites?search=${encodeURIComponent(tc.testCaseId)}`,
      });
    }
  });

  // -------------------------------------------------------------------------
  // Rule 5: Requirement Quality & Traceability Coverage
  // -------------------------------------------------------------------------
  // A) Requirement with zero scenarios
  if (
    (rawContent.trim().length > 0 || reqTitle.trim().length > 0 || intelligence) &&
    scenarios.length === 0
  ) {
    issues.push({
      id: nextId("REQ"),
      category: "Requirement Quality",
      severity: "Critical",
      title: `Requirement Specification Has Zero Synthesized Scenarios`,
      description: `Active requirement "${reqTitle || 'Current Requirement'}" has not been synthesized into positive, negative, boundary, or role-based scenarios.`,
      targetRef: reqId,
      suggestedFix: "Execute Gemini scenario synthesis in the Requirements Workspace.",
      requirementId: reqId,
      linkHref: `/requirements`,
    });
  }

  // B) Requirements business rules without scenario coverage
  if (intelligence?.businessRules && intelligence.businessRules.length > 0) {
    intelligence.businessRules.forEach((rule, idx) => {
      const ruleRef = `BR-${String(idx + 1).padStart(2, "0")}`;
      const isCovered = scenarios.some(
        (sc) =>
          sc.businessRule.toLowerCase().includes(rule.toLowerCase().slice(0, 20)) ||
          sc.description.toLowerCase().includes(rule.toLowerCase().slice(0, 20)) ||
          sc.title.toLowerCase().includes(rule.toLowerCase().slice(0, 20)) ||
          sc.businessRule.toLowerCase().includes(ruleRef.toLowerCase())
      );

      if (!isCovered && scenarios.length > 0) {
        issues.push({
          id: nextId("REQ"),
          category: "Requirement Quality",
          severity: "Warning",
          title: `Uncovered Business Rule: ${ruleRef}`,
          description: `Business rule "${rule}" does not have an explicit generated scenario covering it.`,
          targetRef: ruleRef,
          suggestedFix: "Generate a targeted positive or boundary scenario for this rule in the Requirements Workspace.",
          requirementId: reqId,
          linkHref: `/requirements`,
        });
      }
    });
  }

  // C) Workflows without scenario coverage
  if (intelligence?.workflows && intelligence.workflows.length > 0 && scenarios.length > 0) {
    intelligence.workflows.forEach((wf, idx) => {
      const wfRef = `WF-${String(idx + 1).padStart(2, "0")}`;
      const isCovered = scenarios.some(
        (sc) =>
          sc.description.toLowerCase().includes(wf.toLowerCase().slice(0, 20)) ||
          sc.title.toLowerCase().includes(wf.toLowerCase().slice(0, 20))
      );
      if (!isCovered) {
        issues.push({
          id: nextId("REQ"),
          category: "Requirement Quality",
          severity: "Info",
          title: `Uncovered User Workflow: ${wfRef}`,
          description: `Workflow stage "${wf}" has no explicit scenario mapped to its sequence.`,
          targetRef: wfRef,
          suggestedFix: "Add an end-to-end integration scenario validating this workflow sequence.",
          requirementId: reqId,
          linkHref: `/requirements`,
        });
      }
    });
  }

  // D) Traceability Links coverage
  if (input.traceabilityLinks && input.traceabilityLinks.length > 0) {
    input.traceabilityLinks.forEach((link) => {
      if (link.coverageStatus === "Uncovered" || !link.scenarioId) {
        issues.push({
          id: nextId("TRC"),
          category: "Requirement Quality",
          severity: "Warning",
          title: `Uncovered Traceability Link: ${link.requirementId}`,
          description: `Requirement clause "${link.businessRule}" is marked Uncovered in the bidirectional traceability matrix.`,
          targetRef: link.requirementId,
          suggestedFix: "Synthesize test scenarios and link executable test cases to satisfy traceability.",
          requirementId: link.requirementId,
          linkHref: `/traceability`,
        });
      }
    });
  }

  // E) Incomplete specification text length
  if (rawContent.trim().length > 0 && rawContent.trim().length < 30) {
    issues.push({
      id: nextId("REQ"),
      category: "Requirement Quality",
      severity: "Critical",
      title: `Underspecified Requirement Content`,
      description: `Requirement content is only ${rawContent.trim().length} characters long, which is insufficient for rigorous UAT generation.`,
      targetRef: reqId,
      suggestedFix: "Provide complete user stories, functional acceptance rules, and boundary constraints.",
      requirementId: reqId,
      linkHref: `/requirements`,
    });
  }

  // F) Missing personas / roles in intelligence
  if (intelligence && (!intelligence.roles || intelligence.roles.length === 0)) {
    issues.push({
      id: nextId("REQ"),
      category: "Requirement Quality",
      severity: "Info",
      title: `No User Personas / Roles Declared in Intelligence`,
      description: `Requirement did not declare target actors or user personas for role-based validation.`,
      targetRef: `REQ-ROLES`,
      suggestedFix: "Specify user roles (e.g. Admin, Customer, Reviewer) to enable role-based testing.",
      requirementId: reqId,
      linkHref: `/requirements`,
    });
  }

  // G) Missing business rules in intelligence
  if (intelligence && (!intelligence.businessRules || intelligence.businessRules.length === 0)) {
    issues.push({
      id: nextId("REQ"),
      category: "Requirement Quality",
      severity: "Warning",
      title: `Missing Explicit Business Rules in Intelligence`,
      description: `No formal business rules or limits were identified in the requirement text.`,
      targetRef: `REQ-RULES`,
      suggestedFix: "Define clear governing business rules, limits, or constraints.",
      requirementId: reqId,
      linkHref: `/requirements`,
    });
  }

  // H) Missing outcomes in intelligence
  if (intelligence && (!intelligence.outcomes || intelligence.outcomes.length === 0)) {
    issues.push({
      id: nextId("REQ"),
      category: "Requirement Quality",
      severity: "Warning",
      title: `Undefined Business Outcomes in Intelligence`,
      description: `No observable terminal outcomes were parsed from the requirement specification.`,
      targetRef: `REQ-OUTCOMES`,
      suggestedFix: "Declare required success states and business deliverables.",
      requirementId: reqId,
      linkHref: `/requirements`,
    });
  }

  // -------------------------------------------------------------------------
  // Rule 6: Ambiguous Requirements
  // -------------------------------------------------------------------------
  // A) Flag ambiguities identified by Gemini intelligence
  if (intelligence?.ambiguities && intelligence.ambiguities.length > 0) {
    intelligence.ambiguities.forEach((amb) => {
      issues.push({
        id: nextId("AMB"),
        category: "Ambiguous Requirements",
        severity: "Warning",
        title: `Intelligence Ambiguity Detected`,
        description: amb,
        targetRef: reqId,
        suggestedFix: "Clarify requirement specification with product owner before final signoff.",
        requirementId: reqId,
        linkHref: `/requirements`,
      });
    });
  }

  // B) Scan rawContent and title for subjective terminology
  VAGUE_TERMS.forEach(({ term, metric }) => {
    const regex = new RegExp(`\\b${term}\\b`, "i");
    if (regex.test(rawContent) || regex.test(reqTitle)) {
      issues.push({
        id: nextId("AMB"),
        category: "Ambiguous Requirements",
        severity: "Warning",
        title: `Subjective / Unquantified Constraint: "${term}"`,
        description: `Requirement content mentions "${term}" without specifying precise measurable threshold metrics.`,
        targetRef: `REQ-TEXT`,
        suggestedFix: metric,
        requirementId: reqId,
        linkHref: `/requirements`,
      });
    }
  });

  // -------------------------------------------------------------------------
  // Rule 7: Execution Integrity (Live Execution & Defect Data)
  // -------------------------------------------------------------------------
  const executedCaseIds = Object.keys(executions);

  testCases.forEach((tc) => {
    const exec = executions[tc.testCaseId];
    if (exec) {
      // A) FAIL without actualResult
      if (exec.status === "FAIL" && (!exec.actualResult || exec.actualResult.trim() === "")) {
        issues.push({
          id: nextId("EXE"),
          category: "Execution Integrity",
          severity: "Critical",
          title: `Failed Test Case ${tc.testCaseId} Missing Actual Result Details`,
          description: `Test case ${tc.testCaseId} is marked FAIL, but no actual result or error message was documented. Detailed failure observations are required for defect triaging.`,
          targetRef: tc.testCaseId,
          suggestedFix: "Record observed failure message, error codes, and step evidence in the Execution Cockpit.",
          testCaseId: tc.testCaseId,
          scenarioId: tc.scenarioId,
          requirementId: tc.requirementReference || reqId,
          linkHref: `/execution?id=${encodeURIComponent(tc.testCaseId)}`,
        });
      }

      // B) FAIL defect tracking
      if (exec.status === "FAIL") {
        const matchingDefect =
          defects.find((d) => d.testCaseId === tc.testCaseId) ||
          (exec.defectId ? defects.find((d) => d.defectId === exec.defectId) : null);

        if (!matchingDefect) {
          issues.push({
            id: nextId("EXE"),
            category: "Execution Integrity",
            severity: "Warning",
            title: `Failed Test Case ${tc.testCaseId} Has No Logged Defect Ticket`,
            description: `Test case ${tc.testCaseId} failed during execution, but no defect ticket has been registered in the defect log.`,
            targetRef: tc.testCaseId,
            suggestedFix: "Use 'Create Defect' in the Execution Cockpit to log and escalate the observed defect.",
            testCaseId: tc.testCaseId,
            scenarioId: tc.scenarioId,
            requirementId: tc.requirementReference || reqId,
            linkHref: `/execution?id=${encodeURIComponent(tc.testCaseId)}`,
          });
        } else if (matchingDefect.status === "RESOLVED") {
          issues.push({
            id: nextId("EXE"),
            category: "Execution Integrity",
            severity: "Info",
            title: `Defect ${matchingDefect.defectId} Resolved — Re-Execution Recommended for ${tc.testCaseId}`,
            description: `Linked defect ${matchingDefect.defectId} is marked RESOLVED in the defect workflow. Re-execution of ${tc.testCaseId} is recommended to verify remediation and update status to PASS.`,
            targetRef: `${matchingDefect.defectId} / ${tc.testCaseId}`,
            suggestedFix: "Execute test case in the Execution Cockpit to confirm defect resolution.",
            testCaseId: tc.testCaseId,
            scenarioId: tc.scenarioId,
            requirementId: tc.requirementReference || reqId,
            defectId: matchingDefect.defectId,
            linkHref: `/execution?id=${encodeURIComponent(tc.testCaseId)}`,
          });
        }
      }

      // C) BLOCKED without explanation
      if (
        exec.status === "BLOCKED" &&
        (!exec.actualResult || exec.actualResult.trim() === "") &&
        (!exec.testerComment || exec.testerComment.trim() === "")
      ) {
        issues.push({
          id: nextId("EXE"),
          category: "Execution Integrity",
          severity: "Warning",
          title: `Blocked Test Case ${tc.testCaseId} Missing Blocker Cause`,
          description: `Test case ${tc.testCaseId} is marked BLOCKED but lacks diagnostic comments explaining the impediment.`,
          targetRef: tc.testCaseId,
          suggestedFix: "Document the upstream environmental failure, missing dependency, or data blocker in execution notes.",
          testCaseId: tc.testCaseId,
          scenarioId: tc.scenarioId,
          requirementId: tc.requirementReference || reqId,
          linkHref: `/execution?id=${encodeURIComponent(tc.testCaseId)}`,
        });
      }

      // D) Status contradictions
      if (exec.stepResults && exec.stepResults.length > 0) {
        if (exec.status === "PASS" && exec.stepResults.some((s) => s.status === "FAIL")) {
          issues.push({
            id: nextId("EXE"),
            category: "Execution Integrity",
            severity: "Critical",
            title: `Execution Contradiction: Passed Case With Failed Step (${tc.testCaseId})`,
            description: `Overall test case status is PASS, but one or more individual test steps failed. A test case cannot pass if any step fails.`,
            targetRef: tc.testCaseId,
            suggestedFix: "Update overall status to FAIL or re-verify step execution outcomes.",
            testCaseId: tc.testCaseId,
            scenarioId: tc.scenarioId,
            requirementId: tc.requirementReference || reqId,
            linkHref: `/execution?id=${encodeURIComponent(tc.testCaseId)}`,
          });
        }

        if (
          exec.status === "FAIL" &&
          exec.stepResults.every((s) => s.status === "PASS") &&
          exec.stepResults.length === tc.testSteps.length
        ) {
          issues.push({
            id: nextId("EXE"),
            category: "Execution Integrity",
            severity: "Warning",
            title: `Step Status Contradiction in ${tc.testCaseId}`,
            description: `Overall status is FAIL, yet all ${exec.stepResults.length} test steps are recorded as PASS.`,
            targetRef: tc.testCaseId,
            suggestedFix: "Confirm if a step actually failed, or if an unexpected external postcondition caused the failure.",
            testCaseId: tc.testCaseId,
            scenarioId: tc.scenarioId,
            requirementId: tc.requirementReference || reqId,
            linkHref: `/execution?id=${encodeURIComponent(tc.testCaseId)}`,
          });
        }
      }
    } else if (executedCaseIds.length > 0 && tc.priority === "Critical") {
      // Execution has started on the suite, but critical test case is still unexecuted
      issues.push({
        id: nextId("EXE"),
        category: "Execution Integrity",
        severity: "Info",
        title: `Pending Execution: Critical Case ${tc.testCaseId}`,
        description: `Critical priority test case "${tc.title}" has not yet been executed in the active test run.`,
        targetRef: tc.testCaseId,
        suggestedFix: "Prioritize execution of critical business path verifications in the Cockpit.",
        testCaseId: tc.testCaseId,
        scenarioId: tc.scenarioId,
        requirementId: tc.requirementReference || reqId,
        linkHref: `/execution?id=${encodeURIComponent(tc.testCaseId)}`,
      });
    }
  });

  // Orphaned defects
  defects.forEach((defect) => {
    if (testCases.length > 0 && !testCases.some((tc) => tc.testCaseId === defect.testCaseId)) {
      issues.push({
        id: nextId("EXE"),
        category: "Execution Integrity",
        severity: "Warning",
        title: `Orphaned Defect Record: ${defect.defectId}`,
        description: `Defect "${defect.title}" references test case ID "${defect.testCaseId}" which does not exist in the active test suite.`,
        targetRef: defect.defectId,
        suggestedFix: "Link defect to a valid test case in the current suite or archive outdated defect.",
        defectId: defect.defectId,
        linkHref: `/execution`,
      });
    }
  });

  // -------------------------------------------------------------------------
  // Rule 8: Clean Execution Architecture Verified (INFO)
  // -------------------------------------------------------------------------
  const criticalIssues = issues.filter(
    (i) => i.severity === "Critical" || i.severity === "CRITICAL"
  );
  if (testCases.length > 0 && criticalIssues.length === 0) {
    issues.push({
      id: nextId("INF"),
      category: "Requirement Quality",
      severity: "Info",
      title: "Clean Execution Architecture Verified",
      description: `All ${testCases.length} test cases contain observable action steps and non-empty expected results ready for manual execution.`,
      targetRef: "SUITE-VERIFIED",
      suggestedFix: "Proceed to execution cockpit for manual verification.",
      linkHref: `/execution`,
    });
  }

  // -------------------------------------------------------------------------
  // Summaries & Aggregations
  // -------------------------------------------------------------------------
  let criticalCount = 0;
  let warningCount = 0;
  let infoCount = 0;

  issues.forEach((i) => {
    const sev = i.severity.toUpperCase();
    if (sev === "CRITICAL") criticalCount++;
    else if (sev === "WARNING") warningCount++;
    else if (sev === "INFO") infoCount++;
  });

  const categorySummaries: ValidationCategorySummary[] = VALIDATION_CATEGORIES.map(
    (category) => {
      const catIssues = issues.filter((i) => i.category === category);
      let crit = 0;
      let warn = 0;
      let inf = 0;
      catIssues.forEach((i) => {
        const s = i.severity.toUpperCase();
        if (s === "CRITICAL") crit++;
        else if (s === "WARNING") warn++;
        else if (s === "INFO") inf++;
      });
      return {
        category,
        count: catIssues.length,
        critical: crit,
        warning: warn,
        info: inf,
      };
    }
  );

  const entityStats: ValidationEntityStats = {
    testCasesEvaluated: testCases.length,
    scenariosEvaluated: scenarios.length,
    requirementsEvaluated:
      rawContent.trim().length > 0 || reqTitle.trim().length > 0 || intelligence ? 1 : 0,
    executionsEvaluated: Object.keys(executions).length,
    defectsEvaluated: defects.length,
  };

  return {
    issues,
    totalIssues: issues.length,
    criticalCount,
    warningCount,
    infoCount,
    evaluatedAt: new Date().toISOString(),
    categorySummaries,
    entityStats,
  };
}
