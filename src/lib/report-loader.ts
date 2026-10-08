import { ConformanceReport } from "@/types";
import { mockReport } from "@/data/mockReport";

/**
 * Loads the current conformance report.
 * This provides an architectural boundary so the UI does not directly
 * depend on the mock data source.
 */
export function loadReport(): ConformanceReport | null {
  return mockReport;
}
