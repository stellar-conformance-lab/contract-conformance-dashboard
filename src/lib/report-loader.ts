
import {
  ConformanceReport,
  HistoryManifest,
  HistoricalRun,
  ScenarioResult,
  Status,
  Summary,
} from "@/types";

const REPORTS_BASE_URL =
  "https://stellar-conformance-lab.github.io/contract-conformance";

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isValidStatus(status: unknown): status is Status {
  return (
    typeof status === "string" &&
    ["PASS", "FAIL", "ERROR", "SKIPPED"].includes(status)
  );
}



function isValidSummary(summary: unknown): summary is Summary {
  if (!isRecord(summary)) return false;

  const { total, passed, failed, errors, skipped } = summary;

  const isValidCount = (value: unknown): value is number =>
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 0;

  if (
    !isValidCount(total) ||
    !isValidCount(passed) ||
    !isValidCount(failed) ||
    !isValidCount(errors) ||
    !isValidCount(skipped)
  ) {
    return false;
  }

  return total === passed + failed + errors + skipped;
}

function isValidScenarioResult(result: unknown): result is ScenarioResult {
  if (!isRecord(result)) return false;

  return (
    typeof result.test_id === "string" &&
    typeof result.description === "string" &&
    isValidStatus(result.status) &&
    typeof result.expected_behavior === "string" &&
    typeof result.observed_behavior === "string"
  );
}

function validateReport(data: unknown): data is ConformanceReport {
  if (!isRecord(data)) return false;

  return (
    typeof data.profile === "string" &&
    typeof data.fixture === "string" &&
    isValidStatus(data.status) &&
    isValidSummary(data.summary) &&
    Array.isArray(data.results) &&
    data.results.every(isValidScenarioResult)
  );
}

function isValidHistoricalRun(run: unknown): run is HistoricalRun {
  if (!isRecord(run)) return false;

  return (
    typeof run.id === "string" &&
    /^\d+$/.test(run.id) &&
    typeof run.commit === "string" &&
    typeof run.timestamp === "string" &&
    !Number.isNaN(Date.parse(run.timestamp)) &&
    typeof run.profile === "string" &&
    typeof run.fixture === "string" &&
    isValidStatus(run.status) &&
    isValidSummary(run.summary) &&
    typeof run.report === "string" &&
    run.report === `history/${run.id}.json`
  );
}

function validateManifest(data: unknown): data is HistoryManifest {
  if (!isRecord(data) || !Array.isArray(data.runs)) return false;

  const seenIds = new Set<string>();

  for (const run of data.runs) {
    if (!isValidHistoricalRun(run) || seenIds.has(run.id)) {
      return false;
    }
    seenIds.add(run.id);
  }

  return true;
}


async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} while fetching ${url}`);
  }

  return response.json();
}

/**
 * Loads the current conformance report from the public CI endpoint.
 */
export async function loadReport(): Promise<ConformanceReport | null> {
  try {
    const data = await fetchJson(`${REPORTS_BASE_URL}/report.json`);

    if (validateReport(data)) return data;

    console.error("Current conformance report validation failed");
    return null;
  } catch (error) {
    console.error("Failed to load current conformance report", error);
    return null;
  }
}

/**
 * Loads and validates the public historical-run manifest.
 */
export async function loadHistoryManifest(): Promise<HistoryManifest | null> {
  try {
    const data = await fetchJson(`${REPORTS_BASE_URL}/history/manifest.json`);

    if (validateManifest(data)) return data;

    console.error("Historical manifest validation failed");
    return null;
  } catch (error) {
    console.error("Failed to load historical manifest", error);
    return null;
  }
}

/**
 * Loads a historical report by its run ID.
 * Only numeric run IDs are accepted to prevent arbitrary URL paths.
 */
export async function loadHistoricalReport(
  runId: string,
): Promise<ConformanceReport | null> {
  if (!/^\d+$/.test(runId)) {
    console.error("Invalid historical run ID");
    return null;
  }

  try {
    const data = await fetchJson(
      `${REPORTS_BASE_URL}/history/${encodeURIComponent(runId)}.json`,
    );

    if (validateReport(data)) return data;

    console.error(`Historical report validation failed for run ${runId}`);
    return null;
  } catch (error) {
    console.error(`Failed to load historical report ${runId}`, error);
    return null;
  }
}