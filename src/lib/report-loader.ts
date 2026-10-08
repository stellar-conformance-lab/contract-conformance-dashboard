import { ConformanceReport, Status, Summary, ScenarioResult } from "@/types";
import reportData from "@/data/report.json";

function isValidStatus(status: unknown): status is Status {
  return typeof status === "string" && ["PASS", "FAIL", "ERROR", "SKIPPED"].includes(status);
}

function isValidSummary(summary: unknown): summary is Summary {
  return (
    summary !== null &&
    typeof summary === "object" &&
    typeof (summary as Summary).total === "number" &&
    typeof (summary as Summary).passed === "number" &&
    typeof (summary as Summary).failed === "number" &&
    typeof (summary as Summary).errors === "number" &&
    typeof (summary as Summary).skipped === "number"
  );
}

function isValidScenarioResult(result: unknown): result is ScenarioResult {
  return (
    result !== null &&
    typeof result === "object" &&
    typeof (result as ScenarioResult).test_id === "string" &&
    typeof (result as ScenarioResult).description === "string" &&
    isValidStatus((result as ScenarioResult).status) &&
    typeof (result as ScenarioResult).expected_behavior === "string" &&
    typeof (result as ScenarioResult).observed_behavior === "string"
  );
}

function validateReport(data: unknown): data is ConformanceReport {
  if (!data || typeof data !== "object") return false;
  
  const d = data as Record<string, unknown>;

  if (typeof d.profile !== "string") return false;
  if (typeof d.fixture !== "string") return false;
  if (!isValidStatus(d.status)) return false;
  if (!isValidSummary(d.summary)) return false;
  if (!Array.isArray(d.results)) return false;
  
  for (const result of d.results) {
    if (!isValidScenarioResult(result)) return false;
  }
  
  return true;
}

/**
 * Loads the current conformance report.
 * This provides an architectural boundary so the UI does not directly
 * depend on the mock data source.
 */
export function loadReport(): ConformanceReport | null {
  try {
    if (validateReport(reportData)) {
      return reportData as ConformanceReport;
    } else {
      console.error("Conformance report validation failed");
      return null;
    }
  } catch (err) {
    console.error("Failed to load conformance report", err);
    return null;
  }
}
