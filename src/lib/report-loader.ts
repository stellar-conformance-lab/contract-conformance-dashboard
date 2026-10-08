import { ConformanceReport, Status, Summary, ScenarioResult } from "@/types";

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
 * Loads the current conformance report from the public CI endpoint.
 * This provides an architectural boundary so the UI does not directly
 * depend on the data source.
 */
export async function loadReport(): Promise<ConformanceReport | null> {
  try {
    const res = await fetch("https://stellar-conformance-lab.github.io/contract-conformance/report.json");
    if (!res.ok) {
      console.error(`Failed to fetch report: HTTP ${res.status}`);
      return null;
    }
    const data = await res.json();
    if (validateReport(data)) {
      return data;
    } else {
      console.error("Conformance report validation failed");
      return null;
    }
  } catch (err) {
    console.error("Failed to load conformance report", err);
    return null;
  }
}
