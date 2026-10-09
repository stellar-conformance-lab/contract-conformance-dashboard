import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  loadReport,
  loadHistoryManifest,
  loadHistoricalReport,
} from "./report-loader";

// Suppress console.error in tests to avoid noisy output
const originalConsoleError = console.error;

beforeEach(() => {
  global.fetch = vi.fn();
  console.error = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
  console.error = originalConsoleError;
});

const validSummary = {
  total: 1,
  passed: 1,
  failed: 0,
  errors: 0,
  skipped: 0,
};

const validScenarioResult = {
  test_id: "TEST-01",
  description: "Test description",
  status: "PASS",
  expected_behavior: "Expected",
  observed_behavior: "Observed",
};

const validReport = {
  profile: "SEP-41",
  fixture: "test-fixture",
  status: "PASS",
  summary: validSummary,
  results: [validScenarioResult],
};

const validRun = {
  id: "12345",
  commit: "abcde",
  timestamp: "2026-10-09T00:00:00Z",
  profile: "SEP-41",
  fixture: "test-fixture",
  status: "PASS",
  summary: validSummary,
  report: "history/12345.json",
};

const validManifest = {
  runs: [validRun],
};

describe("report-loader", () => {
  describe("loadReport", () => {
    it("returns valid report data", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => validReport,
      } as Response);

      const report = await loadReport();
      expect(report).toEqual(validReport);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://stellar-conformance-lab.github.io/contract-conformance/report.json",
        expect.any(Object)
      );
    });

    it("returns null for malformed report data", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...validReport, profile: 123 }), // Invalid profile type
      } as Response);

      const report = await loadReport();
      expect(report).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    it("returns null on HTTP errors", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      const report = await loadReport();
      expect(report).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    it("returns null on network failure", async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error("Network Error"));

      const report = await loadReport();
      expect(report).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("loadHistoricalReport", () => {
    it("returns valid historical report data", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => validReport,
      } as Response);

      const report = await loadHistoricalReport("12345");
      expect(report).toEqual(validReport);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://stellar-conformance-lab.github.io/contract-conformance/history/12345.json",
        expect.any(Object)
      );
    });

    it("returns null for invalid historical IDs", async () => {
      const report = await loadHistoricalReport("invalid-id-123");
      expect(report).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });

    it("returns null for malicious historical IDs", async () => {
      const report = await loadHistoricalReport("../../../../etc/passwd");
      expect(report).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("loadHistoryManifest", () => {
    it("returns valid manifest data", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => validManifest,
      } as Response);

      const manifest = await loadHistoryManifest();
      expect(manifest).toEqual(validManifest);
    });

    it("returns null for duplicate IDs in history manifests", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          runs: [validRun, validRun], // Duplicate IDs
        }),
      } as Response);

      const manifest = await loadHistoryManifest();
      expect(manifest).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    it("returns null for malformed manifest data", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          runs: [{ ...validRun, id: 123 }], // Invalid id type
        }),
      } as Response);

      const manifest = await loadHistoryManifest();
      expect(manifest).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });
});
