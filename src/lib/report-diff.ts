import { ConformanceReport, ScenarioResult, Status } from "@/types";

export type DiffChangeType =
  | "UNCHANGED"
  | "FIXED"
  | "REGRESSED"
  | "STATUS_CHANGED"
  | "ADDED"
  | "REMOVED";

export interface ScenarioDiff {
  test_id: string;
  description: string;
  currentStatus?: Status;
  baselineStatus?: Status;
  changeType: DiffChangeType;
  currentResult?: ScenarioResult;
  baselineResult?: ScenarioResult;
}

export interface SummaryDiff {
  total: number;
  passed: number;
  failed: number;
  errors: number;
  skipped: number;
}

export interface ReportComparison {
  summaryDiff: SummaryDiff;
  scenarioDiffs: ScenarioDiff[];
  hasDifferences: boolean;
  fixedCount: number;
  regressedCount: number;
}

/**
 * Computes the comparative diff between a current report and a baseline report.
 */
export function compareReports(
  current: ConformanceReport,
  baseline: ConformanceReport
): ReportComparison {
  const summaryDiff: SummaryDiff = {
    total: current.summary.total - baseline.summary.total,
    passed: current.summary.passed - baseline.summary.passed,
    failed: current.summary.failed - baseline.summary.failed,
    errors: current.summary.errors - baseline.summary.errors,
    skipped: current.summary.skipped - baseline.summary.skipped,
  };

  const baselineMap = new Map<string, ScenarioResult>();
  for (const r of baseline.results) {
    baselineMap.set(r.test_id, r);
  }

  const currentMap = new Map<string, ScenarioResult>();
  for (const r of current.results) {
    currentMap.set(r.test_id, r);
  }

  const scenarioDiffs: ScenarioDiff[] = [];
  let fixedCount = 0;
  let regressedCount = 0;

  for (const cur of current.results) {
    const base = baselineMap.get(cur.test_id);
    if (!base) {
      scenarioDiffs.push({
        test_id: cur.test_id,
        description: cur.description,
        currentStatus: cur.status,
        changeType: "ADDED",
        currentResult: cur,
      });
    } else if (base.status === cur.status) {
      scenarioDiffs.push({
        test_id: cur.test_id,
        description: cur.description,
        currentStatus: cur.status,
        baselineStatus: base.status,
        changeType: "UNCHANGED",
        currentResult: cur,
        baselineResult: base,
      });
    } else {
      let changeType: DiffChangeType;
      if (
        cur.status === "PASS" &&
        (base.status === "FAIL" || base.status === "ERROR")
      ) {
        changeType = "FIXED";
        fixedCount++;
      } else if (
        (cur.status === "FAIL" || cur.status === "ERROR") &&
        base.status === "PASS"
      ) {
        changeType = "REGRESSED";
        regressedCount++;
      } else {
        changeType = "STATUS_CHANGED";
      }
      scenarioDiffs.push({
        test_id: cur.test_id,
        description: cur.description,
        currentStatus: cur.status,
        baselineStatus: base.status,
        changeType,
        currentResult: cur,
        baselineResult: base,
      });
    }
  }

  for (const base of baseline.results) {
    if (!currentMap.has(base.test_id)) {
      scenarioDiffs.push({
        test_id: base.test_id,
        description: base.description,
        baselineStatus: base.status,
        changeType: "REMOVED",
        baselineResult: base,
      });
    }
  }

  const hasDifferences =
    fixedCount > 0 ||
    regressedCount > 0 ||
    scenarioDiffs.some((d) => d.changeType !== "UNCHANGED") ||
    summaryDiff.total !== 0 ||
    summaryDiff.passed !== 0 ||
    summaryDiff.failed !== 0 ||
    summaryDiff.errors !== 0 ||
    summaryDiff.skipped !== 0;

  return {
    summaryDiff,
    scenarioDiffs,
    hasDifferences,
    fixedCount,
    regressedCount,
  };
}
