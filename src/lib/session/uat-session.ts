import {
  GeneratedTestCase,
  GeneratedScenario,
  TestCaseGenerationSummary,
  RequirementIntelligence,
  RequirementInputType,
  TestCaseExecution,
  DefectRecord,
  DefectStatus,
  ExecutionSummary,
} from "@/types";
import {
  TestCaseExecutionSchema,
  DefectRecordSchema,
} from "@/lib/validation/schemas";

const SUITE_STORAGE_KEY = "uatforge_active_suite";
const REQUIREMENT_STORAGE_KEY = "uatforge_active_requirement";
const SCENARIOS_STORAGE_KEY = "uatforge_active_scenarios";
const EXECUTIONS_STORAGE_KEY = "uatforge_active_executions";
const DEFECTS_STORAGE_KEY = "uatforge_active_defects";

export interface ActiveSuiteSession {
  requirementTitle: string;
  testCases: GeneratedTestCase[];
  summary: TestCaseGenerationSummary;
  meta?: {
    model?: string;
    generatedAt?: string;
    testCaseCount?: number;
  };
  timestamp: string;
}

export interface ActiveRequirementSession {
  title: string;
  rawContent: string;
  inputType: RequirementInputType;
  documentFileName?: string;
  targetUrl?: string;
  screenshotFileName?: string;
  intelligence?: RequirementIntelligence;
  timestamp: string;
}

function notifyChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("uatforge_session_change"));
  }
}

// ----------------------------------------------------
// SUITE
// ----------------------------------------------------
export function getActiveSuite(): ActiveSuiteSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SUITE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.testCases)) {
      return parsed as ActiveSuiteSession;
    }
  } catch {
    return null;
  }
  return null;
}

export function setActiveSuite(suite: ActiveSuiteSession): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SUITE_STORAGE_KEY, JSON.stringify(suite));
    notifyChange();
  } catch {
    // ignore
  }
}

// ----------------------------------------------------
// REQUIREMENT
// ----------------------------------------------------
export function getActiveRequirement(): ActiveRequirementSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(REQUIREMENT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ActiveRequirementSession;
  } catch {
    return null;
  }
}

export function setActiveRequirement(req: ActiveRequirementSession): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(REQUIREMENT_STORAGE_KEY, JSON.stringify(req));
    notifyChange();
  } catch {
    // ignore
  }
}

// ----------------------------------------------------
// SCENARIOS
// ----------------------------------------------------
export function getActiveScenarios(): GeneratedScenario[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(SCENARIOS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setActiveScenarios(scenarios: GeneratedScenario[]): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SCENARIOS_STORAGE_KEY, JSON.stringify(scenarios));
    notifyChange();
  } catch {
    // ignore
  }
}

// ----------------------------------------------------
// EXECUTIONS
// ----------------------------------------------------
export function getAllExecutions(): Record<string, TestCaseExecution> {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(EXECUTIONS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, TestCaseExecution>;
  } catch {
    return {};
  }
}

export function getExecutionForTestCase(
  testCaseId: string
): TestCaseExecution | null {
  const all = getAllExecutions();
  return all[testCaseId] || null;
}

export function saveExecution(execution: TestCaseExecution): boolean {
  if (typeof window === "undefined") return false;
  const validation = TestCaseExecutionSchema.safeParse(execution);
  if (!validation.success) {
    console.error("Invalid TestCaseExecution payload:", validation.error);
    return false;
  }

  try {
    const all = getAllExecutions();
    all[execution.testCaseId] = execution;
    sessionStorage.setItem(EXECUTIONS_STORAGE_KEY, JSON.stringify(all));
    notifyChange();
    return true;
  } catch {
    return false;
  }
}

export function resetExecution(testCaseId: string): void {
  if (typeof window === "undefined") return;
  try {
    const all = getAllExecutions();
    delete all[testCaseId];
    sessionStorage.setItem(EXECUTIONS_STORAGE_KEY, JSON.stringify(all));
    notifyChange();
  } catch {
    // ignore
  }
}

// ----------------------------------------------------
// DEFECTS
// ----------------------------------------------------
export function getAllDefects(): DefectRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(DEFECTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveDefect(defect: DefectRecord): boolean {
  if (typeof window === "undefined") return false;
  const validation = DefectRecordSchema.safeParse(defect);
  if (!validation.success) {
    console.error("Invalid DefectRecord payload:", validation.error);
    return false;
  }

  try {
    const all = getAllDefects();
    const existingIndex = all.findIndex((d) => d.defectId === defect.defectId);
    if (existingIndex >= 0) {
      all[existingIndex] = defect;
    } else {
      all.unshift(defect);
    }
    sessionStorage.setItem(DEFECTS_STORAGE_KEY, JSON.stringify(all));
    notifyChange();
    return true;
  } catch {
    return false;
  }
}

export function updateDefectStatus(
  defectId: string,
  status: DefectStatus
): boolean {
  if (typeof window === "undefined") return false;
  try {
    const all = getAllDefects();
    const target = all.find((d) => d.defectId === defectId);
    if (!target) return false;
    target.status = status;
    target.updatedAt = new Date().toISOString();
    sessionStorage.setItem(DEFECTS_STORAGE_KEY, JSON.stringify(all));
    notifyChange();
    return true;
  } catch {
    return false;
  }
}

export function deleteDefect(defectId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const all = getAllDefects();
    const filtered = all.filter((d) => d.defectId !== defectId);
    sessionStorage.setItem(DEFECTS_STORAGE_KEY, JSON.stringify(filtered));
    notifyChange();
    return true;
  } catch {
    return false;
  }
}

export function getDefectForTestCase(testCaseId: string): DefectRecord | null {
  const all = getAllDefects();
  return all.find((d) => d.testCaseId === testCaseId) || null;
}


// ----------------------------------------------------
// REAL METRICS CALCULATION
// ----------------------------------------------------
export function calculateExecutionMetrics(
  testCaseIds: string[],
  executions: Record<string, TestCaseExecution>
): ExecutionSummary {
  const total = testCaseIds.length;
  let passed = 0;
  let failed = 0;
  let blocked = 0;

  for (const id of testCaseIds) {
    const exec = executions[id];
    if (exec) {
      if (exec.status === "PASS") passed++;
      else if (exec.status === "FAIL") failed++;
      else if (exec.status === "BLOCKED") blocked++;
    }
  }

  const notExecuted = Math.max(0, total - (passed + failed + blocked));
  const executed = passed + failed + blocked;
  const coveragePercentage = total > 0 ? Number(((executed / total) * 100).toFixed(1)) : 0;

  return {
    total,
    notExecuted,
    passed,
    failed,
    blocked,
    coveragePercentage,
  };
}

// ----------------------------------------------------
// SUBSCRIPTION
// ----------------------------------------------------
export function subscribeToUATSession(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("uatforge_session_change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("uatforge_session_change", callback);
  };
}
