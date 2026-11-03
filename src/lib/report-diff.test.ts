import { describe, it, expect } from "vitest";
import { compareReports } from "./report-diff";
import { ConformanceReport } from "@/types";

const makeReport = (
  passed: number,
  failed: number,
  results: { test_id: string; description: string; status: "PASS" | "FAIL" | "ERROR" | "SKIPPED" }[]
): ConformanceReport => ({
  profile: "SEP-41",
  fixture: "test",
  status: failed > 0 ? "FAIL" : "PASS",
  summary: {
    total: passed + failed,
    passed,
    failed,
    errors: 0,
    skipped: 0,
  },
  results: results.map((r) => ({
    ...r,
    expected_behavior: "expected",
    observed_behavior: "observed",
  })),
});

describe("compareReports", () => {
  it("detects no differences between identical reports", () => {
    const report = makeReport(2, 0, [
      { test_id: "T-01", description: "Test 1", status: "PASS" },
      { test_id: "T-02", description: "Test 2", status: "PASS" },
    ]);

    const diff = compareReports(report, report);
    expect(diff.hasDifferences).toBe(false);
    expect(diff.fixedCount).toBe(0);
    expect(diff.regressedCount).toBe(0);
    expect(diff.summaryDiff).toEqual({
      total: 0,
      passed: 0,
      failed: 0,
      errors: 0,
      skipped: 0,
    });
  });

  it("detects fixed scenarios (FAIL -> PASS)", () => {
    const baseline = makeReport(1, 1, [
      { test_id: "T-01", description: "Test 1", status: "PASS" },
      { test_id: "T-02", description: "Test 2", status: "FAIL" },
    ]);

    const current = makeReport(2, 0, [
      { test_id: "T-01", description: "Test 1", status: "PASS" },
      { test_id: "T-02", description: "Test 2", status: "PASS" },
    ]);

    const diff = compareReports(current, baseline);
    expect(diff.hasDifferences).toBe(true);
    expect(diff.fixedCount).toBe(1);
    expect(diff.regressedCount).toBe(0);
    expect(diff.summaryDiff.passed).toBe(1);
    expect(diff.summaryDiff.failed).toBe(-1);

    const t2Diff = diff.scenarioDiffs.find((d) => d.test_id === "T-02");
    expect(t2Diff?.changeType).toBe("FIXED");
    expect(t2Diff?.baselineStatus).toBe("FAIL");
    expect(t2Diff?.currentStatus).toBe("PASS");
  });

  it("detects regressed scenarios (PASS -> FAIL)", () => {
    const baseline = makeReport(2, 0, [
      { test_id: "T-01", description: "Test 1", status: "PASS" },
      { test_id: "T-02", description: "Test 2", status: "PASS" },
    ]);

    const current = makeReport(1, 1, [
      { test_id: "T-01", description: "Test 1", status: "PASS" },
      { test_id: "T-02", description: "Test 2", status: "FAIL" },
    ]);

    const diff = compareReports(current, baseline);
    expect(diff.hasDifferences).toBe(true);
    expect(diff.fixedCount).toBe(0);
    expect(diff.regressedCount).toBe(1);
    expect(diff.summaryDiff.passed).toBe(-1);
    expect(diff.summaryDiff.failed).toBe(1);

    const t2Diff = diff.scenarioDiffs.find((d) => d.test_id === "T-02");
    expect(t2Diff?.changeType).toBe("REGRESSED");
  });

  it("identifies added and removed scenarios", () => {
    const baseline = makeReport(1, 0, [
      { test_id: "T-01", description: "Test 1", status: "PASS" },
    ]);

    const current = makeReport(2, 0, [
      { test_id: "T-02", description: "Test 2", status: "PASS" },
      { test_id: "T-03", description: "Test 3", status: "PASS" },
    ]);

    const diff = compareReports(current, baseline);
    expect(diff.hasDifferences).toBe(true);
    expect(diff.scenarioDiffs.find((d) => d.test_id === "T-01")?.changeType).toBe("REMOVED");
    expect(diff.scenarioDiffs.find((d) => d.test_id === "T-02")?.changeType).toBe("ADDED");
    expect(diff.scenarioDiffs.find((d) => d.test_id === "T-03")?.changeType).toBe("ADDED");
  });
});
